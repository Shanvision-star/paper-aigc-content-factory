import fs from "node:fs";
import path from "node:path";
import { formalRenderOutputPath, formalRenderReadinessIssue, formalRenderStatusPath } from "./renderFreshness.js";

export type QualityReport = {
  status: "pass" | "partial" | "failed";
  checked_at: string;
  passed: string[];
  failed: string[];
  not_verified: string[];
  blocking_items: string[];
};

const deterministicTimestamp = new Date(0).toISOString();

const requiredContractArtifacts = [
  "topic.yaml",
  "research/sources.jsonl",
  "research/claims.json",
  "script/hooks.json",
  "script/voiceover.md",
  "script/voice_segments.json",
  "storyboard/hook_variants.json",
  "storyboard/storyboard.json",
  "qa/hook_report.json",
  "blog/blog.md",
  "voice/voice_profile_manifest.json",
  "review/human_review.md"
];

const futureRuntimeArtifacts = [
  "audio/voiceover.wav",
  "captions/subtitles.srt",
  formalRenderOutputPath,
  formalRenderStatusPath,
  "publish/publish_pack.md"
];

type VoiceProfileManifest = {
  status?: string;
};

function artifactExists(episodeDir: string, relativePath: string): boolean {
  return fs.existsSync(path.join(episodeDir, relativePath));
}

function voiceProfileStatusIssue(episodeDir: string): string | null {
  const manifestPath = path.join(episodeDir, "voice/voice_profile_manifest.json");

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as VoiceProfileManifest;
    if (manifest.status && manifest.status !== "audio_ready") {
      return `Voice profile is not audio_ready: ${manifest.status}`;
    }
  } catch {
    return "Voice profile manifest is unreadable";
  }

  return null;
}

export function buildQualityReport(episodeDir: string): QualityReport {
  const passed = requiredContractArtifacts.filter((relativePath) => artifactExists(episodeDir, relativePath));
  const failed = requiredContractArtifacts.filter((relativePath) => !artifactExists(episodeDir, relativePath));
  const voiceIssue = voiceProfileStatusIssue(episodeDir);
  const formalRenderIssue = formalRenderReadinessIssue(episodeDir, false);
  const notVerified = [
    ...futureRuntimeArtifacts.filter((relativePath) => !artifactExists(episodeDir, relativePath)),
    ...(voiceIssue ? ["voice/voice_profile_manifest.json#status"] : []),
    ...(formalRenderIssue ? ["renders/hyperframes_formal_status.json#status"] : [])
  ];
  const status = failed.length > 0 ? "failed" : notVerified.length > 0 ? "partial" : "pass";

  return {
    status,
    checked_at: deterministicTimestamp,
    passed,
    failed,
    not_verified: notVerified,
    blocking_items: [
      ...failed.map((relativePath) => `Missing required artifact: ${relativePath}`),
      ...futureRuntimeArtifacts
        .filter((relativePath) => !artifactExists(episodeDir, relativePath))
        .map((relativePath) => `Not verified runtime artifact: ${relativePath}`),
      ...(voiceIssue ? [voiceIssue] : []),
      ...(formalRenderIssue ? [`Formal HyperFrames render is not ready: ${formalRenderIssue}`] : [])
    ]
  };
}

export function writeQualityReport(episodeDir: string, report: QualityReport): void {
  const reportPath = path.join(episodeDir, "qa", "qa_report.json");

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
