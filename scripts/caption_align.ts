import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  readVoiceSegments,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

export type CaptionAlignerResult = {
  status: "missing_audio" | "captions_ready";
  outputs: string[];
  missing_inputs: string[];
  readability_warnings?: string[];
};

function formatSrtTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const milliseconds = Math.round((seconds - whole) * 1000);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(",", ".");
}

function protectCaptionText(sourceText: string): string {
  return sourceText
    .replace(/Q 乘 K 转置/g, "QK^T（Q 乘 K 转置）")
    .replace(/根号下 d k/g, "√(d_k)")
    .replace(/根号 d k/g, "√(d_k)")
    .replace(/d k/g, "d_k")
    .replace(/d v/g, "d_v")
    .replace(/d model/g, "d_model")
    .replace(/KV\s*Cache/g, "KV Cache（Key-Value Cache）")
    .replace(/K 和 V/g, "Key 和 Value")
    .replace(/K\/V/g, "Key/Value")
    .replace(/ K，/g, " Key，")
    .replace(/ V。/g, " Value。")
    .replace(/Scaled Dot-Product Attention/g, "Scaled\u00A0Dot\u2011Product\u00A0Attention")
    .replace(/Self-Attention/g, "Self\u2011Attention")
    .replace(/Multi-Head Attention/g, "Multi\u2011Head\u00A0Attention")
    .replace(/Q Cache/g, "Q\u00A0Cache")
    .replace(/FlashAttention/g, "FlashAttention")
    .replace(/ChatGPT/g, "ChatGPT")
    .replace(/Claude/g, "Claude")
    .replace(/token/g, "token")
    .replace(/softmax/g, "softmax");
}

type TermFirstMentionRule = {
  id: string;
  pattern: RegExp;
  replacement: string;
};

const TERM_FIRST_MENTION_RULES: TermFirstMentionRule[] = [
  {
    id: "mha",
    pattern: /多头注意力/u,
    replacement: "MHA（多头注意力）"
  },
  {
    id: "wq",
    pattern: /Q 投影矩阵/u,
    replacement: "W Q（Q 投影矩阵）"
  },
  {
    id: "wk",
    pattern: /K 投影矩阵/u,
    replacement: "W K（K 投影矩阵）"
  },
  {
    id: "wv",
    pattern: /V 投影矩阵/u,
    replacement: "W V（V 投影矩阵）"
  },
  {
    id: "concat",
    pattern: /Concat(?![：:])/u,
    replacement: "Concat（拼接）"
  },
  {
    id: "wo",
    pattern: /输出投影矩阵 W O|矩阵 W O/u,
    replacement: "W O（输出投影矩阵）"
  },
  {
    id: "mqa",
    pattern: /多查询注意力/u,
    replacement: "MQA（多查询注意力）"
  },
  {
    id: "gqa",
    pattern: /分组查询注意力/u,
    replacement: "GQA（分组查询注意力）"
  },
  {
    id: "moe",
    pattern: /混合专家机制/u,
    replacement: "MoE（混合专家机制）"
  }
];

function enrichTermFirstMentions(entries: Array<{ start: number; end: number; text: string }>): Array<{ start: number; end: number; text: string }> {
  const seen = new Set<string>();

  return entries.map((entry) => {
    let text = entry.text;

    for (const rule of TERM_FIRST_MENTION_RULES) {
      if (!seen.has(rule.id) && rule.pattern.test(text)) {
        text = text.replace(rule.pattern, rule.replacement);
        seen.add(rule.id);
      }
    }

    return {
      ...entry,
      text
    };
  });
}

function displayWidth(value: string): number {
  let width = 0;

  for (const char of value) {
    width += /[\x00-\x7F\u00A0\u2011]/.test(char) ? 0.58 : 1;
  }

  return width;
}

function tokenizeCaption(value: string): string[] {
  return value.match(/KV Cache（Key-Value Cache）|Key-Value Cache|Scaled\u00A0Dot\u2011Product\u00A0Attention|Multi\u2011Head\u00A0Attention|Self\u2011Attention|[A-Za-z0-9_^()√.\u00A0\u2011-]+|./gu) ?? [];
}

function splitByWidth(value: string, maxWidth: number): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const token of tokenizeCaption(value)) {
    if (/^[。！？；：，,、）)]$/u.test(token)) {
      current = `${current}${token}`;
      continue;
    }

    const candidate = `${current}${token}`;

    if (current && displayWidth(candidate) > maxWidth) {
      chunks.push(current.trim());
      current = token.trimStart();
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function splitIntoReadableCaptions(text: string): string[] {
  const protectedText = protectCaptionText(text).replace(/\s+/g, " ").trim();
  const phrases = protectedText.match(/[^。！？；：，,、]+[。！？；：，,、]?/gu) ?? [protectedText];
  const captions: string[] = [];
  let current = "";
  const maxCaptionWidth = 18;

  for (const phrase of phrases.map((item) => item.trim()).filter(Boolean)) {
    const candidate = current ? `${current}${phrase}` : phrase;

    if (current && displayWidth(candidate) > maxCaptionWidth) {
      captions.push(...splitByWidth(current, maxCaptionWidth));
      current = phrase;
    } else {
      current = candidate;
    }
  }

  if (current) {
    captions.push(...splitByWidth(current, maxCaptionWidth));
  }

  return captions.map((caption) => caption.trim()).filter(Boolean);
}

function wrapCaptionForAss(text: string): string {
  if (displayWidth(text) <= 20) {
    return text;
  }

  const maxLineWidth = 18;
  const lines = splitByWidth(text, maxLineWidth);

  if (lines.length <= 2) {
    return lines.join("\\N");
  }

  return splitByWidth(text, 14).slice(0, 3).join("\\N");
}

function escapeAssText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}");
}

function formatAssTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const centiseconds = Math.floor((seconds - whole) * 100);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function buildShortCaptionEntries(segments: ReturnType<typeof readVoiceSegments>): Array<{ start: number; end: number; text: string }> {
  const entries: Array<{ start: number; end: number; text: string }> = [];

  for (const segment of segments) {
    const captions = splitIntoReadableCaptions(segment.text);
    const weights = captions.map((caption) => Math.max(displayWidth(caption), 1));
    const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
    let cursor = segment.start;

    captions.forEach((caption, index) => {
      const isLast = index === captions.length - 1;
      const proportionalDuration = segment.duration * (weights[index] / totalWeight);
      const end = isLast ? segment.start + segment.duration : Math.min(segment.start + segment.duration, cursor + proportionalDuration);

      entries.push({
        start: cursor,
        end,
        text: caption
      });

      cursor = end;
    });
  }

  return enrichTermFirstMentions(mergeShortCaptionEntries(entries));
}

function mergeShortCaptionEntries(entries: Array<{ start: number; end: number; text: string }>): Array<{ start: number; end: number; text: string }> {
  const merged: Array<{ start: number; end: number; text: string }> = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const duration = entry.end - entry.start;

    if (duration < 0.7 && entries[index + 1] && /[，：、]$/u.test(entry.text)) {
      entries[index + 1] = {
        ...entries[index + 1],
        start: entry.start,
        text: `${entry.text}${entries[index + 1].text}`
      };
      continue;
    }

    if (duration < 0.7 && merged.length > 0) {
      const previous = merged[merged.length - 1];
      merged[merged.length - 1] = {
        ...previous,
        end: entry.end,
        text: `${previous.text}${entry.text}`
      };
      continue;
    }

    merged.push(entry);
  }

  return merged;
}

function buildAss(entries: Array<{ start: number; end: number; text: string }>): string {
  const events = entries.map((entry) => {
    const text = escapeAssText(wrapCaptionForAss(entry.text));

    return `Dialogue: 0,${formatAssTime(entry.start)},${formatAssTime(entry.end)},Default,,0,0,0,,${text}`;
  });

  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1080",
    "PlayResY: 1920",
    "WrapStyle: 2",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,Microsoft YaHei,50,&H00FFFFFF,&H00FFFFFF,&HCC101820,&H66101820,-1,0,0,0,100,100,0,0,1,4,1,2,76,76,170,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...events,
    ""
  ].join("\n");
}

function buildReadabilityWarnings(entries: Array<{ start: number; end: number; text: string }>): string[] {
  return entries.flatMap((entry, index) => {
    const warnings: string[] = [];
    const duration = entry.end - entry.start;

    if (displayWidth(entry.text) > 34) {
      warnings.push(`caption_${index + 1}: display width may be too long`);
    }

    if (duration < 0.7) {
      warnings.push(`caption_${index + 1}: duration below 0.7s`);
    }

    return warnings;
  });
}

export function runCaptionAligner(topicPath: string, rootDir = "."): CaptionAlignerResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const audioPath = path.join(episodeDir, "audio/voiceover.wav");
  const captionDir = path.join(episodeDir, "captions");

  if (!fs.existsSync(audioPath)) {
    const result: CaptionAlignerResult = {
      status: "missing_audio",
      outputs: [],
      missing_inputs: ["audio/voiceover.wav"]
    };

    writeJson(path.join(captionDir, "caption_status.json"), {
      ...result,
      generated_at: runtimeTimestamp
    });

    return result;
  }

  const segments = readVoiceSegments(episodeDir);
  const shortCaptionEntries = buildShortCaptionEntries(segments);
  const srt = segments
    .map((segment, index) => [
      String(index + 1),
      `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.start + segment.duration)}`,
      protectCaptionText(segment.text),
      ""
    ].join("\n"))
    .join("\n");
  const vtt = [
    "WEBVTT",
    "",
    ...segments.flatMap((segment) => [
      `${formatVttTime(segment.start)} --> ${formatVttTime(segment.start + segment.duration)}`,
      protectCaptionText(segment.text),
      ""
    ])
  ].join("\n");
  const shortSrt = shortCaptionEntries
    .map((entry, index) => [
      String(index + 1),
      `${formatSrtTime(entry.start)} --> ${formatSrtTime(entry.end)}`,
      entry.text,
      ""
    ].join("\n"))
    .join("\n");
  const shortVtt = [
    "WEBVTT",
    "",
    ...shortCaptionEntries.flatMap((entry) => [
      `${formatVttTime(entry.start)} --> ${formatVttTime(entry.end)}`,
      entry.text,
      ""
    ])
  ].join("\n");
  const ass = buildAss(shortCaptionEntries);
  const readabilityWarnings = buildReadabilityWarnings(shortCaptionEntries);

  writeText(path.join(captionDir, "subtitles.srt"), srt);
  writeText(path.join(captionDir, "subtitles.vtt"), vtt);
  writeText(path.join(captionDir, "subtitles.short.srt"), shortSrt);
  writeText(path.join(captionDir, "subtitles.short.vtt"), shortVtt);
  writeText(path.join(captionDir, "subtitles.ass"), ass);

  const result: CaptionAlignerResult = {
    status: "captions_ready",
    outputs: [
      "captions/subtitles.srt",
      "captions/subtitles.vtt",
      "captions/subtitles.short.srt",
      "captions/subtitles.short.vtt",
      "captions/subtitles.ass"
    ],
    missing_inputs: [],
    readability_warnings: readabilityWarnings
  };

  writeJson(path.join(captionDir, "caption_status.json"), {
    ...result,
    generated_at: runtimeTimestamp
  });

  return result;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/caption_align.ts <topic.yaml>");
    return 1;
  }

  console.log(JSON.stringify(runCaptionAligner(topicPath)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/caption_align.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
