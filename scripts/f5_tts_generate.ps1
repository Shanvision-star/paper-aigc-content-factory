param(
  [string]$EpisodeDir = "C:\Users\Rome\Documents\Paper_every_day\episodes\ep01_attention_is_all_you_need",
  [string]$Device = "cuda",
  [int]$NfeStep = 16,
  [decimal]$Speed = 0.78,
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$OutDir = Join-Path $EpisodeDir "audio\f5_tts"
$OutputWav = Join-Path $OutDir "attention_full_voiceover_f5_v1.wav"
$GenFile = Join-Path $OutDir "full_voiceover_zh_v1.txt"
$RefTextFile = Join-Path $OutDir "reference_text_f5_neutral.txt"
$RefAudio = Join-Path $EpisodeDir "voice\enrollment\reference_neutral_f5_8s.wav"
$F5Cli = "D:\Shanvisorin_platform\F5-TTS\.venv\Scripts\f5-tts_infer-cli.exe"
$F5Python = "D:\Shanvisorin_platform\F5-TTS\.venv\Scripts\python.exe"
$Checkpoint = "D:\Shanvisorin_platform\models\F5-TTS_Emilia-ZH-EN\model_1250000.safetensors"
$Vocab = "D:\Shanvisorin_platform\models\F5-TTS_Emilia-ZH-EN\vocab.txt"
$StatusPath = Join-Path $OutDir "tts_status.json"

function Get-WavDurationSec {
  param([string]$WavPath)

  try {
    $Ffprobe = (& node -e "console.log(require('ffprobe-static').path)") | Select-Object -First 1
    if (-not $Ffprobe -or -not (Test-Path $Ffprobe)) {
      return $null
    }

    $DurationText = & $Ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $WavPath
    $Duration = 0.0
    if ([double]::TryParse($DurationText, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$Duration)) {
      return [Math]::Round($Duration, 3)
    }
  } catch {
    return $null
  }

  return $null
}

function Write-TtsStatus {
  param(
    [string]$Status,
    [bool]$MadeTtsCall
  )

  $DurationSec = if (Test-Path $OutputWav) { Get-WavDurationSec $OutputWav } else { $null }
  $QualityProfile = if ($NfeStep -lt 16 -or $Device -eq "cpu") { "fast_review_not_final_publish" } else { "standard_review_cuda" }
  $Limitations = @("Human voice similarity check is still required before final publishing.")
  if ($NfeStep -lt 16 -or $Device -eq "cpu") {
    $Limitations += "Fast or CPU generation is for review only; final voiceover should use CUDA and nfe_step >= 16."
  }
  $Limitations += "Current workflow requires a neutral 8-10s reference audio to prevent reference-text leakage into generated voiceover."

  $StatusObject = [ordered]@{
    status = $Status
    engine = "f5_tts_local"
    provider_calls = $false
    tts_calls = $MadeTtsCall
    generated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
    source_text = "audio/f5_tts/full_voiceover_zh_v1.txt"
    reference_audio = "voice/enrollment/reference_neutral_f5_8s.wav"
    output_audio = "audio/f5_tts/attention_full_voiceover_f5_v1.wav"
    duration_sec = $DurationSec
    sample_rate_hz = 24000
    channels = 1
    quality_profile = $QualityProfile
    model = [ordered]@{
      repo = "SWivid/F5-TTS_Emilia-ZH-EN"
      checkpoint = $Checkpoint
      vocab = $Vocab
    }
    settings = [ordered]@{
      device = $Device
      nfe_step = $NfeStep
      speed = $Speed
      offline_cache = $true
    }
    limitations = $Limitations
  }

  $StatusObject | ConvertTo-Json -Depth 8 | Set-Content -Path $StatusPath -Encoding UTF8
}

if ((Test-Path $OutputWav) -and -not $Force) {
  if (Test-Path $StatusPath) {
    try {
      $ExistingStatus = Get-Content -Raw -Encoding UTF8 $StatusPath | ConvertFrom-Json
      $MatchesRequestedSettings = (
        $ExistingStatus.settings.device -eq $Device -and
        [int]$ExistingStatus.settings.nfe_step -eq $NfeStep -and
        [decimal]$ExistingStatus.settings.speed -eq $Speed
      )

      if ($MatchesRequestedSettings -and $ExistingStatus.quality_profile -ne "fast_review_not_final_publish") {
        Write-TtsStatus "skipped_existing" $false
        Write-Host "status=skipped_existing"
        Write-Host "output=$OutputWav"
        exit 0
      }
    } catch {
      Write-Host "status=existing_status_unreadable_regenerating"
    }
  }

  Write-Host "status=existing_audio_settings_mismatch_regenerating"
}

foreach ($RequiredPath in @($GenFile, $RefTextFile, $RefAudio, $F5Cli, $F5Python, $Checkpoint, $Vocab)) {
  if (-not (Test-Path $RequiredPath)) {
    throw "Missing required F5-TTS input: $RequiredPath"
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

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$env:PYTHONIOENCODING = "utf-8"
try {
  $BundledFfmpeg = (& node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)") | Select-Object -First 1
  if ($BundledFfmpeg -and (Test-Path $BundledFfmpeg)) {
    $env:PATH = "$(Split-Path -Parent $BundledFfmpeg);$env:PATH"
  }
} catch {
  # F5-TTS can still write WAV via torchaudio; bundled ffmpeg is a best-effort stabilizer.
}

# Local offline cache boundary: avoid accidental network downloads during Dagu runs.
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

$RefText = Get-Content -Raw -Encoding UTF8 $RefTextFile

& $F5Cli `
  --model F5TTS_v1_Base `
  --ckpt_file $Checkpoint `
  --vocab_file $Vocab `
  --ref_audio $RefAudio `
  --ref_text $RefText `
  --gen_file $GenFile `
  --output_dir $OutDir `
  --output_file "attention_full_voiceover_f5_v1.wav" `
  --device $Device `
  --nfe_step $NfeStep `
  --speed $Speed

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-TtsStatus "generated_review_draft" $true
Write-Host "status=generated"
Write-Host "output=$OutputWav"
