import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
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
const ttsSkillPath = path.join(rootDir, ".agents", "skills", "tts-voiceover-quality-gate", "SKILL.md");
const scriptReviewerSkillPath = path.join(rootDir, ".agents", "skills", "technical-script-reviewer", "SKILL.md");

describe("first-video retrospective constraints", () => {
  it("records voiceover, script, and render-review hard gates in README and spec", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");

    for (const doc of [readme, spec]) {
      expect(doc).toContain("Voiceover Hard Gates");
      expect(doc).toContain("Script Quality Contract");
      expect(doc).toContain("Review Before Render");
      expect(doc).toContain("sample-first");
      expect(doc).toContain("ASR transcript diff");
      expect(doc).toContain("neutral 8-10s");
      expect(doc).toContain("source_text");
      expect(doc).toContain("spoken_text");
      expect(doc).toContain("Feynman");
      expect(doc).toContain("modern LLM");
      expect(doc).toContain("qa_report.json");
      expect(doc).toContain("tts-voiceover-quality-gate");
      expect(doc).toContain("technical-script-reviewer");
    }
  });

  it("adds reusable skills for TTS gates and technical script review", () => {
    expect(fs.existsSync(ttsSkillPath)).toBe(true);
    expect(fs.existsSync(scriptReviewerSkillPath)).toBe(true);

    const ttsSkill = fs.readFileSync(ttsSkillPath, "utf8");
    expect(ttsSkill).toContain("sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render");
    expect(ttsSkill).toContain("seg_001");
    expect(ttsSkill).toContain("seg_010");
    expect(ttsSkill).toContain("seg_014");
    expect(ttsSkill).toContain("neutral 8-10s");
    expect(ttsSkill).toContain("ASR transcript diff");
    expect(ttsSkill).toContain("source_text");
    expect(ttsSkill).toContain("spoken_text");
    expect(ttsSkill).toContain("reference-text leakage");

    const reviewerSkill = fs.readFileSync(scriptReviewerSkillPath, "utf8");
    expect(reviewerSkill).toContain("Attention is weighted aggregation");
    expect(reviewerSkill).toContain("learned projection spaces");
    expect(reviewerSkill).toContain("Multi-Head");
    expect(reviewerSkill).toContain("Sora");
    expect(reviewerSkill).toContain("Agent");
    expect(reviewerSkill).toContain("MCP");
    expect(reviewerSkill).toContain("Feynman");
  });

  it("names the real-audio Dagu chain as sample through render", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep01-real-audio.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));
    const expectedChain = ["sample", "asr_diff", "human_approval", "full_tts", "merge", "captions", "render"];

    for (const id of expectedChain) {
      expect(steps[id]).toBeTruthy();
    }

    expect(steps.sample.run).toBe("npm run audio:f5-generate-samples");
    expect(steps.asr_diff.depends).toBe("sample");
    expect(steps.human_approval.depends).toBe("asr_diff");
    expect(steps.full_tts.depends).toBe("human_approval");
    expect(steps.merge.depends).toBe("full_tts");
    expect(steps.captions.depends).toBe("import_voiceover");
    expect(steps.render.depends).toBe("captions");
    expect(steps.render.run).toBe("npm run video:hyperframes-render-formal");

    expect(steps.f5_tts_generate_samples).toBeUndefined();
    expect(steps.sample_asr_transcript_diff).toBeUndefined();
    expect(steps.sample_audio_review_gate).toBeUndefined();
    expect(steps.f5_tts_generate_segments).toBeUndefined();
    expect(steps.merge_tts_segments).toBeUndefined();
    expect(steps.hyperframes_formal_mp4).toBeUndefined();
  });
});
