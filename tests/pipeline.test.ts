import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runContractSmoke } from "../scripts/run_pipeline.js";

describe("contract-smoke pipeline", () => {
  it("writes deterministic P0 episode artifacts without real provider outputs", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "contract-smoke-"));
    const base = path.join(tempRoot, "episodes", "ep01_attention_is_all_you_need");

    try {
      runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);

      for (const relativePath of [
        "topic.yaml",
        "research/sources.jsonl",
        "research/paper_notes.md",
        "research/claims.json",
        "research/timeline.json",
        "script/hooks.json",
        "script/voiceover.md",
        "script/voice_segments.json",
        "storyboard/hook_variants.json",
        "storyboard/storyboard.json",
        "blog/blog.md",
        "qa/hook_report.json",
        "voice/enrollment/recording_needed.md",
        "voice/voice_profile_manifest.json",
        "review/human_review.md"
      ]) {
        expect(fs.existsSync(path.join(base, relativePath))).toBe(true);
      }

      const voiceManifest = JSON.parse(
        fs.readFileSync(path.join(base, "voice", "voice_profile_manifest.json"), "utf8")
      ) as {
        allowed_use: string[];
        status: string;
      };

      expect(voiceManifest.status).toBe("recording_needed");
      expect(voiceManifest.allowed_use).toEqual(["personal_ai_paper_voiceover"]);

      for (const relativePath of [
        "audio/voiceover.wav",
        "audio/voiceover_manifest.json",
        "captions/subtitles.srt",
        "captions/subtitles.vtt",
        "renders",
        "publish"
      ]) {
        expect(fs.existsSync(path.join(base, relativePath))).toBe(false);
      }
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
