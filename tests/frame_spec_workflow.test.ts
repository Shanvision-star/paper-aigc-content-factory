import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");
const exists = (relativePath: string) => fs.existsSync(path.join(rootDir, relativePath));

const readmePath = "README.md";
const mainSpecPath = "docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md";
const globalDesignPath = "docs/visual_system/DESIGN.md";
const globalFramePath = "docs/visual_system/FRAME.md";
const frameSkillPath = ".agents/skills/frame-spec-writer/SKILL.md";
const hyperframesComposerSkillPath = ".agents/skills/hyperframes-composer/SKILL.md";
const ep01FramePath = "episodes/ep01_attention_is_all_you_need/video_script/FRAME.md";

describe("frame-spec workflow constraints", () => {
  it("records the global-to-episode frame authority chain in README and main spec", () => {
    const readme = read(readmePath);
    const spec = read(mainSpecPath);

    for (const doc of [readme, spec]) {
      expect(doc).toContain("DESIGN.md -> FRAME.md -> episode FRAME.md");
      expect(doc).toContain("docs/visual_system/DESIGN.md");
      expect(doc).toContain("docs/visual_system/FRAME.md");
      expect(doc).toContain("episodes/{paper_id}/video_script/FRAME.md");
      expect(doc).toContain("frame-spec-writer");
      expect(doc).toContain("paper figure spotlight");
      expect(doc).toContain("formula explanation");
      expect(doc).toContain("platform variants");
      expect(doc).toContain("safe area");
    }
  });

  it("adds reusable global DESIGN and FRAME visual contracts", () => {
    expect(exists(globalDesignPath)).toBe(true);
    expect(exists(globalFramePath)).toBe(true);

    const design = read(globalDesignPath);
    const frame = read(globalFramePath);

    expect(design).toContain("Account Visual Identity");
    expect(design).toContain("Color Tokens");
    expect(design).toContain("Typography Roles");
    expect(design).toContain("Chinese / English Modes");
    expect(design).toContain("safe90");
    expect(design).toContain("Figure and Formula Treatment");
    expect(design).toContain("What Not To Do");

    expect(frame).toContain("Global Frame System");
    expect(frame).toContain("1080x1920");
    expect(frame).toContain("1920x1080");
    expect(frame).toContain("1080x1080");
    expect(frame).toContain("Caption Safe Area");
    expect(frame).toContain("Typography Floor");
    expect(frame).toContain("Frame Treatments");
    expect(frame).toContain("Paper Genre Treatment Registry");
    expect(frame).toContain("Pre-Render Frame Audit");
  });

  it("adds a frame-spec-writer skill with strict inputs, outputs, and boundaries", () => {
    expect(exists(frameSkillPath)).toBe(true);
    const skill = read(frameSkillPath);

    expect(skill).toContain("name: frame-spec-writer");
    expect(skill).toContain("docs/visual_system/DESIGN.md");
    expect(skill).toContain("docs/visual_system/FRAME.md");
    expect(skill).toContain("episodes/{paper_id}/video_script/FRAME.md");
    expect(skill).toContain("research_report.md");
    expect(skill).toContain("voice_segments.json");
    expect(skill).toContain("assets_manifest.json");
    expect(skill).toContain("Do not invent paper facts");
    expect(skill).toContain("Do not rewrite spoken narration");
    expect(skill).toContain("Do not run real HyperFrames render");
    expect(skill).toContain("Do not run real Manim render");
    expect(skill).toContain("Do not run provider, LLM, or network calls");
    expect(skill).toContain("Chinese `地`");
  });

  it("adds an ep01 frame contract that requires paper figures, formulas, and render QA", () => {
    expect(exists(ep01FramePath)).toBe(true);
    const episodeFrame = read(ep01FramePath);

    expect(episodeFrame).toContain("Attention Is All You Need");
    expect(episodeFrame).toContain("episode thesis");
    expect(episodeFrame).toContain("original paper figures");
    expect(episodeFrame).toContain("Transformer architecture");
    expect(episodeFrame).toContain("Attention formula");
    expect(episodeFrame).toContain("QK");
    expect(episodeFrame).toContain("softmax");
    expect(episodeFrame).toContain("Multi-Head Attention");
    expect(episodeFrame).toContain("Positional Encoding");
    expect(episodeFrame).toContain("modern LLM");
    expect(episodeFrame).toContain("no black frame");
    expect(episodeFrame).toContain("subtitle overlap");
  });

  it("makes hyperframes-composer consume episode FRAME.md without changing P0 render boundaries", () => {
    const skill = read(hyperframesComposerSkillPath);

    expect(skill).toContain("video_script/FRAME.md");
    expect(skill).toContain("Do not run P0 video render during default tests");
    expect(skill).toContain("Do not add Remotion as a P0 render path");
    expect(skill).toContain("Do not publish rendered media to any platform");
  });
});
