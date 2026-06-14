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
  const srt = segments
    .map((segment, index) => [
      String(index + 1),
      `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.start + segment.duration)}`,
      segment.text,
      ""
    ].join("\n"))
    .join("\n");
  const vtt = [
    "WEBVTT",
    "",
    ...segments.flatMap((segment) => [
      `${formatVttTime(segment.start)} --> ${formatVttTime(segment.start + segment.duration)}`,
      segment.text,
      ""
    ])
  ].join("\n");

  writeText(path.join(captionDir, "subtitles.srt"), srt);
  writeText(path.join(captionDir, "subtitles.vtt"), vtt);

  const result: CaptionAlignerResult = {
    status: "captions_ready",
    outputs: ["captions/subtitles.srt", "captions/subtitles.vtt"],
    missing_inputs: []
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
