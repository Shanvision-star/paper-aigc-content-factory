import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = path.resolve(".");
const episodeDir = path.join(rootDir, "episodes", "ep02_attention_qkv_en");
const outDir = path.join(episodeDir, "qa", "animation_review_stills");

type SvgChunk = string;

const fixedArrowMarker = (id: string, color: string): SvgChunk => `
      <marker id="${id}" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M0 0L12 6L0 12Z" fill="${color}"/>
      </marker>`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text(x: number, y: number, value: string, size = 32, weight = 800, fill = "#111827", anchor = "start"): SvgChunk {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(value)}</text>`;
}

function multiline(x: number, y: number, value: string, size = 28, width = 34, weight = 800, fill = "#334155"): SvgChunk {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">
    ${lines.map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * 1.22}">${escapeXml(item)}</tspan>`).join("\n")}
  </text>`;
}

function shell(title: string, subtitle: string, body: SvgChunk): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.55"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.13"/>
      </filter>
      ${fixedArrowMarker("arrow-blue", "#4C78FF")}
      ${fixedArrowMarker("arrow-orange", "#F58518")}
      ${fixedArrowMarker("arrow-green", "#54A24B")}
    </defs>
    <rect width="1080" height="1920" fill="#F7F7F5"/>
    <rect width="1080" height="1920" fill="url(#grid)"/>
    <rect x="70" y="74" width="455" height="58" rx="12" fill="#FFFFFF" stroke="#B279A2" stroke-opacity="0.4"/>
    ${text(92, 114, "EP02 · English animation review", 28, 950, "#B279A2")}
    ${multiline(70, 212, title, 60, 30, 950, "#111827")}
    ${multiline(76, 332, subtitle, 27, 58, 800, "#475569")}
    <g filter="url(#shadow)">
      <rect x="70" y="430" width="940" height="1125" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
      ${body}
    </g>
    ${text(70, 1658, "Source: Harvard Annotated Transformer + EP02 FRAME", 25, 850, "#64748B")}
    ${text(70, 1704, "Gates: anchored paths · complete formula · no overflow · full derivation", 25, 850, "#64748B")}
  </svg>`;
}

function formula(x: number, y: number): SvgChunk {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="850" height="150" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(38, 94, "Attention(", 39, 800, "#111827")}
    ${text(230, 94, "Q", 46, 950, "#4C78FF")}
    ${text(268, 94, ",", 39, 850, "#111827")}
    ${text(300, 94, "K", 46, 950, "#F58518")}
    ${text(338, 94, ",", 39, 850, "#111827")}
    ${text(370, 94, "V", 46, 950, "#54A24B")}
    ${text(413, 94, ") = softmax", 39, 800, "#111827")}
    ${text(632, 94, "(", 58, 800, "#111827")}
    ${text(680, 60, "QK", 35, 950, "#111827")}
    ${text(735, 38, "T", 22, 950, "#111827")}
    <line x1="665" y1="78" x2="772" y2="78" stroke="#111827" stroke-width="4"/>
    ${text(678, 122, "√(dₖ)", 31, 950, "#111827")}
    ${text(780, 94, ")V", 46, 950, "#54A24B")}
  </g>`;
}

function pill(x: number, y: number, label: string, fill: string, stroke: string, color = "#111827"): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="168" height="58" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${text(x + 84, y + 39, label, 26, 900, color, "middle")}
  </g>`;
}

function hArrow(x1: number, y: number, x2: number, color: string, markerId: string, width = 5): SvgChunk {
  return `<path d="M${x1} ${y}H${x2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none" marker-end="url(#${markerId})"/>`;
}

function flowArcArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend: number,
  color: string,
  markerId: string,
  width = 5,
  opacity = 1
): SvgChunk {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const nx = -dy / length;
  const ny = dx / length;
  const cx = (x1 + x2) / 2 + nx * bend;
  const cy = (y1 + y2) / 2 + ny * bend;
  return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none" opacity="${opacity}" marker-end="url(#${markerId})"/>`;
}

function qkGraph(): string {
  const nodes = [
    { id: "K1", x: 235, y: 610, w: "0.12", bend: -26 },
    { id: "K2", x: 810, y: 610, w: "0.08", bend: 26 },
    { id: "K3", x: 860, y: 885, w: "0.71", bend: 18 },
    { id: "K4", x: 640, y: 1080, w: "0.04", bend: 24 },
    { id: "K5", x: 360, y: 1080, w: "0.03", bend: -24 },
    { id: "K6", x: 180, y: 850, w: "0.02", bend: -18 }
  ];
  const center = { x: 540, y: 820, r: 84 };
  const edges = nodes.map((node) => {
    const hot = node.id === "K3";
    const color = hot ? "#F58518" : "#4C78FF";
    const width = 5;
    const dx = node.x - center.x;
    const dy = node.y - center.y;
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const sx = center.x + ux * (center.r + 2);
    const sy = center.y + uy * (center.r + 2);
    const ex = node.x - ux * 66;
    const ey = node.y - uy * 66;
    return flowArcArrow(sx, sy, ex, ey, node.bend, color, hot ? "arrow-orange" : "arrow-blue", width, hot ? 0.95 : 0.45);
  }).join("\n");
  const nodeSvg = nodes.map((node) => {
    const hot = node.id === "K3";
    return `<g>
      <circle cx="${node.x}" cy="${node.y}" r="58" fill="${hot ? "#FFF7ED" : "#EFF6FF"}" stroke="${hot ? "#F58518" : "#4C78FF"}" stroke-width="5"/>
      ${text(node.x, node.y + 7, node.id, 28, 950, "#111827", "middle")}
      <rect x="${node.x - 42}" y="${node.y + 74}" width="84" height="42" rx="12" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(node.x, node.y + 103, node.w, 22, 900, hot ? "#7C2D12" : "#334155", "middle")}
    </g>`;
  }).join("\n");
  const matrixRows = [
    ["0.12", "0.08", "0.71", "0.04"],
    ["0.05", "0.16", "0.20", "0.59"],
    ["0.38", "0.10", "0.44", "0.08"]
  ];
  const matrixY = 1260;
  const matrixSvg = matrixRows.flatMap((row, r) => row.map((cell, c) => {
    const hot = r === 0 && c === 2;
    return `<rect x="${250 + c * 150}" y="${matrixY + r * 70}" width="132" height="54" rx="10" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(316 + c * 150, matrixY + 36 + r * 70, cell, 22, 900, hot ? "#7C2D12" : "#1E293B", "middle")}`;
  })).join("\n");
  return shell(
    "QK^T needs anchored relation paths",
    "The current Query points to Key nodes with SVG paths anchored at node edges. No floating line fragments, no arrow drift.",
    `<g>
      <circle cx="540" cy="820" r="82" fill="#0F172A"/>
      ${text(540, 802, "current", 26, 900, "#FFFFFF", "middle")}
      ${text(540, 840, "Query Qᵢ", 30, 950, "#FFFFFF", "middle")}
      ${edges}
      ${nodeSvg}
      ${text(540, 1224, "soft attention row", 34, 950, "#111827", "middle")}
      ${matrixSvg}
      ${pill(168, 1485, "QK^T", "#EFF6FF", "#4C78FF", "#4C78FF")}
      ${text(368, 1523, "score matrix, not a static graph", 30, 850, "#475569")}
    </g>`
  );
}

function derivationChain(): string {
  const cardW = 138;
  const stageX = [110, 290, 470, 650, 830];
  const stage = (x: number, y: number, n: string, title: string, sub: string, color: string): SvgChunk => `<g>
    <rect x="${x}" y="${y}" width="${cardW}" height="220" rx="18" fill="#FFFFFF" stroke="${color}" stroke-opacity="0.45" stroke-width="3"/>
    <rect x="${x + 18}" y="${y + 18}" width="42" height="42" rx="12" fill="${color}"/>
    ${text(x + 39, y + 49, n, 24, 950, "#FFFFFF", "middle")}
    ${multiline(x + 18, y + 98, title, 26, 8, 950, "#111827")}
    ${multiline(x + 18, y + 167, sub, 20, 11, 800, "#475569")}
  </g>`;
  const arrows = stageX.slice(0, -1).map((x, index) => hArrow(x + cardW + 12, 1170, stageX[index + 1] - 12, "#94A3B8", "arrow-blue", 5)).join("\n");
  return shell(
    "Show the paper derivation, not just labels",
    "This frame is the required source-backed hero: formula first, then the same computation unfolded into five visual beats.",
    `<g>
      ${formula(110, 585)}
      <rect x="132" y="775" width="816" height="94" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>
      ${multiline(160, 822, "Full formula stays in one object: softmax( QK^T / √(dₖ) ) V", 27, 48, 900, "#111827")}
      ${stage(stageX[0], 1060, "1", "Score", "QK^T", "#4C78FF")}
      ${stage(stageX[1], 1060, "2", "Scale", "÷ √(dₖ)", "#E45756")}
      ${stage(stageX[2], 1060, "3", "Softmax", "row weights", "#B279A2")}
      ${stage(stageX[3], 1060, "4", "Read V", "weighted sum", "#54A24B")}
      ${stage(stageX[4], 1060, "5", "Output", "new token state", "#0F172A")}
      ${arrows}
      <rect x="132" y="1350" width="816" height="92" rx="18" fill="#FFF7ED" stroke="#F58518" stroke-opacity="0.35"/>
      ${multiline(160, 1392, "dₖ = Query/Key vector dimension; the denominator is square root of dₖ.", 27, 48, 850, "#7C2D12")}
    </g>`
  );
}

function softmaxFrame(): string {
  const scoreRows = [
    ["3.2", "1.1", "0.3", "0.4"],
    ["0.2", "2.6", "1.1", "0.7"],
    ["0.5", "0.8", "3.8", "0.6"]
  ];
  const weightRows = [
    ["0.81", "0.10", "0.04", "0.05"],
    ["0.06", "0.62", "0.21", "0.11"],
    ["0.03", "0.04", "0.87", "0.06"]
  ];
  const grid = (x: number, y: number, rows: string[][], hotRow: number, hotCol: number): SvgChunk => rows.flatMap((row, r) => row.map((cell, c) => {
    const hot = r === hotRow && c === hotCol;
    return `<rect x="${x + c * 94}" y="${y + r * 82}" width="82" height="62" rx="10" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(x + 41 + c * 94, y + 40 + r * 82, cell, 23, 900, hot ? "#7C2D12" : "#1E293B", "middle")}`;
  })).join("\n");
  return shell(
    "Softmax is row-wise normalization",
    "The animation should highlight one Query row, normalize that row to sum to one, then pass the weights to V.",
    `<g>
      ${text(255, 610, "scores after QK^T / √(dₖ)", 28, 900, "#111827", "middle")}
      ${text(760, 610, "attention weights", 28, 900, "#111827", "middle")}
      ${grid(112, 680, scoreRows, 2, 2)}
      ${hArrow(510, 800, 598, "#B279A2", "arrow-blue", 5)}
      ${text(554, 770, "softmax", 26, 950, "#B279A2", "middle")}
      ${grid(610, 680, weightRows, 2, 2)}
      <rect x="125" y="980" width="830" height="105" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
      ${text(154, 1045, "Active row sum: 0.03 + 0.04 + 0.87 + 0.06 = 1.00", 31, 900, "#111827")}
      ${pill(168, 1195, "row-wise", "#F5F3FF", "#B279A2", "#B279A2")}
      ${multiline(365, 1222, "one current token gets one distribution over context tokens", 27, 32, 850, "#475569")}
    </g>`
  );
}

function weightedValueFrame(): string {
  const values = ["V₁", "V₂", "V₃", "V₄"];
  const weights = ["0.03", "0.04", "0.87", "0.06"];
  const rows = values.map((value, i) => {
    const y = 690 + i * 110;
    const hot = i === 2;
    return `<g>
      <rect x="160" y="${y}" width="145" height="66" rx="14" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(232, y + 43, weights[i], 26, 900, hot ? "#7C2D12" : "#1E293B", "middle")}
      <text x="365" y="${y + 44}" font-family="Arial, sans-serif" font-size="30" font-weight="950" fill="#64748B">×</text>
      <rect x="425" y="${y}" width="145" height="66" rx="14" fill="${hot ? "#F0FDF4" : "#F8FAFC"}" stroke="#54A24B" stroke-opacity="0.45"/>
      ${text(497, y + 43, value, 28, 950, "#54A24B", "middle")}
      ${flowArcArrow(570, y + 33, 776, 910, hot ? 0 : 18, hot ? "#54A24B" : "#94A3B8", "arrow-green", 5, hot ? 1 : 0.58)}
    </g>`;
  }).join("\n");
  return shell(
    "Weights read Value vectors into output",
    "After softmax, the visual must show the multiplication by V and the merge into O. This is the missing final step in the bad draft.",
    `<g>
      ${text(232, 640, "weights", 30, 900, "#111827", "middle")}
      ${text(497, 640, "Value vectors", 30, 900, "#111827", "middle")}
      ${rows}
      <circle cx="850" cy="910" r="72" fill="#F0FDF4" stroke="#54A24B" stroke-width="6"/>
      ${text(850, 925, "Oᵢ", 40, 950, "#54A24B", "middle")}
      ${text(850, 1018, "new representation", 28, 850, "#475569", "middle")}
      <rect x="135" y="1175" width="810" height="118" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
      ${multiline(170, 1238, "Formula beat: softmax gives proportions; V carries the information that gets aggregated.", 30, 47, 850, "#111827")}
    </g>`
  );
}

function kvCacheFrame(): string {
  const tokens = Array.from({ length: 9 }, (_, i) => i);
  const boxes = (x: number, y: number, color: string): SvgChunk => tokens.map((_, i) => `<rect x="${x + i * 34}" y="${y}" width="24" height="42" rx="6" fill="${i < 6 ? color : "#E5E7EB"}" opacity="${i < 6 ? 0.9 : 0.55}"/>`).join("\n");
  return shell(
    "KV Cache belongs to runtime state",
    "The English engineering section must not reuse the QKV projection cards. It should show new Q reading cached Key/Value projections.",
    `<g>
      ${pill(132, 650, "new Q", "#EFF6FF", "#4C78FF", "#4C78FF")}
      ${pill(410, 650, "cached K", "#FFF7ED", "#F58518", "#F58518")}
      ${pill(688, 650, "cached V", "#F0FDF4", "#54A24B", "#54A24B")}
      ${hArrow(300, 678, 400, "#4C78FF", "arrow-blue", 5)}
      ${hArrow(578, 678, 680, "#F58518", "arrow-orange", 5)}
      ${text(150, 815, "Step t", 28, 900, "#111827")}
      ${boxes(255, 785, "#FDE68A")}
      ${text(150, 930, "Step t + 1", 28, 900, "#111827")}
      ${boxes(255, 900, "#BFDBFE")}
      <rect x="560" y="790" width="360" height="175" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
      ${multiline(590, 850, "Cache projected K and V, not raw tokens. New Query is computed for the current token.", 29, 28, 900, "#111827")}
      <rect x="132" y="1110" width="790" height="118" rx="18" fill="#ECFDF5" stroke="#54A24B" stroke-opacity="0.35"/>
      ${multiline(165, 1170, "Engineering layering: FlashAttention = kernel, GQA/MQA = model structure, KV Cache = runtime state.", 30, 48, 850, "#064E3B")}
    </g>`
  );
}

const frames = [
  ["01_qk_anchored_relation_graph.png", qkGraph()],
  ["02_formula_derivation_chain.png", derivationChain()],
  ["03_rowwise_softmax.png", softmaxFrame()],
  ["04_weighted_value_to_output.png", weightedValueFrame()],
  ["05_kv_cache_runtime_state.png", kvCacheFrame()]
] as const;

async function main(): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [filename, svg] of frames) {
    await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, filename));
  }
  fs.writeFileSync(
    path.join(outDir, "review_notes.md"),
    [
      "# EP02 English Animation Review Stills",
      "",
      "These stills are not final renders. They are approval frames for rebuilding the English animation branch.",
      "",
      "Detected issue in the current English video:",
      "",
      "- Relation lines were drawn as visual fragments instead of anchored SVG paths, causing drift and unclear pointing.",
      "- Formula was hand-laid as text pieces without a stable formula bounding box, causing crowding and overflow risk.",
      "- The animation did not show the paper derivation chain: QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V -> output.",
      "- Some scenes reused the same projection-card skeleton, so KV Cache and formula beats lost their distinct meaning.",
      "- Captions and source notes competed with the formula area instead of reserving a no-caption zone.",
      "",
      "New review gates:",
      "",
      "- Every relation edge must be an SVG path anchored to the outer edge of source and target nodes/cards, never into the interior.",
      "- Arrowheads and connector stroke widths must stay consistent; emphasis uses color/opacity, not arrow size.",
      "- Relation and aggregation connectors must be single-segment flow arcs with consistent curvature, not arbitrary multi-bend curves.",
      "- The complete formula must fit within one protected bounding box.",
      "- Formula scenes must show the derivation chain and annotation targets.",
      "- KV Cache must show runtime reuse of projected K/V, not generic QKV cards.",
      "- Keyframes must be checked at QK, formula, softmax, weighted V, and KV Cache beats before rendering."
    ].join("\n"),
    "utf8"
  );
  console.log(JSON.stringify({
    status: "animation_review_stills_ready",
    output_dir: path.relative(rootDir, outDir).replace(/\\/g, "/"),
    frames: frames.map(([filename]) => filename)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
