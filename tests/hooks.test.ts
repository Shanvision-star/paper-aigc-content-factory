import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readHookPatterns,
  readPlatformProfile,
  readTopic
} from "../scripts/lib/contracts.js";
import { episodeDirForTopic, episodePath } from "../scripts/lib/episodePaths.js";
import { buildHooksForTopic, writeHookArtifacts } from "../scripts/lib/hooks.js";

const scoreFields = [
  "hook_strength",
  "clarity",
  "truthfulness",
  "platform_fit",
  "visual_potential"
] as const;

function hasChinese(text: string): boolean {
  return /[\u3400-\u9fff]/u.test(text);
}

describe("deterministic hook lab", () => {
  it("builds at least three scored hooks per platform and selects the first hook", () => {
    const topic = readTopic("episodes/ep01_attention_is_all_you_need/topic.yaml");
    const profiles = topic.targets.map((profileId) => readPlatformProfile(profileId));
    const patterns = readHookPatterns();

    const results = buildHooksForTopic(topic, profiles, patterns);

    expect(episodeDirForTopic(topic)).toBe("episodes/ep01_attention_is_all_you_need");
    expect(episodePath(topic, "script/hooks.json")).toBe(
      path.join("episodes", "ep01_attention_is_all_you_need", "script", "hooks.json")
    );
    expect(results).toHaveLength(6);

    for (const result of results) {
      const profile = profiles.find((candidate) => candidate.id === result.platform);
      expect(profile).toBeDefined();
      expect(result.episode_id).toBe(topic.episode_id);
      expect(result.variants.length).toBeGreaterThanOrEqual(3);
      expect(result.selected_hook_id).toBe(result.variants[0]?.hook_id);
      expect(result.variants.map((variant) => variant.pattern)).toEqual(
        profile?.hook_strategy.primary_patterns.slice(0, 3)
      );

      for (const variant of result.variants) {
        expect(variant.hook_id).toMatch(/^hook_[a-z0-9_]+_[0-9]{2}$/);
        expect(variant.spoken_line.length).toBeGreaterThan(0);
        expect(variant.on_screen_text.length).toBeGreaterThan(0);
        expect(variant.visual_cue.length).toBeGreaterThan(0);
        expect(Array.isArray(variant.claim_ids)).toBe(true);
        expect(Array.isArray(variant.risk_flags)).toBe(true);

        for (const field of scoreFields) {
          expect(typeof variant.score[field]).toBe("number");
        }

        if (profile?.language === "en-US") {
          expect(hasChinese(variant.spoken_line)).toBe(false);
        }
      }
    }
  });

  it("writes canonical hook artifacts to script, storyboard, and qa directories", () => {
    const topic = readTopic("episodes/ep01_attention_is_all_you_need/topic.yaml");
    const profiles = topic.targets.map((profileId) => readPlatformProfile(profileId));
    const patterns = readHookPatterns();
    const results = buildHooksForTopic(topic, profiles, patterns);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hook-lab-"));

    try {
      writeHookArtifacts(tempDir, results);

      const hooksPath = path.join(tempDir, "script", "hooks.json");
      const hookVariantsPath = path.join(tempDir, "storyboard", "hook_variants.json");
      const hookReportPath = path.join(tempDir, "qa", "hook_report.json");

      expect(fs.existsSync(hooksPath)).toBe(true);
      expect(fs.existsSync(hookVariantsPath)).toBe(true);
      expect(fs.existsSync(hookReportPath)).toBe(true);
      expect(fs.existsSync(path.join(tempDir, "script", "hook_variants.json"))).toBe(false);
      expect(fs.existsSync(path.join(tempDir, "script", "storyboard.json"))).toBe(false);

      const hooks = JSON.parse(fs.readFileSync(hooksPath, "utf8")) as unknown[];
      const hookVariants = JSON.parse(fs.readFileSync(hookVariantsPath, "utf8")) as unknown[];
      const hookReport = JSON.parse(fs.readFileSync(hookReportPath, "utf8")) as {
        generated_at: string;
        status: string;
        platform_count: number;
        total_variants: number;
      };

      expect(hooks).toHaveLength(6);
      expect(hookVariants).toHaveLength(6);
      expect(hookReport.generated_at).toBe(new Date(0).toISOString());
      expect(hookReport.status).toBe("partial");
      expect(hookReport.platform_count).toBe(6);
      expect(hookReport.total_variants).toBe(18);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
