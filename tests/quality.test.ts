import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runContractSmoke } from "../scripts/run_pipeline.js";
import { buildQualityReport, writeQualityReport } from "../scripts/lib/quality.js";

describe("quality gate", () => {
  it("marks P0 contract smoke as partial while runtime artifacts are not verified", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quality-gate-"));
    const episodeDir = path.join(tempRoot, "episodes", "ep01_attention_is_all_you_need");

    try {
      runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);

      const report = buildQualityReport(episodeDir);

      expect(report.status).toBe("partial");
      expect(report.checked_at).toBe(new Date(0).toISOString());
      expect(report.passed).toContain("script/hooks.json");
      expect(report.not_verified).toContain("audio/voiceover.wav");
      expect(report.not_verified).toContain("renders/douyin_zh_1080x1920_draft.mp4");
      expect(report.not_verified).toContain("renders/hyperframes_formal_status.json");
      expect(report.not_verified).toContain("voice/voice_profile_manifest.json#status");
      expect(report.blocking_items).toHaveLength(6);
      expect(report.blocking_items).toContain("Voice profile is not audio_ready: recording_needed");
      expect(report.failed).toEqual([]);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("writes qa_report.json under the episode qa directory", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quality-gate-write-"));
    const episodeDir = path.join(tempRoot, "episodes", "ep01_attention_is_all_you_need");
    const reportPath = path.join(episodeDir, "qa", "qa_report.json");

    try {
      runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);
      const report = buildQualityReport(episodeDir);

      writeQualityReport(episodeDir, report);

      expect(fs.existsSync(reportPath)).toBe(true);
      expect(JSON.parse(fs.readFileSync(reportPath, "utf8"))).toEqual(report);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
