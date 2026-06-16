import fs from "node:fs";
import path from "node:path";

type SharpFactory = (input: Buffer) => {
  png: () => {
    toFile: (filePath: string) => Promise<unknown>;
  };
};

const ROOT_DIR = process.cwd();
const EPISODE_DIR = path.join(ROOT_DIR, "episodes/ep03_multi_head_attention");
const VIDEO_SCRIPT_DIR = path.join(EPISODE_DIR, "video_script");
const SOURCE_ASSETS_DIR = path.join(VIDEO_SCRIPT_DIR, "source_assets");
const PUBLISH_DIR = path.join(EPISODE_DIR, "publish");

const WIDTH = 1080;
const HEIGHT = 1920;
const SAFE_X = 54;
const SAFE_Y = 96;
const SAFE_W = WIDTH - SAFE_X * 2;
const SAFE_H = HEIGHT - SAFE_Y * 2;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function imageDataUri(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase() === ".jpg" ? "jpeg" : "png";
  return `data:image/${ext};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

async function loadSharp(): Promise<SharpFactory> {
  const sharp = await import("sharp");
  return ((sharp as { default?: unknown }).default ?? sharp) as SharpFactory;
}

function formulaText(x: number, y: number, content: string, size = 30): string {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Cambria Math, Times New Roman, serif" font-size="${size}" font-weight="700" fill="#111827">${content}</text>`;
}

function flowPill(x: number, y: number, w: number, label: string, fill: string, stroke: string, color: string): string {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="72" rx="24" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + 46}" text-anchor="middle" font-size="28" font-weight="850" fill="${color}">${escapeXml(label)}</text>
  `;
}

function buildSvg(): string {
  const multiHeadFigure = path.join(SOURCE_ASSETS_DIR, "harvard_figure_multi_head_attention.png");
  const transformerFigure = path.join(SOURCE_ASSETS_DIR, "harvard_figure_transformer_architecture.png");
  const multiHeadUri = fs.existsSync(multiHeadFigure) ? imageDataUri(multiHeadFigure) : "";
  const transformerUri = fs.existsSync(transformerFigure) ? imageDataUri(transformerFigure) : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse">
      <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#E9EDF2" stroke-width="1"/>
    </pattern>
    <linearGradient id="blueOrangeGreen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4C78FF"/>
      <stop offset="0.52" stop-color="#F58518"/>
      <stop offset="1" stop-color="#54A24B"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#1D2939" flood-opacity="0.18"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B"/>
    </marker>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0B0F17"/>
  <rect x="${SAFE_X}" y="${SAFE_Y}" width="${SAFE_W}" height="${SAFE_H}" rx="46" fill="#F7F7F5"/>
  <rect x="${SAFE_X}" y="${SAFE_Y}" width="${SAFE_W}" height="${SAFE_H}" rx="46" fill="url(#grid)" opacity="0.75"/>

  <g font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif">
    <rect x="174" y="138" width="732" height="66" rx="28" fill="#F4EAF8" stroke="#D3BBE6" stroke-width="2"/>
    <text x="540" y="182" text-anchor="middle" font-size="30" font-weight="850" fill="#101828">第3集 · Attention Is All You Need 精读</text>

    <text x="104" y="308" font-size="82" font-weight="950" fill="#111827">一个 Head</text>
    <text x="104" y="405" font-size="92" font-weight="950" fill="#111827">为什么<tspan fill="#E45756">不够？</tspan></text>
    <path d="M108 442 C270 414 475 419 682 440" fill="none" stroke="#FFE36E" stroke-width="20" stroke-linecap="round" opacity="0.95"/>

    <text x="106" y="525" font-size="35" font-weight="850" fill="#334155">不是 fixed experts（固定专家）</text>
    <text x="106" y="574" font-size="35" font-weight="850" fill="#334155">而是 learned projection subspaces（投影子空间）</text>

    <g filter="url(#shadow)">
      <rect x="86" y="648" width="908" height="548" rx="32" fill="#FFFFFF" stroke="#E1E7EF" stroke-width="2"/>
      <text x="124" y="710" font-size="31" font-weight="900" fill="#111827">Proof Object：原论文 Figure 2</text>
      <text x="124" y="750" font-size="23" font-weight="760" fill="#64748B">用论文结构证明：Linear → Attention → Concat → W<tspan baseline-shift="super" font-size="15">O</tspan></text>
      <rect x="118" y="784" width="402" height="300" rx="22" fill="#FBFCFE" stroke="#DCE4EE"/>
      ${multiHeadUri ? `<image href="${multiHeadUri}" x="146" y="812" width="346" height="230" preserveAspectRatio="xMidYMid meet"/>` : ""}
      <rect x="574" y="794" width="322" height="282" rx="22" fill="#FBFCFE" stroke="#DCE4EE"/>
      ${transformerUri ? `<image href="${transformerUri}" x="602" y="822" width="266" height="218" preserveAspectRatio="xMidYMid meet" opacity="0.95"/>` : ""}
      <text x="319" y="1124" text-anchor="middle" font-size="24" font-weight="800" fill="#667085">Multi-Head Attention crop</text>
      <text x="735" y="1124" text-anchor="middle" font-size="24" font-weight="800" fill="#667085">Transformer context</text>
    </g>

    <g filter="url(#shadow)">
      <rect x="86" y="1236" width="908" height="240" rx="32" fill="#FFFFFF" stroke="#E1E7EF" stroke-width="2"/>
      <text x="124" y="1296" font-size="30" font-weight="900" fill="#111827">3 个事实，不靠口号</text>
      ${flowPill(128, 1336, 218, "1 多组投影", "#EEF4FF", "#AFC5FF", "#3867D6")}
      ${flowPill(420, 1336, 238, "2 并行 Attention", "#FFF5E9", "#F5C28A", "#D56700")}
      ${flowPill(730, 1336, 206, "3 Wᴼ 融合", "#EEF9EF", "#B9DDBB", "#31823C")}
      <line x1="354" y1="1372" x2="412" y2="1372" stroke="#64748B" stroke-width="4" marker-end="url(#arrow)"/>
      <line x1="666" y1="1372" x2="722" y2="1372" stroke="#64748B" stroke-width="4" marker-end="url(#arrow)"/>
    </g>

    <g filter="url(#shadow)">
      <rect x="86" y="1516" width="908" height="236" rx="32" fill="#FFFFFF" stroke="#E1E7EF" stroke-width="2"/>
      <text x="124" y="1574" font-size="30" font-weight="900" fill="#111827">论文公式对应</text>
      <rect x="126" y="1606" width="828" height="58" rx="18" fill="#FAFBFD" stroke="#E5EAF1"/>
      ${formulaText(540, 1645, 'head<tspan baseline-shift="sub" font-size="19">i</tspan> = Attention(QW<tspan baseline-shift="sub" font-size="19">i</tspan><tspan baseline-shift="super" font-size="19">Q</tspan>, KW<tspan baseline-shift="sub" font-size="19">i</tspan><tspan baseline-shift="super" font-size="19">K</tspan>, VW<tspan baseline-shift="sub" font-size="19">i</tspan><tspan baseline-shift="super" font-size="19">V</tspan>)', 29)}
      <rect x="126" y="1680" width="828" height="58" rx="18" fill="#FFF9F0" stroke="#F2D2AD"/>
      ${formulaText(540, 1719, 'd<tspan baseline-shift="sub" font-size="19">k</tspan> = d<tspan baseline-shift="sub" font-size="19">v</tspan> = d<tspan baseline-shift="sub" font-size="19">model</tspan> / h', 30)}
    </g>

    <text x="540" y="1830" text-anchor="middle" font-size="25" font-weight="800" fill="#667085">Source: Harvard Annotated Transformer · Figure 2 · safe90</text>
  </g>
</svg>`;
}

async function main(): Promise<void> {
  fs.mkdirSync(VIDEO_SCRIPT_DIR, { recursive: true });
  fs.mkdirSync(PUBLISH_DIR, { recursive: true });

  const svg = buildSvg();
  const svgPath = path.join(VIDEO_SCRIPT_DIR, "cover_ep03_ogilvy_paper_match_1080x1920_safe90.svg");
  const pngPath = path.join(VIDEO_SCRIPT_DIR, "cover_ep03_ogilvy_paper_match_1080x1920_safe90.png");
  const notePath = path.join(PUBLISH_DIR, "cover_ep03_ogilvy_paper_match.md");

  fs.writeFileSync(svgPath, svg, "utf8");
  const sharp = await loadSharp();
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  fs.writeFileSync(
    notePath,
    [
      "# EP03 Ogilvy Paper-Matched Cover",
      "",
      "- Big Idea: Multi-Head Attention is not fixed experts; it is learned projection subspaces plus Concat and W^O fusion.",
      "- Headline as mini-ad: 一个 Head 为什么不够？",
      "- Visual hero: original Figure 2 Multi-Head Attention crop.",
      "- Proof objects: Figure 2, head_i formula, d_k=d_v=d_model/h.",
      "- Export: PNG, 1080x1920, safe90 black padding."
    ].join("\n"),
    "utf8"
  );

  console.log(
    JSON.stringify({
      status: "cover_ready",
      outputs: [
        path.relative(EPISODE_DIR, pngPath),
        path.relative(EPISODE_DIR, svgPath),
        path.relative(EPISODE_DIR, notePath)
      ],
      constraints: {
        format: "PNG",
        canvas: "1080x1920",
        safe_padding: {
          left_right: SAFE_X,
          top_bottom: SAFE_Y
        }
      }
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
