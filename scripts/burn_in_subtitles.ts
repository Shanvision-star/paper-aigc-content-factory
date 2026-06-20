import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { preProductionContractMissingInputs } from "./lib/preProductionContracts.js";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

const require = createRequire(import.meta.url);

type BurnInSubtitlesResult = {
  status: "missing_inputs" | "rendered" | "render_failed";
  input_video: string;
  subtitle_file: string;
  output_video: string;
  exit_code: number | null;
  missing_inputs: string[];
};

function resolveFfmpegPath(): string {
  try {
    const ffmpeg = require("@ffmpeg-installer/ffmpeg") as { path?: string };

    if (ffmpeg.path && fs.existsSync(ffmpeg.path)) {
      return ffmpeg.path;
    }
  } catch {
    // Fall back to PATH below.
  }

  return "ffmpeg";
}

function slashPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function runBurnInSubtitles(
  topicPath: string,
  rootDir = ".",
  options: {
    inputVideo?: string;
    subtitleFile?: string;
    audioFile?: string;
    outputVideo?: string;
  } = {}
): BurnInSubtitlesResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const inputVideo = options.inputVideo ?? "renders/douyin_zh_1080x1920_draft.mp4";
  const subtitleFile = options.subtitleFile ?? "captions/subtitles.ass";
  const outputVideo = options.outputVideo ?? "renders/douyin_zh_1080x1920_subtitled.mp4";
  const statusPath = path.join(episodeDir, "renders/subtitle_burn_status.json");
  const missingInputs = [
    ...preProductionContractMissingInputs(episodeDir),
    ...[inputVideo, subtitleFile, options.audioFile].filter((relativePath): relativePath is string => Boolean(relativePath))
      .filter((relativePath) => !fs.existsSync(path.join(episodeDir, relativePath)))
  ];

  if (missingInputs.length > 0) {
    const result: BurnInSubtitlesResult = {
      status: "missing_inputs",
      input_video: inputVideo,
      subtitle_file: subtitleFile,
      output_video: outputVideo,
      exit_code: null,
      missing_inputs: missingInputs
    };

    writeJson(statusPath, { ...result, generated_at: runtimeTimestamp });
    return result;
  }

  const ffmpegPath = resolveFfmpegPath();
  const args = [
    "-y",
    "-i",
    slashPath(inputVideo),
    ...(options.audioFile ? ["-i", slashPath(options.audioFile)] : []),
    "-vf",
    `subtitles=${slashPath(subtitleFile)}`,
    ...(options.audioFile ? ["-map", "0:v:0", "-map", "1:a:0", "-c:a", "aac", "-b:a", "128k", "-shortest"] : ["-c:a", "copy"]),
    slashPath(outputVideo)
  ];
  const result = spawnSync(ffmpegPath, args, {
    cwd: episodeDir,
    encoding: "utf8",
    shell: false
  });
  const rendered = result.status === 0 && fs.existsSync(path.join(episodeDir, outputVideo));
  const summary: BurnInSubtitlesResult = {
    status: rendered ? "rendered" : "render_failed",
    input_video: inputVideo,
    subtitle_file: subtitleFile,
    output_video: outputVideo,
    exit_code: result.status,
    missing_inputs: []
  };

  writeJson(statusPath, {
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
    console.error("Usage: tsx scripts/burn_in_subtitles.ts <topic.yaml> [--input <video>] [--ass <file>] [--output <video>]");
    return 1;
  }

  const optionValue = (name: string): string | undefined => {
    const index = rest.indexOf(name);
    return index >= 0 ? rest[index + 1] : undefined;
  };
  const result = runBurnInSubtitles(topicPath, ".", {
    inputVideo: optionValue("--input"),
    subtitleFile: optionValue("--ass"),
    audioFile: optionValue("--audio"),
    outputVideo: optionValue("--output")
  });

  console.log(JSON.stringify(result));

  return result.status === "rendered" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/burn_in_subtitles.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
