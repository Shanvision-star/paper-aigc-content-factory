param(
  [string]$EpisodeDir = "C:\Users\Rome\Documents\Paper_every_day\episodes\ep01_attention_is_all_you_need",
  [string]$Device = "cuda",
  [int]$NfeStep = 16,
  [decimal]$Speed = 0.78,
  [string]$SegmentSubdir = "segments",
  [string[]]$SegmentIds = @(),
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$SegmentDir = Join-Path $EpisodeDir "audio\f5_tts\$SegmentSubdir"
$ManifestPath = Join-Path $SegmentDir "segment_manifest.json"
$RefTextFile = Join-Path $EpisodeDir "audio\f5_tts\reference_text_f5_neutral.txt"
$RefAudio = Join-Path $EpisodeDir "voice\enrollment\reference_neutral_f5_8s.wav"
$F5Cli = "D:\Shanvisorin_platform\F5-TTS\.venv\Scripts\f5-tts_infer-cli.exe"
$F5Python = "D:\Shanvisorin_platform\F5-TTS\.venv\Scripts\python.exe"
$Checkpoint = "D:\Shanvisorin_platform\models\F5-TTS_Emilia-ZH-EN\model_1250000.safetensors"
$Vocab = "D:\Shanvisorin_platform\models\F5-TTS_Emilia-ZH-EN\vocab.txt"

foreach ($RequiredPath in @($ManifestPath, $RefTextFile, $RefAudio, $F5Cli, $F5Python, $Checkpoint, $Vocab)) {
  if (-not (Test-Path $RequiredPath)) {
    throw "Missing required segmented F5-TTS input: $RequiredPath"
  }
}

function New-CodepointString {
  param([int[]]$Codepoints)

  return -join ($Codepoints | ForEach-Object { [char]$_ })
}

$UnsafeReferenceTerms = @(
  "Attention",
  "Transformer",
  "QKV",
  (New-CodepointString @(0x51, 0x3001, 0x4b)),
  "Self-Attention",
  "Multi-Head",
  (New-CodepointString @(0x8bba, 0x6587)),
  (New-CodepointString @(0x9605, 0x8bfb, 0x5e8f, 0x5217)),
  (New-CodepointString @(0x6a21, 0x578b, 0x9605, 0x8bfb, 0x5e8f, 0x5217)),
  (New-CodepointString @(0x4e3a, 0x4ec0, 0x4e48, 0x91cd, 0x8981)),
  (New-CodepointString @(0x6700, 0x540e, 0x770b, 0x5b83, 0x4e3a, 0x4ec0, 0x4e48, 0x91cd, 0x8981)),
  (New-CodepointString @(0x6539, 0x53d8, 0x4e86, 0x6a21, 0x578b, 0x9605, 0x8bfb, 0x5e8f, 0x5217, 0x7684, 0x65b9, 0x5f0f)),
  (New-CodepointString @(0x6539, 0x53d8, 0x4e86, 0x6a21, 0x578b, 0x7406, 0x89e3, 0x8bed, 0x8a00, 0x7684, 0x65b9, 0x5f0f))
)
$RawRefText = Get-Content -Raw -Encoding UTF8 $RefTextFile
foreach ($UnsafeReferenceTerm in $UnsafeReferenceTerms) {
  if ($RawRefText -like "*$UnsafeReferenceTerm*") {
    throw "Unsafe F5 reference text contains topic-specific term '$UnsafeReferenceTerm'. Re-record neutral reference audio first."
  }
}

New-Item -ItemType Directory -Force -Path $SegmentDir | Out-Null

$env:PYTHONIOENCODING = "utf-8"
try {
  $BundledFfmpeg = (& node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)") | Select-Object -First 1
  if ($BundledFfmpeg -and (Test-Path $BundledFfmpeg)) {
    $env:PATH = "$(Split-Path -Parent $BundledFfmpeg);$env:PATH"
  }
} catch {
  # F5-TTS can still write WAV via torchaudio; bundled ffmpeg is a best-effort stabilizer.
}

$env:HF_HOME = "D:\Shanvisorin_platform\hf-cache"
$env:HUGGINGFACE_HUB_CACHE = "D:\Shanvisorin_platform\hf-cache\hub"
$env:CACHED_PATH_CACHE_ROOT = "D:\Shanvisorin_platform\cached-path"
$env:TORCH_HOME = "D:\Shanvisorin_platform\torch-cache"
$env:XDG_CACHE_HOME = "D:\Shanvisorin_platform\xdg-cache"
$env:PIP_CACHE_DIR = "D:\Shanvisorin_platform\pip-cache"
$env:HF_HUB_DISABLE_XET = "1"
$env:HF_HUB_DISABLE_SYMLINKS_WARNING = "1"
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"

if ($Device -eq "cuda") {
  $CudaProbeJson = & $F5Python -c "import torch, json; print(json.dumps({'torch': torch.__version__, 'cuda': torch.cuda.is_available(), 'device_count': torch.cuda.device_count(), 'device_name': torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}, ensure_ascii=False))"
  $CudaProbe = $CudaProbeJson | ConvertFrom-Json
  if (-not $CudaProbe.cuda) {
    throw "F5-TTS requested CUDA, but PyTorch cannot access CUDA. Probe: $CudaProbeJson"
  }

  Write-Host "cuda_probe=$CudaProbeJson"
}

$Manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
$RefText = Get-Content -Raw -Encoding UTF8 $RefTextFile
$GeneratedSegments = @()
$SegmentsToGenerate = @($Manifest.segments)

if ($SegmentIds.Count -gt 0) {
  $RequestedSegmentIds = @{}
  foreach ($SegmentIdValue in $SegmentIds) {
    foreach ($SegmentId in ($SegmentIdValue -split ",")) {
      $CleanSegmentId = $SegmentId.Trim()
      if ($CleanSegmentId) {
        $RequestedSegmentIds[$CleanSegmentId] = $true
      }
    }
  }

  $SegmentsToGenerate = @($Manifest.segments | Where-Object { $RequestedSegmentIds.ContainsKey($_.segment_id) })
  if ($SegmentsToGenerate.Count -ne $RequestedSegmentIds.Count) {
    $FoundIds = @($SegmentsToGenerate | ForEach-Object { $_.segment_id })
    throw "Requested segment ids were not all found. requested=$($RequestedSegmentIds.Keys -join ',') found=$($FoundIds -join ',')"
  }
}

foreach ($Segment in $SegmentsToGenerate) {
  $GenFile = Join-Path $EpisodeDir ($Segment.gen_file -replace "/", "\")
  $OutputRelative = $Segment.output_audio -replace "/", "\"
  $OutputPath = Join-Path $EpisodeDir $OutputRelative
  $OutputFile = Split-Path -Leaf $OutputPath

  if ((Test-Path $OutputPath) -and -not $Force) {
    Write-Host "segment=$($Segment.segment_id) status=skipped_existing output=$OutputPath"
  } else {
    Write-Host "segment=$($Segment.segment_id) status=generating"
    & $F5Cli `
      --model F5TTS_v1_Base `
      --ckpt_file $Checkpoint `
      --vocab_file $Vocab `
      --ref_audio $RefAudio `
      --ref_text $RefText `
      --gen_file $GenFile `
      --output_dir $SegmentDir `
      --output_file $OutputFile `
      --device $Device `
      --nfe_step $NfeStep `
      --speed $Speed `
      --cross_fade_duration 0.05

    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }

  $GeneratedSegments += [ordered]@{
    segment_id = $Segment.segment_id
    output_audio = $Segment.output_audio
  }
}

$StatusObject = [ordered]@{
  status = "generated_segmented_review"
  engine = "f5_tts_local_segmented"
  provider_calls = $false
  tts_calls = $true
  generated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
  source_manifest = "audio/f5_tts/$SegmentSubdir/segment_manifest.json"
  reference_audio = "voice/enrollment/reference_neutral_f5_8s.wav"
  settings = [ordered]@{
    device = $Device
    nfe_step = $NfeStep
    speed = $Speed
    offline_cache = $true
  }
  limitations = @(
    "Segmented generation avoids F5-TTS long-text batch artifacts but still requires human voice and pronunciation review.",
    "Current workflow requires a neutral 8-10s reference audio to prevent reference-text leakage into generated voiceover."
  )
  segments = $GeneratedSegments
}

$StatusObject | ConvertTo-Json -Depth 8 | Set-Content -Path (Join-Path $SegmentDir "segmented_tts_status.json") -Encoding UTF8
Write-Host "status=generated_segmented"
