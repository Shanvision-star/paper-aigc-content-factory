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

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const SAFE_X = 54;
const SAFE_Y = 96;
const SAFE_WIDTH = CANVAS_WIDTH - SAFE_X * 2;
const SAFE_HEIGHT = CANVAS_HEIGHT - SAFE_Y * 2;

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readImageDataUri(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace(".", "") || "png";
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

async function loadSharp(): Promise<SharpFactory | null> {
  try {
    const sharp = await import("sharp");
    return ((sharp as { default?: unknown }).default ?? sharp) as SharpFactory;
  } catch {
    return null;
  }
}

function textLines(lines: string[], x: number, y: number, size: number, color: string, weight = 800, lineHeight = 1.12): string {
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : size * lineHeight * index;
      return `<text x="${x}" y="${y + dy}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function chip(x: number, y: number, w: number, text: string, fill: string, stroke: string, color: string): string {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="58" rx="24" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + 38}" text-anchor="middle" font-size="24" font-weight="800" fill="${color}">${escapeXml(text)}</text>
  `;
}

function buildCoverSvg(): string {
  const figurePath = path.join(SOURCE_ASSETS_DIR, "harvard_figure_multi_head_attention.png");
  const archPath = path.join(SOURCE_ASSETS_DIR, "harvard_figure_transformer_architecture.png");
  const figureUri = fs.existsSync(figurePath) ? readImageDataUri(figurePath) : "";
  const archUri = fs.existsSync(archPath) ? readImageDataUri(archPath) : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#E9EDF2" stroke-width="1"/>
    </pattern>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#263044" flood-opacity="0.16"/>
    </filter>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4C78FF"/>
      <stop offset="0.55" stop-color="#F58518"/>
      <stop offset="1" stop-color="#54A24B"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="#0C0F14"/>
  <rect x="${SAFE_X}" y="${SAFE_Y}" width="${SAFE_WIDTH}" height="${SAFE_HEIGHT}" rx="42" fill="#F7F7F5"/>
  <rect x="${SAFE_X}" y="${SAFE_Y}" width="${SAFE_WIDTH}" height="${SAFE_HEIGHT}" rx="42" fill="url(#grid)" opacity="0.72"/>

  <g font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif">
    <rect x="178" y="142" width="724" height="66" rx="28" fill="#F3EAF8" stroke="#D6C0E6" stroke-width="2"/>
    <text x="540" y="185" text-anchor="middle" font-size="30" font-weight="800" fill="#121827">第3集 · Attention Is All You Need 精读</text>

    ${textLines(["一个 Head", "为什么不够？"], 106, 318, 76, "#121827", 900, 1.08)}
    <rect x="103" y="477" width="630" height="16" rx="8" fill="#FFE36E" opacity="0.9"/>
    <text x="106" y="558" font-size="34" font-weight="760" fill="#354158">Multi-Head Attention（多头注意力）</text>
    <text x="106" y="608" font-size="28" font-weight="700" fill="#536173">同一输入 → 多个 learned projection subspaces → Concat + W<tspan baseline-shift="super" font-size="18">O</tspan></text>

    <g filter="url(#softShadow)">
      <rect x="104" y="700" width="872" height="470" rx="30" fill="#FFFFFF" stroke="#E1E6ED" stroke-width="2"/>
      <text x="132" y="758" font-size="30" font-weight="850" fill="#121827">Proof Object：原论文 Figure 2</text>
      <text x="132" y="798" font-size="22" font-weight="700" fill="#6A7687">Source-backed，先看论文结构，再看手机可读重绘</text>
      ${figureUri ? `<image href="${figureUri}" x="138" y="836" width="390" height="250" preserveAspectRatio="xMidYMid meet"/>` : ""}
      ${archUri ? `<image href="${archUri}" x="580" y="836" width="310" height="250" preserveAspectRatio="xMidYMid meet" opacity="0.92"/>` : ""}
      <text x="138" y="1126" font-size="22" font-weight="760" fill="#617086">Multi-Head Attention crop</text>
      <text x="580" y="1126" font-size="22" font-weight="760" fill="#617086">Transformer context</text>
    </g>

    <g filter="url(#softShadow)">
      <rect x="104" y="1212" width="872" height="312" rx="30" fill="#FFFFFF" stroke="#E1E6ED" stroke-width="2"/>
      <text x="132" y="1272" font-size="30" font-weight="850" fill="#121827">核心公式</text>
      <rect x="150" y="1318" width="780" height="84" rx="20" fill="#FAFBFD" stroke="#E4E9F0"/>
      <text x="540" y="1374" text-anchor="middle" font-family="Cambria Math, Times New Roman, serif" font-size="32" font-weight="700" fill="#121827">
        head<tspan baseline-shift="sub" font-size="21">i</tspan> = Attention(QW<tspan baseline-shift="sub" font-size="21">i</tspan><tspan baseline-shift="super" font-size="21">Q</tspan>, KW<tspan baseline-shift="sub" font-size="21">i</tspan><tspan baseline-shift="super" font-size="21">K</tspan>, VW<tspan baseline-shift="sub" font-size="21">i</tspan><tspan baseline-shift="super" font-size="21">V</tspan>)
      </text>
      <rect x="150" y="1426" width="780" height="76" rx="20" fill="#FFF8F0" stroke="#F2D2AD"/>
      <text x="540" y="1477" text-anchor="middle" font-family="Cambria Math, Times New Roman, serif" font-size="31" font-weight="700" fill="#121827">
        MultiHead(Q,K,V)=Concat(head<tspan baseline-shift="sub" font-size="20">1</tspan>,...,head<tspan baseline-shift="sub" font-size="20">h</tspan>)W<tspan baseline-shift="super" font-size="20">O</tspan>
      </text>
    </g>

    <g filter="url(#softShadow)">
      <rect x="104" y="1562" width="872" height="156" rx="28" fill="#FFFFFF" stroke="#E1E6ED" stroke-width="2"/>
      <text x="132" y="1616" font-size="28" font-weight="850" fill="#121827">一句话记住</text>
      <text x="132" y="1662" font-size="27" font-weight="760" fill="#354158">不是 fixed experts（固定专家）</text>
      <text x="132" y="1704" font-size="27" font-weight="760" fill="#354158">而是 learned projection subspaces（学习到的投影子空间）</text>
    </g>

    <g>
      ${chip(118, 1750, 248, "Projection", "#EEF4FF", "#AFC5FF", "#3867D6")}
      ${chip(416, 1750, 210, "Concat", "#FFF5E9", "#F5C28A", "#D56700")}
      ${chip(676, 1750, 230, "Wᴼ 融合", "#EEF9EF", "#B9DDBB", "#31823C")}
    </g>

    <text x="540" y="1862" text-anchor="middle" font-size="24" font-weight="760" fill="#AEB8C6">Source: Harvard Annotated Transformer · Douyin-safe safe90</text>
  </g>
</svg>`;
}

function buildDescription(): string {
  return `# 第3集《为什么一个 Head 不够？》发布描述

## 小红书

一个 Head 已经能算 Attention，为什么 Transformer 还要开很多个 Head？

这一集我们拆开 Multi-Head Attention（多头注意力）：同一份输入不是交给多个“固定专家”，而是进入多个 learned projection subspaces（学习到的投影子空间），最后通过 Concat 和 W^O 输出投影重新融合。

你会看到：
1. head_i 公式到底在表达什么
2. MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O 为什么不是装饰
3. d_k=d_v=d_model/h 如何避免“头越多计算越爆”
4. MHA、MQA、GQA、MoE 在现代大模型里分别处在哪一层

#AI学习 #Transformer #AttentionIsAllYouNeed #大模型 #论文精读 #人工智能

## 抖音

一个 Head 能看关系，为什么 Transformer 还要 Multi-Head Attention？

第3集拆论文 Figure 2 + 公式：head_i、Concat、W^O、d_k=d_v=d_model/h。重点记住：多头不是多个固定专家，而是表示空间的分解与重组。

#Transformer #多头注意力 #大模型 #AI论文精读 #Attention

## B站

标题建议：第3集｜为什么一个 Head 不够？Multi-Head Attention 的公式和工程边界

简介：
本集承接第2集 QKV，继续拆解《Attention Is All You Need》里的 Multi-Head Attention。我们会对齐 Harvard Annotated Transformer 和原论文 Figure 2，讲清楚 head_i 公式、Concat、W^O 输出投影，以及 d_k=d_v=d_model/h 的设计意义。

重点不是把 Multi-Head Attention 讲成“多个固定专家”，而是从工程视角理解：同一输入进入多个 learned projection subspaces，再重新融合成统一表示。最后也会区分 MHA、MQA、GQA、MoE 的系统层级。
`;
}

function buildPlatformManifest(): string {
  return JSON.stringify(
    {
      episode: "ep03_multi_head_attention",
      title: "第3集｜为什么一个 Head 不够？",
      cover: {
        format: "PNG",
        canvas: "1080x1920",
        constraint: "safe90",
        path: "video_script/cover_ep03_multi_head_final_1080x1920_safe90.png"
      },
      videos: {
        douyin: "renders/douyin_zh_1080x1920_final_subtitled_sfx.mp4",
        xiaohongshu: "renders/xiaohongshu_zh_1080x1440_final_subtitled_sfx.mp4",
        bilibili: "renders/bilibili_zh_1920x1080_final_subtitled_sfx.mp4"
      },
      proof_objects: [
        "Harvard Annotated Transformer Multi-Head Attention",
        "Attention Is All You Need Figure 2",
        "head_i formula",
        "MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O",
        "d_k=d_v=d_model/h"
      ],
      hard_gates: [
        "no dark content background",
        "safe90 cover",
        "source-backed formulas and figures",
        "English professional terms with Chinese annotations",
        "personal voice with stable English terms"
      ]
    },
    null,
    2
  );
}

async function main(): Promise<void> {
  ensureDir(VIDEO_SCRIPT_DIR);
  ensureDir(PUBLISH_DIR);

  const svg = buildCoverSvg();
  const svgPath = path.join(VIDEO_SCRIPT_DIR, "cover_ep03_multi_head_final_1080x1920_safe90.svg");
  const pngPath = path.join(VIDEO_SCRIPT_DIR, "cover_ep03_multi_head_final_1080x1920_safe90.png");
  const descriptionPath = path.join(PUBLISH_DIR, "description_zh.md");
  const manifestPath = path.join(PUBLISH_DIR, "platform_manifest.json");

  fs.writeFileSync(svgPath, svg, "utf8");

  const sharp = await loadSharp();
  if (!sharp) {
    throw new Error("sharp is required to render the EP03 cover PNG");
  }

  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  fs.writeFileSync(descriptionPath, buildDescription(), "utf8");
  fs.writeFileSync(manifestPath, buildPlatformManifest(), "utf8");

  console.log(
    JSON.stringify({
      status: "ep03_publish_assets_ready",
      outputs: [
        path.relative(EPISODE_DIR, pngPath),
        path.relative(EPISODE_DIR, svgPath),
        path.relative(EPISODE_DIR, descriptionPath),
        path.relative(EPISODE_DIR, manifestPath)
      ],
      cover_constraint: {
        canvas: `${CANVAS_WIDTH}x${CANVAS_HEIGHT}`,
        safe_padding: {
          left_right: SAFE_X,
          top_bottom: SAFE_Y,
          content_width: SAFE_WIDTH,
          content_height: SAFE_HEIGHT
        }
      }
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
