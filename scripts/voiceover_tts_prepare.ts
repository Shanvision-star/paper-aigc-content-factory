import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  hashText,
  readVoiceSegments,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

type PreparedTtsSegment = {
  segment_id: string;
  source_text: string;
  spoken_text: string;
  focus_terms: string[];
  gen_file: string;
  output_audio: string;
};

type PreparedTtsManifest = {
  status: "prepared";
  engine_hint: "f5_tts_local_segmented" | "indextts2_local_segmented";
  generated_at: string;
  source: string;
  text_hash: string;
  notes: string[];
  segments: PreparedTtsSegment[];
};

type TtsPrepareEngine = "f5_tts" | "indextts2";

type EngineConfig = {
  engine_hint: PreparedTtsManifest["engine_hint"];
  segment_dir: string;
  output_dir: string;
  output_audio_dir: string;
};

const engineConfigs: Record<TtsPrepareEngine, EngineConfig> = {
  f5_tts: {
    engine_hint: "f5_tts_local_segmented",
    segment_dir: "audio/f5_tts/segments",
    output_dir: "audio/f5_tts/segments",
    output_audio_dir: "audio/f5_tts/segments"
  },
  indextts2: {
    engine_hint: "indextts2_local_segmented",
    segment_dir: "audio/indextts2/segments",
    output_dir: "audio/indextts2/segments",
    output_audio_dir: "audio/indextts2/segments"
  }
};

const termReplacements: Array<[RegExp, string]> = [
  [/\bQK\^T\b/g, "Q 乘 K 转置"],
  [/sqrt\(d_k\)/g, "根号下 d k"],
  [/\bd_k\b/g, "d k"],
  [/\bClaude\b/g, "Claude"],
  [/\bChatGPT\b/g, "ChatGPT"],
  [/\bAI Agent\b/g, "AI Agent"],
  [/\bAgent\b/g, "Agent"],
  [/\bAttention Is All You Need\b/g, "Attention Is All You Need"],
  [/\bSelf-Attention\b/g, "Self Attention"],
  [/\bMulti-Head Attention\b/g, "Multi Head Attention"],
  [/\bFlashAttention\b/g, "FlashAttention"],
  [/\bKV Cache\b/g, "KV Cache"],
  [/\bvLLM\b/g, "vLLM"],
  [/\bMCP\b/g, "MCP"],
  [/\bBERT\b/g, "BERT"],
  [/\bGPT\b/g, "GPT"],
  [/\bGQA\b/g, "GQA"],
  [/\bMLA\b/g, "MLA"],
  [/\bMoE\b/g, "MoE"],
  [/\bRoPE\b/g, "RoPE"],
  [/\bYaRN\b/g, "YaRN"],
  [/\bALiBi\b/g, "ALiBi"],
  [/\bQK\b/g, "Q K"],
  [/\bQ、K、V\b/g, "Q，K，V"],
  [/\bsoftmax\b/g, "softmax"],
  [/\bSora\b/g, "Sora"]
];

const chinesePronunciationReplacements: Array<[RegExp, string]> = [
  [/更准确地说/g, "准确一点说"],
  [/“它”/g, "它"],
  [/根号\s*d\s*k/g, "根号下 d k"],
  [/动态地(?=建立关系|建模|计算|汇聚|更新|调整|变化|生成)/g, "以动态方式"],
  [/一个\s*token\s*，?\s*一个\s*token\s*地往后生成/g, "逐个 token 往后生成"],
  [/按行归一化/g, "对每个当前 token 的那一组分数分别做归一化"],
  [/一整行注意力权重/g, "一组注意力权重"],
  [/这一行权重/g, "这一组权重"],
  [/重新算/g, "从头再算"],
  [/重复计算/g, "一遍又一遍计算"],
  [/神奇地理解一句话/g, "模型突然就理解了这句话"]
];

const englishPronunciationStabilityReplacements: Array<[RegExp, string]> = [
  [/当\s*ChatGPT\s*或\s*Claude\s*生成回答时/g, "当 ChatGPT，或者 Claude，生成回答时"],
  [/逐个\s*token\s*往后生成/g, "逐个 token，往后生成"],
  [/每生成一个新\s*token/g, "每生成一个新的 token"]
];

const formulaLetterPronunciationReplacements: Array<[RegExp, string]> = [
  // F5-TTS sometimes reads the standalone formula letter K as "kai".
  // Use "Kay" only in spoken_text; captions and visual formulas still display K.
  [/(?<![A-Za-z])K(?![A-Za-z])/g, "Kay"]
];

const focusTermPatterns: Array<[RegExp, string]> = [
  [/\bAttention Is All You Need\b/i, "paper_title"],
  [/\bTransformer\b/i, "transformer"],
  [/\bSelf-Attention\b/i, "self_attention"],
  [/\bQ、K、V\b/i, "qkv"],
  [/\bsoftmax\b/i, "softmax"],
  [/\bMulti-Head Attention\b/i, "multi_head_attention"],
  [/\bBERT\b|\bGPT\b|\bClaude\b|\bSora\b|\bMCP\b/i, "modern_ai_connection"],
  [/\bFlashAttention\b|\bKV Cache\b|\bvLLM\b/i, "inference_optimization"],
  [/2017/, "year_2017"]
];

function normalizeNumbers(sourceText: string): string {
  return sourceText
    .replace(/2017\s*年/g, "二零一七年")
    .replace(/O\(n²\)/g, "O N 平方")
    .replace(/O\(n\^2\)/g, "O N 平方")
    .replace(/3\s*分钟/g, "三分钟");
}

function detectFocusTerms(sourceText: string): string[] {
  return focusTermPatterns
    .filter(([pattern]) => pattern.test(sourceText))
    .map(([, term]) => term);
}

export function normalizeForTts(sourceText: string, segmentId?: string): string {
  let text = normalizeNumbers(sourceText);

  for (const [pattern, replacement] of chinesePronunciationReplacements) {
    text = text.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of englishPronunciationStabilityReplacements) {
    text = text.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of termReplacements) {
    text = text.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of formulaLetterPronunciationReplacements) {
    text = text.replace(pattern, replacement);
  }

  text = text
    .replace(/：/g, "： ")
    .replace(/。/g, "。 ")
    .replace(/？/g, "？ ")
    .replace(/！/g, "！ ")
    .replace(/，/g, "， ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

export function prepareSegmentedTts(topicPath: string, rootDir = ".", engine: TtsPrepareEngine = "indextts2"): PreparedTtsManifest {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const engineConfig = engineConfigs[engine];
  const segmentDir = path.join(episodeDir, engineConfig.segment_dir);
  const voiceSegments = readVoiceSegments(episodeDir);

  const segments = voiceSegments.map((segment) => {
    const spokenText = normalizeForTts(segment.text, segment.segment_id);
    const genFile = path.join(engineConfig.output_dir, `${segment.segment_id}.txt`);
    const outputAudio = path.join(engineConfig.output_audio_dir, `${segment.segment_id}.wav`);

    writeText(path.join(episodeDir, genFile), `${spokenText}\n`);

    return {
      segment_id: segment.segment_id,
      source_text: segment.text,
      spoken_text: spokenText,
      focus_terms: detectFocusTerms(segment.text),
      gen_file: genFile.replace(/\\/g, "/"),
      output_audio: outputAudio.replace(/\\/g, "/")
    };
  });

  const manifest: PreparedTtsManifest = {
    status: "prepared",
    engine_hint: engineConfig.engine_hint,
    generated_at: runtimeTimestamp,
    source: "script/voice_segments.json",
    text_hash: hashText(segments.map((segment) => segment.spoken_text).join("\n")),
    notes: [
      "English words stay English; acronyms are spaced only when it improves pronunciation clarity.",
      "Numbers and technical formulas are rewritten into Chinese spoken forms.",
      "Chinese pronunciation disambiguation is applied before TTS; for example 动态地 uses the adverbial particle 地 pronounced de and may be rewritten as 以动态方式 in spoken_text.",
      "The source script is the only narration source; this step does not inject hidden cue phrases.",
      "Each scene is generated independently to avoid long-text batch repetition and boundary artifacts.",
      "Captions can keep the original display text while TTS uses the spoken_text field."
    ],
    segments
  };

  fs.mkdirSync(segmentDir, { recursive: true });
  writeJson(path.join(segmentDir, "segment_manifest.json"), manifest);

  return manifest;
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  return index >= 0 ? args[index + 1] : undefined;
}

function parseEngine(args: string[]): TtsPrepareEngine {
  const engine = argValue(args, "--engine") ?? "indextts2";

  if (engine !== "f5_tts" && engine !== "indextts2") {
    throw new Error(`Unsupported TTS prepare engine: ${engine}`);
  }

  return engine;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/voiceover_tts_prepare.ts <topic.yaml> [--engine indextts2|f5_tts]");
    return 1;
  }

  console.log(JSON.stringify(prepareSegmentedTts(topicPath, ".", parseEngine(rest))));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/voiceover_tts_prepare.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
