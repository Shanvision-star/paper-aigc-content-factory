import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

type FormalScene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  engine: string;
  assets?: string[];
  caption: string;
  claim_ids: string[];
};

type SegmentTiming = {
  segment_id: string;
  duration_sec: number;
};

type SegmentMergeReport = {
  status: "merged";
  input_manifest: string;
  output_audio: string;
  pause_ms: number;
  duration_sec: number;
  segments: SegmentTiming[];
};

type ApplyTimingOptions = {
  reportRelativePath?: string;
};

type ApplyTimingResult = {
  status: "timings_applied";
  total_duration_sec: number;
  scenes: number;
  source_report: string;
  outputs: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function rounded(seconds: number): number {
  return Number(seconds.toFixed(3));
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds - minutes * 60;
  const secText = secs.toFixed(1).padStart(4, "0");

  return `${String(minutes).padStart(2, "0")}:${secText}`;
}

function voiceoverMarkdown(scenes: FormalScene[], totalDurationSec: number, sourceReport: string): string {
  const lines = [
    "# Douyin Voiceover V5 Focus-Cue Audio-Timed",
    "",
    "## Title",
    "",
    "《Attention Is All You Need》为什么改变了今天的 AI？",
    "",
    "## Production Notes",
    "",
    "- Target platform: Douyin / Xiaohongshu Chinese vertical draft.",
    `- Final configured duration: ${formatClock(totalDurationSec)} from segmented voiceover audio.`,
    "- Teaching method: Feynman learning method first, formula second.",
    "- Core thesis: Transformer changed AI by moving sequence understanding from sequential message passing to global relationship modeling.",
    "- Source boundary: Transformer claims trace to the paper; Sora/MCP references stay at system-layer context and do not imply they are Transformer variants.",
    "- Focus cue strategy: use short oral prompts such as \"重点来了\", \"需要关注\", and \"公式不用背\" to help short-video viewers notice conceptual turns.",
    `- Timing source: ${sourceReport}.`,
    "",
    "## Voiceover",
    ""
  ];

  for (const scene of scenes) {
    lines.push(
      `### ${formatClock(scene.start)}-${formatClock(scene.start + scene.duration)}`,
      "",
      ...scene.voiceover.split("。").flatMap((sentence, index, all) => {
        const trimmed = sentence.trim();
        if (!trimmed) {
          return [];
        }

        const suffix = index < all.length - 1 ? "。" : "";
        return [`${trimmed}${suffix}`];
      }),
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}

function timedScenesFromReport(scenes: FormalScene[], report: SegmentMergeReport): FormalScene[] {
  if (scenes.length !== report.segments.length) {
    throw new Error(`Scene count ${scenes.length} does not match audio segment count ${report.segments.length}`);
  }

  let cursor = 0;
  const pauseSec = report.pause_ms / 1000;

  const timedScenes = scenes.map((scene, index) => {
    const segment = report.segments[index];
    const expectedSegmentId = `seg_${String(index + 1).padStart(3, "0")}`;

    if (segment.segment_id !== expectedSegmentId) {
      throw new Error(`Unexpected segment order at scene ${scene.scene_id}: expected ${expectedSegmentId}, got ${segment.segment_id}`);
    }

    const start = rounded(cursor);
    const duration = rounded(segment.duration_sec + (index < scenes.length - 1 ? pauseSec : 0));
    cursor += duration;

    return {
      ...scene,
      start,
      duration
    };
  });

  const drift = rounded(report.duration_sec - cursor);
  if (Math.abs(drift) > 0 && Math.abs(drift) < 0.05) {
    const lastScene = timedScenes[timedScenes.length - 1];
    lastScene.duration = rounded(lastScene.duration + drift);
  }

  return timedScenes;
}

export function applySegmentAudioTimings(topicPath: string, options: ApplyTimingOptions = {}, rootDir = "."): ApplyTimingResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const reportRelativePath = options.reportRelativePath ?? "audio/f5_tts/segments/segmented_merge_report.json";
  const reportPath = path.join(episodeDir, reportRelativePath);
  const formalStoryboardPath = path.join(episodeDir, "video_script/storyboard.json");
  const formalVoiceoverPath = path.join(episodeDir, "video_script/douyin_voiceover.md");

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Missing segmented audio timing report: ${reportRelativePath}`);
  }

  const scenes = readJson<FormalScene[]>(formalStoryboardPath);
  const report = readJson<SegmentMergeReport>(reportPath);
  const timedScenes = timedScenesFromReport(scenes, report);
  const totalDurationSec = rounded(Math.max(...timedScenes.map((scene) => scene.start + scene.duration)));
  const markdown = voiceoverMarkdown(timedScenes, totalDurationSec, reportRelativePath);
  const runtimeScenes = timedScenes.map(({ assets: _assets, ...scene }) => scene);

  writeJson(formalStoryboardPath, timedScenes);
  writeText(formalVoiceoverPath, markdown);
  writeText(path.join(episodeDir, "video_script/timed_voiceover_from_audio.md"), markdown);
  writeJson(
    path.join(episodeDir, "script/voice_segments.json"),
    timedScenes.map((scene, index) => ({
      segment_id: `seg_${String(index + 1).padStart(3, "0")}`,
      start: scene.start,
      duration: scene.duration,
      text: scene.voiceover,
      claim_ids: scene.claim_ids
    }))
  );
  writeText(path.join(episodeDir, "script/voiceover.md"), markdown);
  writeJson(path.join(episodeDir, "storyboard/storyboard.json"), runtimeScenes);
  writeText(
    path.join(episodeDir, "audio/f5_tts/full_voiceover_zh_v1.txt"),
    `${timedScenes.map((scene) => scene.voiceover).join("\n\n")}\n`
  );
  writeJson(path.join(episodeDir, "video_script/timing_report.json"), {
    status: "timings_applied",
    generated_at: runtimeTimestamp,
    source_report: reportRelativePath,
    output_audio: report.output_audio,
    total_duration_sec: totalDurationSec,
    scenes: timedScenes.map((scene) => ({
      scene_id: scene.scene_id,
      start: scene.start,
      duration: scene.duration,
      end: rounded(scene.start + scene.duration)
    }))
  });

  return {
    status: "timings_applied",
    total_duration_sec: totalDurationSec,
    scenes: timedScenes.length,
    source_report: reportRelativePath,
    outputs: [
      "video_script/storyboard.json",
      "video_script/douyin_voiceover.md",
      "video_script/timed_voiceover_from_audio.md",
      "video_script/timing_report.json",
      "script/voice_segments.json",
      "storyboard/storyboard.json"
    ]
  };
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/apply_segment_audio_timings.ts <topic.yaml> [--report audio/f5_tts/segments/segmented_merge_report.json]");
    return 1;
  }

  const reportIndex = rest.indexOf("--report");
  const reportRelativePath = reportIndex >= 0 ? rest[reportIndex + 1] : undefined;
  const result = applySegmentAudioTimings(topicPath, { reportRelativePath });

  console.log(JSON.stringify(result));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/apply_segment_audio_timings.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
