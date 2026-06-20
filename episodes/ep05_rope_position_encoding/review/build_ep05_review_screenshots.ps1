param(
    [string]$Root = (Resolve-Path "$PSScriptRoot\..\..\..").Path
)

Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $Root "episodes\ep05_rope_position_encoding\review\screenshots"
$mediaDir = Join-Path $Root "episodes\ep05_rope_position_encoding\renders\hyperframes_review\media"
New-Item -ItemType Directory -Force $outDir | Out-Null

$coverPath = Join-Path $outDir "ep05_cover_review.png"
$firstPath = Join-Path $outDir "ep05_first_page_animation_review.png"
$formulaPath = Join-Path $outDir "ep05_matlab_formula_animation_review.png"

function Color-Hex([string]$hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-Font([string]$name, [float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    return [System.Drawing.Font]::new($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-PenHex([string]$hex, [float]$width = 1) {
    return [System.Drawing.Pen]::new((Color-Hex $hex), $width)
}

function New-BrushHex([string]$hex) {
    return [System.Drawing.SolidBrush]::new((Color-Hex $hex))
}

function Fill-RoundedRect($g, [System.Drawing.Brush]$brush, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath($brush, $path)
    $path.Dispose()
}

function Stroke-RoundedRect($g, [System.Drawing.Pen]$pen, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.DrawPath($pen, $path)
    $path.Dispose()
}

function Draw-CenteredText($g, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$w, [float]$h) {
    $fmt = [System.Drawing.StringFormat]::new()
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $fmt.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
    $g.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $fmt)
    $fmt.Dispose()
}

function Draw-LeftText($g, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$w, [float]$h) {
    $fmt = [System.Drawing.StringFormat]::new()
    $fmt.Alignment = [System.Drawing.StringAlignment]::Near
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Near
    $fmt.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
    $g.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $fmt)
    $fmt.Dispose()
}

function Save-ScaledImage([string]$inputPath, [string]$outputPath) {
    $src = [System.Drawing.Image]::FromFile($inputPath)
    $bmp = [System.Drawing.Bitmap]::new(1080, 1920)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear((Color-Hex "#F7F4EC"))
    $g.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, 1080, 1920))
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
}

$bmp = [System.Drawing.Bitmap]::new(1080, 1920)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear((Color-Hex "#F7F4EC"))

$ink = New-BrushHex "#101820"
$muted = New-BrushHex "#59616B"
$green = New-BrushHex "#126B50"
$amber = New-BrushHex "#B36B18"
$blue = New-BrushHex "#173B63"
$paper = New-BrushHex "#FFFDF7"
$soft = New-BrushHex "#FFF1C8"

$display = New-Font "Microsoft YaHei UI" 72 ([System.Drawing.FontStyle]::Bold)
$displaySmall = New-Font "Microsoft YaHei UI" 54 ([System.Drawing.FontStyle]::Bold)
$body = New-Font "Microsoft YaHei UI" 32
$bodyBold = New-Font "Microsoft YaHei UI" 34 ([System.Drawing.FontStyle]::Bold)
$caption = New-Font "Microsoft YaHei UI" 24
$mono = New-Font "Consolas" 28 ([System.Drawing.FontStyle]::Bold)
$huge = New-Font "Arial" 176 ([System.Drawing.FontStyle]::Bold)

Draw-LeftText $g "EP05" $bodyBold $amber 72 78 250 60
Draw-LeftText $g "RoPE 旋转位置编码" $bodyBold $green 72 138 720 60
Draw-LeftText $g "为什么现代大模型都绕不开 RoPE？" $display $ink 72 245 930 210
Draw-LeftText $g "从 x = x + PE，到 Q/K 旋转：Attention 如何看见相隔多远" $body $muted 76 478 900 120

$watermark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(18, 16, 24, 32))
$g.DrawString("RoPE", $huge, $watermark, 35, 595)
$watermark.Dispose()

Fill-RoundedRect $g $paper 76 690 928 450 26
Stroke-RoundedRect $g (New-PenHex "#183A5A" 3) 76 690 928 450 26
Draw-LeftText $g "1  原始 Positional Encoding" $bodyBold $blue 122 740 740 54
Draw-LeftText $g "把位置加到输入：x = x + PE" $body $muted 122 805 720 48
for ($i = 0; $i -lt 5; $i++) {
    $x = 128 + $i * 120
    Fill-RoundedRect $g (New-BrushHex "#EAF3FF") $x 900 96 72 6
    Stroke-RoundedRect $g (New-PenHex "#173B63" 2) $x 900 96 72 6
    Draw-CenteredText $g ("t" + ($i + 1)) $mono $blue $x 900 96 72
}
Draw-LeftText $g "位置像连续坐标：知道第几个位置" $caption $muted 122 1008 760 46

Fill-RoundedRect $g $paper 76 1210 928 440 26
Stroke-RoundedRect $g (New-PenHex "#126B50" 3) 76 1210 928 440 26
Draw-LeftText $g "2  RoPE：位置转进 Q / K" $bodyBold $green 122 1260 780 54
Draw-LeftText $g "Q 在位置 m 旋转；K 在位置 n 旋转" $body $muted 122 1325 780 48

$centerQ = [System.Drawing.PointF]::new(340, 1470)
$centerK = [System.Drawing.PointF]::new(700, 1470)
foreach ($c in @($centerQ, $centerK)) {
    $g.DrawEllipse((New-PenHex "#B6BDC7" 3), $c.X - 92, $c.Y - 92, 184, 184)
    $g.DrawLine((New-PenHex "#D8DDE4" 2), $c.X - 92, $c.Y, $c.X + 92, $c.Y)
    $g.DrawLine((New-PenHex "#D8DDE4" 2), $c.X, $c.Y - 92, $c.X, $c.Y + 92)
}
$arrowPenQ = New-PenHex "#173B63" 8
$arrowPenQ.EndCap = [System.Drawing.Drawing2D.LineCap]::ArrowAnchor
$arrowPenK = New-PenHex "#B36B18" 8
$arrowPenK.EndCap = [System.Drawing.Drawing2D.LineCap]::ArrowAnchor
$g.DrawLine($arrowPenQ, 340, 1470, 285, 1390)
$g.DrawLine($arrowPenK, 340, 1470, 420, 1435)
$g.DrawLine($arrowPenQ, 700, 1470, 640, 1400)
$g.DrawLine($arrowPenK, 700, 1470, 780, 1418)
Draw-CenteredText $g "Q: m × θ_i" $caption $blue 250 1575 180 48
Draw-CenteredText $g "K: n × θ_i" $caption $amber 610 1575 180 48

Fill-RoundedRect $g $soft 146 1698 788 96 18
Stroke-RoundedRect $g (New-PenHex "#B36B18" 2) 146 1698 788 96 18
Draw-CenteredText $g "RoPE 让 Q/K 比较时带上相对位移 n - m" $bodyBold $amber 170 1710 740 70
Draw-CenteredText $g "Harvard x = x + pe  |  RoFormer Q/K rotation" $caption $muted 80 1822 920 46

$bmp.Save($coverPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Save-ScaledImage (Join-Path $mediaDir "rope_hooked_keyframe.png") $firstPath
Save-ScaledImage (Join-Path $mediaDir "rope_true_meaning_keyframe.png") $formulaPath

Write-Output "cover=$coverPath"
Write-Output "first=$firstPath"
Write-Output "formula=$formulaPath"
