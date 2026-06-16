import fs from "node:fs";
import path from "node:path";

type SvgChunk = string;

const rootDir = path.resolve(".");
const episodeDir = path.join(rootDir, "episodes", "ep03_multi_head_attention");
const visualsDir = path.join(episodeDir, "visuals");
const reviewDir = path.join(episodeDir, "qa", "animation_review_stills");
const sourceDir = path.join(episodeDir, "video_script", "source_assets");

const colors = {
  paper: "#F7F7F5",
  ink: "#111827",
  muted: "#64748B",
  grid: "#E5E7EB",
  q: "#4C78FF",
  k: "#F58518",
  v: "#54A24B",
  concat: "#B279A2",
  wo: "#E45756",
  soft: "#F8FAFC",
  line: "#CBD5E1"
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text(
  x: number,
  y: number,
  value: string,
  size = 32,
  weight = 800,
  fill = colors.ink,
  anchor: "start" | "middle" = "start"
): SvgChunk {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Microsoft YaHei, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(value)}</text>`;
}

function wrapText(value: string, maxChars: number): string[] {
  const normalized = value.trim();
  if (!normalized) {
    return [];
  }

  const visualUnits = (token: string): number => {
    return Array.from(token).reduce((sum, char) => {
      if (/[\u3400-\u9FFF]/.test(char)) return sum + 1;
      if (/[A-Z]/.test(char)) return sum + 0.72;
      if (/[a-z0-9_+\-^/()=.]/.test(char)) return sum + 0.58;
      if (/\s/.test(char)) return sum + 0.35;
      return sum + 0.7;
    }, 0);
  };

  const hasWideText = /[\u3400-\u9FFF]/.test(normalized);
  if (hasWideText) {
    const tokens = normalized.match(/[A-Za-z0-9_+\-^/()=.]+|\s+|[\u3400-\u9FFF]|[^\sA-Za-z0-9_\u3400-\u9FFF]/g) ?? [normalized];
    const lines: string[] = [];
    let line = "";
    let units = 0;
    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        if (line && !line.endsWith(" ")) {
          line += " ";
          units += visualUnits(" ");
        }
        continue;
      }

      const next = `${line}${token}`;
      const tokenUnits = visualUnits(token);
      if (units + tokenUnits > maxChars && line.trim()) {
        lines.push(line.trim());
        line = token;
        units = tokenUnits;
      } else {
        line = next;
        units += tokenUnits;
      }
    }
    if (line.trim()) {
      lines.push(line.trim());
    }
    return lines;
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (visualUnits(next) > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

function multiline(x: number, y: number, value: string, size = 28, maxChars = 22, weight = 800, fill = colors.ink): SvgChunk {
  const lines = wrapText(value, maxChars);

  return `<text x="${x}" y="${y}" font-family="Microsoft YaHei, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">
    ${lines.map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : Math.round(size * 1.35)}">${escapeXml(item)}</tspan>`).join("\n")}
  </text>`;
}

function marker(id: string, color: string): SvgChunk {
  return `<marker id="${id}" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M0 0L12 6L0 12Z" fill="${color}"/>
  </marker>`;
}

function shell(title: string, subtitle: string, body: SvgChunk): string {
  const pillW = 470;
  const pillX = (1080 - pillW) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="${colors.grid}" stroke-width="1" opacity="0.52"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.11"/>
      </filter>
      ${marker("arrow-q", colors.q)}
      ${marker("arrow-k", colors.k)}
      ${marker("arrow-v", colors.v)}
      ${marker("arrow-muted", "#94A3B8")}
      ${marker("arrow-wo", colors.wo)}
    </defs>
    <rect width="1080" height="1920" fill="${colors.paper}"/>
    <rect width="1080" height="1920" fill="url(#grid)" opacity="0.76"/>
    <rect x="0" y="0" width="18" height="1920" fill="#F4ECF7"/>
    <rect x="18" y="0" width="4" height="1920" fill="#E2E8F0"/>
    <rect x="42" y="48" width="996" height="1812" rx="34" fill="#FFFFFF" opacity="0.20" stroke="#E2E8F0"/>
    <g opacity="0.18">
      <circle cx="1000" cy="210" r="36" fill="#F4ECF7"/>
      <circle cx="70" cy="1680" r="28" fill="#EFF6FF"/>
      <path d="M78 1760H1002" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="10 14"/>
    </g>
    <rect x="${pillX}" y="66" width="${pillW}" height="70" rx="16" fill="#F4ECF7" stroke="${colors.concat}" stroke-opacity="0.5"/>
    ${text(540, 112, "第3集 · 为什么一个 Head 不够", 31, 950, colors.ink, "middle")}
    ${multiline(64, 222, title, 58, 15, 950, colors.ink)}
    ${multiline(70, 360, subtitle, 28, 28, 850, "#475569")}
    ${body}
  </svg>`;
}

function roundedCard(x: number, y: number, w: number, h: number, fill = "#FFFFFF", stroke = "#E2E8F0"): SvgChunk {
  return `<g>
    <rect x="${x + 12}" y="${y + 14}" width="${w}" height="${h}" rx="24" fill="#E2E8F0" opacity="0.45"/>
    <rect x="${x + 6}" y="${y + 7}" width="${w}" height="${h}" rx="24" fill="#F8FAFC" opacity="0.70" stroke="#E2E8F0"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${fill}" stroke="${stroke}" filter="url(#shadow)"/>
    <path d="M${x + 28} ${y + 22}H${x + w - 28}" stroke="#F4ECF7" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
  </g>`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = "#94A3B8", markerId = "arrow-muted"): SvgChunk {
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#${markerId})"/>`;
}

function arc(x1: number, y1: number, x2: number, y2: number, bend: number, color: string, markerId: string): SvgChunk {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + bend;
  return `<path d="M${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" stroke="${color}" stroke-width="5" stroke-linecap="round" fill="none" marker-end="url(#${markerId})"/>`;
}

function pill(x: number, y: number, w: number, value: string, fill: string, stroke: string, color = colors.ink): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${text(x + w / 2, y + 41, value, 27, 900, color, "middle")}
  </g>`;
}

function mathPill(x: number, y: number, w: number, fill: string, stroke: string, color: string, parts: SvgChunk): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <text x="${x + w / 2}" y="${y + 41}" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="900" fill="${color}">${parts}</text>
  </g>`;
}

function miniMatrix(x: number, y: number, rows: string[][], active: [number, number] | null, cellW = 58, cellH = 42): SvgChunk {
  return `<g>
    ${rows.flatMap((row, r) => row.map((cell, c) => {
      const hot = active ? active[0] === r && active[1] === c : false;
      return `<g>
        <rect x="${x + c * (cellW + 8)}" y="${y + r * (cellH + 8)}" width="${cellW}" height="${cellH}" rx="8" fill="${hot ? "#FDE68A" : "#F8FAFC"}" stroke="${hot ? colors.k : "#CBD5E1"}"/>
        ${text(x + c * (cellW + 8) + cellW / 2, y + r * (cellH + 8) + cellH * 0.65, cell, 18, 850, hot ? "#7C2D12" : "#1F2937", "middle")}
      </g>`;
    })).join("\n")}
  </g>`;
}

function miniBlocks(x: number, y: number, count: number, color: string, label: string): SvgChunk {
  const blocks = Array.from({ length: count }, (_, index) => {
    return `<rect x="${x + index * 32}" y="${y}" width="24" height="24" rx="5" fill="${color}" opacity="${index % 2 === 0 ? 0.34 : 0.18}" stroke="${color}" stroke-opacity="0.55"/>`;
  }).join("\n");

  return `<g>
    ${blocks}
    ${text(x + Math.min(count * 16, 160), y + 55, label, 18, 850, "#475569", "middle")}
  </g>`;
}

function sourceLabel(x: number, y: number, value = "Source: Harvard Annotated Transformer", width = 420): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="50" rx="14" fill="#FFFFFF" stroke="#CBD5E1"/>
    ${text(x + width / 2, y + 33, value, 21, 850, colors.muted, "middle")}
  </g>`;
}

function sourceLabelRight(y: number, value = "Source: Harvard Annotated Transformer", width = 420): SvgChunk {
  return sourceLabel(984 - width, y, value, width);
}

function stepCard(x: number, y: number, n: string, title: string, desc: string, color: string): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="198" height="118" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="${x + 16}" y="${y + 16}" width="34" height="34" rx="9" fill="${color}"/>
    ${text(x + 33, y + 41, n, 20, 950, "#FFFFFF", "middle")}
    ${text(x + 64, y + 42, title, 25, 950, colors.ink)}
    ${multiline(x + 18, y + 82, desc, 19, 14, 850, "#475569")}
  </g>`;
}

function codeBlock(x: number, y: number, w: number): SvgChunk {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="126" rx="14" fill="#0F172A"/>
    ${text(x + 28, y + 42, "x = x.view(batch, -1, h, d_k).transpose(1, 2)", 21, 850, "#E5E7EB")}
    ${text(x + 28, y + 78, "x, attn = attention(query, key, value, mask)", 21, 850, "#E5E7EB")}
    ${text(x + 28, y + 114, "return self.linears[-1](concat(x))", 21, 850, "#E5E7EB")}
  </g>`;
}

function formulaHeadSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="190" viewBox="0 0 920 190">
    <rect x="4" y="4" width="912" height="182" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="44" y="112" font-family="Georgia, serif" font-size="31" font-weight="700" fill="${colors.ink}">
      <tspan>head</tspan><tspan baseline-shift="sub" font-size="23">i</tspan><tspan> = Attention(</tspan>
      <tspan fill="${colors.q}">QW</tspan><tspan baseline-shift="sub" font-size="19" fill="${colors.q}">i</tspan><tspan baseline-shift="super" font-size="19" fill="${colors.q}">Q</tspan><tspan>, </tspan>
      <tspan fill="${colors.k}">KW</tspan><tspan baseline-shift="sub" font-size="19" fill="${colors.k}">i</tspan><tspan baseline-shift="super" font-size="19" fill="${colors.k}">K</tspan><tspan>, </tspan>
      <tspan fill="${colors.v}">VW</tspan><tspan baseline-shift="sub" font-size="19" fill="${colors.v}">i</tspan><tspan baseline-shift="super" font-size="19" fill="${colors.v}">V</tspan><tspan>)</tspan>
    </text>
  </svg>`;
}

function formulaConcatSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="220" viewBox="0 0 940 220">
    <rect x="4" y="4" width="932" height="212" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="470" y="78" text-anchor="middle" font-family="Georgia, serif" font-size="31" font-weight="700" fill="${colors.ink}">
      <tspan>MultiHead(Q,K,V) =</tspan>
    </text>
    <text x="470" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="29" font-weight="700" fill="${colors.ink}">
      <tspan fill="${colors.concat}">Concat(</tspan><tspan>head</tspan><tspan baseline-shift="sub" font-size="19">1</tspan><tspan>, ..., head</tspan><tspan baseline-shift="sub" font-size="19">h</tspan><tspan fill="${colors.concat}">)</tspan>
      <tspan fill="${colors.wo}"> W</tspan><tspan baseline-shift="super" font-size="19" fill="${colors.wo}">O</tspan>
    </text>
  </svg>`;
}

function dimensionSvg(): string {
  const slices = Array.from({ length: 8 }, (_, index) => {
    const x = 76 + index * 94;
    return `<g>
      <rect x="${x}" y="82" width="76" height="76" rx="14" fill="${index % 2 === 0 ? "#EFF6FF" : "#FFF7ED"}" stroke="${index % 2 === 0 ? colors.q : colors.k}" stroke-opacity="0.45"/>
      ${text(x + 38, 132, `h${index + 1}`, 22, 900, index % 2 === 0 ? colors.q : colors.k, "middle")}
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="240" viewBox="0 0 920 240">
    <rect x="4" y="4" width="912" height="232" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(460, 36, "Original dimension rule", 20, 850, colors.muted, "middle")}
    <text x="460" y="76" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-weight="700" fill="${colors.ink}">
      <tspan>d</tspan><tspan baseline-shift="sub" font-size="22">k</tspan><tspan> = d</tspan><tspan baseline-shift="sub" font-size="22">v</tspan><tspan> = d</tspan><tspan baseline-shift="sub" font-size="22">model</tspan><tspan> / h</tspan>
    </text>
    <g transform="translate(0 16)">${slices}</g>
    ${text(460, 205, "把同一个模型维度拆给 h 个 head，不是无脑堆计算", 26, 850, "#475569", "middle")}
  </svg>`;
}

function imageDataHref(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:image/png;base64,${data}`;
}

function formulaImage(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function frame01Hook(): string {
  const heads = [
    { x: 174, label: "head 1", c: colors.q },
    { x: 430, label: "head 2", c: colors.k },
    { x: 686, label: "head h", c: colors.v }
  ];
  const laneTop = 1170;
  const lanes = heads.map((head) => `
    <rect x="${head.x}" y="${laneTop}" width="210" height="270" rx="24" fill="#FFFFFF" stroke="${head.c}" stroke-opacity="0.5" filter="url(#shadow)"/>
    ${text(head.x + 105, laneTop + 60, head.label, 28, 900, head.c, "middle")}
    <rect x="${head.x + 42}" y="${laneTop + 110}" width="126" height="126" rx="18" fill="${head.c}" opacity="0.12"/>
    <path d="M${head.x + 62} ${laneTop + 210} C ${head.x + 95} ${laneTop + 154}, ${head.x + 126} ${laneTop + 154}, ${head.x + 158} ${laneTop + 210}" stroke="${head.c}" stroke-width="6" fill="none"/>
  `).join("\n");

  return shell(
    "一个 Head 为什么不够？",
    "上一集讲完 Q、K、V。这一集只回答一个问题：为什么 Transformer 要开多个注意力头？",
    `${roundedCard(58, 455, 964, 1155)}
    <rect x="96" y="500" width="888" height="142" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(540, 556, "上一集的闭环", 33, 950, colors.ink, "middle")}
    ${text(540, 612, "匹配 → 分权 → 读取 V", 33, 950, colors.q, "middle")}
    <rect x="96" y="715" width="420" height="360" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(306, 774, "单个 Head", 32, 950, colors.ink, "middle")}
    ${miniMatrix(164, 824, [["0.20", "0.30", "0.50"], ["0.10", "0.70", "0.20"], ["0.35", "0.20", "0.45"]], [1, 1], 72, 46)}
    <rect x="136" y="1010" width="340" height="44" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
    ${text(306, 1039, "只有一张注意力权重图", 23, 850, "#475569", "middle")}
    <rect x="564" y="715" width="420" height="360" rx="22" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${text(774, 774, "多个 Head", 32, 950, colors.ink, "middle")}
    ${miniMatrix(618, 824, [["0.64", "0.18", "0.09"], ["0.12", "0.51", "0.21"]], [0, 0], 62, 40)}
    ${miniMatrix(618, 936, [["0.22", "0.61", "0.17"], ["0.08", "0.23", "0.69"]], [1, 2], 62, 40)}
    <rect x="604" y="1010" width="340" height="44" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
    ${text(774, 1039, "多张关系图并行建模", 23, 850, "#475569", "middle")}
    ${line(540, 642, 540, 704, colors.concat, "arrow-muted")}
    ${lanes}
    <rect x="116" y="1482" width="848" height="122" rx="18" fill="#FFF7ED" stroke="${colors.k}" stroke-opacity="0.35"/>
    ${text(540, 1514, "Conclusion", 20, 950, "#9A3412", "middle")}
    ${text(540, 1544, "Multi-Head Attention（多头注意力）", 22, 950, "#7C2D12", "middle")}
    ${text(540, 1574, "不是 fixed experts（固定专家），而是 learned projection subspaces", 21, 900, "#7C2D12", "middle")}
    ${text(540, 1600, "（学习到的投影子空间）。", 21, 900, "#7C2D12", "middle")}
    ${sourceLabelRight(1646, "Source: Harvard Annotated Transformer")}`
  );
}

function frame02Projection(): string {
  const lane = (y: number, label: string, index: number): SvgChunk => {
    const centerY = y + 89;
    const pillY = y + 58;
    return `<g>
      <rect x="106" y="${y}" width="868" height="178" rx="24" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#shadow)"/>
      <rect x="132" y="${pillY}" width="142" height="62" rx="18" fill="#FFFFFF" stroke="#CBD5E1"/>
      ${text(203, pillY + 41, label, 27, 900, colors.ink, "middle")}
      ${pill(320, pillY, 126, "W Q", "#EFF6FF", colors.q, colors.q)}
      ${pill(500, pillY, 126, "W K", "#FFF7ED", colors.k, colors.k)}
      ${pill(680, pillY, 126, "W V", "#F0FDF4", colors.v, colors.v)}
      <rect x="838" y="${pillY}" width="112" height="62" rx="18" fill="#F8FAFC" stroke="#E2E8F0"/>
      ${text(894, pillY + 41, `子空间 ${index}`, 21, 850, "#475569", "middle")}
      ${line(274, centerY, 308, centerY, colors.q, "arrow-q")}
      ${line(446, centerY, 488, centerY, colors.k, "arrow-k")}
      ${line(626, centerY, 668, centerY, colors.v, "arrow-v")}
      ${line(806, centerY, 826, centerY, colors.v, "arrow-v")}
    </g>`;
  };

  return shell(
    "同一输入，拆进多个投影空间",
    "同一份 token 表示，会进入不同的 Query、Key、Value 投影空间。",
    `${roundedCard(120, 500, 840, 160)}
    ${text(540, 596, "输入 X：同一份 token 表示", 40, 950, colors.ink, "middle")}
    ${line(540, 660, 540, 736, "#94A3B8", "arrow-muted")}
    ${lane(755, "head_1", 1)}
    ${lane(980, "head_2", 2)}
    ${lane(1205, "head_h", 3)}
    <rect x="120" y="1450" width="840" height="220" rx="24" fill="#F8FAFC" stroke="#E2E8F0"/>
    ${text(154, 1504, "三个投影矩阵的中文读法", 28, 950, colors.ink)}
    ${multiline(154, 1556, "W Q：Query Projection Matrix｜Q 投影矩阵", 24, 31, 900, colors.q)}
    ${multiline(154, 1602, "W K：Key Projection Matrix｜K 投影矩阵", 24, 31, 900, colors.k)}
    ${multiline(154, 1648, "W V：Value Projection Matrix｜V 投影矩阵", 24, 31, 900, colors.v)}
    ${sourceLabelRight(1714, "Source: Harvard Annotated Transformer")}`
  );
}

function frame03HeadFormula(): string {
  return shell(
    "head_i：每个 Head 的计算单元",
    "每个 head 先拥有自己的投影矩阵，再进入 Attention 计算。",
    `${roundedCard(70, 500, 940, 1125)}
    <image x="80" y="548" width="920" height="190" href="${formulaImage(formulaHeadSvg())}"/>
    <rect x="380" y="792" width="320" height="74" rx="20" fill="#FFFFFF" stroke="#CBD5E1"/>
    ${text(540, 840, "输入 X：同一份表示", 29, 950, colors.ink, "middle")}
    ${line(448, 866, 305, 930, colors.q, "arrow-q")}
    ${line(540, 866, 540, 930, colors.k, "arrow-k")}
    ${line(632, 866, 775, 930, colors.v, "arrow-v")}
    ${pill(142, 930, 238, "Q 投影", "#EFF6FF", colors.q, colors.q)}
    ${pill(420, 930, 238, "K 投影", "#FFF7ED", colors.k, colors.k)}
    ${pill(698, 930, 238, "V 投影", "#F0FDF4", colors.v, colors.v)}
    ${line(260, 992, 420, 1088, colors.q, "arrow-q")}
    ${line(540, 992, 540, 1088, colors.k, "arrow-k")}
    ${line(818, 992, 660, 1088, colors.v, "arrow-v")}
    <rect x="360" y="1088" width="360" height="84" rx="22" fill="#F5F3FF" stroke="${colors.concat}" stroke-width="3"/>
    ${text(540, 1142, "Attention", 34, 950, colors.concat, "middle")}
    ${line(540, 1172, 540, 1245, colors.concat, "arrow-muted")}
    <rect x="384" y="1245" width="312" height="82" rx="22" fill="#F0FDF4" stroke="${colors.v}" stroke-width="3"/>
    <text x="540" y="1298" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="900" fill="${colors.v}">head<tspan baseline-shift="sub" font-size="21">i</tspan></text>
    <rect x="142" y="1344" width="794" height="104" rx="22" fill="${colors.soft}" stroke="#E2E8F0"/>
    ${text(192, 1390, "中文解释", 25, 950, colors.ink)}
    ${text(192, 1428, "同一输入 X，在不同投影空间里重新表示。", 24, 850, "#475569")}
    ${stepCard(142, 1480, "1", "输入 X", "同一份表示", colors.ink)}
    ${stepCard(352, 1480, "2", "线性投影", "WQ/WK/WV", colors.q)}
    ${stepCard(562, 1480, "3", "Attention", "每个 head 独立计算", colors.concat)}
    ${stepCard(772, 1480, "4", "head_i", "得到子空间输出", colors.v)}
    ${sourceLabelRight(1672, "Source: Harvard Annotated Transformer")}`
  );
}

function frame04ParallelHeads(): string {
  const lanes = [0, 1, 2, 3].map((index) => {
    const y = 510 + index * 190;
    const fill = ["#EFF6FF", "#FFF7ED", "#F0FDF4", "#F5F3FF"][index];
    const stroke = [colors.q, colors.k, colors.v, colors.concat][index];
    return `<g>
      <rect x="92" y="${y}" width="896" height="146" rx="24" fill="${fill}" stroke="${stroke}" stroke-opacity="0.42"/>
      <rect x="130" y="${y + 38}" width="150" height="70" rx="18" fill="#FFFFFF" stroke="${stroke}" stroke-opacity="0.30"/>
      ${text(205, y + 83, `head ${index + 1}`, 28, 950, stroke, "middle")}
      <rect x="365" y="${y + 36}" width="162" height="74" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      ${text(446, y + 84, "Attention", 26, 900, colors.ink, "middle")}
      ${line(280, y + 73, 350, y + 73, stroke, index === 0 ? "arrow-q" : index === 1 ? "arrow-k" : index === 2 ? "arrow-v" : "arrow-muted")}
      ${line(530, y + 73, 698, y + 73, stroke, index === 0 ? "arrow-q" : index === 1 ? "arrow-k" : index === 2 ? "arrow-v" : "arrow-muted")}
      <rect x="720" y="${y + 24}" width="210" height="98" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      ${miniMatrix(742, y + 42, [["0.6", "0.2"], ["0.1", "0.7"]], [index % 2, (index + 1) % 2], 52, 32)}
    </g>`;
  }).join("\n");

  return shell(
    "多个 Head 并行，不是手写专家",
    "每个 head 生成自己的注意力模式，但这些模式来自训练，不是程序员手动分工。",
    `${lanes}
    <rect x="110" y="1320" width="860" height="206" rx="24" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#shadow)"/>
    ${text(150, 1371, "Boundary", 25, 950, colors.ink)}
    ${text(150, 1415, "Head patterns（注意力模式）来自 training（训练）涌现，", 22, 900, colors.ink)}
    ${text(150, 1453, "不是手写的 syntax head（语法头）", 22, 900, colors.ink)}
    ${text(150, 1489, "或 reference head（指代头）。", 22, 900, colors.ink)}
    ${sourceLabelRight(1585, "Source: Harvard Annotated Transformer")}`
  );
}

function frame05ConcatWo(): string {
  const headBoxes = [0, 1, 2, 3].map((index) => {
    const y = 620 + index * 122;
    return `<g>
      <rect x="112" y="${y}" width="210" height="80" rx="18" fill="#FFFFFF" stroke="${[colors.q, colors.k, colors.v, colors.concat][index]}" stroke-opacity="0.55"/>
      ${text(217, y + 52, `head_${index + 1}`, 26, 900, colors.ink, "middle")}
      ${line(322, y + 40, 438, 900, "#94A3B8", "arrow-muted")}
    </g>`;
  }).join("\n");

  return shell(
    "Concat 之后，输出投影重新融合",
    "拼接不是终点；输出投影矩阵把多个子空间重新混回模型表示。",
    `${roundedCard(70, 520, 940, 1050)}
    ${headBoxes}
    <rect x="450" y="840" width="210" height="120" rx="24" fill="#F5F3FF" stroke="${colors.concat}" stroke-width="4"/>
    ${text(555, 912, "Concat", 36, 950, colors.concat, "middle")}
    ${line(660, 900, 760, 900, colors.wo, "arrow-wo")}
    <rect x="770" y="840" width="170" height="120" rx="24" fill="#FEF2F2" stroke="${colors.wo}" stroke-width="4"/>
    <text x="855" y="912" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="900" fill="${colors.wo}">W<tspan baseline-shift="super" font-size="24">O</tspan></text>
    <image x="90" y="1124" width="900" height="211" href="${formulaImage(formulaConcatSvg())}"/>
    <rect x="132" y="1400" width="816" height="88" rx="20" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="540" y="1456" text-anchor="middle" font-family="Microsoft YaHei, Arial, sans-serif" font-size="30" font-weight="900" fill="${colors.wo}">W<tspan baseline-shift="super" font-size="18">O</tspan>：Output Projection Matrix｜输出投影矩阵</text>
    ${sourceLabelRight(1525, "Source: Harvard Annotated Transformer")}`
  );
}

function frame06DimensionSplit(): string {
  return shell(
    "头变多，计算不是无脑暴涨",
    "原论文基础配置里 h 等于 8；每个 head 的向量维度按模型宽度拆分。",
    `${roundedCard(90, 520, 900, 960)}
    <image x="90" y="620" width="900" height="235" href="${formulaImage(dimensionSvg())}"/>
    <rect x="145" y="930" width="790" height="235" rx="24" fill="#F8FAFC" stroke="#E2E8F0"/>
    ${text(540, 988, "论文 base 配置里的数字例子", 31, 950, colors.ink, "middle")}
    ${mathPill(178, 1038, 208, "#FFFFFF", colors.q, colors.q, `d<tspan baseline-shift="sub" font-size="17">model</tspan> = 512`)}
    ${pill(450, 1038, 120, "h=8", "#FFFFFF", colors.k, colors.k)}
    ${mathPill(654, 1038, 190, "#FFFFFF", colors.v, colors.v, `d<tspan baseline-shift="sub" font-size="17">k</tspan> = 64`)}
    ${line(390, 1068, 438, 1068, "#94A3B8", "arrow-muted")}
    ${line(572, 1068, 642, 1068, "#94A3B8", "arrow-muted")}
    ${text(540, 1130, "512 ÷ 8 = 64，每个 head 只处理一部分维度", 26, 900, "#475569", "middle")}
    <rect x="145" y="1238" width="790" height="174" rx="24" fill="#FFF7ED" stroke="${colors.k}" stroke-opacity="0.3"/>
    ${text(180, 1290, "Conclusion", 25, 950, "#7C2D12")}
    ${text(180, 1334, "heads（注意力头）不是把 compute（计算）简单乘以 8，", 23, 900, "#7C2D12")}
    ${text(180, 1372, "而是在相近成本下换来", 23, 900, "#7C2D12")}
    ${text(180, 1406, "representation decomposition（表示分解）。", 23, 900, "#7C2D12")}
    ${sourceLabelRight(1500, "Source: Attention Is All You Need")}`
  );
}

function frame07FigureSpotlight(): string {
  const multiHead = imageDataHref(path.join(sourceDir, "harvard_figure_multi_head_attention.png"));
  const architecture = imageDataHref(path.join(sourceDir, "harvard_figure_transformer_architecture.png"));

  return shell(
    "原论文 Figure 2：Multi-Head Attention",
    "先看论文结构，再看手机可读的 Soft Lab 重绘。",
    `${roundedCard(70, 470, 940, 1135)}
    <rect x="104" y="510" width="872" height="604" rx="24" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${multiHead ? `<image x="128" y="550" width="360" height="500" href="${multiHead}" preserveAspectRatio="xMidYMid meet"/>` : text(300, 820, "Missing paper figure crop", 28, 900, colors.wo, "middle")}
    ${architecture ? `<image x="566" y="550" width="320" height="500" href="${architecture}" preserveAspectRatio="xMidYMid meet"/>` : ""}
    ${text(300, 1082, "Figure 2: Multi-Head Attention crop", 21, 850, colors.muted, "middle")}
    ${text(726, 1082, "Transformer architecture context", 21, 850, colors.muted, "middle")}
    <rect x="122" y="1170" width="836" height="250" rx="24" fill="#F8FAFC" stroke="${colors.concat}" stroke-opacity="0.35"/>
    ${text(540, 1225, "Soft Lab redraw：放大关键路径", 29, 950, colors.ink, "middle")}
    ${pill(165, 1270, 130, "Linear", "#FFFFFF", "#CBD5E1", colors.ink)}
    ${line(302, 1301, 365, 1301, colors.q, "arrow-q")}
    ${pill(375, 1270, 180, "Attention", "#EFF6FF", colors.q, colors.q)}
    ${line(562, 1301, 625, 1301, colors.concat, "arrow-muted")}
    ${pill(635, 1270, 145, "Concat", "#F5F3FF", colors.concat, colors.concat)}
    ${line(787, 1301, 828, 1301, colors.wo, "arrow-wo")}
    ${mathPill(836, 1270, 90, "#FEF2F2", colors.wo, colors.wo, `W<tspan baseline-shift="super" font-size="17">O</tspan>`)}
    <text x="150" y="1378" font-family="Microsoft YaHei, Arial, sans-serif" font-size="22" font-weight="850" fill="${colors.ink}">原论文路径：Linear → Attention → Concat → W<tspan baseline-shift="super" font-size="14">O</tspan></text>
    ${text(150, 1414, "手机重绘：保留结构路径，放大关键步骤。", 22, 850, colors.ink)}
    ${sourceLabelRight(1534, "Source: Harvard Annotated Transformer")}`
  );
}

function frame08Engineering(): string {
  const cards = [
    ["MHA", "Multi-Head Attention", "多头注意力", colors.q],
    ["MQA", "Multi-Query Attention", "共享 K/V 降成本", colors.k],
    ["GQA", "Grouped-Query Attention", "分组共享 K/V", colors.v],
    ["MoE", "Mixture of Experts", "另一层稀疏路由", colors.concat]
  ];

  const diagrams = (x: number, y: number, color: string, index: number): SvgChunk => {
    if (index === 0) {
      return `${miniBlocks(x, y, 4, color, "many heads")}
      ${line(x + 156, y + 12, x + 218, y + 12, color, "arrow-muted")}
      ${miniBlocks(x + 230, y, 4, color, "parallel attention")}`;
    }
    if (index === 1) {
      return `${miniBlocks(x, y, 5, colors.q, "many Q")}
      ${line(x + 164, y + 12, x + 226, y + 12, color, "arrow-muted")}
      ${miniBlocks(x + 238, y, 2, color, "shared K/V")}`;
    }
    if (index === 2) {
      return `${miniBlocks(x, y, 3, colors.q, "group 1")}
      ${miniBlocks(x + 162, y, 3, color, "group 2")}`;
    }
    return `${miniBlocks(x, y, 1, colors.q, "token")}
      ${line(x + 46, y + 12, x + 106, y + 12, color, "arrow-muted")}
      ${miniBlocks(x + 118, y, 4, color, "experts")}`;
  };

  const svg = cards.map(([id, full, zh, color], index) => {
    const x = 90 + (index % 2) * 460;
    const y = 610 + Math.floor(index / 2) * 320;
    return `<g>
      <rect x="${x}" y="${y}" width="400" height="286" rx="24" fill="#FFFFFF" stroke="${color}" stroke-opacity="0.48" filter="url(#shadow)"/>
      ${text(x + 38, y + 70, id, 45, 950, color)}
      ${multiline(x + 38, y + 128, full, 27, 21, 900, colors.ink)}
      ${multiline(x + 38, y + 198, zh, 28, 16, 850, "#475569")}
      ${diagrams(x + 42, y + 225, color, index)}
    </g>`;
  }).join("\n");

  return shell(
    "2026 工程延伸：先分清层级",
    "MHA 是注意力结构；MQA/GQA 改 K/V 成本；MoE 是另一层路由，不要混成一条线。",
    `${svg}
    <rect x="100" y="1328" width="880" height="198" rx="24" fill="#F8FAFC" stroke="#E2E8F0"/>
    ${text(140, 1390, "Conclusion", 26, 950, colors.ink)}
    ${text(140, 1434, "Multi-Head Attention（多头注意力）仍是 cost center（成本中心）。", 24, 900, colors.ink)}
    ${text(140, 1474, "MQA、GQA、MoE 属于不同 optimization layer（优化层）。", 24, 900, colors.ink)}
    ${sourceLabelRight(1594, "Source: Harvard Annotated Transformer")}`
  );
}

const frameSpecs = [
  ["kf_01_hook.png", frame01Hook],
  ["kf_02_projection.png", frame02Projection],
  ["kf_03_head_formula.png", frame03HeadFormula],
  ["kf_04_parallel_heads.png", frame04ParallelHeads],
  ["kf_05_concat_wo.png", frame05ConcatWo],
  ["kf_06_dimension_split.png", frame06DimensionSplit],
  ["kf_07_figure2.png", frame07FigureSpotlight],
  ["kf_08_engineering.png", frame08Engineering]
] as const;

async function renderPng(svg: string, outputPath: string): Promise<{ file: string; renderer: string }> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const svgPath = outputPath.replace(/\.png$/i, ".svg");
  fs.writeFileSync(svgPath, svg, "utf8");

  try {
    const importer = Function("return import('sharp')");
    const sharpModule = await importer();
    const sharp = sharpModule.default ?? sharpModule;
    await sharp(Buffer.from(svg)).png().toFile(outputPath);

    return { file: path.relative(episodeDir, outputPath).replace(/\\/g, "/"), renderer: "sharp_png" };
  } catch {
    return { file: path.relative(episodeDir, svgPath).replace(/\\/g, "/"), renderer: "svg_fallback" };
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(visualsDir, { recursive: true });
  fs.mkdirSync(reviewDir, { recursive: true });

  const formulaHeadPath = path.join(visualsDir, "ep03_formula_multi_head.svg");
  const formulaConcatPath = path.join(visualsDir, "ep03_formula_concat_wo.svg");
  const dimensionPath = path.join(visualsDir, "ep03_dimension_split.svg");
  fs.writeFileSync(formulaHeadPath, formulaHeadSvg(), "utf8");
  fs.writeFileSync(formulaConcatPath, formulaConcatSvg(), "utf8");
  fs.writeFileSync(dimensionPath, dimensionSvg(), "utf8");

  const frames = [];
  for (const [filename, createFrame] of frameSpecs) {
    frames.push(await renderPng(createFrame(), path.join(reviewDir, filename)));
  }

  const manifest = {
    status: "review_assets_ready",
    generated_at: "1970-01-01T00:00:00.000Z",
    style: "Soft Lab Chinese Xiaohongshu style, no dark background",
    source_url: "https://nlp.seas.harvard.edu/annotated-transformer/",
    assets: [
      {
        asset_id: "ep03_formula_multi_head_svg",
        path: "visuals/ep03_formula_multi_head.svg",
        source_type: "svg_formula",
        scenes: ["S03", "S04"],
        required_review: "formula must be complete, centered, and readable"
      },
      {
        asset_id: "ep03_formula_concat_wo_svg",
        path: "visuals/ep03_formula_concat_wo.svg",
        source_type: "svg_formula",
        scenes: ["S05", "S08"],
        required_review: "Concat and W^O must be visible as one formula"
      },
      {
        asset_id: "ep03_dimension_split_svg",
        path: "visuals/ep03_dimension_split.svg",
        source_type: "svg_formula_diagram",
        scenes: ["S06"],
        required_review: "d_k=d_v=d_model/h must be legible"
      },
      {
        asset_id: "ep03_paper_figure2_crop",
        path: "video_script/source_assets/harvard_figure_multi_head_attention.png",
        source_type: "paper_crop",
        source_url: "https://nlp.seas.harvard.edu/annotated-transformer/",
        scenes: ["S07"],
        required_review: "source label and phone-readable redraw must both appear"
      },
      {
        asset_id: "ep03_harvard_architecture_crop",
        path: "video_script/source_assets/harvard_figure_transformer_architecture.png",
        source_type: "paper_crop",
        source_url: "https://nlp.seas.harvard.edu/annotated-transformer/",
        scenes: ["S07"],
        required_review: "use only as source-backed context, not decoration"
      },
      {
        asset_id: "ep03_mha_mqa_gqa_moe_cards_svg",
        path: "qa/animation_review_stills/kf_08_engineering.png",
        source_type: "svg_review_frame",
        scenes: ["S09"],
        required_review: "MoE must be separated from MHA"
      }
    ],
    review_frames: frames
  };

  fs.writeFileSync(path.join(visualsDir, "assets_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    path.join(reviewDir, "review_notes.md"),
    [
      "# EP03 Animation Keyframe Review Notes",
      "",
      "These are audience-facing keyframe stills for review before final HyperFrames output.",
      "",
      "- No dark background is allowed for the Chinese version.",
      "- Formulas must remain complete visual objects.",
      "- Internal design prompts, reviewer notes, and production reminders must stay in FRAME.md or prompt files, not inside the visible frame.",
      "- Arrows must attach to card, formula, node, or matrix outer boundaries.",
      "- Sound cues and captions must not cover formula objects.",
      "- The Figure 2 frame uses actual captured Harvard/paper assets plus a phone-readable redraw note.",
      "- Full render is blocked until these keyframes and representative personal-voice samples are approved."
    ].join("\n"),
    "utf8"
  );

  console.log(JSON.stringify({
    status: "ep03_assets_ready_for_review",
    manifest: "episodes/ep03_multi_head_attention/visuals/assets_manifest.json",
    review_dir: "episodes/ep03_multi_head_attention/qa/animation_review_stills",
    frames: frames.map((frame) => frame.file)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
