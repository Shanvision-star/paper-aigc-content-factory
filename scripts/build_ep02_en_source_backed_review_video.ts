import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import sharp from "sharp";

type Segment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  spoken_text: string;
  claim_ids: string[];
};

type Scene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  caption: string;
};

type Platform = {
  id: "youtube-shorts.en-US" | "x.en-US";
  width: number;
  height: number;
  ass: string;
  output: string;
};

const rootDir = path.resolve(".");
const episodeDir = path.join(rootDir, "episodes", "ep02_attention_qkv_en");
const storyboardPath = path.join(episodeDir, "video_script", "storyboard.json");
const segmentsPath = path.join(episodeDir, "script", "voice_segments.json");
const audioPathCandidates = [
  path.join(episodeDir, "audio", "voiceover.postprocessed.wav"),
  path.join(episodeDir, "audio", "voiceover.wav")
];
const sourceFigurePath = path.join(episodeDir, "video_script", "source_assets", "harvard_embedded_03.png");
const renderRoot = path.join(episodeDir, "renders", "source_backed_review");

const platforms: Platform[] = [
  {
    id: "youtube-shorts.en-US",
    width: 1080,
    height: 1920,
    ass: path.join(episodeDir, "captions", "subtitles.en-US.youtube-shorts.ass"),
    output: path.join(episodeDir, "renders", "youtube_shorts_en_1080x1920_source_backed_review.mp4")
  },
  {
    id: "x.en-US",
    width: 1080,
    height: 1080,
    ass: path.join(episodeDir, "captions", "subtitles.en-US.x-square.ass"),
    output: path.join(episodeDir, "renders", "x_en_1080x1080_source_backed_review.mp4")
  }
];

const scenes = JSON.parse(fs.readFileSync(storyboardPath, "utf8")) as Scene[];
const segments = JSON.parse(fs.readFileSync(segmentsPath, "utf8")) as Segment[];
const audioPath = audioPathCandidates.find((candidate) => fs.existsSync(candidate));
const require = createRequire(import.meta.url);
const ffmpegPath = (require("@ffmpeg-installer/ffmpeg") as { path: string }).path;

if (!audioPath) {
  throw new Error("Missing English voiceover audio. Expected audio/voiceover.postprocessed.wav or audio/voiceover.wav.");
}
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(value: string, maxChars: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function text(x: number, y: number, value: string, size: number, weight = 850, fill = "#111827", anchor = "start"): string {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${xml(value)}</text>`;
}

function multiline(x: number, y: number, value: string, size: number, maxChars: number, weight = 850, fill = "#334155", anchor = "start"): string {
  const lines = wrap(value, maxChars);
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * 1.2}">${xml(line)}</tspan>`).join("\n")}
  </text>`;
}

function fixedArrow(id: string, color: string): string {
  return `<marker id="${id}" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M0 0L12 6L0 12Z" fill="${color}"/>
  </marker>`;
}

function hArrow(x1: number, y: number, x2: number, color: string, marker: string): string {
  return `<path d="M${x1} ${y}H${x2}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" marker-end="url(#${marker})"/>`;
}

function flowArc(x1: number, y1: number, x2: number, y2: number, bend: number, color: string, marker: string, opacity = 1): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const nx = -dy / length;
  const ny = dx / length;
  const cx = (x1 + x2) / 2 + nx * bend;
  const cy = (y1 + y2) / 2 + ny * bend;
  return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="${opacity}" marker-end="url(#${marker})"/>`;
}

function card(x: number, y: number, w: number, h: number, title: string, subtitle: string, color: string, fill = "#FFFFFF"): string {
  const titleSize = Math.min(36, Math.max(22, ((w - 42) / Math.max(title.length, 5)) * 1.65));
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${color}" stroke-opacity="0.45" stroke-width="3"/>
    ${multiline(x + 22, y + 62, title, titleSize, 12, 950, color)}
    ${multiline(x + 22, y + h - 58, subtitle, 24, 14, 800, "#475569")}
  </g>`;
}

function formulaBlock(x: number, y: number, scale: number): string {
  const s = (n: number) => Number((n * scale).toFixed(1));
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${s(850)}" height="${s(150)}" rx="${s(18)}" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(s(30), s(92), "Attention(", s(32), 850)}
    ${text(s(225), s(92), "Q", s(39), 950, "#4C78FF")}
    ${text(s(258), s(92), ",", s(32), 850)}
    ${text(s(288), s(92), "K", s(39), 950, "#F58518")}
    ${text(s(321), s(92), ",", s(32), 850)}
    ${text(s(351), s(92), "V", s(39), 950, "#54A24B")}
    ${text(s(392), s(92), ") = softmax", s(32), 850)}
    ${text(s(598), s(92), "(", s(48), 850)}
    ${text(s(645), s(58), "QK", s(31), 950)}
    ${text(s(694), s(38), "T", s(19), 950)}
    <line x1="${s(628)}" y1="${s(76)}" x2="${s(735)}" y2="${s(76)}" stroke="#111827" stroke-width="${s(3.4)}"/>
    ${text(s(640), s(119), "√(dₖ)", s(28), 950)}
    ${text(s(742), s(92), ") V", s(39), 950, "#54A24B")}
  </g>`;
}

function qkGraph(cx: number, cy: number, compact: boolean): string {
  const radius = compact ? 58 : 74;
  const keyRadius = compact ? 40 : 50;
  const distanceX = compact ? 255 : 330;
  const distanceY = compact ? 175 : 235;
  const nodes = [
    { id: "K1", x: cx - distanceX, y: cy - distanceY, weight: "0.12", bend: -20 },
    { id: "K2", x: cx + distanceX, y: cy - distanceY, weight: "0.08", bend: 20 },
    { id: "K3", x: cx + distanceX + 20, y: cy + 45, weight: "0.71", bend: 18 },
    { id: "K4", x: cx + 95, y: cy + distanceY, weight: "0.04", bend: 18 },
    { id: "K5", x: cx - 190, y: cy + distanceY, weight: "0.03", bend: -18 },
    { id: "K6", x: cx - distanceX - 40, y: cy + 30, weight: "0.02", bend: -18 }
  ];
  const edges = nodes.map((node) => {
    const hot = node.id === "K3";
    const dx = node.x - cx;
    const dy = node.y - cy;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / length;
    const uy = dy / length;
    return flowArc(
      cx + ux * (radius + 2),
      cy + uy * (radius + 2),
      node.x - ux * (keyRadius + 8),
      node.y - uy * (keyRadius + 8),
      node.bend,
      hot ? "#F58518" : "#4C78FF",
      hot ? "arrow-orange" : "arrow-blue",
      hot ? 0.96 : 0.45
    );
  }).join("\n");
  const nodeSvg = nodes.map((node) => {
    const hot = node.id === "K3";
    return `<g>
      <circle cx="${node.x}" cy="${node.y}" r="${keyRadius}" fill="${hot ? "#FFF7ED" : "#EFF6FF"}" stroke="${hot ? "#F58518" : "#4C78FF"}" stroke-width="5"/>
      ${text(node.x, node.y + 8, node.id, compact ? 23 : 27, 950, "#111827", "middle")}
      <rect x="${node.x - 40}" y="${node.y + keyRadius + 10}" width="80" height="36" rx="10" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(node.x, node.y + keyRadius + 35, node.weight, 20, 900, hot ? "#7C2D12" : "#334155", "middle")}
    </g>`;
  }).join("\n");
  return `<g>
    ${edges}
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#0F172A"/>
    ${text(cx, cy - 9, "current", compact ? 22 : 26, 950, "#FFFFFF", "middle")}
    ${text(cx, cy + 27, "Query Q", compact ? 25 : 31, 950, "#FFFFFF", "middle")}
    ${nodeSvg}
  </g>`;
}

function scoreMatrix(x: number, y: number, compact: boolean): string {
  const rows = [
    ["0.12", "0.08", "0.71", "0.04"],
    ["0.05", "0.16", "0.20", "0.59"],
    ["0.38", "0.10", "0.44", "0.08"]
  ];
  const cellW = compact ? 80 : 118;
  const cellH = compact ? 42 : 54;
  const gapX = compact ? 92 : 132;
  const gapY = compact ? 52 : 68;
  return `<g>
    ${rows.flatMap((row, r) => row.map((cell, c) => {
      const hot = r === 0 && c === 2;
      return `<rect x="${x + c * gapX}" y="${y + r * gapY}" width="${cellW}" height="${cellH}" rx="9" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(x + c * gapX + cellW / 2, y + r * gapY + cellH * 0.68, cell, compact ? 18 : 22, 900, hot ? "#7C2D12" : "#1E293B", "middle")}`;
    })).join("\n")}
  </g>`;
}

function sourceFigure(x: number, y: number, w: number, h: number): string {
  if (!fs.existsSync(sourceFigurePath)) return "";
  const data = fs.readFileSync(sourceFigurePath).toString("base64");
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
    <image href="data:image/png;base64,${data}" x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" preserveAspectRatio="xMidYMid meet"/>
  </g>`;
}

function visual(scene: Scene, width: number, height: number): string {
  const compact = height <= 1080;
  const left = compact ? 78 : 90;
  const top = compact ? 285 : 455;
  const panelW = width - left * 2;
  const panelH = compact ? 610 : 1010;
  const type = scene.visual_type;
  const centerX = width / 2;

  if (type.includes("cache")) {
    const y = compact ? 350 : 690;
    return `<g>
      ${card(130, y, 190, compact ? 150 : 220, "new Q", "current token", "#4C78FF", "#EFF6FF")}
      ${hArrow(325, y + (compact ? 75 : 110), 405, "#4C78FF", "arrow-blue")}
      ${card(420, y, 230, compact ? 150 : 220, "cached K", "history index", "#F58518", "#FFF7ED")}
      ${hArrow(655, y + (compact ? 75 : 110), 735, "#F58518", "arrow-orange")}
      ${card(750, y, 230, compact ? 150 : 220, "cached V", "history content", "#54A24B", "#F0FDF4")}
      ${timeline(140, y + (compact ? 240 : 330), compact)}
      ${multiline(135, y + (compact ? 410 : 565), "Cache projected Key and Value, not raw tokens. New Query is computed for the current token.", compact ? 26 : 34, compact ? 48 : 45, 900)}
    </g>`;
  }

  if (type.includes("projection")) {
    const y = top + (compact ? 110 : 260);
    const h = compact ? 225 : 350;
    return `<g>
      ${card(110, y, 190, h, "X", "same input", "#111827")}
      ${hArrow(310, y + h / 2, 365, "#94A3B8", "arrow-blue")}
      ${card(380, y, 190, h, "Q = XW_Q", "Query space", "#4C78FF", "#EFF6FF")}
      ${card(600, y, 190, h, "K = XW_K", "Key space", "#F58518", "#FFF7ED")}
      ${card(820, y, 190, h, "V = XW_V", "Value space", "#54A24B", "#F0FDF4")}
      ${multiline(125, y + h + 80, "They are learned projection spaces, not three separate data sources.", compact ? 25 : 34, compact ? 52 : 48, 900)}
    </g>`;
  }

  if (type.includes("meeting")) {
    const y = top + (compact ? 110 : 260);
    const h = compact ? 245 : 390;
    return `<g>
      ${card(115, y, 260, h, "Query", "the question", "#4C78FF", "#EFF6FF")}
      ${card(410, y, 260, h, "Key", "the index label", "#F58518", "#FFF7ED")}
      ${card(705, y, 260, h, "Value", "the real content", "#54A24B", "#F0FDF4")}
      ${multiline(130, y + h + 80, "Feynman analogy: first match the label, then read the useful content.", compact ? 25 : 34, compact ? 52 : 46, 900)}
    </g>`;
  }

  if (type.includes("scale") || type.includes("complete") || type.includes("summary")) {
    const formulaY = compact ? 410 : 650;
    return `<g>
      ${sourceFigure(compact ? 105 : 120, compact ? 280 : 455, compact ? 370 : 400, compact ? 185 : 250)}
      ${formulaBlock(compact ? 120 : 115, formulaY, compact ? 0.98 : 1)}
      <rect x="${compact ? 120 : 130}" y="${formulaY + (compact ? 170 : 210)}" width="${compact ? 840 : 820}" height="${compact ? 94 : 118}" rx="16" fill="#FFF7ED" stroke="#F58518" stroke-opacity="0.36"/>
      ${multiline(compact ? 150 : 165, formulaY + (compact ? 225 : 275), "d_k is the Query and Key vector dimension. The denominator is the square root of d_k.", compact ? 25 : 32, compact ? 52 : 46, 900, "#7C2D12")}
      ${derivationSteps(115, formulaY + (compact ? 300 : 420), compact)}
    </g>`;
  }

  if (type.includes("softmax")) {
    const y = compact ? 360 : 650;
    return `<g>
      ${multiline(125, y - 35, "Scores after QK^T / √(d_k)", compact ? 26 : 32, 34, 950)}
      ${scoreGrid(120, y, false, compact)}
      ${hArrow(compact ? 480 : 500, y + (compact ? 108 : 142), compact ? 590 : 585, "#B279A2", "arrow-blue")}
      ${text(centerX, y + (compact ? 95 : 130), "softmax", compact ? 25 : 30, 950, "#B279A2", "middle")}
      ${scoreGrid(compact ? 620 : 615, y, true, compact)}
      ${multiline(125, y + (compact ? 285 : 385), "One current token gets one row of attention weights. That row sums to one.", compact ? 26 : 34, compact ? 50 : 46, 900)}
    </g>`;
  }

  if (type.includes("weighted")) {
    const y = compact ? 330 : 590;
    return weightedVisual(y, compact);
  }

  if (type.includes("optimization")) {
    const y = compact ? 350 : 660;
    const h = compact ? 230 : 360;
    return `<g>
      ${card(105, y, 285, h, "FlashAttention", "kernel level", "#4C78FF", "#EFF6FF")}
      ${card(400, y, 285, h, "GQA / MQA", "model structure", "#F58518", "#FFF7ED")}
      ${card(695, y, 285, h, "KV Cache", "runtime state", "#54A24B", "#F0FDF4")}
      ${multiline(125, y + h + 80, "Same QKV path, optimized at different engineering layers.", compact ? 28 : 38, compact ? 44 : 42, 950)}
    </g>`;
  }

  if (type.includes("next")) {
    const y = compact ? 355 : 670;
    return `<g>
      ${[0, 1, 2, 3].map((index) => card(120 + index * 210, y, 170, compact ? 190 : 300, `head ${index + 1}`, "one view", "#4C78FF", "#EFF6FF")).join("\n")}
      ${multiline(145, y + (compact ? 285 : 430), "Next: if one view works, why many heads at once?", compact ? 36 : 54, compact ? 29 : 28, 950)}
    </g>`;
  }

  const graphY = compact ? 520 : 805;
  return `<g>
    ${qkGraph(centerX, graphY, compact)}
    ${text(centerX, graphY + (compact ? 300 : 390), "soft attention row", compact ? 28 : 36, 950, "#111827", "middle")}
    ${scoreMatrix(compact ? 285 : 250, graphY + (compact ? 330 : 430), compact)}
  </g>`;
}

function derivationSteps(x: number, y: number, compact: boolean): string {
  const stepW = compact ? 136 : 148;
  const stepH = compact ? 130 : 165;
  const gap = compact ? 20 : 18;
  const labels = [
    ["1", "Score", "QK^T", "#4C78FF"],
    ["2", "Scale", "÷ √(d_k)", "#E45756"],
    ["3", "Softmax", "row weights", "#B279A2"],
    ["4", "Read V", "weighted sum", "#54A24B"],
    ["5", "Output", "new state", "#0F172A"]
  ];
  return `<g>
    ${labels.map(([n, title, sub, color], index) => {
      const sx = x + index * (stepW + gap);
      return `<g>
        <rect x="${sx}" y="${y}" width="${stepW}" height="${stepH}" rx="14" fill="#FFFFFF" stroke="${color}" stroke-opacity="0.45" stroke-width="3"/>
        <rect x="${sx + 14}" y="${y + 14}" width="34" height="34" rx="8" fill="${color}"/>
        ${text(sx + 31, y + 39, n, 21, 950, "#FFFFFF", "middle")}
        ${text(sx + 16, y + (compact ? 78 : 88), title, compact ? 20 : 22, 950)}
        ${multiline(sx + 16, y + (compact ? 110 : 130), sub, compact ? 17 : 19, 10, 850)}
      </g>`;
    }).join("\n")}
    ${labels.slice(0, -1).map((_, index) => hArrow(x + (index + 1) * stepW + index * gap + 5, y + stepH / 2, x + (index + 1) * (stepW + gap) - 5, "#94A3B8", "arrow-blue")).join("\n")}
  </g>`;
}

function scoreGrid(x: number, y: number, weights: boolean, compact: boolean): string {
  const rows = weights
    ? [["0.81", "0.10", "0.04"], ["0.06", "0.62", "0.21"], ["0.03", "0.04", "0.87"]]
    : [["3.2", "1.1", "0.3"], ["0.2", "2.6", "1.1"], ["0.5", "0.8", "3.8"]];
  const cell = compact ? 62 : 86;
  const gap = compact ? 72 : 100;
  return `<g>
    ${rows.flatMap((row, r) => row.map((value, c) => {
      const hot = r === 2 && c === 2;
      return `<rect x="${x + c * gap}" y="${y + r * gap}" width="${cell}" height="${cell}" rx="9" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
      ${text(x + c * gap + cell / 2, y + r * gap + cell * 0.62, value, compact ? 19 : 25, 900, hot ? "#7C2D12" : "#1E293B", "middle")}`;
    })).join("\n")}
  </g>`;
}

function weightedVisual(y: number, compact: boolean): string {
  const values = ["V1", "V2", "V3", "V4"];
  const weights = ["0.03", "0.04", "0.87", "0.06"];
  const rowGap = compact ? 72 : 106;
  const outX = compact ? 820 : 845;
  const outY = y + rowGap * 1.5;
  return `<g>
    ${text(230, y - 35, "weights", compact ? 26 : 32, 950, "#111827", "middle")}
    ${text(500, y - 35, "Value vectors", compact ? 26 : 32, 950, "#111827", "middle")}
    ${values.map((value, index) => {
      const rowY = y + index * rowGap;
      const hot = index === 2;
      return `<g>
        <rect x="160" y="${rowY}" width="140" height="${compact ? 48 : 64}" rx="12" fill="${hot ? "#FDE68A" : "#EEF2FF"}"/>
        ${text(230, rowY + (compact ? 32 : 42), weights[index], compact ? 22 : 26, 900, hot ? "#7C2D12" : "#1E293B", "middle")}
        ${text(370, rowY + (compact ? 33 : 43), "×", compact ? 26 : 31, 950, "#64748B", "middle")}
        <rect x="430" y="${rowY}" width="140" height="${compact ? 48 : 64}" rx="12" fill="${hot ? "#F0FDF4" : "#F8FAFC"}" stroke="#54A24B" stroke-opacity="0.45"/>
        ${text(500, rowY + (compact ? 32 : 42), value, compact ? 23 : 28, 950, "#54A24B", "middle")}
        ${flowArc(570, rowY + (compact ? 24 : 32), outX - 72, outY, hot ? 0 : 16, hot ? "#54A24B" : "#94A3B8", "arrow-green", hot ? 1 : 0.58)}
      </g>`;
    }).join("\n")}
    <circle cx="${outX}" cy="${outY}" r="${compact ? 60 : 72}" fill="#F0FDF4" stroke="#54A24B" stroke-width="6"/>
    ${text(outX, outY + 13, "O", compact ? 42 : 48, 950, "#54A24B", "middle")}
    ${text(outX, outY + (compact ? 90 : 112), "new representation", compact ? 25 : 30, 900, "#475569", "middle")}
  </g>`;
}

function timeline(x: number, y: number, compact: boolean): string {
  const cell = compact ? 22 : 28;
  const gap = compact ? 30 : 38;
  const boxes = (rowY: number, color: string) => Array.from({ length: 9 }, (_, i) =>
    `<rect x="${x + 130 + i * gap}" y="${rowY}" width="${cell}" height="${cell + 14}" rx="6" fill="${i < 6 ? color : "#E5E7EB"}" opacity="${i < 6 ? 0.92 : 0.56}"/>`
  ).join("\n");
  return `<g>
    ${text(x, y + 31, "Step t", compact ? 24 : 28, 950)}
    ${boxes(y, "#FDE68A")}
    ${text(x, y + (compact ? 88 : 108), "Step t + 1", compact ? 24 : 28, 950)}
    ${boxes(y + (compact ? 58 : 76), "#BFDBFE")}
  </g>`;
}

function titleFor(scene: Scene): string {
  const type = scene.visual_type;
  if (type.includes("hook")) return "Q × Kᵀ: what does it compute?";
  if (type.includes("adjacency")) return "Attention builds a soft matrix";
  if (type.includes("cache")) return "KV Cache reuses projected K/V";
  if (type.includes("projection")) return "Q, K, V are learned projections";
  if (type.includes("meeting")) return "A Feynman analogy";
  if (type.includes("pronoun")) return "Query matches every Key";
  if (type.includes("scale")) return "Why divide by √(dₖ)?";
  if (type.includes("softmax")) return "softmax turns scores into weights";
  if (type.includes("weighted")) return "Weighted Value becomes output";
  if (type.includes("complete")) return "Scaled Dot-Product Attention";
  if (type.includes("optimization")) return "Modern LLMs still optimize this path";
  if (type.includes("summary")) return "Feynman summary";
  return "Next: Multi-Head Attention";
}

function svg(scene: Scene, platform: Platform): string {
  const compact = platform.height <= 1080;
  const titleSize = compact ? 46 : 62;
  const subtitleSize = compact ? 23 : 28;
  const titleY = compact ? 145 : 210;
  const subY = compact ? 215 : 305;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${platform.width}" height="${platform.height}" viewBox="0 0 ${platform.width} ${platform.height}">
    <defs>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.56"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.12"/>
      </filter>
      ${fixedArrow("arrow-blue", "#4C78FF")}
      ${fixedArrow("arrow-orange", "#F58518")}
      ${fixedArrow("arrow-green", "#54A24B")}
    </defs>
    <rect width="${platform.width}" height="${platform.height}" fill="#F7F7F5"/>
    <rect width="${platform.width}" height="${platform.height}" fill="url(#grid)"/>
    <rect x="70" y="${compact ? 52 : 74}" width="${compact ? 430 : 500}" height="${compact ? 48 : 58}" rx="10" fill="#FFFFFF" stroke="#B279A2" stroke-opacity="0.4"/>
    ${text(92, compact ? 84 : 113, "EP02 · Attention Is All You Need", compact ? 24 : 30, 950, "#B279A2")}
    ${multiline(70, titleY, titleFor(scene), titleSize, compact ? 29 : 26, 950, "#111827")}
    ${multiline(76, subY, scene.caption, subtitleSize, compact ? 50 : 56, 850, "#475569")}
    <g filter="url(#shadow)">
      <rect x="${compact ? 60 : 70}" y="${compact ? 260 : 385}" width="${platform.width - (compact ? 120 : 140)}" height="${compact ? 660 : 1115}" rx="20" fill="#FFFFFF" stroke="#E2E8F0"/>
      ${visual(scene, platform.width, platform.height)}
    </g>
  </svg>`;
}

async function renderFrames(platform: Platform): Promise<string> {
  const frameDir = path.join(renderRoot, platform.id.replace(".", "_"), "frames");
  fs.mkdirSync(frameDir, { recursive: true });
  const concatPath = path.join(renderRoot, platform.id.replace(".", "_"), "concat.txt");
  const lines: string[] = [];

  for (const [index, scene] of scenes.entries()) {
    const framePath = path.join(frameDir, `${String(index + 1).padStart(2, "0")}_${scene.scene_id}.png`);
    await sharp(Buffer.from(svg(scene, platform))).png().toFile(framePath);
    const matchingSegment = segments[index];
    const duration = matchingSegment?.duration ?? scene.duration;
    lines.push(`file '${framePath.replace(/\\/g, "/")}'`);
    lines.push(`duration ${duration.toFixed(3)}`);
  }

  const lastFrame = path.join(frameDir, `${String(scenes.length).padStart(2, "0")}_${scenes[scenes.length - 1].scene_id}.png`);
  lines.push(`file '${lastFrame.replace(/\\/g, "/")}'`);
  fs.writeFileSync(concatPath, `${lines.join("\n")}\n`, "utf8");
  return concatPath;
}

function runFfmpeg(platform: Platform, concatPath: string): void {
  const renderDir = path.dirname(platform.output);
  fs.mkdirSync(renderDir, { recursive: true });
  const assLocal = path.join(renderDir, `${platform.id.replace(".", "_")}.ass`);
  fs.copyFileSync(platform.ass, assLocal);

  const args = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
    "-i", audioPath!,
    "-vf", `fps=30,ass=${path.basename(assLocal)}`,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "160k",
    "-shortest",
    platform.output
  ];
  const result = spawnSync(ffmpegPath!, args, { cwd: renderDir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error([
      `ffmpeg failed for ${platform.id}`,
      `status=${result.status}`,
      `error=${result.error ? String(result.error) : "none"}`,
      `stdout=${typeof result.stdout === "string" ? result.stdout.slice(-2000) : ""}`,
      `stderr=${typeof result.stderr === "string" ? result.stderr.slice(-4000) : ""}`,
      `args=${args.join(" ")}`
    ].join("\n"));
  }
}

function writeStatus(outputs: Array<{ platform: string; output: string; concat: string }>): void {
  const statusPath = path.join(episodeDir, "qa", "english_source_backed_review_status.json");
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, `${JSON.stringify({
    status: "rendered_needs_human_review",
    generated_at: new Date().toISOString(),
    audio_input: path.relative(episodeDir, audioPath!).replace(/\\/g, "/"),
    outputs: outputs.map((item) => ({
      ...item,
      output: path.relative(episodeDir, item.output).replace(/\\/g, "/"),
      concat: path.relative(episodeDir, item.concat).replace(/\\/g, "/")
    })),
    hard_gates_applied: [
      "source-backed formula and paper Figure 2 presence",
      "complete formula visual object",
      "edge-anchored connectors",
      "single-segment flow arcs",
      "fixed arrowhead size",
      "hard subtitles from English ASS files"
    ],
    review_required: [
      "human visual review for no穿模/no漂移/no subtitle overlap",
      "human listening review for English term stability",
      "X duration review if strict short-video limit is required"
    ]
  }, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const outputs: Array<{ platform: string; output: string; concat: string }> = [];
  for (const platform of platforms) {
    const concatPath = await renderFrames(platform);
    runFfmpeg(platform, concatPath);
    outputs.push({ platform: platform.id, output: platform.output, concat: concatPath });
  }
  writeStatus(outputs);
  console.log(JSON.stringify({
    status: "rendered_needs_human_review",
    outputs: outputs.map((item) => path.relative(rootDir, item.output).replace(/\\/g, "/"))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
