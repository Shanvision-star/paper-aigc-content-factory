import fs from "node:fs";
import path from "node:path";

const episodeDir = path.resolve("episodes/ep01_attention_is_all_you_need");
const visualsDir = path.join(episodeDir, "visuals");
const diagramsDir = path.join(visualsDir, "diagrams");
const formulasDir = path.join(visualsDir, "formulas");
const paperOriginalDir = path.join(visualsDir, "paper_original");
const framesDir = path.join(visualsDir, "manim_or_frames");

type AssetRecord = {
  asset_id: string;
  kind: "diagram" | "formula" | "paper_original_note" | "frames_note";
  path: string;
  concept: string;
  feynman_analogy: string;
  source: string;
  status: "generated" | "reference_note";
};

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath: string, value: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value, "utf8");
}

function svg(title: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .panel { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 3; }
      .muted { fill: #94a3b8; font-family: Arial, "Microsoft YaHei", sans-serif; }
      .text { fill: #f8fafc; font-family: Arial, "Microsoft YaHei", sans-serif; font-weight: 700; }
      .dark { fill: #0f172a; font-family: Arial, "Microsoft YaHei", sans-serif; font-weight: 700; }
      .small { font-size: 30px; }
      .medium { font-size: 44px; }
      .large { font-size: 64px; }
      .accent { fill: #f59e0b; }
      .blue { fill: #38bdf8; }
      .green { fill: #34d399; }
      .pink { fill: #fb7185; }
      .line { stroke: #38bdf8; stroke-width: 5; fill: none; stroke-linecap: round; }
      .softline { stroke: #94a3b8; stroke-width: 3; fill: none; stroke-linecap: round; opacity: .65; }
      .hotline { stroke: #f59e0b; stroke-width: 8; fill: none; stroke-linecap: round; }
      .token { fill: #1e293b; stroke: #38bdf8; stroke-width: 3; }
    </style>
  </defs>
  <rect class="bg" width="1080" height="1920"/>
  <text x="80" y="128" class="text large">${title}</text>
  ${body}
  <text x="80" y="1830" class="muted small">EP01 · Attention Is All You Need · Formal Visual Asset</text>
</svg>
`;
}

function pill(x: number, y: number, w: number, h: number, label: string, colorClass = "token"): string {
  return `<rect x="${x}" y="${y}" rx="28" ry="28" width="${w}" height="${h}" class="${colorClass}"/>
  <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" class="text medium">${label}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, klass = "line"): string {
  return `<path class="${klass}" d="M ${x1} ${y1} L ${x2} ${y2}"/>`;
}

function titleCard(): string {
  return svg("Attention Is All You Need", `
  <rect x="80" y="260" width="920" height="1040" rx="36" class="panel"/>
  <text x="120" y="360" class="dark large">2017</text>
  <text x="120" y="460" class="dark medium">这篇论文问了一个问题：</text>
  <text x="120" y="580" class="dark large">机器读一句话，</text>
  <text x="120" y="670" class="dark large">必须排队读吗？</text>
  <text x="120" y="850" class="dark medium">Vaswani et al.</text>
  <text x="120" y="920" class="dark medium">NeurIPS 2017 / arXiv:1706.03762</text>
  <text x="120" y="1120" class="dark small">Source card for paper authority scene.</text>`);
}

function rnnChain(): string {
  const tokens = ["我", "看见", "一只", "猫", "它", "很快"];
  const items = tokens.map((token, index) => pill(390, 260 + index * 190, 300, 92, token)).join("\n");
  const arrows = tokens.slice(0, -1).map((_, index) => line(540, 352 + index * 190, 540, 450 + index * 190, index > 2 ? "softline" : "line")).join("\n");
  return svg("RNN = 排队传话", `
  ${items}
  ${arrows}
  <text x="120" y="1540" class="text medium">句子越长，前面的信息越容易变弱。</text>
  <text x="120" y="1610" class="muted small">Feynman analogy: message passing in a queue.</text>`);
}

function selfAttention(): string {
  const coords = [
    [540, 420, "我"],
    [260, 620, "看见"],
    [820, 620, "猫"],
    [260, 940, "它"],
    [820, 940, "很快"],
    [540, 1160, "关系"]
  ] as const;
  const relationLines = coords.slice(0, 5).flatMap((a, i) => coords.slice(i + 1, 5).map((b) => line(a[0], a[1], b[0], b[1], a[2] === "它" || b[2] === "它" ? "hotline" : "softline"))).join("\n");
  const nodes = coords.map(([x, y, label]) => pill(x - 90, y - 46, 180, 92, label)).join("\n");
  return svg("Self-Attention = 加权汇聚", `
  ${relationLines}
  ${nodes}
  <text x="120" y="1480" class="text medium">每个 token 计算相关性，</text>
  <text x="120" y="1550" class="text medium">再按 Attention 权重汇聚信息。</text>`);
}

function qkvCards(): string {
  return svg("Q / K / V = 三个投影空间", `
  <rect x="110" y="330" width="860" height="260" rx="36" class="panel"/>
  <text x="160" y="430" class="dark large">Q · Query</text>
  <text x="160" y="520" class="dark medium">我在找什么？</text>
  <rect x="110" y="710" width="860" height="260" rx="36" class="panel"/>
  <text x="160" y="810" class="dark large">K · Key</text>
  <text x="160" y="900" class="dark medium">你有什么特征？</text>
  <rect x="110" y="1090" width="860" height="260" rx="36" class="panel"/>
  <text x="160" y="1190" class="dark large">V · Value</text>
  <text x="160" y="1280" class="dark medium">要被汇聚的信息</text>
  <text x="120" y="1530" class="text medium">同一 token 表示，进入三个 learned projection spaces。</text>`);
}

function attentionFormula(): string {
  return svg("Attention Formula", `
  <rect x="80" y="360" width="920" height="520" rx="40" class="panel"/>
  <text x="130" y="520" class="dark medium">Attention(Q, K, V)</text>
  <text x="130" y="640" class="dark large">= softmax(QK^T / sqrt(d_k)) V</text>
  <rect x="130" y="760" width="220" height="70" rx="24" class="accent"/>
  <text x="240" y="810" text-anchor="middle" class="dark small">先匹配</text>
  <rect x="410" y="760" width="220" height="70" rx="24" class="blue"/>
  <text x="520" y="810" text-anchor="middle" class="dark small">再选择</text>
  <rect x="690" y="760" width="220" height="70" rx="24" class="green"/>
  <text x="800" y="810" text-anchor="middle" class="dark small">再读取</text>
  <text x="120" y="1080" class="text medium">QK^T 算关系，softmax 变权重，V 被加权汇聚。</text>
  <text x="120" y="1160" class="text medium">A = softmax(QK^T) 就像动态关系矩阵。</text>`);
}

function multiHead(): string {
  const heads = ["子空间 A", "子空间 B", "子空间 C", "子空间 D", "子空间 E", "子空间 F"];
  const panels = heads.map((h, i) => {
    const x = i % 2 === 0 ? 130 : 590;
    const y = 360 + Math.floor(i / 2) * 240;
    return `<rect x="${x}" y="${y}" width="360" height="150" rx="28" class="panel"/>
    <text x="${x + 180}" y="${y + 92}" text-anchor="middle" class="dark medium">${h}</text>
    ${line(x + 180, y + 150, 540, 1240, "softline")}`;
  }).join("\n");
  return svg("Multi-Head = 表示子空间", `
  ${panels}
  <rect x="300" y="1240" width="480" height="150" rx="32" class="token"/>
  <text x="540" y="1332" text-anchor="middle" class="text medium">Concat + Linear</text>
  <text x="120" y="1540" class="text medium">不是人工分工，是训练中形成的并行表示子空间。</text>`);
}

function positionEncoding(): string {
  const waves = Array.from({ length: 4 }, (_, row) => {
    const y = 430 + row * 170;
    const pathData = Array.from({ length: 80 }, (_, i) => {
      const x = 120 + i * 10;
      const amp = 54 - row * 6;
      const yy = y + Math.sin(i / (4 + row * 2)) * amp;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${yy.toFixed(1)}`;
    }).join(" ");
    return `<path d="${pathData}" class="${row % 2 === 0 ? "line" : "hotline"}"/>`;
  }).join("\n");
  return svg("Positional Encoding = 位置坐标", `
  ${waves}
  <rect x="100" y="1180" width="880" height="180" rx="32" class="panel"/>
  <text x="140" y="1260" class="dark medium">PE(pos, 2i) = sin(pos / 10000^(2i / d_model))</text>
  <text x="140" y="1330" class="dark medium">PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))</text>
  <text x="120" y="1530" class="text medium">给每个词贴一个能被模型识别的位置坐标。</text>`);
}

function modelTimeline(): string {
  const items = [
    ["2017", "Transformer"],
    ["2018", "BERT"],
    ["2020+", "GPT"],
    ["Now", "Claude / 多模态"]
  ] as const;
  const body = items.map(([year, label], i) => {
    const x = 160 + i * 240;
    return `${line(x, 700, x + 180, 700, "line")}
    <circle cx="${x}" cy="700" r="42" class="accent"/>
    <text x="${x}" y="610" text-anchor="middle" class="text medium">${year}</text>
    <text x="${x}" y="810" text-anchor="middle" class="text small">${label}</text>`;
  }).join("\n");
  return svg("Transformer Lineage", `
  ${body}
  <text x="120" y="1060" class="text medium">核心延续：用 Attention 组织信息，</text>
  <text x="120" y="1130" class="text medium">用并行计算扩大规模。</text>`);
}

function systemLayers(): string {
  const layers = [
    ["模型结构层", "Transformer"],
    ["模型/产品层", "GPT · Claude · Sora-style"],
    ["编排层", "Agent"],
    ["工具接口层", "MCP · Skills · Workflows"]
  ];
  return svg("Modern AI System Layers", layers.map(([title, detail], i) => {
    const y = 360 + i * 250;
    return `<rect x="110" y="${y}" width="860" height="160" rx="30" class="panel"/>
    <text x="160" y="${y + 65}" class="dark medium">${title}</text>
    <text x="160" y="${y + 125}" class="dark large">${detail}</text>`;
  }).join("\n") + `<text x="120" y="1510" class="text medium">Agent 和 MCP 在模型之上，</text>
  <text x="120" y="1580" class="text medium">不是 Transformer 本体。</text>`);
}

function attentionCost(): string {
  return svg("Attention Cost", `
  <text x="120" y="360" class="text medium">所有 token 互相对话：</text>
  <text x="120" y="450" class="text large">关系数量快速增长</text>
  <rect x="160" y="680" width="160" height="220" class="blue"/>
  <rect x="450" y="560" width="160" height="340" class="accent"/>
  <rect x="740" y="360" width="160" height="540" class="pink"/>
  <text x="240" y="960" text-anchor="middle" class="text small">短序列</text>
  <text x="530" y="960" text-anchor="middle" class="text small">中序列</text>
  <text x="820" y="960" text-anchor="middle" class="text small">长序列</text>
  <text x="120" y="1160" class="text large">O(n^2)</text>
  <text x="120" y="1280" class="text medium">FlashAttention · KV Cache · vLLM</text>
  <text x="120" y="1360" class="muted small">Engineering response to attention/inference cost.</text>`);
}

function writeReadmes(): void {
  write(path.join(paperOriginalDir, "README.md"), `# Paper Original Assets

This folder is reserved for original paper screenshots or crops used as brief source anchors.

Required attribution on every original paper visual:

Source: Vaswani et al., Attention Is All You Need, NeurIPS 2017 / arXiv:1706.03762

Current implementation uses redrawn SVG diagrams for animation and keeps this folder as the attribution and extraction contract.
`);

  write(path.join(framesDir, "README.md"), `# Manim Or Frames

This folder is reserved for optional Manim or frame-sequence outputs.

The first formal implementation uses SVG plus HyperFrames to avoid introducing a heavy rendering dependency before the first reviewable draft.
`);
}

function main(): void {
  ensureDir(diagramsDir);
  ensureDir(formulasDir);
  ensureDir(paperOriginalDir);
  ensureDir(framesDir);

  const assets: AssetRecord[] = [
    ["diagram_title_card", "diagram", path.join("visuals/diagrams/title_card.svg"), "paper authority", "original source card", "arXiv/paper metadata"],
    ["diagram_rnn_chain", "diagram", path.join("visuals/diagrams/rnn_chain.svg"), "sequential recurrence bottleneck", "排队传话", "paper framing"],
    ["diagram_self_attention", "diagram", path.join("visuals/diagrams/self_attention.svg"), "self-attention relation modeling", "加权汇聚", "paper attention mechanism"],
    ["diagram_qkv_cards", "diagram", path.join("visuals/diagrams/qkv_cards.svg"), "QKV projections", "三个 learned projection spaces", "attention formula"],
    ["formula_attention", "formula", path.join("visuals/formulas/attention_formula.svg"), "scaled dot-product attention", "先匹配再读取", "paper formula"],
    ["diagram_multihead", "diagram", path.join("visuals/diagrams/multihead.svg"), "multi-head attention", "并行表示子空间", "paper formula"],
    ["diagram_position_encoding", "diagram", path.join("visuals/diagrams/position_encoding.svg"), "positional encoding", "位置坐标", "paper formula"],
    ["formula_positional_encoding", "formula", path.join("visuals/formulas/positional_encoding.svg"), "sinusoidal positional encoding", "正弦余弦坐标", "paper formula"],
    ["diagram_model_timeline", "diagram", path.join("visuals/diagrams/model_timeline.svg"), "modern model lineage", "技术家族树", "paper plus modern context"],
    ["diagram_system_layers", "diagram", path.join("visuals/diagrams/system_layers.svg"), "model agent MCP layers", "底座/编排/接口", "official MCP/Sora context"],
    ["diagram_attention_cost", "diagram", path.join("visuals/diagrams/attention_cost.svg"), "attention cost", "所有人互相对话会变贵", "engineering context"],
    ["paper_original_readme", "paper_original_note", path.join("visuals/paper_original/README.md"), "paper source assets", "论文原始图锚点", "paper attribution"],
    ["manim_or_frames_readme", "frames_note", path.join("visuals/manim_or_frames/README.md"), "optional frames", "复杂动画预留", "local rendering contract"]
  ].map(([asset_id, kind, assetPath, concept, feynman_analogy, source]) => ({
    asset_id,
    kind: kind as AssetRecord["kind"],
    path: assetPath,
    concept,
    feynman_analogy,
    source,
    status: kind === "paper_original_note" || kind === "frames_note" ? "reference_note" : "generated"
  }));

  write(path.join(diagramsDir, "title_card.svg"), titleCard());
  write(path.join(diagramsDir, "rnn_chain.svg"), rnnChain());
  write(path.join(diagramsDir, "self_attention.svg"), selfAttention());
  write(path.join(diagramsDir, "qkv_cards.svg"), qkvCards());
  write(path.join(formulasDir, "attention_formula.svg"), attentionFormula());
  write(path.join(diagramsDir, "multihead.svg"), multiHead());
  write(path.join(diagramsDir, "position_encoding.svg"), positionEncoding());
  write(path.join(formulasDir, "positional_encoding.svg"), positionEncoding());
  write(path.join(diagramsDir, "model_timeline.svg"), modelTimeline());
  write(path.join(diagramsDir, "system_layers.svg"), systemLayers());
  write(path.join(diagramsDir, "attention_cost.svg"), attentionCost());
  writeReadmes();

  write(path.join(visualsDir, "assets_manifest.json"), `${JSON.stringify({
    episode_id: "ep01_attention_is_all_you_need",
    generated_by: "scripts/build_ep01_formal_visuals.ts",
    attribution: "Source: Vaswani et al., Attention Is All You Need, NeurIPS 2017 / arXiv:1706.03762",
    assets
  }, null, 2)}\n`);

  console.log(JSON.stringify({ status: "visuals_ready", assets: assets.length, output: "episodes/ep01_attention_is_all_you_need/visuals/assets_manifest.json" }));
}

main();
