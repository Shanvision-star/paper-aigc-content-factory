import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readTopic } from "./contracts.js";
import { episodeDirForTopic } from "./episodePaths.js";

export const runtimeTimestamp = new Date(0).toISOString();

export type VoiceSegment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  claim_ids: string[];
};

export type StoryboardScene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  engine: string;
  caption: string;
  claim_ids: string[];
  hook_id?: string;
};

export function episodeDirFromTopicPath(topicPath: string, rootDir = "."): string {
  const topic = readTopic(topicPath);

  return path.join(path.resolve(rootDir), episodeDirForTopic(topic));
}

export function writeText(filePath: string, value: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
}

export function writeJson(filePath: string, value: unknown): void {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function hashText(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function readVoiceSegments(episodeDir: string): VoiceSegment[] {
  return readJsonFile<VoiceSegment[]>(path.join(episodeDir, "script/voice_segments.json"));
}

export function readStoryboard(episodeDir: string): StoryboardScene[] {
  return readJsonFile<StoryboardScene[]>(path.join(episodeDir, "storyboard/storyboard.json"));
}

export function isValidWav(filePath: string): boolean {
  if (!fs.existsSync(filePath) || path.extname(filePath).toLowerCase() !== ".wav") {
    return false;
  }

  const header = fs.readFileSync(filePath, { flag: "r" }).subarray(0, 12);

  return header.length >= 12 && header.subarray(0, 4).toString("ascii") === "RIFF" && header.subarray(8, 12).toString("ascii") === "WAVE";
}

export function toEpisodeSlashPath(relativePath: string): string {
  return relativePath.replace(/\\/g, "/");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
