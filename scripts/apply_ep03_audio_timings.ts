import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  readJsonFile,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

type MergeReport = {
  status: "merged";
  pause_ms: number;
  duration_sec: number;
  segments: Array<{
    segment_id: string;
    duration_sec: number;
  }>;
};

type VoiceSegment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  claim_ids?: string[];
};

type StoryboardScene = {
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

const sceneToSegments = [
  ["seg_001"],
  ["seg_002"],
  ["seg_003"],
  ["seg_004"],
  ["seg_005"],
  ["seg_006"],
  ["seg_007"],
  ["seg_008", "seg_009"],
  ["seg_010", "seg_011"]
];

function round(seconds: number): number {
  return Number(seconds.toFixed(3));
}

function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${rest.toFixed(1).padStart(4, "0")}`;
}

function buildTimedVoiceover(segments: VoiceSegment[], totalDurationSec: number): string {
  const lines = [
    "# EP03 Timed Voiceover",
    "",
    "## Goal",
    "",
    "第3集《为什么一个 Head 不够？》中文短视频口播，已按真实 F5-TTS 分段音频同步时间。",
    "",
    `- Total duration: ${clock(totalDurationSec)}`,
    "- Audio timing source: audio/f5_tts/segments/segmented_merge_report.json",
    "- Subtitle timing unit: 11 real TTS segments.",
    "- Visual timing unit: 9 storyboard scenes; S08 and S09 merge adjacent TTS segments.",
    "",
    "## Voiceover",
    ""
  ];

  for (const segment of segments) {
    lines.push(
      `### ${clock(segment.start)}-${clock(segment.start + segment.duration)} ${segment.segment_id}`,
      "",
      segment.text,
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/apply_ep03_audio_timings.ts episodes/ep03_multi_head_attention/topic.yaml");
    return 1;
  }

  const episodeDir = episodeDirFromTopicPath(topicPath);
  const report = readJsonFile<MergeReport>(path.join(episodeDir, "audio/f5_tts/segments/segmented_merge_report.json"));
  const segments = readJsonFile<VoiceSegment[]>(path.join(episodeDir, "script/voice_segments.json"));
  const storyboard = readJsonFile<StoryboardScene[]>(path.join(episodeDir, "storyboard/storyboard.json"));
  const pauseSec = report.pause_ms / 1000;

  if (segments.length !== report.segments.length) {
    throw new Error(`Voice segment count ${segments.length} does not match merge report count ${report.segments.length}`);
  }

  if (storyboard.length !== sceneToSegments.length) {
    throw new Error(`Storyboard scene count ${storyboard.length} does not match EP03 scene map ${sceneToSegments.length}`);
  }

  let cursor = 0;
  const timedSegments = segments.map((segment, index) => {
    const reportSegment = report.segments[index];

    if (segment.segment_id !== reportSegment.segment_id) {
      throw new Error(`Segment order mismatch at ${index}: ${segment.segment_id} vs ${reportSegment.segment_id}`);
    }

    const start = round(cursor);
    const duration = round(reportSegment.duration_sec + (index < segments.length - 1 ? pauseSec : 0));
    cursor += duration;

    return {
      ...segment,
      start,
      duration,
      status: "audio_timed"
    };
  });

  const byId = new Map(timedSegments.map((segment) => [segment.segment_id, segment]));
  const timedStoryboard = storyboard.map((scene, index) => {
    const ids = sceneToSegments[index];
    const group = ids.map((id) => {
      const segment = byId.get(id);
      if (!segment) {
        throw new Error(`Missing timed segment for scene ${scene.scene_id}: ${id}`);
      }
      return segment;
    });
    const start = group[0].start;
    const end = group[group.length - 1].start + group[group.length - 1].duration;

    return {
      ...scene,
      start: round(start),
      duration: round(end - start),
      voiceover: group.map((segment) => segment.text).join("\n")
    };
  });

  const totalDurationSec = round(report.duration_sec);
  const voiceoverMarkdown = buildTimedVoiceover(timedSegments, totalDurationSec);

  writeJson(path.join(episodeDir, "script/voice_segments.json"), timedSegments);
  writeText(path.join(episodeDir, "script/voiceover.md"), voiceoverMarkdown);
  writeJson(path.join(episodeDir, "storyboard/storyboard.json"), timedStoryboard);
  writeJson(path.join(episodeDir, "video_script/storyboard.json"), timedStoryboard);
  writeText(path.join(episodeDir, "video_script/timed_voiceover_from_audio.md"), voiceoverMarkdown);
  writeJson(path.join(episodeDir, "video_script/timing_report.json"), {
    status: "timings_applied",
    generated_at: runtimeTimestamp,
    source_report: "audio/f5_tts/segments/segmented_merge_report.json",
    total_duration_sec: totalDurationSec,
    segment_count: timedSegments.length,
    scene_count: timedStoryboard.length,
    scene_to_segments: sceneToSegments,
    scenes: timedStoryboard.map((scene) => ({
      scene_id: scene.scene_id,
      start: scene.start,
      duration: scene.duration,
      end: round(scene.start + scene.duration)
    }))
  });
  writeText(
    path.join(episodeDir, "audio/f5_tts/full_voiceover_zh_v1.txt"),
    `${timedSegments.map((segment) => segment.text).join("\n\n")}\n`
  );

  console.log(JSON.stringify({
    status: "timings_applied",
    total_duration_sec: totalDurationSec,
    segments: timedSegments.length,
    scenes: timedStoryboard.length
  }));

  return 0;
}

process.exitCode = main(process.argv.slice(2));
