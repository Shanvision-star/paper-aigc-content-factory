import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

type Segment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  spoken_text: string;
  caption: string;
  visual_type: string;
  claim_ids: string[];
};

type PlatformSpec = {
  id: "youtube-shorts.en-US" | "x.en-US";
  width: number;
  height: number;
  projectDir: string;
  outputVideo: string;
  hardSubtitle: boolean;
};

type StoryboardScene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  engine: "hyperframes";
  assets: string[];
  caption: string;
  claim_ids: string[];
};

const rootDir = path.resolve(".");
const sourceEpisodeDir = path.join(rootDir, "episodes", "ep02_attention_qkv");
const episodeDir = path.join(rootDir, "episodes", "ep02_attention_qkv_en");
const runtimeTimestamp = new Date(0).toISOString();

const segments: Segment[] = [
  {
    segment_id: "seg_001",
    start: 0,
    duration: 7.5,
    text: "Attention is like a relationship map that changes at every layer. Today we open that map and focus on one line: Q times K transpose.",
    spoken_text: "Attention is like a relationship map that changes at every layer. Today we open that map and focus on one line: Q times K transpose.",
    caption: "Q times K transpose",
    visual_type: "hook_relation_graph_qk_reveal",
    claim_ids: ["c_attention_core", "c_attention_qkv"]
  },
  {
    segment_id: "seg_002",
    start: 7.5,
    duration: 7.5,
    text: "The question is simple: for the current token, which tokens in the context should it read from?",
    spoken_text: "The question is simple: for the current token, which tokens in the context should it read from?",
    caption: "Which tokens should it read from?",
    visual_type: "soft_adjacency_matrix_explainer",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_003",
    start: 15.0,
    duration: 8.5,
    text: "This is not a fixed graph, and not a Graph Neural Network. It is a soft attention matrix, rebuilt at each layer.",
    spoken_text: "This is not a fixed graph, and not a Graph Neural Network. It is a soft attention matrix, rebuilt at each layer.",
    caption: "A soft attention matrix",
    visual_type: "soft_adjacency_matrix_explainer",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_004",
    start: 23.5,
    duration: 10.8,
    text: "So what are Q, K, and V? They are not three different data sources. In self-attention, they usually come from the same token representation.",
    spoken_text: "So what are Q, K, and V? They are not three different data sources. In self-attention, they usually come from the same token representation.",
    caption: "Q, K, V come from the same input",
    visual_type: "qkv_projection_spaces",
    claim_ids: ["c_attention_qkv"]
  },
  {
    segment_id: "seg_005",
    start: 34.3,
    duration: 11.2,
    text: "The same input X is projected three ways: X times W Q becomes Query, X times W K becomes Key, and X times W V becomes Value.",
    spoken_text: "The same input X is projected three ways: X times W Q becomes Query, X times W K becomes Key, and X times W V becomes Value.",
    caption: "XW_Q, XW_K, XW_V",
    visual_type: "qkv_projection_spaces",
    claim_ids: ["c_attention_qkv"]
  },
  {
    segment_id: "seg_006",
    start: 45.5,
    duration: 11.0,
    text: "Use a meeting room analogy. Query is your question. Key is each person's label. Value is the actual information they can give you.",
    spoken_text: "Use a meeting room analogy. Query is your question. Key is each person's label. Value is the actual information they can give you.",
    caption: "Query = question. Key = label. Value = content.",
    visual_type: "meeting_room_feynman_qkv",
    claim_ids: ["c_attention_qkv"]
  },
  {
    segment_id: "seg_007",
    start: 56.5,
    duration: 10.0,
    text: "For a pronoun like it, the model does not magically understand the reference. The current token's Query is matched against every Key.",
    spoken_text: "For a pronoun like it, the model does not magically understand the reference. The current token's Query is matched against every Key.",
    caption: "Query matches every Key",
    visual_type: "pronoun_reference_qk_score",
    claim_ids: ["c_attention_core", "c_attention_qkv"]
  },
  {
    segment_id: "seg_008",
    start: 66.5,
    duration: 8.5,
    text: "That matching step is Q times K transpose. It produces a matrix of compatibility scores.",
    spoken_text: "That matching step is Q times K transpose. It produces a matrix of compatibility scores.",
    caption: "QK^T gives compatibility scores",
    visual_type: "pronoun_reference_qk_score",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_009",
    start: 75.0,
    duration: 12.8,
    text: "Next, the scores are divided by the square root of d k. In the paper, d k is the Query and Key vector dimension. Scaling keeps softmax stable.",
    spoken_text: "Next, the scores are divided by the square root of d k. In the paper, d k is the Query and Key vector dimension. Scaling keeps softmax stable.",
    caption: "divide by √(dₖ)",
    visual_type: "scale_by_sqrt_dk",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_010",
    start: 87.8,
    duration: 10.8,
    text: "Then softmax normalizes each row. For each current token, the row becomes attention weights that add up to one.",
    spoken_text: "Then softmax normalizes each row. For each current token, the row becomes attention weights that add up to one.",
    caption: "softmax normalizes each row",
    visual_type: "row_wise_softmax_weights",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_011",
    start: 98.6,
    duration: 11.5,
    text: "Finally, the model uses those weights to read Value vectors and combine them into a new representation. Match, normalize, then read.",
    spoken_text: "Finally, the model uses those weights to read Value vectors and combine them into a new representation. Match, normalize, then read.",
    caption: "match → normalize → read Value",
    visual_type: "weighted_v_aggregation_formula",
    claim_ids: ["c_attention_core", "c_attention_qkv"]
  },
  {
    segment_id: "seg_012",
    start: 110.1,
    duration: 13.5,
    text: "That is Scaled Dot-Product Attention: softmax of Q K transpose divided by the square root of d k, then multiplied by V.",
    spoken_text: "That is Scaled Dot-Product Attention: softmax of Q K transpose divided by the square root of d k, then multiplied by V.",
    caption: "Scaled Dot-Product Attention",
    visual_type: "complete_scaled_dot_product_attention",
    claim_ids: ["c_attention_core"]
  },
  {
    segment_id: "seg_013",
    start: 123.6,
    duration: 13.0,
    text: "ChatGPT and Claude still use this path. A new Query is produced for the next token, while old Key and Value projections can be reused through KV Cache, or Key-Value Cache.",
    spoken_text: "ChatGPT and Claude still use this path. A new Query is produced for the next token, while old Key and Value projections can be reused through KV Cache, or Key Value Cache.",
    caption: "KV Cache (Key-Value Cache)",
    visual_type: "kv_cache_cached_projection",
    claim_ids: ["c_transformer_impact", "c_attention_core"]
  },
  {
    segment_id: "seg_014",
    start: 136.6,
    duration: 12.0,
    text: "Modern systems optimize the same path: FlashAttention at the kernel level, GQA and MQA at the model level, and KV Cache at runtime.",
    spoken_text: "Modern systems optimize the same path: FlashAttention at the kernel level, GQA and MQA at the model level, and KV Cache at runtime.",
    caption: "kernel · model · runtime",
    visual_type: "modern_attention_optimization_layers",
    claim_ids: ["c_transformer_impact", "c_transformer_parallelism"]
  },
  {
    segment_id: "seg_015",
    start: 148.6,
    duration: 11.5,
    text: "Feynman summary: Query is the question. Key is the index. Value is the content. Attention is a differentiable routing system for information.",
    spoken_text: "Feynman summary: Query is the question. Key is the index. Value is the content. Attention is a differentiable routing system for information.",
    caption: "Attention routes information",
    visual_type: "feynman_summary_information_routing",
    claim_ids: ["c_attention_core", "c_attention_qkv"]
  },
  {
    segment_id: "seg_016",
    start: 160.1,
    duration: 7.9,
    text: "Next episode: if one attention view works, why does Transformer use many heads at once? That is Multi-Head Attention.",
    spoken_text: "Next episode: if one attention view works, why does Transformer use many heads at once? That is Multi-Head Attention.",
    caption: "Next: Multi-Head Attention",
    visual_type: "next_episode_multi_head_cta",
    claim_ids: ["c_attention_core"]
  }
];

function retimeSegments(targetDurationSec: number): void {
  const currentDuration = Math.max(...segments.map((segment) => segment.start + segment.duration));
  const scale = targetDurationSec / currentDuration;
  let cursor = 0;

  for (const segment of segments) {
    segment.start = Number(cursor.toFixed(3));
    segment.duration = Number((segment.duration * scale).toFixed(3));
    cursor += segment.duration;
  }

  const drift = Number((targetDurationSec - cursor).toFixed(3));
  segments[segments.length - 1].duration = Number((segments[segments.length - 1].duration + drift).toFixed(3));
}

function applyExistingAudioTimings(): boolean {
  const reportPath = path.join(episodeDir, "audio", "indextts2", "segments", "segmented_merge_report.json");
  if (!fs.existsSync(reportPath)) {
    return false;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
    pause_ms?: number;
    segments?: Array<{ segment_id: string; duration_sec: number }>;
  };
  const durations = new Map((report.segments ?? []).map((segment) => [segment.segment_id, segment.duration_sec]));
  if (!segments.every((segment) => durations.has(segment.segment_id))) {
    return false;
  }

  const pauseSec = (report.pause_ms ?? 0) / 1000;
  let cursor = 0;
  for (const [index, segment] of segments.entries()) {
    segment.start = Number(cursor.toFixed(3));
    segment.duration = Number(durations.get(segment.segment_id)!.toFixed(3));
    cursor += segment.duration;
    if (index < segments.length - 1) {
      cursor += pauseSec;
    }
  }

  return true;
}

const timingSource = applyExistingAudioTimings() ? "indextts2_segmented_merge_report" : "planned_138s_script_timing";
if (timingSource === "planned_138s_script_timing") {
  retimeSegments(138);
}

const platforms: PlatformSpec[] = [
  {
    id: "youtube-shorts.en-US",
    width: 1080,
    height: 1920,
    projectDir: "renders/hyperframes_youtube_shorts_en",
    outputVideo: "renders/youtube_shorts_en_1080x1920_draft.mp4",
    hardSubtitle: true
  },
  {
    id: "x.en-US",
    width: 1080,
    height: 1080,
    projectDir: "renders/hyperframes_x_en_square",
    outputVideo: "renders/x_en_1080x1080_draft.mp4",
    hardSubtitle: true
  }
];

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(relativePath: string, value: string): void {
  const filePath = path.join(episodeDir, relativePath);
  ensureDir(filePath);
  fs.writeFileSync(filePath, value, "utf8");
}

function writeJson(relativePath: string, value: unknown): void {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function copyFile(sourceRelative: string, targetRelative: string): void {
  const source = path.join(sourceEpisodeDir, sourceRelative);
  const target = path.join(episodeDir, targetRelative);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source asset: ${source}`);
  }
  ensureDir(target);
  fs.copyFileSync(source, target);
}

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function totalDuration(): number {
  return Number(Math.max(...segments.map((segment) => segment.start + segment.duration)).toFixed(3));
}

function srtTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const milliseconds = Math.round((seconds - whole) * 1000);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function vttTime(seconds: number): string {
  return srtTime(seconds).replace(",", ".");
}

function assTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const centiseconds = Math.floor((seconds - whole) * 100);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function captionText(text: string): string {
  return text
    .replace(/KV Cache, or Key-Value Cache/g, "KV Cache (Key-Value Cache)")
    .replace(/KV Cache, or Key Value Cache/g, "KV Cache (Key-Value Cache)")
    .replace(/KV Cache(?! \(Key-Value Cache\))/g, "KV Cache (Key-Value Cache)")
    .replace(/Q times K transpose/g, "QK^T")
    .replace(/Q K transpose/g, "QK^T")
    .replace(/√\(d_k\)/g, "√(dₖ)")
    .replace(/the square root of d k/g, "√(dₖ)")
    .replace(/square root of d k/g, "√(dₖ)")
    .replace(/Key and Value/g, "Key and Value")
    .replace(/Q, K, and V/g, "Q, K, V");
}

function buildSrt(): string {
  return segments.map((segment, index) => [
    String(index + 1),
    `${srtTime(segment.start)} --> ${srtTime(segment.start + segment.duration)}`,
    captionText(segment.text),
    ""
  ].join("\n")).join("\n");
}

function buildVtt(): string {
  return [
    "WEBVTT",
    "",
    ...segments.flatMap((segment) => [
      `${vttTime(segment.start)} --> ${vttTime(segment.start + segment.duration)}`,
      captionText(segment.text),
      ""
    ])
  ].join("\n");
}

function escapeAss(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
}

function buildAss(width: number, height: number): string {
  const fontSize = height >= 1900 ? 54 : 38;
  const marginV = height >= 1900 ? 150 : 70;
  const events = segments.map((segment) => {
    return `Dialogue: 0,${assTime(segment.start)},${assTime(segment.start + segment.duration)},Default,,0,0,0,,${escapeAss(captionText(segment.caption))}`;
  });
  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${width}`,
    `PlayResY: ${height}`,
    "WrapStyle: 2",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,Arial,${fontSize},&H00FFFFFF,&H00FFFFFF,&HC20F172A,&H88101820,-1,0,0,0,100,100,0,0,1,4,1,2,64,64,${marginV},1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...events,
    ""
  ].join("\n");
}

function frameContract(): string {
  return `# EP02 English Frame Contract: What Does QKV Compute?

## Boundary

- This is an English international derivative of EP02.
- It must not overwrite Chinese EP02 script, audio, captions, or renders.
- Target platforms: YouTube Shorts and X.
- Primary visual approach: source-backed Soft Lab / Paper System with the original paper Figure 2 and Harvard Annotated Transformer formula/code anchors.

## Source-Backed Asset Contract

The English video preserves the same technical visual chain:

\`Q -> Key matching -> score matrix -> /√(d_k) -> row-wise softmax -> weighted Value -> output representation\`.

Required original/source assets:

- original paper Figure 2 Scaled Dot-Product Attention crop: \`video_script/source_assets/harvard_embedded_03.png\`
- original paper Transformer architecture image: \`video_script/source_assets/harvard_embedded_02.png\`
- formula SVG: \`visuals/ep02_formula_scaled_dot_product_attention.svg\`
- Harvard attention code SVG: \`visuals/ep02_harvard_attention_code.svg\`
- QKV projection, QK graph, and KV Cache diagrams from the approved EP02 visual system.

## Formula Rules

- Visual/caption form: \`Attention(Q,K,V)=softmax((QK^T)/√(d_k))V\`.
- Spoken form: "Q times K transpose" and "the square root of d k".
- Meaning of \`d_k\`: the dimension of Query and Key vectors in the paper.
- The formula must appear as a complete visual object before the engineering section.
- Captions must not cover the formula bounding box.

## Pronunciation Rules For English TTS

- Do not split or spell out these terms unless explicitly written as letters: \`ChatGPT\`, \`Claude\`, \`token\`, \`Attention\`, \`softmax\`, \`FlashAttention\`, \`GQA\`, \`MQA\`, \`KV Cache\`, \`Multi-Head Attention\`.
- TTS input uses \`spoken_text\`, not raw formula notation.
- Captions may show \`QK^T\`, \`√(d_k)\`, and \`KV Cache (Key-Value Cache)\`.
- Keep English terms stable across all segments.

## Platform Notes

- YouTube Shorts: 1080x1920, hard captions, vertical safe area.
- X: 1080x1080 square variant, hard captions, center-safe layout.
- No auto-publishing.
`;
}

function topicYaml(): string {
  return `episode_id: ep02_attention_qkv_en
title: "EP02 What Does QKV Compute?"
paper:
  title: "Attention Is All You Need"
  arxiv_id: "1706.03762"
  local_research_report: "D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md"
audience:
  primary: "Engineers + AI learners"
targets:
  - youtube-shorts.en-US
  - x.en-US
outputs:
  blog: false
  pdf: false
  video: true
  voiceover: true
  publish_pack: true
constraints:
  auto_publish: false
  require_primary_sources: true
  require_citation_gate: true
  require_human_review: true
  voice_mode: builtin_voice_only
`;
}

function voiceoverMarkdown(): string {
  return `# EP02 English Voiceover: What Does QKV Compute?

## Production Boundary

- This file is the reviewed English source text.
- TTS must use the matching \`spoken_text\` in \`script/voice_segments.json\`.
- Captions may show formulas and abbreviations; spoken text must read naturally.

## Voiceover

${segments.map((segment) => `### ${segment.segment_id} (${srtTime(segment.start)}-${srtTime(segment.start + segment.duration)})\n\n${segment.text}`).join("\n\n")}
`;
}

function pronunciationDoc(): string {
  return `# EP02 English Pronunciation Normalization

## Hard Rules

- \`QK^T\` in captions/visuals is spoken as "Q times K transpose".
- \`√(d_k)\` in captions/visuals is spoken as "the square root of d k".
- \`KV Cache\` may display as \`KV Cache (Key-Value Cache)\`; spoken text uses "KV Cache, or Key Value Cache" once for clarity.
- Keep \`ChatGPT\`, \`Claude\`, \`token\`, \`Attention\`, \`softmax\`, \`FlashAttention\`, \`GQA\`, \`MQA\`, and \`Multi-Head Attention\` as stable English terms.
- Do not use raw formula notation as TTS input.

## Sample Gate Focus Segments

- \`seg_001\`: Attention / Q times K transpose / token.
- \`seg_009\`: square root of d k / softmax.
- \`seg_013\`: ChatGPT / Claude / KV Cache.
- \`seg_016\`: Multi-Head Attention.
`;
}

function adjustedManifest(): unknown {
  const raw = JSON.parse(fs.readFileSync(path.join(sourceEpisodeDir, "visuals", "assets_manifest.json"), "utf8")) as {
    assets: Array<Record<string, unknown>>;
    source_notes?: unknown;
  };
  return {
    episode_id: "ep02_attention_qkv_en",
    source_notes: raw.source_notes,
    assets: raw.assets.map((asset) => ({
      ...asset,
      source_locale: "en-US",
      path: String(asset.path)
    })),
    copied_source_assets: [
      {
        asset_id: "paper_figure2_scaled_dot_product_attention_png",
        path: "video_script/source_assets/harvard_embedded_03.png",
        source: "https://nlp.seas.harvard.edu/annotated-transformer/",
        source_type: "paper_original_crop",
        usage: "Hero Figure 2 source-backed visual"
      },
      {
        asset_id: "paper_transformer_architecture_png",
        path: "video_script/source_assets/harvard_embedded_02.png",
        source: "https://nlp.seas.harvard.edu/annotated-transformer/",
        source_type: "paper_original_crop",
        usage: "Series continuity visual"
      }
    ]
  };
}

function storyboard(): StoryboardScene[] {
  return segments.map((segment, index) => ({
    scene_id: `S${String(index + 1).padStart(2, "0")}`,
    start: segment.start,
    duration: segment.duration,
    voiceover: segment.text,
    visual_type: segment.visual_type,
    engine: "hyperframes",
    assets: assetsForVisual(segment.visual_type),
    caption: segment.caption,
    claim_ids: segment.claim_ids
  }));
}

function assetsForVisual(visualType: string): string[] {
  if (visualType.includes("projection") || visualType.includes("meeting")) {
    return ["ep02_qkv_projection_pipeline_svg"];
  }
  if (visualType.includes("scale") || visualType.includes("weighted") || visualType.includes("complete") || visualType.includes("summary")) {
    return ["ep02_formula_scaled_dot_product_attention_svg", "ep02_harvard_attention_code_svg"];
  }
  if (visualType.includes("cache") || visualType.includes("optimization")) {
    return ["ep02_kv_cache_engineering_svg"];
  }
  if (visualType.includes("next")) {
    return [];
  }
  return ["ep02_qk_relation_graph_svg"];
}

function ttsManifest(): unknown {
  return {
    status: "prepared",
    engine_hint: "indextts2_local_segmented",
    language: "en-US",
    generated_at: runtimeTimestamp,
    source: "script/voice_segments.json",
    text_hash: hashText(segments.map((segment) => segment.spoken_text).join("\n")),
    notes: [
      "English TTS uses spoken_text, not raw formula notation.",
      "Formula captions preserve QK^T and √(d_k); spoken text uses Q times K transpose and the square root of d k.",
      "Do not split ChatGPT, Claude, token, Attention, softmax, FlashAttention, KV Cache, or Multi-Head Attention.",
      "This English package is independent from the Chinese EP02 assets."
    ],
    segments: segments.map((segment) => ({
      segment_id: segment.segment_id,
      source_text: segment.text,
      spoken_text: segment.spoken_text,
      focus_terms: focusTerms(segment.text),
      gen_file: `audio/indextts2/segments/${segment.segment_id}.txt`,
      output_audio: `audio/indextts2/segments/${segment.segment_id}.wav`
    }))
  };
}

function focusTerms(text: string): string[] {
  const terms = ["Attention", "Q", "K", "V", "token", "softmax", "ChatGPT", "Claude", "KV Cache", "FlashAttention", "Multi-Head Attention"];
  return terms.filter((term) => text.includes(term));
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formulaHtml(): string {
  return `<div class="formula" aria-label="Attention(Q,K,V)=softmax(QK transpose over square root d k)V">
    <span>Attention(</span><b class="q">Q</b><span>, </span><b class="k">K</b><span>, </span><b class="v">V</b><span>) = </span>
    <b class="soft">softmax</b><span>(</span>
    <span class="frac"><span class="top"><b class="q">Q</b><b class="k">K<sup>T</sup></b></span><span class="bottom"><span class="root">√</span><span>d<sub>k</sub></span></span></span>
    <span>)</span><b class="v">V</b>
  </div>`;
}

function matrixHtml(): string {
  const values = ["0.10", "0.18", "0.62", "0.10", "0.06", "0.22", "0.12", "0.60", "0.08", "0.11", "0.71", "0.10", "0.04", "0.14", "0.18", "0.64"];
  return `<div class="matrix">${values.map((value, index) => `<span class="${index === 10 ? "hot" : ""}">${value}</span>`).join("")}</div>`;
}

function visualHtml(visualType: string): string {
  if (visualType.includes("projection")) {
    return `<div class="projection">
      <div class="xcard">X<br><small>same token representation</small></div>
      <div class="pcard q">Q = XW<sub>Q</sub><small>Query space</small></div>
      <div class="pcard k">K = XW<sub>K</sub><small>Key space</small></div>
      <div class="pcard v">V = XW<sub>V</sub><small>Value space</small></div>
    </div>`;
  }
  if (visualType.includes("meeting")) {
    return `<div class="meeting">
      <div class="role q"><b>Query</b><span>the question</span></div>
      <div class="role k"><b>Key</b><span>the index label</span></div>
      <div class="role v"><b>Value</b><span>the useful content</span></div>
    </div>`;
  }
  if (visualType.includes("pronoun")) {
    return `<div class="qk">
      <div class="token active">current token<br><b>Query</b></div>
      <div class="keys"><span>Key 1</span><span>Key 2</span><span class="hot">Key 3</span><span>Key n</span></div>
      ${matrixHtml()}
    </div>`;
  }
  if (visualType.includes("scale")) {
    return `<div class="formula-focus">${formulaHtml()}<div class="callout">√(d<sub>k</sub>) means the square root of the Query/Key vector dimension.</div></div>`;
  }
  if (visualType.includes("softmax")) {
    return `<div class="softmax-grid"><div>${matrixHtml()}<b>scores</b></div><div class="arrow">→<small>row-wise softmax</small></div><div>${matrixHtml()}<b>weights sum to 1</b></div></div>`;
  }
  if (visualType.includes("weighted") || visualType.includes("complete")) {
    return `<div class="derivation"><img src="../../video_script/source_assets/harvard_embedded_03.png" alt="Original paper Figure 2 Scaled Dot-Product Attention">${formulaHtml()}<div class="steps"><span>1 score</span><span>2 scale</span><span>3 softmax</span><span>4 read Value</span></div></div>`;
  }
  if (visualType.includes("cache")) {
    return `<div class="cache"><div class="newq">new Query</div><div class="bank k">cached Key</div><div class="bank v">cached Value</div><div class="note">KV Cache = Key-Value Cache</div></div>`;
  }
  if (visualType.includes("optimization")) {
    return `<div class="optim"><div><b>FlashAttention</b><span>kernel level</span></div><div><b>GQA / MQA</b><span>model level</span></div><div><b>KV Cache</b><span>runtime level</span></div></div>`;
  }
  if (visualType.includes("summary")) {
    return `<div class="summary">${formulaHtml()}<div class="meeting compact"><div class="role q"><b>Q</b><span>question</span></div><div class="role k"><b>K</b><span>index</span></div><div class="role v"><b>V</b><span>content</span></div></div><strong>Attention routes information.</strong></div>`;
  }
  if (visualType.includes("next")) {
    return `<div class="heads"><span>head 1</span><span>head 2</span><span>head 3</span><span>head 4</span><b>Multi-Head Attention</b></div>`;
  }
  return `<div class="hero-graph">
    <img src="../../video_script/source_assets/harvard_embedded_03.png" alt="Original paper Figure 2">
    <div class="graph-card"><b>soft attention matrix</b>${matrixHtml()}</div>
  </div>`;
}

function sceneTitle(segment: Segment): string {
  if (segment.visual_type.includes("hook")) return "What does QKV compute?";
  if (segment.visual_type.includes("adjacency")) return "Attention is a soft matrix";
  if (segment.visual_type.includes("projection")) return "Q, K, V are learned projections";
  if (segment.visual_type.includes("meeting")) return "Feynman analogy";
  if (segment.visual_type.includes("pronoun")) return "QK^T gives scores";
  if (segment.visual_type.includes("scale")) return "Why divide by √(dₖ)?";
  if (segment.visual_type.includes("softmax")) return "softmax turns scores into weights";
  if (segment.visual_type.includes("weighted")) return "Read Value with weights";
  if (segment.visual_type.includes("complete")) return "Scaled Dot-Product Attention";
  if (segment.visual_type.includes("cache")) return "Modern LLMs still use this";
  if (segment.visual_type.includes("optimization")) return "Same path, different optimizations";
  if (segment.visual_type.includes("summary")) return "Feynman summary";
  return "Next: Multi-Head Attention";
}

function compositionHtml(platform: PlatformSpec): string {
  const duration = totalDuration();
  const isSquare = platform.width === platform.height;
  const captionBottom = isSquare ? 60 : 150;
  const titleSize = isSquare ? 56 : 74;
  const visualHeight = isSquare ? 520 : 1040;
  const scenes = segments.map((segment, index) => {
    return `<section id="scene-${segment.segment_id}" class="scene" data-start="${segment.start}" data-duration="${segment.duration}">
      <div class="scene-inner">
        <div class="eyebrow">EP02 · Attention Is All You Need</div>
        <h1>${escapeHtml(sceneTitle(segment))}</h1>
        <div class="visual">${visualHtml(segment.visual_type)}</div>
        <div class="source">Source: Attention Is All You Need / Harvard Annotated Transformer</div>
      </div>
    </section>`;
  }).join("\n");
  const captions = JSON.stringify(segments.map((segment) => ({
    id: segment.segment_id,
    start: segment.start,
    end: Number((segment.start + segment.duration).toFixed(3)),
    text: captionText(segment.caption)
  })));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EP02 English QKV</title>
  <script src="media/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #F7F7F5; font-family: Arial, sans-serif; }
    #root { position: relative; width: ${platform.width}px; height: ${platform.height}px; overflow: hidden; background: #F7F7F5; color: #1C1C1C; }
    #root::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px); background-size: 36px 36px; }
    .scene { position: absolute; inset: 0; opacity: 1; }
    .scene-inner { position: relative; z-index: 1; height: 100%; padding: ${isSquare ? 46 : 78}px ${isSquare ? 58 : 70}px ${isSquare ? 122 : 250}px; display: none; flex-direction: column; gap: ${isSquare ? 16 : 26}px; opacity: 0; }
    .eyebrow { align-self: flex-start; padding: 9px 16px; border: 2px solid rgba(178,121,162,0.38); border-radius: 8px; background: rgba(255,255,255,0.82); color: #B279A2; font-weight: 900; font-size: ${isSquare ? 20 : 28}px; letter-spacing: 0; }
    h1 { margin: 0; font-size: ${titleSize}px; line-height: 1.02; letter-spacing: 0; font-weight: 950; max-width: ${isSquare ? 950 : 980}px; }
    .visual { min-height: ${visualHeight}px; flex: 1; display: grid; align-items: center; padding: ${isSquare ? 18 : 26}px; border: 1px solid rgba(100,116,139,0.16); border-radius: 8px; background: rgba(255,255,255,0.88); box-shadow: 0 22px 55px rgba(15,23,42,0.10); overflow: hidden; }
    .source { color: #64748B; font-size: ${isSquare ? 17 : 22}px; font-weight: 800; }
    .caption-layer { position: absolute; z-index: 4; left: 0; right: 0; bottom: ${captionBottom}px; display: grid; place-items: center; pointer-events: none; }
    .caption-group { max-width: ${isSquare ? 890 : 920}px; padding: 14px 22px; border-radius: 8px; background: rgba(15,23,42,0.88); color: white; text-align: center; font-size: ${isSquare ? 34 : 44}px; line-height: 1.1; font-weight: 950; box-shadow: 0 12px 30px rgba(15,23,42,0.28); opacity: 0; visibility: hidden; }
    .q { color: #4C78FF; } .k { color: #F58518; } .v { color: #54A24B; } .soft { color: #B279A2; }
    .matrix { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 12px; }
    .matrix span { min-height: ${isSquare ? 44 : 62}px; display: grid; place-items: center; border-radius: 8px; background: #EEF2FF; color: #1E293B; font-family: Consolas, monospace; font-size: ${isSquare ? 20 : 28}px; font-weight: 900; }
    .matrix .hot { background: #FDE68A; color: #7C2D12; }
    .hero-graph { display: grid; grid-template-columns: ${isSquare ? "1fr 0.9fr" : "1fr"}; gap: 22px; align-items: center; }
    .hero-graph img, .derivation img { max-width: 100%; max-height: ${isSquare ? 430 : 420}px; object-fit: contain; margin: 0 auto; display: block; }
    .graph-card, .role, .pcard, .xcard, .newq, .bank, .optim div, .heads span { border-radius: 8px; border: 2px solid rgba(100,116,139,0.18); background: #FFFFFF; padding: ${isSquare ? 18 : 24}px; box-shadow: 0 12px 28px rgba(15,23,42,0.08); }
    .projection { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: center; }
    .xcard, .pcard { min-height: ${isSquare ? 230 : 360}px; display: grid; place-items: center; text-align: center; font-size: ${isSquare ? 32 : 48}px; font-weight: 950; }
    .pcard small, .xcard small { display: block; color: #64748B; font-size: ${isSquare ? 20 : 26}px; }
    .pcard.q { border-color: rgba(76,120,255,0.36); background: #EFF6FF; }
    .pcard.k { border-color: rgba(245,133,24,0.36); background: #FFF7ED; }
    .pcard.v { border-color: rgba(84,162,75,0.36); background: #F0FDF4; }
    .meeting { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items: center; }
    .role { min-height: ${isSquare ? 230 : 420}px; display: grid; place-items: center; text-align: center; }
    .role b { font-size: ${isSquare ? 36 : 58}px; } .role span { color: #475569; font-size: ${isSquare ? 24 : 34}px; font-weight: 850; }
    .qk { display: grid; grid-template-columns: 0.8fr 1fr 1fr; gap: 18px; align-items: center; }
    .token { min-height: 230px; display: grid; place-items: center; text-align: center; border: 3px solid #4C78FF; color: #4C78FF; background: #EFF6FF; border-radius: 8px; font-size: ${isSquare ? 28 : 42}px; font-weight: 950; }
    .keys { display: grid; gap: 12px; } .keys span { padding: 16px; border-radius: 8px; background: #FFF7ED; color: #9A3412; font-weight: 950; font-size: ${isSquare ? 22 : 32}px; }
    .keys .hot { background: #FDE68A; }
    .formula { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; padding: 22px; border-radius: 8px; background: #FFFFFF; box-shadow: 0 16px 36px rgba(15,23,42,0.10); font-family: Georgia, serif; font-size: ${isSquare ? 34 : 46}px; font-weight: 700; line-height: 1.2; }
    .frac { display: inline-grid; grid-template-rows: auto auto; place-items: center; padding: 0 8px; }
    .frac .top { border-bottom: 3px solid #1C1C1C; padding: 0 12px 4px; }
    .frac .bottom { padding-top: 4px; white-space: nowrap; }
    .root { font-size: 1.16em; margin-right: 2px; }
    .formula-focus { display: grid; gap: 28px; align-content: center; }
    .callout { border-left: 8px solid #E45756; padding: 20px; font-size: ${isSquare ? 24 : 36}px; line-height: 1.25; font-weight: 900; }
    .softmax-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center; }
    .softmax-grid b { display: block; text-align: center; margin-top: 12px; font-size: ${isSquare ? 22 : 30}px; }
    .arrow { font-size: ${isSquare ? 42 : 64}px; font-weight: 950; color: #B279A2; display: grid; place-items: center; } .arrow small { font-size: ${isSquare ? 18 : 24}px; color: #334155; }
    .derivation { display: grid; gap: 18px; align-content: center; }
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; } .steps span { padding: 14px; border-radius: 8px; background: #F8FAFC; text-align: center; font-weight: 950; font-size: ${isSquare ? 18 : 26}px; }
    .cache { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items: center; }
    .newq, .bank { min-height: ${isSquare ? 210 : 380}px; display: grid; place-items: center; text-align: center; font-size: ${isSquare ? 30 : 48}px; font-weight: 950; }
    .newq { border-color: rgba(76,120,255,0.36); color: #4C78FF; background: #EFF6FF; }
    .bank.k { color: #F58518; background: #FFF7ED; } .bank.v { color: #54A24B; background: #F0FDF4; }
    .cache .note { grid-column: 1 / -1; text-align: center; font-size: ${isSquare ? 28 : 40}px; font-weight: 950; color: #1E293B; }
    .optim { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .optim div { min-height: ${isSquare ? 240 : 470}px; display: grid; place-items: center; text-align: center; }
    .optim b { font-size: ${isSquare ? 31 : 46}px; } .optim span { color: #475569; font-size: ${isSquare ? 23 : 32}px; font-weight: 850; }
    .summary { display: grid; gap: 22px; } .summary strong { text-align: center; font-size: ${isSquare ? 32 : 48}px; }
    .meeting.compact .role { min-height: ${isSquare ? 130 : 190}px; }
    .heads { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: center; text-align: center; }
    .heads span { min-height: ${isSquare ? 160 : 280}px; display: grid; place-items: center; color: #4C78FF; font-size: ${isSquare ? 24 : 38}px; font-weight: 950; }
    .heads b { grid-column: 1 / -1; font-size: ${isSquare ? 44 : 74}px; }
  </style>
</head>
<body>
  <div id="root" data-composition-id="ep02-qkv-en-${platform.id.replace(".", "-")}" data-start="0" data-duration="${duration}" data-width="${platform.width}" data-height="${platform.height}">
    <audio id="voiceover" data-start="0" data-duration="${duration}" data-track-index="2" src="media/voiceover.wav" data-volume="1"></audio>
    ${scenes}
    <div class="caption-layer" aria-hidden="true"></div>
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const CAPTIONS = ${captions};
    const tl = gsap.timeline({ paused: true });
    const layer = document.querySelector(".caption-layer");
    CAPTIONS.forEach(function(group, index) {
      const el = document.createElement("div");
      el.className = "caption-group";
      el.id = "caption-" + index;
      el.textContent = group.text;
      layer.appendChild(el);
      tl.set(el, { visibility: "visible" }, group.start);
      tl.fromTo(el, { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power3.out", overwrite: "auto" }, group.start + 0.04);
      tl.to(el, { opacity: 0, scale: 0.96, duration: 0.12, ease: "power2.in", overwrite: "auto" }, Math.max(group.start + 0.3, group.end - 0.14));
      tl.set(el, { opacity: 0, visibility: "hidden" }, group.end);
    });
    tl.set(".scene-inner", { opacity: 0, display: "none" }, 0);
    ${segments.map((segment, index) => {
      const selector = `#scene-${segment.segment_id}`;
      const end = Number((segment.start + segment.duration).toFixed(3));
      return `
      tl.set("${selector} .scene-inner", { display: "flex", opacity: 0 }, ${segment.start});
      tl.to("${selector} .scene-inner", { opacity: 1, duration: 0.18, ease: "power2.out", overwrite: "auto" }, ${segment.start});
      tl.to("${selector} .scene-inner", { opacity: 0, duration: 0.12, ease: "power2.in", overwrite: "auto" }, ${Math.max(segment.start + 0.25, end - 0.14)});
      tl.set("${selector} .scene-inner", { opacity: 0, display: "none" }, ${end});
      tl.from("${selector} .eyebrow", { y: 24, opacity: 0, duration: 0.35, ease: "power3.out", overwrite: "auto" }, ${segment.start + 0.16});
      tl.from("${selector} h1", { x: -34, opacity: 0, duration: 0.48, ease: "expo.out", overwrite: "auto" }, ${segment.start + 0.24});
      tl.from("${selector} .visual", { y: 40, scale: 0.985, opacity: 0, duration: 0.55, ease: "back.out(1.15)", overwrite: "auto" }, ${segment.start + 0.36});
      tl.from("${selector} .matrix span, ${selector} .pcard, ${selector} .role, ${selector} .bank, ${selector} .optim div, ${selector} .heads span, ${selector} .steps span", { y: 18, opacity: 0, duration: 0.35, stagger: 0.035, ease: "power3.out", overwrite: "auto" }, ${segment.start + 0.7});`;
    }).join("\n")}
    tl.to("#root", { opacity: 0, duration: 0.5, ease: "sine.inOut" }, ${Math.max(0, duration - 0.5)});
    window.__timelines["ep02-qkv-en-${platform.id.replace(".", "-")}"] = tl;
  </script>
</body>
</html>
`;
}

function writePlatformProjects(): void {
  const gsapSourcePath = path.join(rootDir, "node_modules", "gsap", "dist", "gsap.min.js");

  for (const platform of platforms) {
    const projectDir = path.join(episodeDir, platform.projectDir);
    fs.mkdirSync(path.join(projectDir, "media"), { recursive: true });
    if (fs.existsSync(gsapSourcePath)) {
      fs.copyFileSync(gsapSourcePath, path.join(projectDir, "media", "gsap.min.js"));
    }
    fs.writeFileSync(path.join(projectDir, "index.html"), compositionHtml(platform), "utf8");
    fs.writeFileSync(path.join(projectDir, "hyperframes.json"), `${JSON.stringify({ version: "1", entry: "index.html" }, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(projectDir, "package.json"), `${JSON.stringify({
      scripts: {
        check: "hyperframes lint",
        inspect: "hyperframes inspect",
        render: `hyperframes render -o ../../${platform.outputVideo.replace(/\\/g, "/")} --fps 30 --quality draft`
      }
    }, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(projectDir, "DESIGN.md"), `# EP02 English ${platform.id} Design\n\nSoft Lab / Paper System. Warm paper background, high-contrast English typography, semantic Q/K/V colors, source-backed formula scenes, and restrained transitions.\n`, "utf8");
  }
}

function finalVideoPath(platform: PlatformSpec): string {
  if (platform.id === "youtube-shorts.en-US") {
    const burnedStaticReviewPath = "renders/youtube_shorts_en_1080x1920_static_review_burned_subs.mp4";
    if (fs.existsSync(path.join(episodeDir, burnedStaticReviewPath))) {
      return burnedStaticReviewPath;
    }
    const staticReviewPath = "renders/youtube_shorts_en_1080x1920_static_review_with_audio.mp4";
    if (fs.existsSync(path.join(episodeDir, staticReviewPath))) {
      return staticReviewPath;
    }
    const muxedPath = "renders/youtube_shorts_en_1080x1920_draft_with_audio.mp4";
    if (fs.existsSync(path.join(episodeDir, muxedPath))) {
      return muxedPath;
    }
  }
  if (platform.id === "x.en-US") {
    const squareStaticReviewPath = "renders/x_en_1080x1080_static_review_burned_subs.mp4";
    if (fs.existsSync(path.join(episodeDir, squareStaticReviewPath))) {
      return squareStaticReviewPath;
    }
  }

  return platform.outputVideo;
}

function publishManifest(): unknown {
  const durationSec = totalDuration();
  const hasAudio = fs.existsSync(path.join(episodeDir, "audio", "voiceover.wav"))
    || fs.existsSync(path.join(episodeDir, "audio", "voiceover.segmented.wav"));
  const hasAnyRenderedReview = platforms.some((platform) => fs.existsSync(path.join(episodeDir, finalVideoPath(platform))));

  return {
    status: hasAnyRenderedReview ? "prepared_with_review_renders" : "prepared_without_render",
    generated_at: runtimeTimestamp,
    platforms: platforms.map((platform) => ({
      platform: platform.id,
      language: "en-US",
      title: "What Does QKV Actually Compute?",
      description: platform.id === "x.en-US"
        ? "QKV is not magic. It is a routing mechanism: Query matches Key, softmax turns scores into weights, and Value carries the information. EP02 of Attention Is All You Need."
        : "EP02 of Attention Is All You Need. This English explainer breaks down Q, K, V, QK^T, √(d_k), row-wise softmax, weighted Value aggregation, and why KV Cache still matters in modern LLM inference.",
      hashtags: ["#AI", "#Transformer", "#Attention", "#QKV", "#LLM", "#ChatGPT", "#Claude", "#KVCache"],
      resolution: { width: platform.width, height: platform.height },
      aspect_ratio: platform.width === platform.height ? "1:1" : "9:16",
      hard_subtitle: platform.hardSubtitle,
      duration_sec: durationSec,
      cover_path: "video_script/cover_ep02_qkv_final_1080x1920_safe90.png",
      hyperframes_raw_video_path: platform.outputVideo,
      video_path: finalVideoPath(platform),
      caption_path: "captions/subtitles.en-US.srt",
      hyperframes_project: platform.projectDir,
      safe_area_note: platform.id === "x.en-US" ? "square center-safe layout" : "vertical safe90-style layout",
      status: platform.id === "x.en-US" && durationSec > 140
        ? "duration_exceeds_x_standard_140s_limit_needs_short_cut"
        : fs.existsSync(path.join(episodeDir, finalVideoPath(platform)))
          ? "rendered_needs_review"
        : hasAudio
          ? "pending_render"
          : "pending_audio_and_render"
    }))
  };
}

function main(): void {
  fs.mkdirSync(episodeDir, { recursive: true });
  for (const relative of [
    "visuals/ep02_formula_scaled_dot_product_attention.svg",
    "visuals/ep02_harvard_attention_code.svg",
    "visuals/ep02_qk_relation_graph.svg",
    "visuals/ep02_qkv_projection_pipeline.svg",
    "visuals/ep02_kv_cache_engineering.svg",
    "video_script/source_assets/harvard_embedded_02.png",
    "video_script/source_assets/harvard_embedded_03.png",
    "video_script/cover_ep02_qkv_final_1080x1920_safe90.png",
    "voice/enrollment/reference_neutral_f5_8s.wav"
  ]) {
    copyFile(relative, relative);
  }

  writeText("topic.yaml", topicYaml());
  writeJson("script/voice_segments.json", segments.map((segment) => ({
    segment_id: segment.segment_id,
    start: segment.start,
    duration: segment.duration,
    text: segment.text,
    spoken_text: segment.spoken_text,
    claim_ids: segment.claim_ids
  })));
  writeText("script/voiceover.md", voiceoverMarkdown());
  writeText("script/pronunciation_normalization.md", pronunciationDoc());
  writeJson("storyboard/storyboard.json", storyboard().map(({ assets: _assets, ...scene }) => scene));
  writeJson("video_script/storyboard.json", storyboard());
  writeText("video_script/FRAME.md", frameContract());
  writeJson("visuals/assets_manifest.json", adjustedManifest());
  writeText("captions/subtitles.en-US.srt", buildSrt());
  writeText("captions/subtitles.en-US.vtt", buildVtt());
  writeText("captions/subtitles.en-US.youtube-shorts.ass", buildAss(1080, 1920));
  writeText("captions/subtitles.en-US.x-square.ass", buildAss(1080, 1080));
  writeText("captions/subtitles.srt", buildSrt());
  writeText("captions/subtitles.vtt", buildVtt());
  writeText("captions/subtitles.ass", buildAss(1080, 1920));
  writeJson("captions/caption_status.json", {
    status: "captions_ready",
    language: "en-US",
    generated_at: runtimeTimestamp,
    outputs: [
      "captions/subtitles.en-US.srt",
      "captions/subtitles.en-US.vtt",
      "captions/subtitles.en-US.youtube-shorts.ass",
      "captions/subtitles.en-US.x-square.ass"
    ],
    missing_inputs: []
  });
  writeJson("audio/indextts2/segments/segment_manifest.json", ttsManifest());
  for (const segment of segments) {
    writeText(`audio/indextts2/segments/${segment.segment_id}.txt`, `${segment.spoken_text}\n`);
  }
  writeJson("publish/platform_manifest.json", publishManifest());
  writePlatformProjects();
  writeJson("qa/english_asset_build_report.json", {
    status: "prepared",
    generated_at: runtimeTimestamp,
    episode_dir: "episodes/ep02_attention_qkv_en",
    source_episode_dir: "episodes/ep02_attention_qkv",
    total_duration_sec: totalDuration(),
    timing_source: timingSource,
    segments: segments.length,
    platforms: platforms.map((platform) => ({
      id: platform.id,
      video_path: finalVideoPath(platform),
      exists: fs.existsSync(path.join(episodeDir, finalVideoPath(platform)))
    })),
    no_chinese_materials_modified: true,
    next_steps: [
      "Human review the YouTube Shorts review render and X square review render.",
      "If publishing to X with a strict short-video limit, cut a shorter platform edit under 140 seconds.",
      "Only replace the static review render with the HyperFrames animated branch after scene-sync QA passes."
    ]
  });
  console.log(JSON.stringify({ status: "prepared", episode_dir: "episodes/ep02_attention_qkv_en", duration_sec: totalDuration(), segments: segments.length }, null, 2));
}

main();
