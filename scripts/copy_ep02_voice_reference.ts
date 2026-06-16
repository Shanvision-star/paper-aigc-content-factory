import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./lib/runtimeAdapters.js";

const rootDir = path.resolve(".");
const sourceEpisodeDir = path.join(rootDir, "episodes/ep01_attention_is_all_you_need");
const targetEpisodeDir = path.join(rootDir, "episodes/ep02_attention_qkv");

const copies = [
  {
    from: "voice/enrollment/consent.wav",
    to: "voice/enrollment/consent.wav"
  },
  {
    from: "voice/enrollment/reference_neutral_f5_8s.wav",
    to: "voice/enrollment/reference_neutral_f5_8s.wav"
  },
  {
    from: "audio/f5_tts/reference_text_f5_neutral.txt",
    to: "audio/f5_tts/reference_text_f5_neutral.txt"
  }
];

const copied: string[] = [];
const missing: string[] = [];

for (const item of copies) {
  const sourcePath = path.join(sourceEpisodeDir, item.from);
  const targetPath = path.join(targetEpisodeDir, item.to);

  if (!fs.existsSync(sourcePath)) {
    missing.push(item.from);
    continue;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
  copied.push(item.to);
}

const result = {
  status: missing.length > 0 ? "missing_inputs" : "copied",
  source_episode: "ep01_attention_is_all_you_need",
  target_episode: "ep02_attention_qkv",
  copied,
  missing
};

writeJson(path.join(targetEpisodeDir, "voice/voice_reference_copy_report.json"), result);
console.log(JSON.stringify(result));

if (missing.length > 0) {
  process.exitCode = 1;
}
