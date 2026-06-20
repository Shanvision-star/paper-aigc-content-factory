param(
    [string]$Root = (Resolve-Path "$PSScriptRoot\..\..\..").Path,
    [switch]$ForceVoice,
    [switch]$AllowSapiDraft
)

$ErrorActionPreference = "Stop"

$EpisodeDir = Join-Path $Root "episodes\ep05_rope_position_encoding"
$TopicPath = Join-Path $EpisodeDir "topic.yaml"
$VoiceoverPath = Join-Path $EpisodeDir "review\ep05_voiceover_v3_225s_for_review.md"
$RenderDir = Join-Path $EpisodeDir "renders\hyperframes_ep05_final"
$MediaDir = Join-Path $RenderDir "media"
$AudioDir = Join-Path $EpisodeDir "audio"
$CaptionDir = Join-Path $EpisodeDir "captions"
$QaDir = Join-Path $EpisodeDir "qa"
$MathAssetDir = Join-Path $Root "experiments\matlab_transformer_poc\outputs\ep05_hyperframes_math_assets"
$RopeLocalAssetDir = Join-Path $Root "experiments\matlab_transformer_poc\outputs\ep05_hyperframes_rope_local_assets"
$RopeComponentAssetDir = Join-Path $Root "experiments\matlab_transformer_poc\outputs\ep05_rope_rotation_component"
[double]$CompositionDurationSec = 216
$EpisodeKicker = "EP05 · 为什么现代大模型都绕不开 RoPE？"
$OutputMp4 = Join-Path $EpisodeDir "renders\ep05_rope_position_encoding_indextts2_sfx_final_review.mp4"
$SapiDraftOutputMp4 = Join-Path $EpisodeDir "renders\ep05_rope_position_encoding_216s_sapi_draft.mp4"
$PersonalVoiceoverBaseWav = Join-Path $AudioDir "voiceover.wav"
$PersonalVoiceoverWithSfxWav = Join-Path $AudioDir "voiceover.with_sfx.wav"
$PersonalVoiceoverWav = $PersonalVoiceoverWithSfxWav
$SapiVoiceoverWav = Join-Path $AudioDir "voiceover_sapi_draft.wav"
$VoiceoverWav = $PersonalVoiceoverWav
$VoiceMode = "authorized_personal_reference_voice"
$VoiceSourceRelative = "audio/voiceover.with_sfx.wav"

foreach ($dir in @($RenderDir, $MediaDir, $AudioDir, $CaptionDir, $QaDir, (Split-Path $OutputMp4))) {
    New-Item -ItemType Directory -Force $dir | Out-Null
}

function Invoke-NpmGate([string]$scriptName) {
    Push-Location $Root
    try {
        & npm run $scriptName
        if ($LASTEXITCODE -ne 0) {
            throw "Gate failed: npm run $scriptName"
        }
    } finally {
        Pop-Location
    }
}

function Convert-TimeToSeconds([string]$value) {
    $parts = $value.Split(":")
    return ([int]$parts[0] * 60) + [int]$parts[1]
}

function Format-SrtTime([double]$seconds) {
    $ts = [TimeSpan]::FromSeconds($seconds)
    return "{0:00}:{1:00}:{2:00},{3:000}" -f [int]$ts.TotalHours, $ts.Minutes, $ts.Seconds, $ts.Milliseconds
}

function ConvertTo-InvariantNumber([double]$value, [int]$digits = 3) {
    return $value.ToString("F$digits", [System.Globalization.CultureInfo]::InvariantCulture)
}

function Remove-MarkdownInline([string]$text) {
    return ($text -replace '`', "" -replace "\*\*", "" -replace "<br\s*/?>", " ").Trim()
}

function ConvertTo-StableVisibleMixedText([string]$text) {
    if ($null -eq $text) {
        return $text
    }

    # 避免大字号 CJK + Latin 混排时“与”触发字体 fallback / glyph 渲染异常；口播语义不变。
    return ($text -replace "KV cache 与推理速度", "KV cache 和推理速度")
}

function ConvertTo-SpokenText([string]$text) {
    $spoken = Remove-MarkdownInline $text
    $spoken = $spoken -replace "x = x \+ pe", "x 等于 x 加 P E"
    $spoken = $spoken -replace "x = x \+ PE", "x 等于 x 加 P E"
    $spoken = $spoken -replace "d_model", "d model"
    $spoken = $spoken -replace "mθ_i", "m 乘 theta 下标 i"
    $spoken = $spoken -replace "nθ_i", "n 乘 theta 下标 i"
    $spoken = $spoken -replace "θ_i", "theta 下标 i"
    $spoken = $spoken -replace "δ_i", "delta 下标 i"
    $spoken = $spoken -replace "n - m", "n 减 m"
    $spoken = $spoken -replace "在长上下文场景里", "在上下文长度变大时"
    $spoken = $spoken -replace "变成了长上下文工程里的核心问题", "变成了处理更长输入范围时的核心工程问题"
    $spoken = $spoken -replace "影响\s*KV\s*cache、长上下文", "影响 Key Value cache 在更大输入范围里的复用"
    $spoken = $spoken -replace "上下文越长", "上下文长度越大"
    $spoken = $spoken -replace "gpt-oss", "g p t oss"
    $spoken = $spoken -replace "DeepSeek-V4", "DeepSeek 第四版"
    $spoken = $spoken -replace "KV\s*cache", "Key Value cache"
    $spoken = $spoken -replace "Q/K", "Query 向量和 Key 向量"
    $spoken = $spoken -replace "(?<![A-Za-z])Q(?![A-Za-z])", "Query 向量"
    $spoken = $spoken -replace "(?<![A-Za-z])K(?![A-Za-z])", "Key 向量"
    $spoken = $spoken -replace "(?<![A-Za-z])V(?![A-Za-z])", "Value 向量"
    return $spoken
}

function Escape-Html([string]$text) {
    return [System.Net.WebUtility]::HtmlEncode($text)
}

function Read-TimedTable([string]$path, [bool]$hasSupport) {
    $rows = @()
    foreach ($line in Get-Content -Encoding UTF8 $path) {
        if ($hasSupport) {
            if ($line -match '^\|\s*(\d\d:\d\d)-(\d\d:\d\d)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|') {
                $rows += [pscustomobject]@{
                    start = Convert-TimeToSeconds $Matches[1]
                    end = Convert-TimeToSeconds $Matches[2]
                    main = ConvertTo-StableVisibleMixedText (Remove-MarkdownInline $Matches[3])
                    support = ConvertTo-StableVisibleMixedText (Remove-MarkdownInline $Matches[4])
                }
            }
        } else {
            if ($line -match '^\|\s*(\d\d:\d\d)-(\d\d:\d\d)\s*\|\s*(.*?)\s*\|') {
                $rows += [pscustomobject]@{
                    start = Convert-TimeToSeconds $Matches[1]
                    end = Convert-TimeToSeconds $Matches[2]
                    text = Remove-MarkdownInline $Matches[3]
                    spoken = ConvertTo-SpokenText $Matches[3]
                }
            }
        }
    }
    return $rows
}

function Get-NodeModulePath([string]$moduleExpression) {
    $result = (& node -e "process.stdout.write(String($moduleExpression))")
    if (-not $result) {
        throw "Cannot resolve node module path: $moduleExpression"
    }
    return $result
}

function Get-AudioDuration([string]$ffprobe, [string]$path) {
    $duration = (& $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $path).Trim()
    return [double]::Parse($duration, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-AtempoChain([double]$speed) {
    if ([Math]::Abs($speed - 1.0) -lt 0.015) {
        return @()
    }
    $filters = @()
    $remaining = $speed
    while ($remaining -gt 2.0) {
        $filters += "atempo=2.0"
        $remaining = $remaining / 2.0
    }
    while ($remaining -lt 0.5) {
        $filters += "atempo=0.5"
        $remaining = $remaining / 0.5
    }
    $filters += ("atempo={0}" -f (ConvertTo-InvariantNumber $remaining 6))
    return $filters
}

function Write-Subtitles([object[]]$subs) {
    $srtPath = Join-Path $CaptionDir "subtitles.srt"
    $lines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $subs.Count; $i++) {
        $item = $subs[$i]
        $lines.Add([string]($i + 1))
        $timeRange = "{0} --> {1}" -f (Format-SrtTime $item.start), (Format-SrtTime $item.end)
        $lines.Add($timeRange)
        $lines.Add($item.main)
        if ($item.support) {
            $lines.Add($item.support)
        }
        $lines.Add("")
    }
    [System.IO.File]::WriteAllLines($srtPath, $lines, [System.Text.UTF8Encoding]::new($false))
    return $srtPath
}

function Resolve-CaptionTimingReport() {
    $voiceManifestPath = Join-Path $AudioDir "voiceover_manifest.json"
    $indexReport = Join-Path $AudioDir "indextts2\segments\segmented_merge_report.json"
    $f5Report = Join-Path $AudioDir "f5_tts\segments\segmented_merge_report.json"

    if (Test-Path -LiteralPath $indexReport) {
        return "audio/indextts2/segments/segmented_merge_report.json"
    }

    if (Test-Path -LiteralPath $f5Report) {
        return "audio/f5_tts/segments/segmented_merge_report.json"
    }

    return $null
}

function Build-DynamicCaptions([string]$timingReport) {
    $captionScript = Join-Path $Root "scripts\build_ep05_dynamic_captions.ts"
    if (-not (Test-Path -LiteralPath $captionScript)) {
        throw "Missing dynamic caption builder: $captionScript"
    }

    $args = @($captionScript, $TopicPath)
    if ($timingReport) {
        $args += @("--timing-report", $timingReport)
    }

    Push-Location $Root
    try {
        & npx tsx @args
        if ($LASTEXITCODE -ne 0) {
            throw "Dynamic caption generation failed."
        }
    } finally {
        Pop-Location
    }

    $captionEntriesPath = Join-Path $CaptionDir "caption_entries.json"
    if (-not (Test-Path -LiteralPath $captionEntriesPath)) {
        throw "Dynamic caption builder did not create $captionEntriesPath"
    }

    return (Get-Content -Raw -Encoding UTF8 $captionEntriesPath | ConvertFrom-Json)
}

function Write-ReviewVoiceover([object[]]$segments, [string]$ffmpeg, [string]$ffprobe) {
    $segmentDir = Join-Path $AudioDir "sapi_segments"
    New-Item -ItemType Directory -Force $segmentDir | Out-Null
    $concatList = Join-Path $segmentDir "concat.txt"

    Add-Type -AssemblyName System.Speech
    $synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
    $voice = $synth.GetInstalledVoices() |
        Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq "zh-CN" -and $_.VoiceInfo.Name -like "*Huihui*" } |
        Select-Object -First 1
    if (-not $voice) {
        $voice = $synth.GetInstalledVoices() |
            Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq "zh-CN" } |
            Select-Object -First 1
    }
    if (-not $voice) {
        throw "No enabled zh-CN SAPI voice is installed."
    }
    $synth.SelectVoice($voice.VoiceInfo.Name)
    $synth.Rate = -1
    $synth.Volume = 100

    $concatLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $segments.Count; $i++) {
        $seg = $segments[$i]
        $raw = Join-Path $segmentDir ("seg_{0:000}_raw.wav" -f ($i + 1))
        $fit = Join-Path $segmentDir ("seg_{0:000}_fit.wav" -f ($i + 1))
        $target = [double]($seg.end - $seg.start)

        if ($ForceVoice -or -not (Test-Path -LiteralPath $raw)) {
            $synth.SetOutputToWaveFile($raw)
            [void]$synth.Speak($seg.spoken)
            $synth.SetOutputToNull()
        }

        $rawDuration = Get-AudioDuration $ffprobe $raw
        $speechTarget = [Math]::Max(0.6, $target - 0.18)
        $speed = if ($rawDuration -gt $speechTarget) { $rawDuration / $speechTarget } else { 1.0 }
        $filters = @(Get-AtempoChain $speed)
        $filters += "apad"
        $filters += ("atrim=0:{0}" -f (ConvertTo-InvariantNumber $target 3))
        $filters += "asetpts=N/SR/TB"
        $af = $filters -join ","
        & $ffmpeg -y -hide_banner -loglevel error -i $raw -af $af -ar 44100 -ac 2 $fit
        if ($LASTEXITCODE -ne 0) {
            throw "ffmpeg failed while fitting audio segment $($i + 1)"
        }
        $concatLines.Add("file '$($fit.Replace('\','/'))'")
    }
    [System.IO.File]::WriteAllLines($concatList, $concatLines, [System.Text.UTF8Encoding]::new($false))
    & $ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $concatList -c:a pcm_s16le $SapiVoiceoverWav
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed while concatenating voiceover."
    }
    $manifest = [ordered]@{
        status = "audio_ready"
        engine = "windows_sapi_builtin_review_voice"
        voice = $voice.VoiceInfo.Name
        culture = $voice.VoiceInfo.Culture.Name
        source_script = "review/ep05_voiceover_v3_225s_for_review.md"
        output = "audio/voiceover_sapi_draft.wav"
        duration_s = [Math]::Round((Get-AudioDuration $ffprobe $SapiVoiceoverWav), 3)
        tts_calls = $false
        provider_calls = $false
        note = "Built-in Windows zh-CN SAPI voice for local draft only; not allowed for final review MP4."
    }
    $manifest | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 (Join-Path $AudioDir "voiceover_sapi_draft_manifest.json")
}

function New-SceneObject([string]$id, [double]$start, [double]$end, [string]$title, [string]$kicker, [string]$body, [string]$kind) {
    return [ordered]@{
        id = $id
        start = $start
        duration = $end - $start + $(if ($end -lt $CompositionDurationSec) { 0.5 } else { 0 })
        title = $title
        kicker = $kicker
        body = $body
        kind = $kind
    }
}

function Write-HyperframesProject([object[]]$subs) {
    $gsapSrc = Join-Path $EpisodeDir "renders\hyperframes_review\media\gsap.min.js"
    foreach ($pair in @(
        @($VoiceoverWav, (Join-Path $MediaDir "voiceover.wav")),
        @((Join-Path $MathAssetDir "pe_formula.png"), (Join-Path $MediaDir "pe_formula.png")),
        @((Join-Path $MathAssetDir "attention_formula.png"), (Join-Path $MediaDir "attention_formula.png")),
        @((Join-Path $MathAssetDir "rope_relative_formula.png"), (Join-Path $MediaDir "rope_relative_formula.png")),
        @((Join-Path $MathAssetDir "rope_matrix_formula.png"), (Join-Path $MediaDir "rope_matrix_formula.png")),
        @((Join-Path $MathAssetDir "rope_numeric_demo.json"), (Join-Path $MediaDir "rope_numeric_demo.json")),
        @((Join-Path $RopeLocalAssetDir "rope_rotation_grid.png"), (Join-Path $MediaDir "rope_rotation_grid.png")),
        @((Join-Path $RopeLocalAssetDir "rope_delta_explainer.png"), (Join-Path $MediaDir "rope_delta_explainer.png")),
        @((Join-Path $RopeLocalAssetDir "rope_bridge_rotation_mini.png"), (Join-Path $MediaDir "rope_bridge_rotation_mini.png")),
        @((Join-Path $RopeComponentAssetDir "rope_rotation_component.mp4"), (Join-Path $MediaDir "rope_rotation_component.mp4")),
        @($gsapSrc, (Join-Path $MediaDir "gsap.min.js"))
    )) {
        if (-not (Test-Path -LiteralPath $pair[0])) {
            throw "Missing media source: $($pair[0])"
        }
        Copy-Item -LiteralPath $pair[0] -Destination $pair[1] -Force
    }
    "{}" | Set-Content -Encoding UTF8 (Join-Path $RenderDir "caption-overrides.json")

    $scenes = @(
        New-SceneObject "s1" 0 23 "位置不是加上去的，是转进 Attention 的" $EpisodeKicker "从原始 Transformer 的位置编码公式和 Annotated Transformer 代码示例，走到 RoFormer 的 Q/K 旋转。" "cover"
        New-SceneObject "s2" 23 50 "原始 PE：位置加到输入" $EpisodeKicker "不是新增 token；是在同一个 d model 维度里逐元素相加。" "pe"
        New-SceneObject "s3" 50 76 "座位号能给位置，但关系还要算距离" $EpisodeKicker "第 37 号和第 42 号当然有各自位置，但相隔 5 个位置才是比较关系时常要用的信息。" "seat"
        New-SceneObject "s4" 76 92 "RoPE：位置写进 Q 和 K 的旋转" $EpisodeKicker "RoPE 不再给 token 额外加一段位置向量，而是在 Q/K 的二维维度块里按位置旋转。" "bridge"
        New-SceneObject "s5" 92 122 "Q 按 m × θᵢ 旋转，K 按 n × θᵢ 旋转" $EpisodeKicker "位置 m 的 Q 按 m × θᵢ 旋转；位置 n 的 K 按 n × θᵢ 旋转。" "rotate"
        New-SceneObject "s6" 122 151 "点积时，位置相位差依赖 n - m" $EpisodeKicker "不是说点积后只剩相对距离，而是位置相关相位由相对位移决定，内容 q/k 仍然参与匹配。" "formula"
        New-SceneObject "s7" 151 170 "长上下文让位置建模变成核心工程问题" $EpisodeKicker "上下文越长，模型越需要稳定地区分近处、远处和相对位移。" "context"
        New-SceneObject "s8" 170 180 "公开证据与专有模型边界" $EpisodeKicker "gpt-oss 可作为 RoPE 公开证据；DeepSeek-V4 可作为 Partial RoPE 公开证据；专有模型未公开细节时不下结论。" "evidence"
        New-SceneObject "s9" 180 207 "费曼总结：座位坐标 vs 相隔几排" $EpisodeKicker "原始 PE 像把座位坐标写在名牌上；RoPE 像在对话时把相隔几排算进这次关系。" "summary"
        New-SceneObject "s10" 207 $CompositionDurationSec "下一集：KV cache 和推理速度" $EpisodeKicker "位置工程会继续影响长上下文、缓存和推理成本。" "outro"
    )

    $sceneHtml = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $scenes.Count; $i++) {
        $scene = $scenes[$i]
        $track = 1 + ($i % 2)
        $sceneFragment = @"
    <section id="$($scene.id)" class="scene scene-$($scene.kind) clip" data-start="$($scene.start)" data-duration="$([Math]::Round($scene.duration, 3))" data-track-index="$track">
      <div class="scene-inner">
        <div class="kicker">$(Escape-Html $scene.kicker)</div>
        <h1>$(Escape-Html $scene.title)</h1>
        <p class="scene-body">$(Escape-Html $scene.body)</p>
        <div class="visual visual-$($scene.kind)">
          $(Get-SceneVisualHtml $scene.kind)
        </div>
      </div>
    </section>
"@
        $sceneHtml.Add($sceneFragment)
    }

    $captionHtml = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $subs.Count; $i++) {
        $cap = $subs[$i]
        $capStart = [double]$cap.start
        $capEnd = [double]$cap.end
        if ($i -lt ($subs.Count - 1)) {
            $nextStart = [double]$subs[$i + 1].start
            $capEnd = [Math]::Min($capEnd, $nextStart - 0.002)
        }
        $capDuration = [Math]::Round([Math]::Max(0.05, ($capEnd - $capStart)), 3)
        $captionFragment = @"
    <div id="cap-$i" class="caption-group clip" data-start="$(ConvertTo-InvariantNumber $capStart)" data-duration="$(ConvertTo-InvariantNumber $capDuration)" data-track-index="20">
      <div class="caption-main">$(Escape-Html $cap.main)</div>
      <div class="caption-support">$(Escape-Html $cap.support)</div>
    </div>
"@
        $captionHtml.Add($captionFragment)
    }

    $videoClips = ""
    $audioSrc = "media/voiceover.wav"
    $html = @"
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EP05 · 为什么现代大模型都绕不开 RoPE？</title>
  <script src="media/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #F7F4EC; }
    #root {
      position: relative;
      overflow: hidden;
      width: 1080px;
      height: 1920px;
      background: #F7F4EC;
      color: #101820;
      font-family: "Noto Sans JP", "Noto Sans", sans-serif;
    }
    .scene {
      position: absolute;
      inset: 0;
      opacity: 0;
      background: #F7F4EC;
      overflow: hidden;
    }
    .scene::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(16,24,32,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,32,0.030) 1px, transparent 1px);
      background-size: 56px 56px;
      opacity: 0.55;
      pointer-events: none;
    }
    .scene-inner {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 96px 74px 246px;
      display: flex;
      flex-direction: column;
      gap: 26px;
    }
    .kicker {
      width: fit-content;
      max-width: 900px;
      padding: 11px 18px;
      border: 2px solid rgba(179,107,24,0.34);
      background: #FFF4D8;
      color: #72410E;
      font-size: 28px;
      font-weight: 900;
      border-radius: 8px;
    }
    h1 {
      margin: 0;
      color: #101820;
      font-size: 64px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;
      max-width: 930px;
    }
    .scene-body {
      margin: 0;
      max-width: 900px;
      color: #46505A;
      font-size: 32px;
      line-height: 1.42;
      font-weight: 700;
    }
    .visual {
      flex: 1;
      position: relative;
      min-height: 720px;
      border: 3px solid rgba(16,24,32,0.14);
      border-radius: 8px;
      background: rgba(255,255,255,0.74);
      overflow: hidden;
      box-shadow: 0 18px 46px rgba(16,24,32,0.08);
    }
    .caption-group {
      position: absolute;
      left: 86px;
      right: 86px;
      bottom: 126px;
      z-index: 80;
      min-height: 126px;
      padding: 20px 28px;
      border: 2px solid rgba(179,107,24,0.44);
      border-radius: 8px;
      background: rgba(255,248,229,0.96);
      box-shadow: 0 16px 34px rgba(16,24,32,0.11);
      text-align: center;
      opacity: 0;
    }
    .caption-main {
      color: #3F2508;
      font-size: 38px;
      line-height: 1.18;
      font-weight: 900;
    }
    .caption-support {
      margin-top: 12px;
      color: #5E6470;
      font-size: 25px;
      line-height: 1.24;
      font-weight: 700;
    }
    .caption-support:empty {
      display: none;
    }
    .matlab-clip {
      position: absolute;
      z-index: 35;
      object-fit: cover;
      background: #FFFFFF;
      border: 1px solid rgba(16,24,32,0.12);
      border-radius: 8px;
      box-shadow: 0 14px 32px rgba(16,24,32,0.12);
    }
    .matlab-hook {
      left: 76px;
      top: 405px;
      width: 928px;
      height: 1198px;
    }
    .matlab-rope {
      left: 92px;
      top: 405px;
      width: 896px;
      height: 1198px;
    }
    .cover-title {
      position: absolute;
      left: 66px;
      top: 86px;
      right: 66px;
      font-size: 88px;
      line-height: 1.08;
      font-weight: 900;
      color: #101820;
    }
    .cover-sub {
      position: absolute;
      left: 70px;
      top: 310px;
      right: 70px;
      font-size: 34px;
      line-height: 1.42;
      font-weight: 800;
      color: #46505A;
    }
    .cover-watermark {
      position: absolute;
      left: 46px;
      top: 380px;
      color: rgba(16,24,32,0.055);
      font-size: 186px;
      font-weight: 900;
      font-family: "Noto Sans JP", "Noto Sans", sans-serif;
    }
    .proof-grid {
      position: absolute;
      left: 58px;
      right: 58px;
      bottom: 72px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .proof-card {
      min-height: 250px;
      padding: 26px;
      border-radius: 8px;
      border: 3px solid rgba(16,24,32,0.18);
      background: rgba(255,255,255,0.86);
    }
    .proof-card b { display: block; font-size: 30px; margin-bottom: 14px; color: #173B63; }
    .proof-card span { display: block; font-size: 24px; color: #46505A; line-height: 1.3; font-weight: 700; }
    .pe-meaning {
      position: absolute;
      left: 70px;
      right: 70px;
      top: 86px;
      display: grid;
      grid-template-columns: 1fr 56px 1fr 70px 1fr;
      gap: 10px;
      align-items: center;
    }
    .pe-card {
      min-height: 184px;
      padding: 20px;
      border-radius: 8px;
      border: 3px solid rgba(16,24,32,0.12);
      background: #FFFFFF;
      display: grid;
      align-content: center;
      gap: 12px;
      text-align: center;
      box-shadow: 0 10px 24px rgba(16,24,32,0.06);
    }
    .pe-card b {
      color: #173B63;
      font-size: 25px;
      line-height: 1.2;
      font-weight: 900;
    }
    .pe-card span {
      color: #46505A;
      font-size: 19px;
      line-height: 1.28;
      font-weight: 800;
    }
    .pe-card .tagline {
      color: #72410E;
      font-size: 17px;
      line-height: 1.2;
      font-weight: 900;
    }
    .pe-card.result b {
      color: #7A334D;
    }
    .pe-vector-mini {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
    }
    .pe-mini-cell {
      height: 22px;
      border-radius: 4px;
      background: var(--mini);
      border: 1px solid rgba(16,24,32,0.10);
    }
    .pe-op {
      color: #B36B18;
      font-size: 48px;
      font-weight: 900;
      text-align: center;
      line-height: 1;
    }
    .seat-row {
      position: absolute;
      left: 70px;
      right: 70px;
      top: 180px;
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 8px;
    }
    .seat {
      height: 78px;
      border: 2px solid rgba(16,24,32,0.18);
      background: #FFFFFF;
      border-radius: 8px;
      display: grid;
      place-items: center;
      color: #46505A;
      font-size: 22px;
      font-weight: 800;
    }
    .seat.active-a, .seat.active-b {
      color: #FFFFFF;
      background: #173B63;
      border-color: #173B63;
    }
    .distance-line {
      position: absolute;
      left: 395px;
      top: 304px;
      width: 316px;
      height: 7px;
      background: #B36B18;
      border-radius: 999px;
      transform-origin: left center;
    }
    .distance-label {
      position: absolute;
      left: 350px;
      top: 340px;
      width: 410px;
      padding: 18px;
      background: #FFF4D8;
      border: 2px solid rgba(179,107,24,0.48);
      border-radius: 8px;
      text-align: center;
      color: #72410E;
      font-size: 32px;
      font-weight: 900;
    }
    .rotate-svg {
      position: absolute;
      left: 110px;
      top: 120px;
      width: 700px;
      height: 560px;
      overflow: visible;
    }
    .q-vector { stroke: #173B63; }
    .k-vector { stroke: #B36B18; }
    .formula-card {
      position: absolute;
      left: 70px;
      right: 70px;
      top: 95px;
      min-height: 330px;
      padding: 30px;
      border: 3px solid rgba(16,24,32,0.16);
      border-radius: 8px;
      background: #FFFFFF;
      text-align: center;
    }
    .formula-card .line {
      font-family: Georgia, serif;
      font-size: 44px;
      font-weight: 900;
      line-height: 1.45;
      color: #101820;
    }
    .formula-card .highlight {
      display: inline-block;
      padding: 4px 16px;
      border: 2px solid rgba(179,107,24,0.62);
      background: #FFF1C8;
      border-radius: 6px;
    }
    .evidence-grid, .summary-grid {
      position: absolute;
      left: 62px;
      right: 62px;
      top: 120px;
      display: grid;
      gap: 18px;
    }
    .evidence-grid { grid-template-columns: 1fr; }
    .summary-grid { grid-template-columns: 1fr 1fr; }
    .evidence-item, .summary-item {
      padding: 28px;
      min-height: 150px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 3px solid rgba(16,24,32,0.13);
      box-shadow: 0 12px 28px rgba(16,24,32,0.07);
    }
    .evidence-item b, .summary-item b {
      display: block;
      margin-bottom: 10px;
      color: #7A334D;
      font-size: 32px;
      font-weight: 900;
    }
    .evidence-item span, .summary-item span {
      color: #46505A;
      font-size: 26px;
      line-height: 1.35;
      font-weight: 750;
    }
    .visual-summary .summary-grid {
      top: 105px;
    }
    .bridge-proof-card {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 46px;
      padding: 22px;
      border-radius: 8px;
      border: 2px solid rgba(122,51,77,0.28);
      background: #FFFDF7;
      box-shadow: 0 12px 26px rgba(16,24,32,0.06);
    }
    .bridge-proof-card .math-asset {
      height: 255px;
      object-fit: contain;
      border: 0;
      background: transparent;
    }
    .bridge-compare-grid {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 375px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .bridge-compare-card {
      min-height: 245px;
      padding: 26px;
      border-radius: 8px;
      border: 3px solid rgba(16,24,32,0.13);
      background: #FFFFFF;
      box-shadow: 0 12px 28px rgba(16,24,32,0.07);
    }
    .bridge-compare-card b {
      display: block;
      margin-bottom: 12px;
      color: #173B63;
      font-size: 31px;
      line-height: 1.2;
      font-weight: 900;
    }
    .bridge-compare-card span {
      display: block;
      color: #46505A;
      font-size: 25px;
      line-height: 1.34;
      font-weight: 800;
    }
    .bridge-boundary-note {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 975px;
      padding: 24px;
      border-radius: 8px;
      border: 2px solid rgba(179,107,24,0.38);
      background: #FFF7E2;
      color: #72410E;
      font-size: 28px;
      line-height: 1.36;
      font-weight: 900;
      text-align: center;
    }
    .bridge-rotation-preview {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 650px;
      width: calc(100% - 184px);
      height: 260px;
      object-fit: contain;
      border: 2px solid rgba(16,24,32,0.10);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 10px 22px rgba(16,24,32,0.05);
    }
    .feynman-map {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 570px;
      display: grid;
      grid-template-columns: 1fr 72px 1fr 72px 1fr;
      align-items: center;
      gap: 10px;
    }
    .feynman-node {
      min-height: 240px;
      padding: 24px 20px;
      border-radius: 8px;
      border: 3px solid rgba(16,24,32,0.12);
      background: #FFFDF7;
      display: grid;
      align-content: center;
      gap: 12px;
      text-align: center;
      box-shadow: 0 12px 26px rgba(16,24,32,0.06);
    }
    .feynman-node b {
      color: #173B63;
      font-size: 27px;
      line-height: 1.22;
      font-weight: 900;
    }
    .feynman-node span {
      color: #46505A;
      font-size: 23px;
      line-height: 1.28;
      font-weight: 800;
    }
    .feynman-arrow {
      color: #B36B18;
      font-size: 54px;
      line-height: 1;
      font-weight: 900;
      text-align: center;
    }
    .feynman-bottom {
      position: absolute;
      left: 126px;
      right: 126px;
      top: 870px;
      padding: 26px;
      border-radius: 8px;
      border: 2px solid rgba(122,51,77,0.28);
      background: #EDF2FA;
      color: #173B63;
      font-size: 29px;
      line-height: 1.34;
      font-weight: 900;
      text-align: center;
    }
    .outro-mark {
      position: absolute;
      left: 80px;
      right: 80px;
      top: 170px;
      height: 430px;
      display: grid;
      place-items: center;
      text-align: center;
      color: #101820;
      font-size: 70px;
      line-height: 1.18;
      font-weight: 900;
    }
    .outro-next-grid {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 690px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    .outro-next-card {
      min-height: 176px;
      padding: 24px 18px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 3px solid rgba(16,24,32,0.12);
      box-shadow: 0 12px 28px rgba(16,24,32,0.07);
      text-align: center;
      display: grid;
      align-content: center;
      gap: 10px;
    }
    .outro-next-card b {
      color: #173B63;
      font-size: 26px;
      line-height: 1.12;
      font-weight: 900;
    }
    .outro-next-card span {
      color: #46505A;
      font-size: 20px;
      line-height: 1.25;
      font-weight: 800;
    }
    .source-note {
      position: absolute;
      left: 74px;
      right: 74px;
      bottom: 44px;
      color: #7B828A;
      font-size: 21px;
      line-height: 1.35;
      font-weight: 700;
    }
    .cover-chain {
      position: absolute;
      left: 56px;
      right: 56px;
      top: 86px;
      bottom: 64px;
      display: grid;
      grid-template-rows: 1fr 96px 1fr;
      gap: 18px;
    }
    .mechanism-card {
      border: 3px solid rgba(16,24,32,0.16);
      border-radius: 8px;
      background: rgba(255,255,255,0.92);
      padding: 28px;
      display: grid;
      align-content: center;
      gap: 16px;
    }
    .mechanism-card b {
      color: #173B63;
      font-size: 34px;
      font-weight: 900;
    }
    .mechanism-card .math {
      color: #101820;
      font-family: Georgia, serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.25;
    }
    .mechanism-card span {
      color: #46505A;
      font-size: 25px;
      line-height: 1.36;
      font-weight: 750;
    }
    .math-asset {
      width: 100%;
      display: block;
      border-radius: 8px;
      border: 2px solid rgba(16,24,32,0.10);
      background: #FBF5EA;
    }
    .mechanism-card .math-asset {
      height: 190px;
      object-fit: contain;
      padding: 8px;
    }
    .formula-source {
      margin-top: 4px;
      color: #6B7280;
      font-size: 21px;
      line-height: 1.28;
      font-weight: 800;
    }
    .chain-arrow {
      display: grid;
      place-items: center;
      color: #72410E;
      font-size: 28px;
      font-weight: 900;
    }
    .chain-arrow::after {
      content: "↓";
      display: block;
      color: #B36B18;
      font-size: 70px;
      line-height: 1;
    }
    .pe-formula-box {
      position: absolute;
      left: 70px;
      right: 70px;
      top: 318px;
      min-height: 236px;
      padding: 16px;
      border: 3px solid rgba(16,24,32,0.16);
      border-radius: 8px;
      background: #FFFFFF;
      text-align: center;
    }
    .pe-formula-box .math-asset {
      height: 198px;
      object-fit: contain;
      border: 0;
      padding: 0;
    }
    .code-window {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 586px;
      padding: 22px 24px;
      border-radius: 8px;
      border: 2px solid rgba(23,59,99,0.22);
      background: #F8FAFC;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.75);
    }
    .code-window b {
      display: block;
      color: #173B63;
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .code-window code {
      display: block;
      color: #1F2937;
      font-family: "JetBrains Mono", monospace;
      font-size: 24px;
      line-height: 1.35;
      font-weight: 700;
      white-space: normal;
      word-break: break-word;
    }
    .pe-compute {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 736px;
      display: grid;
      grid-template-columns: 105px 1fr;
      gap: 12px 16px;
      align-items: center;
      padding: 22px 24px;
      border-radius: 8px;
      border: 2px solid rgba(122,51,77,0.18);
      background: #FFFDF7;
    }
    .pe-compute-label {
      color: #46505A;
      font-size: 22px;
      font-weight: 900;
      text-align: right;
    }
    .pe-vector-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
    }
    .pe-cell {
      height: 28px;
      border-radius: 5px;
      background: var(--cell);
      border: 1px solid rgba(16,24,32,0.10);
    }
    .pe-compute-note {
      grid-column: 1 / -1;
      color: #72410E;
      font-size: 21px;
      line-height: 1.28;
      font-weight: 900;
      text-align: center;
    }
    .pe-result {
      position: absolute;
      left: 92px;
      right: 92px;
      bottom: 56px;
      padding: 22px 28px;
      border: 2px solid rgba(23,59,99,0.38);
      border-radius: 8px;
      background: #EDF2FA;
      color: #173B63;
      font-size: 30px;
      line-height: 1.34;
      font-weight: 900;
      text-align: center;
    }
    .seat-note {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 450px;
      padding: 28px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 3px solid rgba(16,24,32,0.12);
      color: #46505A;
      font-size: 30px;
      line-height: 1.42;
      font-weight: 800;
      text-align: center;
    }
    .seat-logic-grid {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 680px;
      display: grid;
      grid-template-columns: 1fr 46px 1fr 46px 1fr;
      gap: 10px;
      align-items: stretch;
    }
    .seat-logic-card {
      min-height: 158px;
      padding: 20px 16px;
      border-radius: 8px;
      background: #FFFDF7;
      border: 2px solid rgba(16,24,32,0.12);
      box-shadow: 0 10px 22px rgba(16,24,32,0.05);
      text-align: center;
      display: grid;
      align-content: center;
      gap: 8px;
    }
    .seat-logic-card b {
      color: #173B63;
      font-size: 25px;
      line-height: 1.14;
      font-weight: 900;
    }
    .seat-logic-card span {
      color: #46505A;
      font-size: 20px;
      line-height: 1.24;
      font-weight: 800;
    }
    .seat-logic-arrow {
      align-self: center;
      color: #B36B18;
      font-size: 42px;
      line-height: 1;
      font-weight: 900;
      text-align: center;
    }
    .rope-pair-grid {
      position: absolute;
      left: 70px;
      right: 70px;
      top: 255px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .rope-pair {
      min-height: 340px;
      padding: 12px 16px 14px;
      border: 2px solid rgba(16,24,32,0.14);
      border-radius: 8px;
      background: rgba(255,255,255,0.92);
      text-align: center;
    }
    .rope-pair b {
      display: block;
      color: #101820;
      font-size: 23px;
      line-height: 1.25;
      font-weight: 900;
    }
    .rope-pair span {
      display: block;
      margin-top: 4px;
      color: #46505A;
      font-size: 18px;
      line-height: 1.3;
      font-weight: 800;
    }
    .rope-disc {
      width: 150px;
      height: 188px;
      margin: 8px auto 4px;
      overflow: visible;
    }
    .disc-outline { fill: #FFFFFF; stroke: #BCC5CE; stroke-width: 3; }
    .disc-axis { stroke: rgba(16,24,32,0.18); stroke-width: 2; }
    .vector-q, .vector-k { stroke-width: 5; stroke-linecap: round; }
    .vector-q { stroke: #173B63; }
    .vector-k { stroke: #C75C16; }
    .origin-dot { fill: #101820; }
    .disc-label {
      font-family: "Noto Sans JP", "Noto Sans", sans-serif;
      font-size: 15px;
      font-weight: 900;
    }
    .q-label { fill: #173B63; }
    .k-label { fill: #C75C16; }
    .relative-arc { fill: none; stroke: #B36B18; stroke-width: 5; stroke-linecap: round; }
    .delta-bar-grid {
      position: absolute;
      left: 95px;
      right: 95px;
      bottom: 52px;
      display: grid;
      gap: 14px;
    }
    .rotation-matrix-card {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 38px;
      padding: 14px;
      border-radius: 8px;
      border: 2px solid rgba(122,51,77,0.28);
      background: #FFFDF7;
    }
    .rotation-matrix-card .math-asset {
      height: 180px;
      object-fit: contain;
      border: 0;
    }
    .rope-rotation-asset {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 252px;
      height: 770px;
      width: calc(100% - 128px);
      object-fit: contain;
      border: 2px solid rgba(16,24,32,0.10);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 12px 26px rgba(16,24,32,0.06);
    }
    video.rope-rotation-asset {
      object-fit: contain;
    }
    .floating-rope-video {
      position: absolute;
      left: 120px;
      top: 580px;
      width: 840px;
      height: 760px;
      z-index: 38;
      opacity: 1;
    }
    .delta-row {
      display: grid;
      grid-template-columns: 90px 1fr 260px;
      align-items: center;
      gap: 18px;
      color: #46505A;
      font-size: 22px;
      font-weight: 800;
    }
    .delta-track {
      height: 28px;
      background: #E7E9EC;
      border-radius: 4px;
      overflow: hidden;
    }
    .delta-fill {
      height: 100%;
      width: var(--w);
      background: #173B63;
    }
    .formula-focus {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 70px;
      min-height: 430px;
      padding: 18px;
      border: 3px solid rgba(16,24,32,0.16);
      border-radius: 8px;
      background: #FFFFFF;
      text-align: center;
    }
    .formula-focus .math-asset {
      height: 170px;
      object-fit: contain;
      margin-bottom: 12px;
      border-color: rgba(179,107,24,0.24);
    }
    .formula-focus .math {
      font-family: Georgia, serif;
      color: #101820;
      font-size: 42px;
      line-height: 1.5;
      font-weight: 900;
    }
    .formula-focus .math.small {
      font-size: 34px;
      color: #46505A;
    }
    .formula-focus .highlight {
      display: inline-block;
      padding: 4px 16px;
      border: 2px solid rgba(179,107,24,0.62);
      background: #FFF1C8;
      border-radius: 6px;
      color: #72410E;
    }
    .formula-note {
      position: absolute;
      left: 82px;
      right: 82px;
      top: 545px;
      padding: 24px;
      color: #46505A;
      border: 2px solid rgba(23,59,99,0.28);
      border-radius: 8px;
      background: #EDF2FA;
      font-size: 28px;
      line-height: 1.36;
      font-weight: 850;
      text-align: center;
    }
    .delta-explainer-asset {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 700px;
      height: 340px;
      width: calc(100% - 184px);
      object-fit: contain;
      border: 2px solid rgba(16,24,32,0.10);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 12px 26px rgba(16,24,32,0.05);
    }
    .delta-ratio-strip {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 1075px;
      display: grid;
      grid-template-columns: 1fr 54px 1fr 54px 1fr 54px 1fr;
      align-items: stretch;
      gap: 8px;
    }
    .delta-ratio-item {
      min-height: 128px;
      padding: 18px 14px;
      border-radius: 8px;
      border: 2px solid rgba(16,24,32,0.12);
      background: #FFFFFF;
      text-align: center;
      box-shadow: 0 10px 22px rgba(16,24,32,0.05);
    }
    .delta-ratio-item b {
      display: block;
      color: #173B63;
      font-size: 26px;
      line-height: 1.15;
      font-weight: 900;
    }
    .delta-ratio-item span {
      display: block;
      margin-top: 8px;
      color: #B36B18;
      font-size: 24px;
      line-height: 1.15;
      font-weight: 900;
    }
    .delta-ratio-arrow {
      align-self: center;
      color: #7A334D;
      font-size: 24px;
      line-height: 1.15;
      font-weight: 900;
      text-align: center;
    }
    .context-proof-grid {
      position: absolute;
      left: 64px;
      right: 64px;
      top: 84px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .context-proof-card {
      min-height: 270px;
      padding: 28px;
      border-radius: 8px;
      border: 3px solid rgba(16,24,32,0.13);
      background: #FFFFFF;
      box-shadow: 0 12px 28px rgba(16,24,32,0.07);
    }
    .context-proof-card b {
      display: block;
      color: #173B63;
      font-size: 31px;
      line-height: 1.18;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .context-proof-card span {
      display: block;
      color: #46505A;
      font-size: 24px;
      line-height: 1.32;
      font-weight: 800;
    }
    .context-proof-card em {
      display: block;
      margin-top: 16px;
      color: #72410E;
      font-style: normal;
      font-size: 20px;
      line-height: 1.28;
      font-weight: 900;
    }
    .context-takeaway {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 920px;
      padding: 22px 26px;
      border-radius: 8px;
      border: 2px solid rgba(23,59,99,0.28);
      background: #EDF2FA;
      color: #173B63;
      font-size: 28px;
      line-height: 1.30;
      font-weight: 900;
      text-align: center;
    }
    .context-takeaway b {
      display: block;
      margin-bottom: 8px;
      font-size: 30px;
      line-height: 1.18;
      color: #173B63;
    }
    .context-takeaway span {
      display: block;
      color: #46505A;
      font-size: 22px;
      line-height: 1.28;
      font-weight: 800;
    }
    .context-mechanism-map {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 420px;
      display: grid;
      grid-template-columns: 1fr 54px 1fr 54px 1fr;
      gap: 8px;
      align-items: stretch;
    }
    .context-mechanism-step {
      min-height: 210px;
      padding: 22px 16px;
      border-radius: 8px;
      border: 2px solid rgba(16,24,32,0.12);
      background: #FFFDF7;
      text-align: center;
      display: grid;
      align-content: center;
      gap: 10px;
      box-shadow: 0 10px 22px rgba(16,24,32,0.05);
    }
    .context-mechanism-step b {
      color: #7A334D;
      font-size: 25px;
      line-height: 1.16;
      font-weight: 900;
    }
    .context-mechanism-step span {
      color: #46505A;
      font-size: 20px;
      line-height: 1.26;
      font-weight: 800;
    }
    .context-mechanism-arrow {
      align-self: center;
      color: #B36B18;
      font-size: 40px;
      line-height: 1;
      font-weight: 900;
      text-align: center;
    }
    .context-distance-scale {
      position: absolute;
      left: 92px;
      right: 92px;
      top: 682px;
      min-height: 174px;
      padding: 22px 28px;
      border-radius: 8px;
      background: #FFFDF7;
      border: 2px solid rgba(179,107,24,0.34);
      box-shadow: 0 10px 24px rgba(16,24,32,0.05);
    }
    .context-distance-scale b {
      display: block;
      color: #173B63;
      font-size: 25px;
      line-height: 1.18;
      font-weight: 900;
      margin-bottom: 34px;
    }
    .context-scale-track {
      position: relative;
      height: 72px;
      border-bottom: 6px solid rgba(179,107,24,0.48);
    }
    .context-scale-point {
      position: absolute;
      bottom: -15px;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      background: #173B63;
      transform: translateX(-50%);
    }
    .context-scale-point.n {
      background: #B36B18;
    }
    .context-scale-label {
      position: absolute;
      top: 78px;
      transform: translateX(-50%);
      color: #46505A;
      font-size: 18px;
      line-height: 1.18;
      font-weight: 900;
      text-align: center;
      white-space: nowrap;
    }
    .context-scale-brace {
      position: absolute;
      left: 25%;
      right: 11%;
      top: 34px;
      height: 22px;
      border-top: 4px solid #7A334D;
      border-left: 4px solid #7A334D;
      border-right: 4px solid #7A334D;
      border-radius: 8px 8px 0 0;
    }
    .context-scale-brace-label {
      position: absolute;
      left: 57%;
      top: 2px;
      transform: translateX(-50%);
      color: #7A334D;
      background: #FFFDF7;
      font-size: 20px;
      line-height: 1.12;
      font-weight: 900;
      text-align: center;
      white-space: nowrap;
      padding: 0 14px;
      z-index: 2;
    }
    .evidence-source-note {
      display: block;
      margin-top: 12px;
      color: #72410E;
      font-size: 20px;
      line-height: 1.25;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div id="root" data-composition-id="ep05-rope-final-review" data-start="0" data-duration="$CompositionDurationSec" data-width="1080" data-height="1920">
    <audio id="voiceover-audio" data-start="0" data-duration="$CompositionDurationSec" data-track-index="50" src="$audioSrc" data-volume="1"></audio>
    <video id="matlab-rope-rotation-component" class="rope-rotation-asset floating-rope-video" src="media/rope_rotation_component.mp4" data-start="92" data-duration="30" data-track-index="12" data-media-start="0" muted playsinline autoplay loop preload="auto" aria-label="MATLAB rendered animated Q/K rotation component for four RoPE dimension pairs"></video>
$($sceneHtml -join "`n")
$videoClips
$($captionHtml -join "`n")
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    var tl = gsap.timeline({ paused: true });
    var scenes = $((($scenes | ConvertTo-Json -Depth 5 -Compress) -replace "</", "<\/"));
    var captions = $((($subs | ConvertTo-Json -Depth 5 -Compress) -replace "</", "<\/"));
    scenes.forEach(function(scene, index) {
      var selector = "#" + scene.id;
      tl.fromTo(selector, { opacity: 0 }, { opacity: 1, duration: 0.42, ease: "sine.out", overwrite: "auto" }, scene.start + 0.10);
      tl.from(selector + " .kicker", { opacity: 0, duration: 0.32, ease: "sine.out", overwrite: "auto" }, scene.start + 0.22);
      tl.from(selector + " h1", { opacity: 0, duration: 0.38, ease: "sine.out", overwrite: "auto" }, scene.start + 0.32);
      tl.from(selector + " .scene-body", { opacity: 0, duration: 0.34, ease: "sine.out", overwrite: "auto" }, scene.start + 0.48);
      tl.from(selector + " .visual", { opacity: 0, duration: 0.40, ease: "sine.out", overwrite: "auto" }, scene.start + 0.62);
    });
    captions.forEach(function(group, index) {
      var selector = "#cap-" + index;
      tl.fromTo(selector, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "sine.out", overwrite: "auto" }, group.start + 0.03);
      tl.to(selector, { opacity: 0, duration: 0.12, ease: "sine.in", overwrite: "auto" }, group.end - 0.16);
      tl.set(selector, { opacity: 0, visibility: "hidden" }, group.end);
    });
    tl.from(".seat", { opacity: 0, stagger: 0.035, duration: 0.25, ease: "sine.out", overwrite: "auto" }, 51.0);
    tl.from(".distance-line", { scaleX: 0, duration: 0.70, ease: "power3.out", overwrite: "auto" }, 53.0);
    tl.from(".distance-label", { opacity: 0, duration: 0.42, ease: "sine.out", overwrite: "auto" }, 53.7);
    tl.from(".seat-logic-card, .seat-logic-arrow", { opacity: 0, stagger: 0.08, duration: 0.34, ease: "sine.out", overwrite: "auto" }, 55.0);
    tl.from(".bridge-proof-card, .bridge-compare-card, .bridge-boundary-note", { opacity: 0, stagger: 0.10, duration: 0.38, ease: "sine.out", overwrite: "auto" }, 77.0);
    tl.from(".rope-rotation-asset", { opacity: 0, duration: 0.46, ease: "sine.out", overwrite: "auto" }, 93.0);
    tl.from(".delta-explainer-asset", { opacity: 0, duration: 0.42, ease: "sine.out", overwrite: "auto" }, 127.0);
    tl.from(".delta-ratio-item, .delta-ratio-arrow", { opacity: 0, stagger: 0.08, duration: 0.32, ease: "sine.out", overwrite: "auto" }, 128.0);
    tl.from(".context-proof-card, .context-mechanism-step, .context-mechanism-arrow, .context-distance-scale, .context-takeaway", { opacity: 0, stagger: 0.08, duration: 0.38, ease: "sine.out", overwrite: "auto" }, 152.0);
    tl.from(".evidence-item", { opacity: 0, stagger: 0.14, duration: 0.38, ease: "sine.out", overwrite: "auto" }, 171.0);
    tl.from(".summary-item", { opacity: 0, stagger: 0.16, duration: 0.42, ease: "sine.out", overwrite: "auto" }, 181.0);
    tl.from(".outro-next-card", { opacity: 0, stagger: 0.08, duration: 0.34, ease: "sine.out", overwrite: "auto" }, 208.0);
    tl.to("#root", { opacity: 0, duration: 0.70, ease: "sine.inOut", overwrite: "auto" }, $([Math]::Round($CompositionDurationSec - 0.85, 2)));
    window.__timelines["ep05-rope-final-review"] = tl;
  </script>
</body>
</html>
"@

    $design = @"
# EP05 RoPE Final Review Design

## Style Prompt

Warm paper technical explainer for a Chinese AI paper series. The video should feel precise, calm, and readable on a phone screen. MATLAB-generated formula/rotation assets act as proof objects, but only as stable local formula/geometry assets; HyperFrames provides pacing, subtitles, and scene transitions.

## Colors

- Paper: #F7F4EC
- Ink: #101820
- Muted copy: #46505A
- Source blue: #173B63
- RoPE burgundy: #7A334D
- Formula amber: #B36B18
- Code charcoal: #1F2937

## Typography

- Chinese display/body: Noto Sans JP / Noto Sans
- Formula register: MATLAB-rendered image assets, with Georgia only for non-key fallback labels
- Numeric/data labels: JetBrains Mono only where alignment is needed

## What NOT to Do

- Do not show production-side labels such as Hook, 视觉焦点, 视觉爆点, 教学边界, or 给普通观众的一句话.
- Do not use a progress bar as a subtitle.
- Do not move formula text, subtitles, or whole cards to simulate dynamism.
- Do not import a full-page MATLAB MP4 as a small nested page inside a larger frame.
- Do not use SAPI voice for final review audio; SAPI is draft-only.
- Do not imply ChatGPT or Claude use RoPE unless official implementation details are provided.
- Do not say the Q/K dot product leaves only n - m.
"@
    Set-Content -Encoding UTF8 (Join-Path $RenderDir "DESIGN.md") $design
    Set-Content -Encoding UTF8 (Join-Path $RenderDir "index.html") $html
    (@{ version = "1"; entry = "index.html" } | ConvertTo-Json -Depth 5) | Set-Content -Encoding UTF8 (Join-Path $RenderDir "hyperframes.json")
    (@{
        title = "EP05 RoPE Final Review"
        duration_sec = $CompositionDurationSec
        resolution = "1080x1920"
        output_mp4 = "renders/ep05_rope_position_encoding_indextts2_sfx_final_review.mp4"
    } | ConvertTo-Json -Depth 5) | Set-Content -Encoding UTF8 (Join-Path $RenderDir "meta.json")
}

function Get-SceneVisualHtml([string]$kind) {
    switch ($kind) {
        "cover" {
            return @"
<div class="cover-chain">
  <div class="mechanism-card">
    <b>原始 Transformer 论文公式</b>
    <img class="math-asset" src="media/pe_formula.png" alt="Positional Encoding formula rendered by MATLAB" />
    <span>同一个 d model 维度里逐元素相加，不是新增 token。</span>
    <div class="formula-source">Annotated Transformer 代码示例：位置编码被加到输入表示上。</div>
  </div>
  <div class="chain-arrow">从输入加法，走到 Q/K 几何关系</div>
  <div class="mechanism-card">
    <b>RoFormer 论文：旋转位置编码</b>
    <img class="math-asset" src="media/rope_relative_formula.png" alt="RoPE relative-position formula rendered by MATLAB" />
    <span>位置相关相位依赖相对位移 n - m，内容 q/k 仍参与匹配。</span>
  </div>
</div>
"@
        }
        "pe" {
            return @"
<div class="pe-meaning">
  <div class="pe-card">
    <b>词向量 x<sub>m</sub></b>
    <div class="pe-vector-mini">
      <span class="pe-mini-cell" style="--mini:#DDEBFA"></span><span class="pe-mini-cell" style="--mini:#CFE1F5"></span><span class="pe-mini-cell" style="--mini:#E7EEF8"></span><span class="pe-mini-cell" style="--mini:#D3E4F8"></span><span class="pe-mini-cell" style="--mini:#E1EBF6"></span><span class="pe-mini-cell" style="--mini:#D8E7F7"></span><span class="pe-mini-cell" style="--mini:#EAF2FB"></span><span class="pe-mini-cell" style="--mini:#D1E2F4"></span>
    </div>
    <span>表示“这个 token 是什么”</span>
    <span class="tagline">内容信息</span>
  </div>
  <div class="pe-op">+</div>
  <div class="pe-card">
    <b>位置向量 PE<sub>m</sub></b>
    <div class="pe-vector-mini">
      <span class="pe-mini-cell" style="--mini:#FCE8B8"></span><span class="pe-mini-cell" style="--mini:#F8DFA2"></span><span class="pe-mini-cell" style="--mini:#FFF0C9"></span><span class="pe-mini-cell" style="--mini:#F5D28E"></span><span class="pe-mini-cell" style="--mini:#FCE7B0"></span><span class="pe-mini-cell" style="--mini:#F4D89A"></span><span class="pe-mini-cell" style="--mini:#FFF3D6"></span><span class="pe-mini-cell" style="--mini:#F7DCA2"></span>
    </div>
    <span>表示“它在第 m 个位置”</span>
    <span class="tagline">位置信息</span>
  </div>
  <div class="pe-op">→</div>
  <div class="pe-card result">
    <b>输入表示 x′<sub>m</sub></b>
    <div class="pe-vector-mini">
      <span class="pe-mini-cell" style="--mini:#D6CAD9"></span><span class="pe-mini-cell" style="--mini:#D1BBD0"></span><span class="pe-mini-cell" style="--mini:#E4D8DF"></span><span class="pe-mini-cell" style="--mini:#CFAEC4"></span><span class="pe-mini-cell" style="--mini:#DED0DA"></span><span class="pe-mini-cell" style="--mini:#D4C0D1"></span><span class="pe-mini-cell" style="--mini:#EBE1E7"></span><span class="pe-mini-cell" style="--mini:#D3BCCD"></span>
    </div>
    <span>同一个 d model 向量里逐元素合并</span>
    <span class="tagline">长度不变</span>
  </div>
</div>
<div class="pe-formula-box">
  <img class="math-asset" src="media/pe_formula.png" alt="Positional Encoding formula rendered by MATLAB" />
</div>
<div class="code-window">
  <b>Annotated Transformer 代码示例</b>
  <code>x = x + self.pe[:, :x.size(1)]</code>
</div>
<div class="pe-compute">
  <div class="pe-compute-label">x<sub>m</sub></div>
  <div class="pe-vector-row">
    <span class="pe-cell" style="--cell:#DDEBFA"></span><span class="pe-cell" style="--cell:#CFE1F5"></span><span class="pe-cell" style="--cell:#E7EEF8"></span><span class="pe-cell" style="--cell:#D3E4F8"></span><span class="pe-cell" style="--cell:#E1EBF6"></span><span class="pe-cell" style="--cell:#D8E7F7"></span><span class="pe-cell" style="--cell:#EAF2FB"></span><span class="pe-cell" style="--cell:#D1E2F4"></span>
  </div>
  <div class="pe-compute-label">PE<sub>m</sub></div>
  <div class="pe-vector-row">
    <span class="pe-cell" style="--cell:#FCE8B8"></span><span class="pe-cell" style="--cell:#F8DFA2"></span><span class="pe-cell" style="--cell:#FFF0C9"></span><span class="pe-cell" style="--cell:#F5D28E"></span><span class="pe-cell" style="--cell:#FCE7B0"></span><span class="pe-cell" style="--cell:#F4D89A"></span><span class="pe-cell" style="--cell:#FFF3D6"></span><span class="pe-cell" style="--cell:#F7DCA2"></span>
  </div>
  <div class="pe-compute-label">x′<sub>m</sub></div>
  <div class="pe-vector-row">
    <span class="pe-cell" style="--cell:#D6CAD9"></span><span class="pe-cell" style="--cell:#D1BBD0"></span><span class="pe-cell" style="--cell:#E4D8DF"></span><span class="pe-cell" style="--cell:#CFAEC4"></span><span class="pe-cell" style="--cell:#DED0DA"></span><span class="pe-cell" style="--cell:#D4C0D1"></span><span class="pe-cell" style="--cell:#EBE1E7"></span><span class="pe-cell" style="--cell:#D3BCCD"></span>
  </div>
  <div class="pe-compute-note">代码里的加法是同位置、同维度逐元素相加；不是把 PE 拼到句子最后。</div>
</div>
<div class="pe-result">模型输入同时带着“词是什么”和“第几个位置”</div>
"@
        }
        "seat" {
            $seats = 34..43 | ForEach-Object {
                $cls = if ($_ -eq 37) { "seat active-a" } elseif ($_ -eq 42) { "seat active-b" } else { "seat" }
                "<div class=""$cls"">$_</div>"
            }
            return @"
<div class="seat-row">$($seats -join "")</div>
<div class="distance-line"></div>
<div class="distance-label">37 到 42：相隔 5 个位置</div>
<div class="seat-note">第 37 和第 42 是绝对位置；42 - 37 = 5 才是比较关系时常用的相对位移。</div>
<div class="seat-logic-grid">
  <div class="seat-logic-card"><b>绝对位置</b><span>37 和 42 各自在哪里</span></div>
  <div class="seat-logic-arrow">→</div>
  <div class="seat-logic-card"><b>相对位移</b><span>42 - 37 = 5</span></div>
  <div class="seat-logic-arrow">→</div>
  <div class="seat-logic-card"><b>Attention 关系</b><span>比较时需要知道相隔多远</span></div>
</div>
"@
        }
        "bridge" {
            return @"
<div class="bridge-proof-card">
  <img class="math-asset" src="media/rope_matrix_formula.png" alt="RoPE 2D rotation matrix rendered by MATLAB" />
</div>
<div class="bridge-compare-grid">
  <div class="bridge-compare-card"><b>原始 PE</b><span>位置编码加到输入表示上，让模型在进入 Attention 前带着“第几个位置”。</span></div>
  <div class="bridge-compare-card"><b>RoPE</b><span>位置不再额外拼接，而是进入 Q/K 的二维维度块旋转。</span></div>
</div>
<img class="bridge-rotation-preview" src="media/rope_bridge_rotation_mini.png" alt="MATLAB rendered compact RoPE Q/K rotation preview" />
<div class="bridge-boundary-note">圆盘表示向量维度里的旋转，不表示 token 在句子平面移动。</div>
"@
        }
        "rotate" {
            return @"
<div class="rotation-matrix-card">
  <img class="math-asset" src="media/rope_matrix_formula.png" alt="RoPE 2D rotation matrix rendered by MATLAB" />
</div>
<div class="rope-rotation-asset" aria-label="MATLAB animated Q/K rotation area"></div>
"@
        }
        "formula" {
            return @"
<div class="formula-focus">
  <img class="math-asset" src="media/attention_formula.png" alt="Scaled dot-product attention formula rendered by MATLAB" />
  <img class="math-asset" src="media/rope_relative_formula.png" alt="RoPE relative-position formula rendered by MATLAB" />
  <div class="formula-source">MATLAB 数值验证：m = 3，n = 8，所以 n - m = 5。</div>
</div>
<div class="formula-note">严谨说法：位置相关相位差依赖 n - m；内容向量 q/k 仍然参与 Attention 匹配。</div>
<img class="delta-explainer-asset" src="media/rope_delta_explainer.png" alt="MATLAB rendered explanation of delta_i values across four dimension pairs" />
<div class="delta-ratio-strip">
  <div class="delta-ratio-item"><b>δ₁</b><span>5.0000</span></div>
  <div class="delta-ratio-arrow">×0.1</div>
  <div class="delta-ratio-item"><b>δ₂</b><span>0.5000</span></div>
  <div class="delta-ratio-arrow">×0.1</div>
  <div class="delta-ratio-item"><b>δ₃</b><span>0.0500</span></div>
  <div class="delta-ratio-arrow">×0.1</div>
  <div class="delta-ratio-item"><b>δ₄</b><span>0.0050</span></div>
</div>
"@
        }
        "context" {
            return @"
<div class="context-proof-grid">
  <div class="context-proof-card"><b>OpenAI gpt-oss</b><span>公开架构说明写明使用 Rotary Positional Embedding，并支持 128k context。</span><em>Source: OpenAI gpt-oss release</em></div>
  <div class="context-proof-card"><b>DeepSeek-V4</b><span>Transformers 文档写到 Hybrid attention 与 Partial RoPE；官方发布页写到 1M context。</span><em>Source: DeepSeek API Docs / Transformers docs</em></div>
</div>
<div class="context-mechanism-map">
  <div class="context-mechanism-step"><b>上下文变长</b><span>token 距离跨度变大</span></div>
  <div class="context-mechanism-arrow">→</div>
  <div class="context-mechanism-step"><b>比较更难</b><span>近处、远处都要稳定区分</span></div>
  <div class="context-mechanism-arrow">→</div>
  <div class="context-mechanism-step"><b>位置工程</b><span>相对位移建模变关键</span></div>
</div>
<div class="context-distance-scale">
  <b>同一套 Q/K 匹配，要在更长范围里分清 m、n 和 n - m</b>
  <div class="context-scale-track">
    <div class="context-scale-brace-label">相对位移 n - m</div>
    <div class="context-scale-brace"></div>
    <span class="context-scale-point" style="left:25%"></span>
    <span class="context-scale-point n" style="left:89%"></span>
    <span class="context-scale-label" style="left:25%">位置 m</span>
    <span class="context-scale-label" style="left:89%">位置 n</span>
  </div>
</div>
<div class="context-takeaway"><b>不是不用位置编码</b><span>而是更依赖稳定的位置与相对位移建模</span></div>
"@
        }
        "evidence" {
            return @"
<div class="evidence-grid">
  <div class="evidence-item"><b>公开证据 1：gpt-oss</b><span>OpenAI 公开资料明确写到 RoPE，用它作为“公开模型采用 RoPE”的证据。<i class="evidence-source-note">不外推到所有 GPT 系列专有模型。</i></span></div>
  <div class="evidence-item"><b>公开证据 2：DeepSeek-V4</b><span>公开文档写到 Partial RoPE，可作为 RoPE 变体与长上下文工程的例子。<i class="evidence-source-note">不简化成“普通 RoPE”。</i></span></div>
  <div class="evidence-item"><b>边界</b><span>官方没有公开具体位置编码细节的专有模型，不在成片里替它下结论。</span></div>
</div>
"@
        }
        "summary" {
            return @"
<div class="summary-grid">
  <div class="summary-item"><b>原始 PE</b><span>像在名牌上写座位坐标：我在第几个位置。</span></div>
  <div class="summary-item"><b>RoPE</b><span>像对话时顺手算距离：我们相隔几排。</span></div>
  <div class="summary-item"><b>Attention</b><span>负责比较谁和谁有关。</span></div>
  <div class="summary-item"><b>相对位移</b><span>RoPE 让 Q/K 比较时带上 n - m。</span></div>
</div>
<div class="feynman-map">
  <div class="feynman-node"><b>座位坐标</b><span>第几个位置</span></div>
  <div class="feynman-arrow">→</div>
  <div class="feynman-node"><b>Q/K 比较</b><span>Attention 在这里算相关性</span></div>
  <div class="feynman-arrow">→</div>
  <div class="feynman-node"><b>相对位移</b><span>位置相关项看 n - m</span></div>
</div>
<div class="feynman-bottom">费曼类比必须回到机制：RoPE 不是移动 token，而是在 Q/K 旋转后让比较关系带上相对位移。</div>
"@
        }
        default {
            return @"
<div class="outro-mark">位置进入 Attention，下一步就是 KV cache 和推理速度。</div>
<div class="outro-next-grid">
  <div class="outro-next-card"><b>当前位置</b><span>Q/K 已带相对位移</span></div>
  <div class="outro-next-card"><b>下一集</b><span>为什么缓存能省计算</span></div>
  <div class="outro-next-card"><b>核心问题</b><span>长上下文推理如何更快</span></div>
</div>
"@
        }
    }
}

$voiceSegments = @(Read-TimedTable $VoiceoverPath $false)
if ($voiceSegments.Count -eq 0) {
    throw "Cannot parse voiceover timeline."
}

$ffmpeg = Get-NodeModulePath "require('@ffmpeg-installer/ffmpeg').path"
$ffprobe = Get-NodeModulePath "require('ffprobe-static').path"

if ($ForceVoice -or -not (Test-Path -LiteralPath $VoiceoverWav)) {
    if ($AllowSapiDraft) {
        Write-ReviewVoiceover $voiceSegments $ffmpeg $ffprobe
        $VoiceoverWav = $SapiVoiceoverWav
        $VoiceMode = "sapi_draft_not_for_final_review"
        $OutputMp4 = $SapiDraftOutputMp4
    } else {
        throw "Missing authorized personal voiceover: $PersonalVoiceoverWav. Generate audio/voiceover.wav from the EP04 authorized reference audio before building the final review MP4. Use -AllowSapiDraft only for explicitly labeled local drafts."
    }
}

if ($VoiceMode -eq "authorized_personal_reference_voice") {
    Invoke-NpmGate "audio:pronunciation-gate:ep05"
    Invoke-NpmGate "audio:freshness-gate:ep05-critical"

    if (-not (Test-Path -LiteralPath $PersonalVoiceoverWithSfxWav)) {
        throw "Missing SFX-mixed personal voiceover: $PersonalVoiceoverWithSfxWav. Run audio merge, postprocess, voiceover import, dynamic captions, and audio:sfx-mix:ep05 before final MP4 build."
    }

    if (Test-Path -LiteralPath $PersonalVoiceoverBaseWav) {
        $baseTime = (Get-Item -LiteralPath $PersonalVoiceoverBaseWav).LastWriteTimeUtc
        $sfxTime = (Get-Item -LiteralPath $PersonalVoiceoverWithSfxWav).LastWriteTimeUtc
        if ($sfxTime -lt $baseTime) {
            throw "SFX-mixed voiceover is older than audio/voiceover.wav. Re-run audio:sfx-mix:ep05 to avoid stale or missing sound cues."
        }
    }

    $mixStatusPath = Join-Path $AudioDir "sfx\mix_status.json"
    if (-not (Test-Path -LiteralPath $mixStatusPath)) {
        throw "Missing SFX mix status: $mixStatusPath"
    }
    $mixStatus = Get-Content -LiteralPath $mixStatusPath -Raw | ConvertFrom-Json
    if ($mixStatus.status -ne "mixed") {
        throw "SFX mix status is not mixed: $($mixStatus.status)"
    }
}

$voiceDuration = Get-AudioDuration $ffprobe $VoiceoverWav
$CompositionDurationSec = [Math]::Max($CompositionDurationSec, [Math]::Ceiling($voiceDuration + 0.35))
$captionTimingReport = Resolve-CaptionTimingReport
$subtitleSegments = @(Build-DynamicCaptions $captionTimingReport)
if ($subtitleSegments.Count -eq 0) {
    throw "Dynamic captions are empty."
}
$srtPath = Join-Path $CaptionDir "subtitles.srt"

Write-HyperframesProject $subtitleSegments

$hyperframes = Join-Path $Root "node_modules\.bin\hyperframes.cmd"
if (-not (Test-Path -LiteralPath $hyperframes)) {
    throw "HyperFrames CLI not found: $hyperframes"
}

Push-Location $Root
try {
    $env:HYPERFRAMES_FFMPEG_PATH = $ffmpeg
    $env:HYPERFRAMES_FFPROBE_PATH = $ffprobe
    $env:PATH = "$(Split-Path -Parent $ffmpeg);$(Split-Path -Parent $ffprobe);$($env:PATH)"
    & $hyperframes lint $RenderDir
    $lintExit = $LASTEXITCODE
    if ($lintExit -ne 0) {
        throw "HyperFrames lint failed with exit code $lintExit"
    }
    & $hyperframes render $RenderDir -o $OutputMp4 --fps 15 --quality draft --resolution portrait --low-memory-mode
    $renderExit = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($renderExit -ne 0 -or -not (Test-Path -LiteralPath $OutputMp4)) {
    throw "HyperFrames render failed with exit code $renderExit"
}

$MuxedMp4 = $OutputMp4 -replace "\.mp4$", ".muxed.mp4"
& $ffmpeg -y -hide_banner -loglevel error -i $OutputMp4 -i $VoiceoverWav -c:v copy -c:a aac -shortest $MuxedMp4
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $MuxedMp4)) {
    throw "ffmpeg mux failed while adding review voiceover."
}
Move-Item -LiteralPath $MuxedMp4 -Destination $OutputMp4 -Force

$videoDuration = Get-AudioDuration $ffprobe $OutputMp4
$ffprobeJson = (& $ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of json $OutputMp4) | ConvertFrom-Json
$qa = [ordered]@{
    status = "partial"
    reason = if ($VoiceMode -eq "authorized_personal_reference_voice") {
        "Local final review MP4 generated with authorized personal-reference voice; human review still required before publish."
    } else {
        "Local draft MP4 generated with built-in Windows SAPI draft voice; not allowed for final review or publish."
    }
    output_mp4 = if ($VoiceMode -eq "authorized_personal_reference_voice") {
        "renders/ep05_rope_position_encoding_indextts2_sfx_final_review.mp4"
    } else {
        "renders/ep05_rope_position_encoding_216s_sapi_draft.mp4"
    }
    duration_s = [Math]::Round($videoDuration, 3)
    width = $ffprobeJson.streams[0].width
    height = $ffprobeJson.streams[0].height
    fps = $ffprobeJson.streams[0].r_frame_rate
    caption_source = "captions/subtitles.srt"
    voice_source = if ($VoiceMode -eq "authorized_personal_reference_voice") { $VoiceSourceRelative } else { "audio/voiceover_sapi_draft.wav" }
    voice_mode = $VoiceMode
    hyperframes_project = "renders/hyperframes_ep05_final"
    verified = @(
        "MP4 file exists",
        "duration is generated from voiceover-aware composition timing",
        "portrait resolution requested through HyperFrames",
        "dynamic subtitles are split from reviewed voiceover text and burned as HTML caption groups",
        "MATLAB formula assets are inserted as local scene-level proof objects",
        "MATLAB RoPE rotation component is inserted as a local animated scene-level asset",
        "visible subtitle source excludes production-side readout cues",
        "full-page MATLAB MP4 clips are not nested inside the HyperFrames canvas"
    )
    not_verified = @(
        "human visual review of the full generated duration",
        "personal voiceover quality approval",
        "platform upload packaging"
    )
    publish_ready = $false
}
$qa | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $QaDir "ep05_final_mp4_review_report.json")

Write-Output "mp4=$OutputMp4"
Write-Output "duration_s=$([Math]::Round($videoDuration, 3))"
Write-Output "srt=$srtPath"
Write-Output "voice=$VoiceoverWav"
Write-Output "qa=$(Join-Path $QaDir 'ep05_final_mp4_review_report.json')"
