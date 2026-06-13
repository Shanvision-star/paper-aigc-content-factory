import fs from "node:fs";
import path from "node:path";

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
  "renders/douyin_zh_1080x1920_draft.mp4",
  "publish/publish_pack.md"
];

function artifactExists(episodeDir: string, relativePath: string): boolean {
  return fs.existsSync(path.join(episodeDir, relativePath));
}

export function buildQualityReport(episodeDir: string): QualityReport {
  const passed = requiredContractArtifacts.filter((relativePath) => artifactExists(episodeDir, relativePath));
  const failed = requiredContractArtifacts.filter((relativePath) => !artifactExists(episodeDir, relativePath));
  const notVerified = futureRuntimeArtifacts.filter((relativePath) => !artifactExists(episodeDir, relativePath));
  const status = failed.length > 0 ? "failed" : notVerified.length > 0 ? "partial" : "pass";

  return {
    status,
    checked_at: deterministicTimestamp,
    passed,
    failed,
    not_verified: notVerified,
    blocking_items: [
      ...failed.map((relativePath) => `Missing required artifact: ${relativePath}`),
      ...notVerified.map((relativePath) => `Not verified runtime artifact: ${relativePath}`)
    ]
  };
}

export function writeQualityReport(episodeDir: string, report: QualityReport): void {
  const reportPath = path.join(episodeDir, "qa", "qa_report.json");

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
