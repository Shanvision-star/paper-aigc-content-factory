import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  readJsonFile,
  readVoiceSegments,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

type VoiceSegment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  claim_ids: string[];
};

type MergeReport = {
  status: "merged";
  pause_ms: number;
  duration_sec: number;
  output_audio: string;
  segments: Array<{
    segment_id: string;
    duration_sec: number;
  }>;
};

type CaptionEntry = {
  index: number;
  segment_id: string;
  start: number;
  end: number;
  main: string;
  support: string;
};

const termNotes: Array<{ id: string; pattern: RegExp; support: string }> = [
  { id: "rope_full", pattern: /Rotary Position Embedding/i, support: "Rotary Position Embedding = RoPE 全称" },
  { id: "rope", pattern: /\bRoPE\b/i, support: "RoPE = 旋转位置编码" },
  { id: "attention", pattern: /\bAttention\b/i, support: "Attention = 按关系加权读取信息" },
  { id: "pe", pattern: /\bPE\b|Positional Encoding/i, support: "PE = 位置编码" },
  { id: "qk", pattern: /\bQ\/K\b|\bQ 和 K\b|\bQ\b.*\bK\b/i, support: "Q/K = Query/Key，查询/键向量" },
  { id: "d_model", pattern: /\bd_model\b|\bd model\b/i, support: "d model = 模型表示维度" },
  { id: "theta", pattern: /θ_i|theta 下标 i/i, support: "θ_i = 第 i 个二维块的旋转频率" },
  { id: "relative", pattern: /n\s*-\s*m|n 减 m/i, support: "n - m = 两个 token 的相对位移" },
  { id: "partial_rope", pattern: /Partial RoPE/i, support: "Partial RoPE = 部分维度使用 RoPE" },
  { id: "kv_cache", pattern: /KV cache/i, support: "KV cache = 缓存 Key/Value 复用计算" }
];

function round3(value: number): number {
  return Number(value.toFixed(3));
}

function visibleLength(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + (/[A-Za-z0-9_/-]/.test(char) ? 0.55 : 1), 0);
}

function splitLongClause(clause: string, maxWidth = 24): string[] {
  const chars = Array.from(clause.trim());
  const chunks: string[] = [];
  let current = "";

  for (const char of chars) {
    const next = current + char;
    if (current && visibleLength(next) > maxWidth) {
      const breakAt = current.lastIndexOf(" ");
      if (breakAt >= 4) {
        chunks.push(current.slice(0, breakAt).trim());
        current = `${current.slice(breakAt + 1)}${char}`;
      } else {
        chunks.push(current.trim());
        current = char;
      }
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function splitCaptionText(text: string): string[] {
  const normalized = text
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const rough = normalized
    .split(/(?<=[。！？?])|(?<=[；;])|(?<=，)|(?<=：)/u)
    .map((item) => item.trim())
    .filter(Boolean);
  const chunks: string[] = [];

  for (const item of rough) {
    if (visibleLength(item) <= 28) {
      chunks.push(item);
    } else {
      chunks.push(...splitLongClause(item));
    }
  }

  return chunks.length > 0 ? chunks : [normalized];
}

function supportFor(text: string, seen: Set<string>): string {
  for (const note of termNotes) {
    if (!seen.has(note.id) && note.pattern.test(text)) {
      seen.add(note.id);
      return note.support;
    }
  }

  return "";
}

function timingsFromMergeReport(segments: VoiceSegment[], report: MergeReport): VoiceSegment[] {
  const pauseSec = report.pause_ms / 1000;
  let cursor = 0;

  return segments.map((segment, index) => {
    const timing = report.segments[index];
    if (!timing || timing.segment_id !== segment.segment_id) {
      throw new Error(`Caption timing mismatch at ${segment.segment_id}: merge report segment order changed.`);
    }

    const duration = timing.duration_sec + (index < segments.length - 1 ? pauseSec : 0);
    const timedSegment = {
      ...segment,
      start: round3(cursor),
      duration: round3(duration)
    };
    cursor += duration;
    return timedSegment;
  });
}

function buildEntries(segments: VoiceSegment[]): CaptionEntry[] {
  const entries: CaptionEntry[] = [];
  const seenTerms = new Set<string>();

  for (const segment of segments) {
    const chunks = splitCaptionText(segment.text);
    const weights = chunks.map((chunk) => Math.max(4, visibleLength(chunk)));
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    let cursor = segment.start;

    chunks.forEach((chunk, chunkIndex) => {
      const isLast = chunkIndex === chunks.length - 1;
      const rawDuration = isLast
        ? segment.start + segment.duration - cursor
        : segment.duration * (weights[chunkIndex] / totalWeight);
      const duration = Math.max(0.72, rawDuration);
      const segmentEnd = segment.start + segment.duration;
      const allocatedEnd = isLast ? segmentEnd : Math.min(segmentEnd, cursor + duration);
      const minimumEnd = Math.min(segmentEnd, cursor + 0.72);
      const end = Math.min(segmentEnd, Math.max(minimumEnd, allocatedEnd));

      entries.push({
        index: entries.length + 1,
        segment_id: segment.segment_id,
        start: round3(cursor),
        end: round3(end),
        main: chunk,
        support: supportFor(chunk, seenTerms)
      });
      cursor = end;
    });
  }

  return entries;
}

function formatSrtTime(seconds: number): string {
  const ms = Math.round(seconds * 1000);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(",", ".");
}

function buildSrt(entries: CaptionEntry[]): string {
  return `${entries
    .map((entry, index) => [
      String(index + 1),
      `${formatSrtTime(entry.start)} --> ${formatSrtTime(entry.end)}`,
      entry.support ? `${entry.main}\n${entry.support}` : entry.main,
      ""
    ].join("\n"))
    .join("\n")}\n`;
}

function buildVtt(entries: CaptionEntry[]): string {
  return `WEBVTT\n\n${entries
    .map((entry) => [
      `${formatVttTime(entry.start)} --> ${formatVttTime(entry.end)}`,
      entry.support ? `${entry.main}\n${entry.support}` : entry.main,
      ""
    ].join("\n"))
    .join("\n")}\n`;
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

export function buildEp05DynamicCaptions(topicPath: string, args: string[] = [], rootDir = ".") {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const timingReport = argValue(args, "--timing-report");
  let segments = readVoiceSegments(episodeDir);

  if (timingReport) {
    const reportPath = path.join(episodeDir, timingReport);
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Missing timing report: ${timingReport}`);
    }
    segments = timingsFromMergeReport(segments, readJsonFile<MergeReport>(reportPath));
  }

  const entries = buildEntries(segments);
  const captionsDir = path.join(episodeDir, "captions");

  writeJson(path.join(captionsDir, "caption_entries.json"), entries);
  writeText(path.join(captionsDir, "subtitles.srt"), buildSrt(entries));
  writeText(path.join(captionsDir, "subtitles.vtt"), buildVtt(entries));
  writeJson(path.join(captionsDir, "caption_status.json"), {
    status: "dynamic_captions_ready",
    generated_at: runtimeTimestamp,
    source: "script/voice_segments.json",
    timing_report: timingReport ?? null,
    entries: entries.length,
    policy: "Dynamic captions are split from reviewed voiceover text, not summarized prompt cards. Term notes appear only on first relevant occurrence."
  });

  return {
    status: "dynamic_captions_ready",
    entries: entries.length,
    outputs: [
      "captions/caption_entries.json",
      "captions/subtitles.srt",
      "captions/subtitles.vtt",
      "captions/caption_status.json"
    ]
  };
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;
  if (!topicPath) {
    console.error("Usage: tsx scripts/build_ep05_dynamic_captions.ts <topic.yaml> [--timing-report audio/indextts2/segments/segmented_merge_report.json]");
    return 1;
  }

  console.log(JSON.stringify(buildEp05DynamicCaptions(topicPath, rest)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/build_ep05_dynamic_captions.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
