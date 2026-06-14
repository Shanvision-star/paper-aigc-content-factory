import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

const require = createRequire(import.meta.url);

export type AudioPostprocessResult = {
  status: "processed" | "missing_input" | "failed";
  input_audio: string;
  output_audio: string;
  filter_chain: string;
  exit_code: number | null;
};

const filterChain = [
  "highpass=f=80",
  "lowpass=f=7600",
  "afftdn=nr=24:nf=-30:nt=w",
  "acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80",
  "alimiter=limit=0.92",
  "loudnorm=I=-16:TP=-1.5:LRA=11"
].join(",");

function ffmpegPath(): string {
  try {
    const ffmpeg = require("@ffmpeg-installer/ffmpeg") as { path?: string };
    if (ffmpeg.path && fs.existsSync(ffmpeg.path)) {
      return ffmpeg.path;
    }
  } catch {
    // Fall through to PATH lookup.
  }

  return "ffmpeg";
}

export function runAudioPostprocess(topicPath: string, rootDir = "."): AudioPostprocessResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const inputRelative = process.env.AUDIO_POSTPROCESS_INPUT ?? "audio/f5_tts/attention_full_voiceover_f5_v1.wav";
  const outputRelative = "audio/voiceover.postprocessed.wav";
  const inputPath = path.join(episodeDir, inputRelative);
  const outputPath = path.join(episodeDir, outputRelative);

  if (!fs.existsSync(inputPath)) {
    const result: AudioPostprocessResult = {
      status: "missing_input",
      input_audio: inputRelative,
      output_audio: outputRelative,
      filter_chain: filterChain,
      exit_code: null
    };

    writeJson(path.join(episodeDir, "audio/audio_postprocess_report.json"), {
      ...result,
      generated_at: runtimeTimestamp
    });

    return result;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = spawnSync(ffmpegPath(), [
    "-y",
    "-i",
    inputPath,
    "-af",
    filterChain,
    "-ar",
    "24000",
    "-ac",
    "1",
    outputPath
  ], {
    cwd: path.resolve(rootDir),
    encoding: "utf8",
    shell: false
  });

  const status: AudioPostprocessResult["status"] = result.status === 0 && fs.existsSync(outputPath) ? "processed" : "failed";
  const summary: AudioPostprocessResult = {
    status,
    input_audio: inputRelative,
    output_audio: outputRelative,
    filter_chain: filterChain,
    exit_code: result.status
  };

  writeJson(path.join(episodeDir, "audio/audio_postprocess_report.json"), {
    ...summary,
    generated_at: runtimeTimestamp,
    stdout_tail: result.stdout?.slice(-2000) ?? "",
    stderr_tail: result.stderr?.slice(-2000) ?? "",
    error: result.error?.message ?? null
  });

  return summary;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/audio_postprocess.ts <topic.yaml> [--input audio/path.wav]");
    return 1;
  }

  const inputIndex = rest.indexOf("--input");
  if (inputIndex >= 0) {
    process.env.AUDIO_POSTPROCESS_INPUT = rest[inputIndex + 1];
  }

  const result = runAudioPostprocess(topicPath);
  console.log(JSON.stringify(result));

  return result.status === "failed" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/audio_postprocess.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
