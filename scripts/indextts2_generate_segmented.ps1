param(
  [string]$EpisodeDir = "C:\Users\Rome\Documents\Paper_every_day\episodes\ep02_attention_qkv",
  [string]$IndexTtsDir = "D:\Shanvisorin_platform\index-tts",
  [string]$PythonExe = "D:\Shanvisorin_platform\index-tts\.venv\Scripts\python.exe",
  [string]$W2vBertDir = "D:\Shanvisorin_platform\index-tts\external_models\facebook_w2v_bert_2_0",
  [string]$MaskGctSemanticCodec = "D:\Shanvisorin_platform\index-tts\external_models\MaskGCT\semantic_codec\model.safetensors",
  [string]$CampplusCkpt = "D:\Shanvisorin_platform\index-tts\external_models\campplus\campplus_cn_common.bin",
  [string]$BigvganDir = "D:\Shanvisorin_platform\index-tts\external_models\bigvgan_v2_22khz_80band_256x",
  [string]$ReferenceAudio = "voice\enrollment\reference_neutral_f5_8s.wav",
  [string]$SegmentManifest = "audio\indextts2\segments\segment_manifest.json",
  [string]$DeliveryStyleManifest = "audio\indextts2\delivery_style.json",
  [string[]]$SegmentIds = @(),
  [switch]$Force,
  [switch]$UseFp16,
  [switch]$UseCudaKernel
)

$ErrorActionPreference = "Stop"

$ManifestPath = Join-Path $EpisodeDir $SegmentManifest
$RefAudioPath = Join-Path $EpisodeDir $ReferenceAudio
$CfgPath = Join-Path $IndexTtsDir "checkpoints\config.yaml"
$ModelDir = Join-Path $IndexTtsDir "checkpoints"
$PythonRunner = Join-Path (Get-Location) "scripts\indextts2_infer_segments.py"
$BigvganConfig = Join-Path $BigvganDir "config.json"
$BigvganGenerator = Join-Path $BigvganDir "bigvgan_generator.pt"

foreach ($RequiredPath in @($EpisodeDir, $IndexTtsDir, $PythonExe, $W2vBertDir, $MaskGctSemanticCodec, $CampplusCkpt, $BigvganDir, $BigvganConfig, $BigvganGenerator, $ManifestPath, $RefAudioPath, $CfgPath, $ModelDir, $PythonRunner)) {
  if (-not (Test-Path $RequiredPath)) {
    throw "Missing required IndexTTS2 input: $RequiredPath"
  }
}

if ((Get-Item $BigvganGenerator).Length -lt 400000000) {
  throw "Incomplete BigVGAN checkpoint: $BigvganGenerator. Resume the download before running IndexTTS2."
}

$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUNBUFFERED = "1"
$env:HF_HOME = "D:\Shanvisorin_platform\hf-cache"
$env:HUGGINGFACE_HUB_CACHE = "D:\Shanvisorin_platform\hf-cache\hub"
$env:HF_HUB_DISABLE_SYMLINKS_WARNING = "1"
$env:TORCH_HOME = "D:\Shanvisorin_platform\torch-cache"
$env:XDG_CACHE_HOME = "D:\Shanvisorin_platform\xdg-cache"
$env:PIP_CACHE_DIR = "D:\Shanvisorin_platform\pip-cache"
$env:UV_CACHE_DIR = "D:\Shanvisorin_platform\uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "D:\Shanvisorin_platform\uv-python"
$env:PYTHONPATH = "$IndexTtsDir;$env:PYTHONPATH"
$env:INDEXTTS2_W2V_BERT_DIR = $W2vBertDir
$env:INDEXTTS2_MASKGCT_SEMANTIC_CODEC = $MaskGctSemanticCodec
$env:INDEXTTS2_CAMPPLUS_CKPT = $CampplusCkpt
$env:INDEXTTS2_BIGVGAN_DIR = $BigvganDir

$ArgsList = @(
  $PythonRunner,
  "--episode-dir", $EpisodeDir,
  "--manifest", $SegmentManifest,
  "--delivery-style-manifest", $DeliveryStyleManifest,
  "--reference-audio", $ReferenceAudio,
  "--cfg-path", $CfgPath,
  "--model-dir", $ModelDir,
  "--w2v-bert-dir", $W2vBertDir,
  "--maskgct-semantic-codec", $MaskGctSemanticCodec,
  "--campplus-ckpt", $CampplusCkpt,
  "--bigvgan-dir", $BigvganDir
)

foreach ($SegmentIdValue in $SegmentIds) {
  foreach ($SegmentId in ($SegmentIdValue -split ",")) {
    $CleanSegmentId = $SegmentId.Trim()
    if ($CleanSegmentId) {
      $ArgsList += @("--segment-id", $CleanSegmentId)
    }
  }
}

if ($Force) {
  $ArgsList += "--force"
}

if ($UseFp16) {
  $ArgsList += "--use-fp16"
}

if ($UseCudaKernel) {
  $ArgsList += "--use-cuda-kernel"
}

Push-Location $IndexTtsDir
try {
  & $PythonExe @ArgsList
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
