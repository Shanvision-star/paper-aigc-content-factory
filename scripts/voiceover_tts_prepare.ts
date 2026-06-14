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
  engine_hint: "f5_tts_local_segmented";
  generated_at: string;
  source: string;
  text_hash: string;
  notes: string[];
  segments: PreparedTtsSegment[];
};

const termReplacements: Array<[RegExp, string]> = [
  [/\bClaude\b/g, "Claude"],
  [/\bChatGPT\b/g, "ChatGPT"],
  [/\bAI Agent\b/g, "AI Agent"],
  [/\bAgent\b/g, "Agent"],
  [/\bAttention Is All You Need\b/g, "Attention Is All You Need，中文可以理解成，注意力就是全部所需"],
  [/\bSelf-Attention\b/g, "自注意力，也就是 Self Attention"],
  [/\bMulti-Head Attention\b/g, "多头注意力，也就是 Multi Head Attention"],
  [/\bFlashAttention\b/g, "Flash Attention"],
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
  [/\bsoftmax\b/g, "soft max"],
  [/\bSora\b/g, "Sora"]
];

const chinesePronunciationReplacements: Array<[RegExp, string]> = [
  [/动态地(?=建立关系|建模|计算|汇聚|更新|调整|变化)/g, "以动态方式"]
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

  for (const [pattern, replacement] of termReplacements) {
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

export function prepareSegmentedTts(topicPath: string, rootDir = "."): PreparedTtsManifest {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const segmentDir = path.join(episodeDir, "audio/f5_tts/segments");
  const voiceSegments = readVoiceSegments(episodeDir);

  const segments = voiceSegments.map((segment) => {
    const spokenText = normalizeForTts(segment.text, segment.segment_id);
    const genFile = path.join("audio/f5_tts/segments", `${segment.segment_id}.txt`);
    const outputAudio = path.join("audio/f5_tts/segments", `${segment.segment_id}.wav`);

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
    engine_hint: "f5_tts_local_segmented",
    generated_at: runtimeTimestamp,
    source: "script/voice_segments.json",
    text_hash: hashText(segments.map((segment) => segment.spoken_text).join("\n")),
    notes: [
      "English words stay English; acronyms are spaced only when it improves pronunciation clarity.",
      "Numbers and technical formulas are rewritten into Chinese spoken forms.",
      "Chinese pronunciation disambiguation is applied before TTS; for example 动态地 uses the adverbial particle 地 pronounced de and may be rewritten as 以动态方式 in spoken_text.",
      "The source script is the only narration source; this step does not inject hidden cue phrases.",
      "Each scene is generated independently to avoid F5-TTS long-text batch repetition and boundary artifacts.",
      "Captions can keep the original display text while TTS uses the spoken_text field."
    ],
    segments
  };

  fs.mkdirSync(segmentDir, { recursive: true });
  writeJson(path.join(segmentDir, "segment_manifest.json"), manifest);

  return manifest;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/voiceover_tts_prepare.ts <topic.yaml>");
    return 1;
  }

  console.log(JSON.stringify(prepareSegmentedTts(topicPath)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/voiceover_tts_prepare.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
