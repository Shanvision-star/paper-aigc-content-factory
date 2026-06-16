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
const visualOrchestratorSkillPath = ".agents/skills/visual-orchestrator/SKILL.md";
const ep01FramePath = "episodes/ep01_attention_is_all_you_need/video_script/FRAME.md";
const ep02EnglishFramePath = "episodes/ep02_attention_qkv_en/video_script/FRAME.md";

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
      expect(doc).toContain("Formula Asset Contract");
      expect(doc).toContain("platform variants");
      expect(doc).toContain("safe area");
      expect(doc).toContain("HyperFrames Animation Hard Gates");
      expect(doc).toContain("source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render");
      expect(doc).toContain("Q -> K matching -> score matrix QK^T -> /√(d_k) -> row-wise softmax -> weighted V -> output O");
      expect(doc).toContain("flow arcs");
      expect(doc).toContain("kv_cache_cached_projection");
      expect(doc).toContain("不能被泛化的 `projection` 规则吞掉");
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
    expect(frame).toContain("Formula Asset Contract");
    expect(frame).toContain("complete visual objects");
    expect(frame).toContain("KaTeX/MathJax/SVG");
    expect(frame).toContain("Source-Backed HyperFrames Composition Hard Gate");
    expect(frame).toContain("source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render");
    expect(frame).toContain("Formula Derivation Chain Hard Gate");
    expect(frame).toContain("Q -> K matching -> score matrix QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V -> output O");
    expect(frame).toContain("Connector And Arrow Geometry Hard Gate");
    expect(frame).toContain("explicit source and target anchors");
    expect(frame).toContain("fixed marker sizing");
    expect(frame).toContain("single-segment flow arcs");
    expect(frame).toContain("Do not use arbitrary multi-bend curves");
    expect(frame).toContain("must not pass through load-bearing text");
    expect(frame).toContain("do not use rotated CSS rectangles");
    expect(frame).toContain("no穿模");
    expect(frame).toContain("Visual Centering And Whitespace Hard Gate");
    expect(frame).toContain("visible center of the phone frame");
    expect(frame).toContain("Do not leave large unused gaps");
    expect(frame).toContain("Asset frames must be content-fit");
    expect(frame).toContain("squint test at phone size");
    expect(frame).toContain("Specific Scene Matcher Priority Hard Gate");
    expect(frame).toContain("most specific `visual_type`");
    expect(frame).toContain("kv_cache_cached_projection");
    expect(frame).toContain("A `KV Cache` scene must show runtime reuse of projected Key/Value");
    expect(frame).toContain("Formula completeness test");
    expect(frame).toContain("Paper Genre Treatment Registry");
    expect(frame).toContain("Pre-Render Frame Audit");
  });

  it("records EP02 English HyperFrames review gates for connector geometry and formula derivation", () => {
    expect(exists(ep02EnglishFramePath)).toBe(true);
    const frame = read(ep02EnglishFramePath);

    expect(frame).toContain("Source-Backed Asset Contract");
    expect(frame).toContain("Q -> Key matching -> score matrix -> /√(d_k) -> row-wise softmax -> weighted Value -> output representation");
    expect(frame).toContain("Connector Geometry Rules");
    expect(frame).toContain("outer edge of nodes, cards, matrices, or output circles");
    expect(frame).toContain("fixed marker size");
    expect(frame).toContain("single, readable flow arc");
    expect(frame).toContain("HyperFrames Animation Review Gates");
    expect(frame).toContain("qa/animation_review_stills/01_qk_anchored_relation_graph.png");
    expect(frame).toContain("QK^T -> /√(d_k) -> row-wise softmax -> weighted V -> output");
    expect(frame).toContain("no穿模");
    expect(frame).toContain("no漂移");
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
    expect(skill).toContain("Formula asset contract");
    expect(skill).toContain("annotation targets");
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
    expect(episodeFrame).toContain("Formula Asset Contract");
    expect(episodeFrame).toContain("canonical formula");
    expect(episodeFrame).toContain("formula-editor screenshot");
    expect(episodeFrame).toContain("annotation targets");
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
    expect(skill).toContain("Formula Asset Contract");
    expect(skill).toContain("formula_editor_screenshot");
    expect(skill).toContain("Do not use raw, unrendered LaTeX");
    expect(skill).toContain("Do not run P0 video render during default tests");
    expect(skill).toContain("Do not add Remotion as a P0 render path");
    expect(skill).toContain("most specific `visual_type`");
    expect(skill).toContain("kv_cache_cached_projection");
    expect(skill).toContain("Do not let generic substring matchers");
    expect(skill).toContain("Do not publish rendered media to any platform");
  });

  it("makes visual-orchestrator preserve formula asset metadata before HyperFrames", () => {
    const skill = read(visualOrchestratorSkillPath);

    expect(skill).toContain("formula assets");
    expect(skill).toContain("canonical formula text");
    expect(skill).toContain("source type");
    expect(skill).toContain("annotation targets");
    expect(skill).toContain("Do not mark a formula asset complete");
  });
});
