import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

type Scene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  caption: string;
};

const rootDir = path.resolve(".");
const episodeDir = path.join(rootDir, "episodes", "ep02_attention_qkv_en");
const frameDir = path.join(episodeDir, "renders", "static_review_frames");
const concatPath = path.join(episodeDir, "renders", "static_review_concat.txt");
const storyboardPath = path.join(episodeDir, "video_script", "storyboard.json");

const scenes = JSON.parse(fs.readFileSync(storyboardPath, "utf8")) as Scene[];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
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

function textBlock(text: string, x: number, y: number, size: number, widthChars: number, weight = 800, color = "#1C1C1C"): string {
  const lines = wrapText(text, widthChars);
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * 1.18}">${escapeXml(line)}</tspan>`).join("\n")}
  </text>`;
}

function sceneTitle(scene: Scene): string {
  const visualType = scene.visual_type;
  if (visualType.includes("hook")) return "What does QKV compute?";
  if (visualType.includes("adjacency")) return "Attention is a soft matrix";
  if (visualType.includes("cache")) return "KV Cache reuses Key and Value";
  if (visualType.includes("optimization")) return "Same path, different optimizations";
  if (visualType.includes("projection")) return "Q, K, V are learned projections";
  if (visualType.includes("meeting")) return "Feynman analogy";
  if (visualType.includes("pronoun")) return "QK^T gives scores";
  if (visualType.includes("scale")) return "Why divide by √(dₖ)?";
  if (visualType.includes("softmax")) return "softmax turns scores into weights";
  if (visualType.includes("weighted")) return "Read Value with weights";
  if (visualType.includes("complete")) return "Scaled Dot-Product Attention";
  if (visualType.includes("summary")) return "Feynman summary";
  return "Next: Multi-Head Attention";
}

function formulaSvg(x: number, y: number, scale = 1): string {
  const s = (n: number) => Math.round(n * scale);
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${s(850)}" height="${s(170)}" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="${s(34)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(40)}" font-weight="700" fill="#111827">Attention(</text>
    <text x="${s(240)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(48)}" font-weight="800" fill="#4C78FF">Q</text>
    <text x="${s(282)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(40)}" font-weight="700" fill="#111827">,</text>
    <text x="${s(315)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(48)}" font-weight="800" fill="#F58518">K</text>
    <text x="${s(357)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(40)}" font-weight="700" fill="#111827">,</text>
    <text x="${s(390)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(48)}" font-weight="800" fill="#54A24B">V</text>
    <text x="${s(435)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(40)}" font-weight="700" fill="#111827">) = softmax</text>
    <text x="${s(652)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(58)}" font-weight="700" fill="#111827">(</text>
    <text x="${s(696)}" y="${s(67)}" font-family="Georgia, serif" font-size="${s(34)}" font-weight="800" fill="#111827">QK</text>
    <text x="${s(748)}" y="${s(44)}" font-family="Georgia, serif" font-size="${s(23)}" font-weight="800" fill="#111827">T</text>
    <line x1="${s(680)}" y1="${s(82)}" x2="${s(782)}" y2="${s(82)}" stroke="#111827" stroke-width="${s(3)}"/>
    <text x="${s(694)}" y="${s(125)}" font-family="Georgia, serif" font-size="${s(31)}" font-weight="800" fill="#111827">√(dₖ)</text>
    <text x="${s(792)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(58)}" font-weight="700" fill="#111827">)</text>
    <text x="${s(820)}" y="${s(102)}" font-family="Georgia, serif" font-size="${s(48)}" font-weight="800" fill="#54A24B">V</text>
  </g>`;
}

function matrix(x: number, y: number, hot = true): string {
  const cells = [
    ["0.10", "0.18", "0.62", "0.10"],
    ["0.06", "0.22", "0.12", "0.60"],
    ["0.08", "0.11", "0.71", "0.10"],
    ["0.04", "0.14", "0.18", "0.64"]
  ];
  return `<g transform="translate(${x} ${y})">
    ${cells.flatMap((row, r) => row.map((cell, c) => {
      const isHot = hot && r === 2 && c === 2;
      return `<rect x="${c * 185}" y="${r * 88}" width="172" height="72" rx="10" fill="${isHot ? "#FDE68A" : "#EEF2FF"}"/>
      <text x="${c * 185 + 86}" y="${r * 88 + 46}" text-anchor="middle" font-family="Consolas, monospace" font-size="28" font-weight="900" fill="${isHot ? "#7C2D12" : "#1E293B"}">${cell}</text>`;
    })).join("\n")}
  </g>`;
}

function visual(scene: Scene): string {
  const type = scene.visual_type;
  if (type.includes("cache")) {
    return `<g>
      ${card(105, 710, 260, 360, "new Query", "current token", "#EFF6FF", "#4C78FF")}
      ${card(410, 710, 260, 360, "cached Key", "history index", "#FFF7ED", "#F58518")}
      ${card(715, 710, 260, 360, "cached Value", "history content", "#F0FDF4", "#54A24B")}
      ${textBlock("KV Cache reuses historical Key and Value projections.", 145, 1150, 36, 42, 900, "#111827")}
      ${textBlock("It caches projected K and V, not the raw tokens.", 145, 1225, 32, 44, 850, "#475569")}
    </g>`;
  }
  if (type.includes("optimization")) {
    return `<g>
      ${card(95, 700, 285, 430, "FlashAttention", "kernel level", "#EFF6FF", "#4C78FF")}
      ${card(400, 700, 285, 430, "GQA / MQA", "model level", "#FFF7ED", "#F58518")}
      ${card(705, 700, 285, 430, "KV Cache", "runtime level", "#F0FDF4", "#54A24B")}
    </g>`;
  }
  if (type.includes("projection")) {
    return `<g>
      ${card(110, 785, 210, 330, "X", "same token representation", "#FFFFFF", "#111827")}
      ${card(335, 785, 210, 330, "Q = XWQ", "Query space", "#EFF6FF", "#4C78FF")}
      ${card(560, 785, 210, 330, "K = XWK", "Key space", "#FFF7ED", "#F58518")}
      ${card(785, 785, 210, 330, "V = XWV", "Value space", "#F0FDF4", "#54A24B")}
    </g>`;
  }
  if (type.includes("meeting")) {
    return `<g>
      ${card(105, 725, 260, 390, "Query", "the question you ask", "#EFF6FF", "#4C78FF")}
      ${card(410, 725, 260, 390, "Key", "the label you match", "#FFF7ED", "#F58518")}
      ${card(715, 725, 260, 390, "Value", "the content you read", "#F0FDF4", "#54A24B")}
    </g>`;
  }
  if (type.includes("scale") || type.includes("weighted") || type.includes("complete") || type.includes("summary")) {
    return `<g>
      ${formulaSvg(115, 660, 1)}
      <rect x="120" y="895" width="840" height="170" rx="14" fill="#FFFFFF" stroke="#E2E8F0"/>
      <rect x="145" y="920" width="8" height="120" rx="4" fill="#E45756"/>
      ${textBlock("√(dₖ) means the square root of the Query and Key vector dimension.", 175, 955, 34, 38, 900, "#111827")}
      <g transform="translate(120 1115)">
        ${step(0, "1", "score", "QK^T")}
        ${step(215, "2", "scale", "÷ √(dₖ)")}
        ${step(430, "3", "softmax", "row weights")}
        ${step(645, "4", "read", "Value")}
      </g>
    </g>`;
  }
  if (type.includes("softmax")) {
    return `<g>
      ${matrix(100, 700, false)}
      <text x="540" y="860" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="950" fill="#B279A2">→</text>
      ${matrix(620, 700, true)}
      ${textBlock("softmax normalizes each row, so every row becomes attention weights that add up to one.", 125, 1135, 34, 43, 850, "#334155")}
    </g>`;
  }
  if (type.includes("next")) {
    return `<g>
      ${[0, 1, 2, 3].map((i) => card(120 + i * 210, 740, 170, 300, `head ${i + 1}`, "one view", "#EFF6FF", "#4C78FF")).join("\n")}
      ${textBlock("Why does Transformer use many heads at once?", 145, 1140, 44, 32, 950, "#111827")}
    </g>`;
  }
  return `<g>
    <circle cx="540" cy="690" r="82" fill="#0F172A"/>
    <text x="540" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="950" fill="#FFFFFF">token i</text>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = -120 + i * 48;
      const rad = (angle * Math.PI) / 180;
      const x = 540 + Math.cos(rad) * 305;
      const y = 700 + Math.sin(rad) * 240;
      return `<line x1="540" y1="690" x2="${x}" y2="${y}" stroke="${i === 3 ? "#F58518" : "#4C78FF"}" stroke-width="${i === 3 ? 10 : 5}" opacity="0.78"/>
      <circle cx="${x}" cy="${y}" r="55" fill="${i === 3 ? "#FDE68A" : "#EFF6FF"}" stroke="${i === 3 ? "#F58518" : "#4C78FF"}" stroke-width="5"/>
      <text x="${x}" y="${y + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#111827">K${i + 1}</text>`;
    }).join("\n")}
    <text x="540" y="1030" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#111827">soft attention matrix</text>
    ${matrix(175, 1080, true)}
  </g>`;
}

function card(x: number, y: number, width: number, height: number, title: string, subtitle: string, fill: string, color: string): string {
  const titleSize = Math.min(36, Math.max(24, ((width - 48) / Math.max(4, title.length)) * 1.45));
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="${fill}" stroke="${color}" stroke-opacity="0.35" stroke-width="3"/>
    ${textBlock(title, x + 24, y + 88, titleSize, 14, 950, color)}
    ${textBlock(subtitle, x + 24, y + height - 95, 28, 14, 850, "#475569")}
  </g>`;
}

function step(x: number, n: string, title: string, subtitle: string): string {
  return `<g transform="translate(${x} 0)">
    <rect width="190" height="130" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>
    <rect x="16" y="18" width="34" height="34" rx="8" fill="#4C78FF"/>
    <text x="33" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="950" fill="#FFFFFF">${n}</text>
    <text x="62" y="43" font-family="Arial, sans-serif" font-size="24" font-weight="950" fill="#111827">${title}</text>
    <text x="24" y="95" font-family="Arial, sans-serif" font-size="25" font-weight="850" fill="#475569">${subtitle}</text>
  </g>`;
}

function svg(scene: Scene): string {
  const title = sceneTitle(scene);
  const caption = scene.caption.replace(/√\(d_k\)/g, "√(dₖ)");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="#E5E7EB" stroke-width="1" opacity="0.65"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="1080" height="1920" fill="#F7F7F5"/>
    <rect width="1080" height="1920" fill="url(#grid)"/>
    <rect x="70" y="78" width="480" height="56" rx="10" fill="#FFFFFF" stroke="#B279A2" stroke-opacity="0.38" stroke-width="2"/>
    <text x="90" y="116" font-family="Arial, sans-serif" font-size="30" font-weight="950" fill="#B279A2">EP02 · Attention Is All You Need</text>
    ${textBlock(title, 70, 220, 64, 24, 950)}
    <g filter="url(#shadow)">
      <rect x="70" y="340" width="940" height="1150" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      ${visual(scene)}
    </g>
    <g filter="url(#shadow)">
      <rect x="170" y="1505" width="740" height="86" rx="12" fill="#0F172A" opacity="0.91"/>
      ${textBlock(caption, 210, 1558, 40, 28, 950, "#FFFFFF")}
    </g>
    <text x="70" y="1705" font-family="Arial, sans-serif" font-size="26" font-weight="850" fill="#64748B">Source: Attention Is All You Need / Harvard Annotated Transformer</text>
  </svg>`;
}

async function main(): Promise<void> {
  fs.mkdirSync(frameDir, { recursive: true });
  const concatLines: string[] = [];
  for (const [index, scene] of scenes.entries()) {
    const framePath = path.join(frameDir, `${scene.scene_id}.png`);
    await sharp(Buffer.from(svg(scene))).png().toFile(framePath);
    const nextScene = scenes[index + 1];
    const displayDuration = nextScene
      ? Math.max(scene.duration, nextScene.start - scene.start)
      : scene.duration;
    concatLines.push(`file '${framePath.replace(/\\/g, "/")}'`);
    concatLines.push(`duration ${displayDuration.toFixed(3)}`);
  }
  const lastFrame = path.join(frameDir, `${scenes[scenes.length - 1].scene_id}.png`).replace(/\\/g, "/");
  concatLines.push(`file '${lastFrame}'`);
  fs.writeFileSync(concatPath, `${concatLines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({
    status: "static_review_frames_ready",
    frames: scenes.length,
    frame_dir: path.relative(rootDir, frameDir).replace(/\\/g, "/"),
    concat_path: path.relative(rootDir, concatPath).replace(/\\/g, "/")
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
