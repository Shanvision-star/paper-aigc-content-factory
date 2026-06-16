import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  readJsonFile,
  runtimeTimestamp,
  writeJson
} from "./lib/runtimeAdapters.js";

type PreparedTtsSegment = {
  segment_id: string;
  spoken_text: string;
};

type SegmentManifest = {
  segments: PreparedTtsSegment[];
};

type TranscriptSegment = {
  segment_id: string;
  transcript: string;
};

type TranscriptFile = {
  engine?: string;
  segments: TranscriptSegment[];
};

type AsrDiffStatus = "pass" | "failed" | "asr_missing";
type TtsGateEngine = "f5_tts" | "indextts2";

export type AsrTranscriptIssue = {
  segment_id: string;
  kind: "missing_transcript" | "transcript_distance" | "leak_prone_phrase";
  detail: string;
};

export type AsrTranscriptDiffResult = {
  status: AsrDiffStatus;
  engine: TtsGateEngine;
  manifest_file: string;
  transcript_file: string;
  checked_segment_ids: string[];
  issues: AsrTranscriptIssue[];
  warnings: string[];
};

type AsrDiffOptions = {
  transcriptPath?: string;
  sampleSegmentIds?: string[];
  allowMissingAsr?: boolean;
  maxDistanceRatio?: number;
  engine?: TtsGateEngine;
};

const defaultTranscriptPath = "audio/asr/sample_transcripts.json";
const engineManifests: Record<TtsGateEngine, string> = {
  f5_tts: "audio/f5_tts/segments/segment_manifest.json",
  indextts2: "audio/indextts2/segments/segment_manifest.json"
};
const leakPronePhrases = [
  "为什么重要",
  "最后看它为什么重要",
  "改变了模型阅读序列的方式",
  "改变了模型理解语言的方式"
];

function normalizeText(value: string): string {
  return value
    .replace(/\bChat\s*G\s*P\s*T\b/gi, "chatgpt")
    .replace(/\bG\s*P\s*T\b/gi, "gpt")
    .replace(/\bQ\s*K\b/gi, "qk")
    .replace(/\bK\s*V\b/gi, "kv")
    .replace(/\s+/g, "")
    .replace(/[，。！？：；、“”《》（）,.!?;:'"()[\]\-·]/g, "")
    .toLowerCase();
}

function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function distanceRatio(expected: string, actual: string): number {
  const normalizedExpected = normalizeText(expected);
  const normalizedActual = normalizeText(actual);
  const denominator = Math.max(normalizedExpected.length, normalizedActual.length, 1);

  return levenshteinDistance(normalizedExpected, normalizedActual) / denominator;
}

function selectedSegmentIds(manifest: SegmentManifest, options: AsrDiffOptions): string[] {
  if (options.sampleSegmentIds && options.sampleSegmentIds.length > 0) {
    return options.sampleSegmentIds;
  }

  return manifest.segments.map((segment) => segment.segment_id);
}

function detectEngine(episodeDir: string, requestedEngine?: TtsGateEngine): TtsGateEngine {
  if (requestedEngine) {
    return requestedEngine;
  }

  return fs.existsSync(path.join(episodeDir, engineManifests.indextts2)) ? "indextts2" : "f5_tts";
}

export function runAsrTranscriptDiffGate(
  topicPath: string,
  rootDir = ".",
  options: AsrDiffOptions = {}
): AsrTranscriptDiffResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const engine = detectEngine(episodeDir, options.engine);
  const manifestFile = engineManifests[engine];
  const transcriptFile = options.transcriptPath ?? defaultTranscriptPath;
  const transcriptFullPath = path.join(episodeDir, transcriptFile);
  const warnings: string[] = [];

  if (!fs.existsSync(transcriptFullPath)) {
    warnings.push(`Missing ASR transcript file: ${transcriptFile}`);
    const result: AsrTranscriptDiffResult = {
      status: "asr_missing",
      engine,
      manifest_file: manifestFile,
      transcript_file: transcriptFile,
      checked_segment_ids: options.sampleSegmentIds ?? [],
      issues: [],
      warnings
    };
    writeJson(path.join(episodeDir, "audio/asr/transcript_diff_report.json"), {
      ...result,
      allow_missing_asr: options.allowMissingAsr ?? false,
      generated_at: runtimeTimestamp
    });

    return result;
  }

  const manifest = readJsonFile<SegmentManifest>(path.join(episodeDir, manifestFile));
  const transcripts = readJsonFile<TranscriptFile>(transcriptFullPath);
  const segmentsById = new Map(manifest.segments.map((segment) => [segment.segment_id, segment]));
  const transcriptsById = new Map(transcripts.segments.map((segment) => [segment.segment_id, segment.transcript]));
  const checkedSegmentIds = selectedSegmentIds(manifest, options);
  const maxDistanceRatio = options.maxDistanceRatio ?? 0.28;
  const issues: AsrTranscriptIssue[] = [];

  for (const segmentId of checkedSegmentIds) {
    const segment = segmentsById.get(segmentId);
    const transcript = transcriptsById.get(segmentId);

    if (!segment) {
      continue;
    }

    if (!transcript) {
      issues.push({
        segment_id: segmentId,
        kind: "missing_transcript",
        detail: "No ASR transcript found for segment."
      });
      continue;
    }

    const leakHits = leakPronePhrases.filter((phrase) => transcript.includes(phrase));
    for (const phrase of leakHits) {
      issues.push({
        segment_id: segmentId,
        kind: "leak_prone_phrase",
        detail: `Transcript contains leak-prone phrase: ${phrase}`
      });
    }

    const ratio = distanceRatio(segment.spoken_text, transcript);
    if (ratio > maxDistanceRatio) {
      issues.push({
        segment_id: segmentId,
        kind: "transcript_distance",
        detail: `Transcript differs from spoken_text. distance_ratio=${ratio.toFixed(3)} threshold=${maxDistanceRatio}`
      });
    }
  }

  const result: AsrTranscriptDiffResult = {
    status: issues.length > 0 ? "failed" : "pass",
    engine,
    manifest_file: manifestFile,
    transcript_file: transcriptFile,
    checked_segment_ids: checkedSegmentIds,
    issues,
    warnings
  };

  writeJson(path.join(episodeDir, "audio/asr/transcript_diff_report.json"), {
    ...result,
    generated_at: runtimeTimestamp
  });

  return result;
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  return index >= 0 ? args[index + 1] : undefined;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/asr_transcript_diff_gate.ts <topic.yaml> [--engine indextts2|f5_tts] [--transcript audio/asr/sample_transcripts.json] [--sample-ids seg_001,seg_010,seg_014] [--allow-missing-asr]");
    return 1;
  }

  const sampleIds = argValue(rest, "--sample-ids")?.split(",").map((value) => value.trim()).filter(Boolean);
  const allowMissingAsr = rest.includes("--allow-missing-asr");
  const engineArg = argValue(rest, "--engine");
  if (engineArg && engineArg !== "f5_tts" && engineArg !== "indextts2") {
    console.error("Invalid --engine. Expected indextts2 or f5_tts.");
    return 1;
  }
  const engine = engineArg as TtsGateEngine | undefined;

  const result = runAsrTranscriptDiffGate(topicPath, ".", {
    transcriptPath: argValue(rest, "--transcript"),
    sampleSegmentIds: sampleIds,
    allowMissingAsr,
    engine
  });

  console.log(JSON.stringify(result));
  if (result.status === "pass" || (result.status === "asr_missing" && allowMissingAsr)) {
    return 0;
  }

  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/asr_transcript_diff_gate.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
