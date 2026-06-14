import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const readmePath = path.join(rootDir, "README.md");
const specPath = path.join(
  rootDir,
  "docs",
  "superpowers",
  "specs",
  "2026-06-12-ai-paper-content-factory-design.md"
);
const coverSkillPath = path.join(
  rootDir,
  ".agents",
  "skills",
  "short-video-cover-constraints",
  "SKILL.md"
);

describe("short-video cover constraints", () => {
  it("records the Douyin-safe cover export constraints in README and skill", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");
    expect(fs.existsSync(coverSkillPath)).toBe(true);

    const skill = fs.readFileSync(coverSkillPath, "utf8");
    for (const doc of [readme, spec, skill]) {
      expect(doc).toContain("cover_transformer_ai_v1_1080x1920_safe90.png");
      expect(doc).toContain("PNG");
      expect(doc).toContain("1080x1920");
      expect(doc).toContain("90%");
      expect(doc).toContain("54px");
      expect(doc).toContain("96px");
      expect(doc).toContain("black padding");
      expect(doc).toContain("youtube-thumbnail");
      expect(doc).toContain("marketing-short-video-editing-coach");
      expect(doc).toContain("awesome-nanobanana-pro");
    }
  });
});
