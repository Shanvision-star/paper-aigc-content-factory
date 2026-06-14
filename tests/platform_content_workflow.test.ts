import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");
const exists = (relativePath: string) => fs.existsSync(path.join(rootDir, relativePath));

const readmePath = "README.md";
const mainSpecPath = "docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md";
const scriptHumanizerSkillPath = ".agents/skills/script-humanizer-zh/SKILL.md";
const openingOptimizerSkillPath = ".agents/skills/short-video-opening-optimizer/SKILL.md";
const platformAdapterSkillPath = ".agents/skills/platform-format-adapter/SKILL.md";
const researchNotesPath = "docs/platform_distribution/github_research_notes.md";

describe("platform content workflow constraints", () => {
  it("records script humanizer, opening optimizer, and platform adapter in README and main spec", () => {
    const readme = read(readmePath);
    const spec = read(mainSpecPath);

    for (const doc of [readme, spec]) {
      expect(doc).toContain("script-humanizer-zh");
      expect(doc).toContain("short-video-opening-optimizer");
      expect(doc).toContain("platform-format-adapter");
      expect(doc).toContain("platform_profiles/*.yaml");
      expect(doc).toContain("publish/platform_manifest.json");
      expect(doc).toContain("safe90");
      expect(doc).toContain("1080x1920");
      expect(doc).toContain("1920x1080");
      expect(doc).toContain("1080x1080");
    }
  });

  it("adds a script-humanizer-zh skill with technical-script boundaries", () => {
    expect(exists(scriptHumanizerSkillPath)).toBe(true);
    const skill = read(scriptHumanizerSkillPath);

    expect(skill).toContain("name: script-humanizer-zh");
    expect(skill).toContain("humanizer-zh");
    expect(skill).toContain("technical-script-reviewer");
    expect(skill).toContain("Do not change approved technical claims");
    expect(skill).toContain("Do not rewrite locked spoken_text");
    expect(skill).toContain("Do not alter formulas");
    expect(skill).toContain("Chinese-native rhythm");
    expect(skill).toContain("English terms remain whole words");
  });

  it("adds a short-video-opening-optimizer skill for platform hooks", () => {
    expect(exists(openingOptimizerSkillPath)).toBe(true);
    const skill = read(openingOptimizerSkillPath);

    expect(skill).toContain("name: short-video-opening-optimizer");
    expect(skill).toContain("0-3s");
    expect(skill).toContain("visual hook");
    expect(skill).toContain("verbal hook");
    expect(skill).toContain("text overlay");
    expect(skill).toContain("Douyin");
    expect(skill).toContain("Xiaohongshu");
    expect(skill).toContain("Bilibili");
    expect(skill).toContain("YouTube Shorts");
    expect(skill).toContain("not clickbait");
  });

  it("adds a platform-format-adapter skill for local packaging variants", () => {
    expect(exists(platformAdapterSkillPath)).toBe(true);
    const skill = read(platformAdapterSkillPath);

    expect(skill).toContain("name: platform-format-adapter");
    expect(skill).toContain("platform_profiles/*.yaml");
    expect(skill).toContain("publish/platform_manifest.json");
    expect(skill).toContain("cover");
    expect(skill).toContain("video");
    expect(skill).toContain("captions");
    expect(skill).toContain("metadata");
    expect(skill).toContain("Do not auto-publish");
    expect(skill).toContain("partial failure");
  });

  it("records GitHub research notes for reusable external patterns", () => {
    expect(exists(researchNotesPath)).toBe(true);
    const notes = read(researchNotesPath);

    expect(notes).toContain("ai-zixun/humanizer-zh");
    expect(notes).toContain("wpsnote/wpsnote-skills");
    expect(notes).toContain("coreyhaines31/marketingskills");
    expect(notes).toContain("msitarzewski/agency-agents");
    expect(notes).toContain("canva-sdks/canva-claude-skills");
    expect(notes).toContain("charlie947/social-media-skills");
    expect(notes).toContain("ZeroLu/awesome-nanobanana-pro");
    expect(notes).toContain("short-video-opening-optimizer exact match not found");
  });
});
