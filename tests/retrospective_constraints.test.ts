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
const voiceoverAdapterSkillPath = path.join(rootDir, ".agents", "skills", "voiceover-adapter", "SKILL.md");
const voiceoverEmotionSkillPath = path.join(rootDir, ".agents", "skills", "voiceover-emotion-coach", "SKILL.md");
const scriptReviewerSkillPath = path.join(rootDir, ".agents", "skills", "technical-script-reviewer", "SKILL.md");
const soundCueSkillPath = path.join(rootDir, ".agents", "skills", "sound-cue-designer", "SKILL.md");
const ep02SoundCuePlanPath = path.join(
  rootDir,
  "episodes",
  "ep02_attention_qkv",
  "video_script",
  "sound_cue_plan.md"
);
const ep02SoundCueTimelinePath = path.join(
  rootDir,
  "episodes",
  "ep02_attention_qkv",
  "video_script",
  "sound_cue_timeline.json"
);
const ep02PronunciationPath = path.join(
  rootDir,
  "episodes",
  "ep02_attention_qkv",
  "script",
  "pronunciation_normalization.md"
);
const ep02HyperframesPromptPath = path.join(
  rootDir,
  "episodes",
  "ep02_attention_qkv",
  "video_script",
  "hyperframes_prompt.md"
);
const ep02AudioPromptPath = path.join(
  rootDir,
  "episodes",
  "ep02_attention_qkv",
  "audio",
  "voiceover_audio_prompt.md"
);
const indextts2RunnerPath = path.join(rootDir, "scripts", "indextts2_infer_segments.py");
const indextts2PowerShellPath = path.join(rootDir, "scripts", "indextts2_generate_segmented.ps1");

describe("first-video retrospective constraints", () => {
  it("records voiceover, script, and render-review hard gates in README and spec", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");

    for (const doc of [readme, spec]) {
      expect(doc).toContain("Voiceover Hard Gates");
      expect(doc).toContain("IndexTTS2");
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
    expect(ttsSkill).toContain("IndexTTS2");
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

  it("records reusable sound-cue constraints for episode development", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");

    for (const doc of [readme, spec]) {
      expect(doc).toContain("Sound Cue Design Contract");
      expect(doc).toContain("sound-cue-designer");
      expect(doc).toContain("auditory bookmarks");
      expect(doc).toContain("12-18 dB");
      expect(doc).toContain("ASR transcript diff");
      expect(doc).toContain("do not overpower voiceover");
    }

    expect(fs.existsSync(soundCueSkillPath)).toBe(true);
    const soundCueSkill = fs.readFileSync(soundCueSkillPath, "utf8");
    expect(soundCueSkill).toContain("auditory bookmarks");
    expect(soundCueSkill).toContain("QK reveal");
    expect(soundCueSkill).toContain("softmax normalization");
    expect(soundCueSkill).toContain("weighted V aggregation");
    expect(soundCueSkill).toContain("12-18 dB");

    expect(fs.existsSync(ep02SoundCuePlanPath)).toBe(true);
    const ep02SoundCuePlan = fs.readFileSync(ep02SoundCuePlanPath, "utf8");
    expect(ep02SoundCuePlan).toContain("EP02 QKV");
    expect(ep02SoundCuePlan).toContain("QK reveal");
    expect(ep02SoundCuePlan).toContain("Q/K/V card taps");
    expect(ep02SoundCuePlan).toContain("softmax normalization");
    expect(ep02SoundCuePlan).toContain("weighted V aggregation");
    expect(ep02SoundCuePlan).toContain("do not overpower voiceover");
    expect(ep02SoundCuePlan).toContain("Animation-Locked Cue Timeline");
    expect(ep02SoundCuePlan).toContain("scene_id + visual_action + offset_sec");
    expect(ep02SoundCuePlan).toContain("Cue timing follows the visual animation anchor");

    expect(fs.existsSync(ep02SoundCueTimelinePath)).toBe(true);
    const ep02SoundCueTimeline = JSON.parse(fs.readFileSync(ep02SoundCueTimelinePath, "utf8"));
    expect(ep02SoundCueTimeline.status).toBe("planned_not_mixed");
    expect(ep02SoundCueTimeline.mix_policy.background_music).toBe("disabled_by_default");
    expect(ep02SoundCueTimeline.cues).toHaveLength(8);
    expect(ep02SoundCueTimeline.cues[0]).toMatchObject({
      cue_id: "cue_001_opening",
      scene_id: "S01",
      visual_action_anchor: "Relation graph and center token appear"
    });
    expect(ep02SoundCueTimeline.cues.map((cue: { cue_id: string }) => cue.cue_id)).toContain("cue_007_engineering_layers");
  });

  it("adds a reusable voiceover emotion coach that preserves the original AI voice", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");

    for (const doc of [readme, spec]) {
      expect(doc).toContain("Voiceover Emotion Contract");
      expect(doc).toContain("voiceover-emotion-coach");
      expect(doc).toContain("delivery_style");
      expect(doc).toContain("emo_text");
      expect(doc).toContain("preserve_original_ai_voice");
      expect(doc).toContain("low_intensity_prosody");
      expect(doc).toContain("no hidden narration cues");
      expect(doc).toContain("sample-first");
    }

    expect(fs.existsSync(voiceoverEmotionSkillPath)).toBe(true);
    const skill = fs.readFileSync(voiceoverEmotionSkillPath, "utf8");
    expect(skill).toContain("delivery_style");
    expect(skill).toContain("engine_emotion_prompt");
    expect(skill).toContain("emo_text");
    expect(skill).toContain("emo_alpha");
    expect(skill).toContain("preserve_original_ai_voice");
    expect(skill).toContain("use_emo_text=false");
    expect(skill).toContain("spoken_text");
    expect(skill).toContain("Do not add emotion tags to spoken_text");
    expect(skill).toContain("Do not skip sample-first");
    expect(skill).toContain("Do not replace the original AI voice character");
    expect(skill).toContain("ChatGPT");
    expect(skill).toContain("KV Cache");

    const indextts2Runner = fs.readFileSync(indextts2RunnerPath, "utf8");
    expect(indextts2Runner).toContain("--delivery-style-manifest");
    expect(indextts2Runner).toContain("use_emo_text");
    expect(indextts2Runner).toContain("emo_text");
    expect(indextts2Runner).toContain("use_random");

    const indextts2PowerShell = fs.readFileSync(indextts2PowerShellPath, "utf8");
    expect(indextts2PowerShell).toContain("DeliveryStyleManifest");
    expect(indextts2PowerShell).toContain("--delivery-style-manifest");
  });

  it("records pronunciation normalization and EP02 prompt contracts", () => {
    const readme = fs.readFileSync(readmePath, "utf8");
    const spec = fs.readFileSync(specPath, "utf8");

    for (const doc of [readme, spec]) {
      expect(doc).toContain("Pronunciation Normalization Contract");
      expect(doc).toContain("source_text");
      expect(doc).toContain("spoken_text");
      expect(doc).toContain("更准确地说");
      expect(doc).toContain("准确一点说");
      expect(doc).toContain("QK^T");
      expect(doc).toContain("Q 乘 K 转置");
      expect(doc).toContain("根号下 d k");
    }

    const voiceoverAdapterSkill = fs.readFileSync(voiceoverAdapterSkillPath, "utf8");
    expect(voiceoverAdapterSkill).toContain("Pronunciation Normalization Contract");
    expect(voiceoverAdapterSkill).toContain("更准确地说");
    expect(voiceoverAdapterSkill).toContain("按行归一化");
    expect(voiceoverAdapterSkill).toContain("QK^T");
    expect(voiceoverAdapterSkill).toContain("根号下 d k");
    expect(voiceoverAdapterSkill).toContain("ChatGPT");
    expect(voiceoverAdapterSkill).toContain("token");

    const ttsSkill = fs.readFileSync(ttsSkillPath, "utf8");
    expect(ttsSkill).toContain("Pronunciation Normalization Contract");
    expect(ttsSkill).toContain("更准确地说");
    expect(ttsSkill).toContain("QK^T");
    expect(ttsSkill).toContain("sqrt(d_k)");
    expect(ttsSkill).toContain("ChatGPT");
    expect(ttsSkill).toContain("token");

    expect(fs.existsSync(ep02PronunciationPath)).toBe(true);
    const ep02Pronunciation = fs.readFileSync(ep02PronunciationPath, "utf8");
    expect(ep02Pronunciation).toContain("Attention 像一张不断变化的关系图");
    expect(ep02Pronunciation).toContain("更准确地说");
    expect(ep02Pronunciation).toContain("准确一点说");
    expect(ep02Pronunciation).toContain("按行归一化");
    expect(ep02Pronunciation).toContain("那一组分数");
    expect(ep02Pronunciation).toContain("QK^T");
    expect(ep02Pronunciation).toContain("Q 乘 K 转置");
    expect(ep02Pronunciation).toContain("sqrt(d_k)");
    expect(ep02Pronunciation).toContain("根号下 d k");
    expect(ep02Pronunciation).toContain("KV Cache");
    expect(ep02Pronunciation).toContain("ChatGPT");
    expect(ep02Pronunciation).toContain("保持英文整体词");
    expect(ep02Pronunciation).toContain("ASR transcript diff");

    expect(fs.existsSync(ep02HyperframesPromptPath)).toBe(true);
    const ep02HyperframesPrompt = fs.readFileSync(ep02HyperframesPromptPath, "utf8");
    expect(ep02HyperframesPrompt).toContain("https://nlp.seas.harvard.edu/annotated-transformer/");
    expect(ep02HyperframesPrompt).toContain("Q = XW_Q");
    expect(ep02HyperframesPrompt).toContain("row-wise softmax");
    expect(ep02HyperframesPrompt).toContain("soft adjacency matrix");
    expect(ep02HyperframesPrompt).toContain("Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V");
    expect(ep02HyperframesPrompt).toContain("cue_002_qk_reveal");
    expect(ep02HyperframesPrompt).toContain("do not overpower voiceover");
    expect(ep02HyperframesPrompt).toContain("sound_cue_timeline.json");
    expect(ep02HyperframesPrompt).toContain("trigger by `scene_id`, `visual_action_anchor`, and `offset_sec`");

    expect(fs.existsSync(ep02AudioPromptPath)).toBe(true);
    const ep02AudioPrompt = fs.readFileSync(ep02AudioPromptPath, "utf8");
    expect(ep02AudioPrompt).toContain("sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render");
    expect(ep02AudioPrompt).toContain("Mainline: IndexTTS2");
    expect(ep02AudioPrompt).toContain("neutral 8-10s");
    expect(ep02AudioPrompt).toContain("English terms as whole words");
    expect(ep02AudioPrompt).toContain("no hidden narration cues");
    expect(ep02AudioPrompt).toContain("Q 乘 K 转置");
    expect(ep02AudioPrompt).toContain("根号下 d k");
    expect(ep02AudioPrompt).toContain("ASR transcript diff");
  });
});
