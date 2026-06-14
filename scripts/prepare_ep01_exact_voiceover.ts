import fs from "node:fs";
import path from "node:path";
import { episodeDirFromTopicPath, hashText, writeJson, writeText } from "./lib/runtimeAdapters.js";

const topicPath = "episodes/ep01_attention_is_all_you_need/topic.yaml";
const episodeDir = episodeDirFromTopicPath(topicPath);
const segmentSubdir = "exact_segments";
const segmentDir = path.join(episodeDir, "audio/f5_tts", segmentSubdir);
const formalVoiceoverPath = path.join(episodeDir, "video_script/douyin_voiceover.md");

function extractVoiceover(markdown: string): string {
  const marker = "## Voiceover";
  const markerIndex = markdown.indexOf(marker);
  const body = markerIndex >= 0 ? markdown.slice(markerIndex + marker.length) : markdown;

  return body
    .split(/\n/)
    .filter((line) => !line.trim().startsWith("### "))
    .join("\n")
    .trim();
}

const exactVoiceover = extractVoiceover(fs.readFileSync(formalVoiceoverPath, "utf8"));

const blocks = exactVoiceover
  .trim()
  .split(/\n\s*\n/g)
  .map((block) => block.trim())
  .filter(Boolean);

const segments = blocks.map((block, index) => {
  const segmentId = `exact_${String(index + 1).padStart(3, "0")}`;
  const genFile = path.join("audio/f5_tts", segmentSubdir, `${segmentId}.txt`).replace(/\\/g, "/");
  const outputAudio = path.join("audio/f5_tts", segmentSubdir, `${segmentId}.wav`).replace(/\\/g, "/");

  writeText(path.join(episodeDir, genFile), `${block}\n`);

  return {
    segment_id: segmentId,
    source_text: block,
    spoken_text: block,
    focus_terms: [],
    gen_file: genFile,
    output_audio: outputAudio
  };
});

writeText(path.join(episodeDir, "script/voiceover_exact_user.md"), `${exactVoiceover}\n`);
writeJson(path.join(segmentDir, "segment_manifest.json"), {
  status: "prepared",
  engine_hint: "f5_tts_local_exact_segmented",
  source: "video_script/douyin_voiceover.md",
  text_hash: hashText(exactVoiceover),
  notes: [
    "Strict source script is derived from the approved formal voiceover file.",
    "Blank-line paragraphs are generated as independent audio segments to reduce long-text repetition risk."
  ],
  segments
});

console.log(JSON.stringify({
  status: "prepared_exact_voiceover",
  segments: segments.length,
  script: "script/voiceover_exact_user.md",
  manifest: `audio/f5_tts/${segmentSubdir}/segment_manifest.json`
}));
