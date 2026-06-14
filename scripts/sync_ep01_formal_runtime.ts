import fs from "node:fs";
import path from "node:path";
import { writeJson, writeText } from "./lib/runtimeAdapters.js";

type FormalScene = {
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

const episodeDir = path.resolve("episodes/ep01_attention_is_all_you_need");
const videoScriptDir = path.join(episodeDir, "video_script");
const formalVoiceoverPath = path.join(videoScriptDir, "douyin_voiceover.md");
const formalStoryboardPath = path.join(videoScriptDir, "storyboard.json");

function readFormalStoryboard(): FormalScene[] {
  return JSON.parse(fs.readFileSync(formalStoryboardPath, "utf8")) as FormalScene[];
}

function main(): void {
  const voiceoverMarkdown = fs.readFileSync(formalVoiceoverPath, "utf8");
  const scenes = readFormalStoryboard();

  writeText(path.join(episodeDir, "script/voiceover.md"), voiceoverMarkdown);
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
  writeJson(
    path.join(episodeDir, "storyboard/storyboard.json"),
    scenes.map(({ assets: _assets, ...scene }) => scene)
  );
  writeText(
    path.join(episodeDir, "audio/f5_tts/full_voiceover_zh_v1.txt"),
    `${scenes.map((scene) => scene.voiceover).join("\n\n")}\n`
  );

  console.log(JSON.stringify({
    status: "runtime_synced",
    scenes: scenes.length,
    outputs: [
      "script/voiceover.md",
      "script/voice_segments.json",
      "storyboard/storyboard.json",
      "audio/f5_tts/full_voiceover_zh_v1.txt"
    ]
  }));
}

main();
