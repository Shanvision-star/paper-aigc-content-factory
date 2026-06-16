import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { episodeDirFromTopicPath, readJsonFile, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

const require = createRequire(import.meta.url);
const ffprobeStatic = require("ffprobe-static") as { path: string };

type SegmentManifest = {
  segments: Array<{
    segment_id: string;
    output_audio: string;
  }>;
};

type MergeOptions = {
  pauseMs: number;
  segmentSubdir?: string;
  outputRelative?: string;
  engine?: "f5_tts" | "indextts2";
};

const engineAudioDirs = {
  f5_tts: "audio/f5_tts",
  indextts2: "audio/indextts2"
} as const;

function ffmpegBinary(): string {
  return typeof ffmpegPath === "string" ? ffmpegPath : ffmpegPath.path;
}

function durationSec(filePath: string): number {
  const output = execFileSync(
    ffprobeStatic.path,
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" }
  ).trim();

  return Number(output);
}

function concatEscaped(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
}

export function mergeSegmentedAudio(topicPath: string, options: MergeOptions = { pauseMs: 90 }, rootDir = ".") {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const segmentSubdir = options.segmentSubdir ?? "segments";
  const outputRelative = options.outputRelative ?? "audio/voiceover.segmented.wav";
  const engine = options.engine ?? "f5_tts";
  const engineAudioDir = engineAudioDirs[engine];
  const segmentDir = path.join(episodeDir, engineAudioDir, segmentSubdir);
  const manifest = readJsonFile<SegmentManifest>(path.join(segmentDir, "segment_manifest.json"));
  const pausePath = path.join(segmentDir, `pause_${options.pauseMs}ms.wav`);
  const concatListPath = path.join(segmentDir, "concat_list.txt");
  const outputPath = path.join(episodeDir, outputRelative);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  execFileSync(ffmpegBinary(), [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=24000:cl=mono",
    "-t",
    String(options.pauseMs / 1000),
    "-acodec",
    "pcm_s16le",
    pausePath
  ], { stdio: "pipe" });

  const concatEntries = manifest.segments.flatMap((segment, index) => {
    const audioPath = path.join(episodeDir, segment.output_audio);

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Missing generated segment audio: ${segment.output_audio}`);
    }

    const entries = [`file '${concatEscaped(audioPath)}'`];
    if (index < manifest.segments.length - 1) {
      entries.push(`file '${concatEscaped(pausePath)}'`);
    }

    return entries;
  });

  fs.writeFileSync(concatListPath, `${concatEntries.join("\n")}\n`, "utf8");

  execFileSync(ffmpegBinary(), [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-acodec",
    "pcm_s16le",
    "-ar",
    "24000",
    "-ac",
    "1",
    outputPath
  ], { stdio: "pipe" });

  const segmentDurations = manifest.segments.map((segment) => ({
    segment_id: segment.segment_id,
    duration_sec: Number(durationSec(path.join(episodeDir, segment.output_audio)).toFixed(3))
  }));
  const result = {
    status: "merged",
    engine,
    generated_at: runtimeTimestamp,
    input_manifest: `${engineAudioDir}/${segmentSubdir}/segment_manifest.json`,
    output_audio: outputRelative.replace(/\\/g, "/"),
    pause_ms: options.pauseMs,
    duration_sec: Number(durationSec(outputPath).toFixed(3)),
    segments: segmentDurations
  };

  writeJson(path.join(segmentDir, "segmented_merge_report.json"), result);

  return result;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/audio_segment_merge.ts <topic.yaml> [--engine indextts2|f5_tts] [--pause-ms 90] [--segment-subdir segments] [--output audio/voiceover.segmented.wav]");
    return 1;
  }

  const pauseIndex = rest.indexOf("--pause-ms");
  const pauseMs = pauseIndex >= 0 ? Number(rest[pauseIndex + 1]) : 90;
  const engineIndex = rest.indexOf("--engine");
  const engine = engineIndex >= 0 ? rest[engineIndex + 1] : "f5_tts";
  if (engine !== "f5_tts" && engine !== "indextts2") {
    throw new Error("Invalid --engine. Expected indextts2 or f5_tts.");
  }
  const segmentSubdirIndex = rest.indexOf("--segment-subdir");
  const outputIndex = rest.indexOf("--output");
  const segmentSubdir = segmentSubdirIndex >= 0 ? rest[segmentSubdirIndex + 1] : undefined;
  const outputRelative = outputIndex >= 0 ? rest[outputIndex + 1] : undefined;

  console.log(JSON.stringify(mergeSegmentedAudio(topicPath, { pauseMs, segmentSubdir, outputRelative, engine })));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/audio_segment_merge.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
