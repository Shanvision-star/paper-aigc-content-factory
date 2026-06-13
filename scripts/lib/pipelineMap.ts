import fs from "node:fs";
import path from "node:path";
import { readHookPatterns, readPlatformProfile, readTopic } from "./contracts.js";
import { episodeDirForTopic } from "./episodePaths.js";
import type { QualityReport } from "./quality.js";

export type PipelineStageStatus = "pass" | "partial" | "failed" | "blocked";

export type PipelineAsset = {
  path: string;
  exists: boolean;
};

export type PipelineStage = {
  id: string;
  title: string;
  command: string;
  status: PipelineStageStatus;
  purpose: string;
  inputs: PipelineAsset[];
  outputs: PipelineAsset[];
  blocking_items: string[];
};

export type PipelineMap = {
  episode_id: string;
  title: string;
  generated_at: string;
  dagu_workflow: string;
  stages: PipelineStage[];
  summary: {
    status: PipelineStageStatus;
    passed_stages: number;
    partial_stages: number;
    failed_stages: number;
    blocked_stages: number;
    blocking_items: string[];
  };
};

const deterministicTimestamp = new Date(0).toISOString();

const contractSmokeOutputs = [
  "research/sources.jsonl",
  "research/claims.json",
  "research/timeline.json",
  "script/voiceover.md",
  "script/voice_segments.json",
  "storyboard/storyboard.json",
  "voice/voice_profile_manifest.json",
  "voice/enrollment/recording_needed.md",
  "review/human_review.md",
  "blog/blog.md"
];

function repoAsset(relativePath: string): PipelineAsset {
  return {
    path: relativePath,
    exists: fs.existsSync(relativePath)
  };
}

function episodeAsset(episodeDir: string, relativePath: string): PipelineAsset {
  return {
    path: relativePath,
    exists: fs.existsSync(path.join(episodeDir, relativePath))
  };
}

function plannedAsset(relativePath: string): PipelineAsset {
  return {
    path: relativePath,
    exists: true
  };
}

function allExist(assets: PipelineAsset[]): boolean {
  return assets.every((asset) => asset.exists);
}

function missingItems(prefix: string, assets: PipelineAsset[]): string[] {
  return assets.filter((asset) => !asset.exists).map((asset) => `${prefix}: ${asset.path}`);
}

function readQualityReport(episodeDir: string): QualityReport | null {
  const reportPath = path.join(episodeDir, "qa/qa_report.json");

  if (!fs.existsSync(reportPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(reportPath, "utf8")) as QualityReport;
}

function buildStage(
  stage: Omit<PipelineStage, "status" | "blocking_items">,
  status?: PipelineStageStatus,
  blockingItems: string[] = []
): PipelineStage {
  const missingInputs = missingItems("Missing input", stage.inputs);
  const missingOutputs = missingItems("Missing output", stage.outputs);
  const derivedStatus = status ?? (missingInputs.length > 0 || missingOutputs.length > 0 ? "failed" : "pass");

  return {
    ...stage,
    status: derivedStatus,
    blocking_items: [...blockingItems, ...missingInputs, ...missingOutputs]
  };
}

export function buildPipelineMap(topicPath: string, rootDir = "."): PipelineMap {
  const topic = readTopic(topicPath);
  const episodeDir = path.join(rootDir, episodeDirForTopic(topic));

  for (const profileId of topic.targets) {
    readPlatformProfile(profileId);
  }
  readHookPatterns();

  const platformProfileInputs = topic.targets.map((target) => repoAsset(`platform_profiles/${target}.yaml`));
  const baseInputs = [
    repoAsset(topicPath),
    repoAsset("pipelines/episode.schema.json"),
    repoAsset("data/hook_patterns.yml"),
    ...platformProfileInputs
  ];
  const hookOutputs = [
    episodeAsset(episodeDir, "script/hooks.json"),
    episodeAsset(episodeDir, "storyboard/hook_variants.json"),
    episodeAsset(episodeDir, "qa/hook_report.json")
  ];
  const smokeOutputs = contractSmokeOutputs.map((relativePath) => episodeAsset(episodeDir, relativePath));
  const qualityReport = readQualityReport(episodeDir);

  const stages: PipelineStage[] = [
    buildStage({
      id: "validate_topic",
      title: "Validate Topic Contract",
      command: "npm run validate:topic",
      purpose: "校验主题、平台 profile 与 Hook 模式库是否满足 P0 合同。",
      inputs: baseInputs,
      outputs: []
    }),
    buildStage({
      id: "hooks_score",
      title: "Hook Lab Scoring",
      command: "npm run hooks:score",
      purpose: "为国内外平台生成 deterministic 开场候选，并记录评分与选择原因。",
      inputs: [repoAsset(topicPath), repoAsset("data/hook_patterns.yml"), ...platformProfileInputs],
      outputs: hookOutputs
    }),
    buildStage({
      id: "contract_smoke",
      title: "Contract-Smoke Artifacts",
      command: "npm run episode:contract-smoke",
      purpose: "生成 P0 可审核资产包骨架，不调用真实 LLM、TTS、渲染或发布平台。",
      inputs: [repoAsset(topicPath), repoAsset("data/hook_patterns.yml"), ...platformProfileInputs],
      outputs: smokeOutputs
    }),
    buildStage({
      id: "quality_gate",
      title: "Quality Gate",
      command: "npm run quality:gate",
      purpose: "汇总合同产物与未来运行态缺口，阻止把 partial 误报成发布完成。",
      inputs: [...hookOutputs, ...smokeOutputs],
      outputs: [episodeAsset(episodeDir, "qa/qa_report.json")]
    }, qualityReport?.status ?? "failed", qualityReport?.blocking_items ?? ["Missing quality report: qa/qa_report.json"]),
    buildStage({
      id: "pipeline_map",
      title: "Pipeline Map",
      command: "npm run pipeline:map",
      purpose: "把每个流程节点的输入、输出、状态与阻断项写成可视化文档和机器可读 JSON。",
      inputs: [
        episodeAsset(episodeDir, "qa/qa_report.json"),
        episodeAsset(episodeDir, "qa/hook_report.json")
      ],
      outputs: [
        plannedAsset("qa/pipeline_map.json"),
        plannedAsset("qa/pipeline_map.md")
      ]
    }),
    buildStage({
      id: "voiceover_audio",
      title: "Voiceover Audio",
      command: "future: personal voice or built-in TTS",
      purpose: "后续接入个人声音或内置 TTS 后生成真实口播音频。",
      inputs: [
        episodeAsset(episodeDir, "script/voiceover.md"),
        episodeAsset(episodeDir, "voice/voice_profile_manifest.json")
      ],
      outputs: [episodeAsset(episodeDir, "audio/voiceover.wav")]
    }, "blocked", ["Not verified runtime artifact: audio/voiceover.wav"]),
    buildStage({
      id: "captions",
      title: "Captions",
      command: "future: caption alignment",
      purpose: "后续根据口播音频和 voice segments 生成字幕。",
      inputs: [
        episodeAsset(episodeDir, "script/voice_segments.json"),
        episodeAsset(episodeDir, "audio/voiceover.wav")
      ],
      outputs: [episodeAsset(episodeDir, "captions/subtitles.srt")]
    }, "blocked", ["Not verified runtime artifact: captions/subtitles.srt"]),
    buildStage({
      id: "video_render",
      title: "Video Render",
      command: "future: HyperFrames/Manim render",
      purpose: "后续把 storyboard、音频和字幕渲染成平台视频草稿。",
      inputs: [
        episodeAsset(episodeDir, "storyboard/storyboard.json"),
        episodeAsset(episodeDir, "audio/voiceover.wav"),
        episodeAsset(episodeDir, "captions/subtitles.srt")
      ],
      outputs: [episodeAsset(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4")]
    }, "blocked", ["Not verified runtime artifact: renders/douyin_zh_1080x1920_draft.mp4"]),
    buildStage({
      id: "publish_pack",
      title: "Publish Pack",
      command: "future: platform packaging",
      purpose: "后续生成各平台标题、封面、简介、标签和发布时间建议。",
      inputs: [
        episodeAsset(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"),
        episodeAsset(episodeDir, "qa/qa_report.json")
      ],
      outputs: [episodeAsset(episodeDir, "publish/publish_pack.md")]
    }, "blocked", ["Not verified runtime artifact: publish/publish_pack.md"])
  ];

  const blockingItems = stages.flatMap((stage) => stage.blocking_items);
  const failedStages = stages.filter((stage) => stage.status === "failed").length;
  const partialStages = stages.filter((stage) => stage.status === "partial").length;
  const blockedStages = stages.filter((stage) => stage.status === "blocked").length;

  return {
    episode_id: topic.episode_id,
    title: topic.title,
    generated_at: deterministicTimestamp,
    dagu_workflow: "dagu/ai-paper-content-factory-ep01.yaml",
    stages,
    summary: {
      status: failedStages > 0 ? "failed" : partialStages > 0 || blockedStages > 0 ? "partial" : "pass",
      passed_stages: stages.filter((stage) => stage.status === "pass").length,
      partial_stages: partialStages,
      failed_stages: failedStages,
      blocked_stages: blockedStages,
      blocking_items: blockingItems
    }
  };
}

function statusMark(status: PipelineStageStatus): string {
  return {
    pass: "PASS",
    partial: "PARTIAL",
    failed: "FAILED",
    blocked: "BLOCKED"
  }[status];
}

function formatAssets(assets: PipelineAsset[]): string {
  if (assets.length === 0) {
    return "-";
  }

  return assets.map((asset) => `${asset.exists ? "ok" : "missing"} ${asset.path}`).join("<br/>");
}

function mermaidForMap(map: PipelineMap): string {
  const lines = [
    "flowchart TD",
    "  validate_topic[\"validate_topic<br/>topic/profile contracts\"] --> hooks_score[\"hooks_score<br/>Hook Lab\"]",
    "  hooks_score --> contract_smoke[\"contract_smoke<br/>P0 artifacts\"]",
    "  contract_smoke --> quality_gate[\"quality_gate<br/>qa_report\"]",
    "  quality_gate --> pipeline_map[\"pipeline_map<br/>I/O map\"]",
    "  quality_gate -. blocked .-> voiceover_audio[\"voiceover_audio<br/>future\"]",
    "  voiceover_audio -. blocked .-> captions[\"captions<br/>future\"]",
    "  captions -. blocked .-> video_render[\"video_render<br/>future\"]",
    "  video_render -. blocked .-> publish_pack[\"publish_pack<br/>future\"]"
  ];

  return lines.join("\n");
}

export function renderPipelineMapMarkdown(map: PipelineMap): string {
  const rows = map.stages.map((stage) => [
    stage.id,
    statusMark(stage.status),
    formatAssets(stage.inputs),
    formatAssets(stage.outputs),
    stage.command,
    stage.blocking_items.length > 0 ? stage.blocking_items.join("<br/>") : "-"
  ]);

  return [
    `# ${map.title} Pipeline Map`,
    "",
    `Episode: \`${map.episode_id}\``,
    "",
    `Generated at: \`${map.generated_at}\``,
    "",
    `Dagu workflow: \`${map.dagu_workflow}\``,
    "",
    "## Flow",
    "",
    "```mermaid",
    mermaidForMap(map),
    "```",
    "",
    "## Stage I/O",
    "",
    "| Stage | Status | Inputs | Outputs | Command | Blocking Items |",
    "|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "## Summary",
    "",
    `- Status: \`${map.summary.status}\``,
    `- Passed stages: ${map.summary.passed_stages}`,
    `- Partial stages: ${map.summary.partial_stages}`,
    `- Failed stages: ${map.summary.failed_stages}`,
    `- Blocked future stages: ${map.summary.blocked_stages}`,
    ""
  ].join("\n");
}

export function writePipelineMap(episodeDir: string, map: PipelineMap): void {
  const reportDir = path.join(episodeDir, "qa");

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, "pipeline_map.json"), `${JSON.stringify(map, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(reportDir, "pipeline_map.md"), renderPipelineMapMarkdown(map), "utf8");
}
