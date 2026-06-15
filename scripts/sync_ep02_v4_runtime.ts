import fs from "node:fs";
import path from "node:path";
import { writeJson, writeText } from "./lib/runtimeAdapters.js";

type V4Scene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  engine: string;
  assets: string[];
  caption: string;
  claim_ids: string[];
};

const episodeDir = path.resolve("episodes/ep02_attention_qkv");
const videoScriptDir = path.join(episodeDir, "video_script");
const voiceoverV4Path = path.join(videoScriptDir, "douyin_voiceover_v4.md");
const runtimeVoiceoverPath = path.join(videoScriptDir, "douyin_voiceover.md");
const storyboardV4Path = path.join(videoScriptDir, "storyboard_v4.json");
const runtimeStoryboardPath = path.join(videoScriptDir, "storyboard.json");

function readStoryboard(): V4Scene[] {
  return JSON.parse(fs.readFileSync(storyboardV4Path, "utf8")) as V4Scene[];
}

export function syncEp02V4Runtime(): {
  status: "runtime_synced";
  episode_id: "ep02_attention_qkv";
  scenes: number;
  outputs: string[];
} {
  const voiceoverMarkdown = fs.readFileSync(voiceoverV4Path, "utf8");
  const scenes = readStoryboard();
  const runtimeScenes = scenes.map(({ assets: _assets, ...scene }) => scene);
  const outputs = [
    "script/voiceover.md",
    "script/voice_segments.json",
    "storyboard/storyboard.json",
    "video_script/douyin_voiceover.md",
    "video_script/storyboard.json",
    "audio/indextts2/full_voiceover_zh_v1.txt",
    "audio/f5_tts/full_voiceover_zh_v1.txt"
  ];

  writeText(path.join(episodeDir, "script/voiceover.md"), voiceoverMarkdown);
  writeText(runtimeVoiceoverPath, voiceoverMarkdown);
  writeJson(
    path.join(episodeDir, "script/voice_segments.json"),
    scenes.map((scene, index) => ({
      segment_id: `seg_${String(index + 1).padStart(3, "0")}`,
      start: scene.start,
      duration: scene.duration,
      text: scene.voiceover,
      claim_ids: scene.claim_ids
    }))
  );
  writeJson(runtimeStoryboardPath, scenes);
  writeJson(path.join(episodeDir, "storyboard/storyboard.json"), runtimeScenes);
  writeText(
    path.join(episodeDir, "audio/f5_tts/full_voiceover_zh_v1.txt"),
    `${scenes.map((scene) => scene.voiceover).join("\n\n")}\n`
  );
  writeText(
    path.join(episodeDir, "audio/indextts2/full_voiceover_zh_v1.txt"),
    `${scenes.map((scene) => scene.voiceover).join("\n\n")}\n`
  );

  return {
    status: "runtime_synced",
    episode_id: "ep02_attention_qkv",
    scenes: scenes.length,
    outputs
  };
}

function main(): void {
  console.log(JSON.stringify(syncEp02V4Runtime()));
}

main();
