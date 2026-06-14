import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { buildHyperframesRenderEnv, buildHyperframesSmokeProject } from "../scripts/hyperframes_render_smoke.js";
import { runContractSmoke } from "../scripts/run_pipeline.js";

const topicPath = "episodes/ep01_attention_is_all_you_need/topic.yaml";

describe("HyperFrames render smoke", () => {
  it("builds a portrait smoke project without rendering during tests", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hyperframes-smoke-"));

    try {
      runContractSmoke(topicPath, tempRoot);

      const project = buildHyperframesSmokeProject(topicPath, tempRoot);
      const html = fs.readFileSync(path.join(project.project_dir, "index.html"), "utf8");
      const meta = JSON.parse(fs.readFileSync(path.join(project.project_dir, "meta.json"), "utf8"));

      expect(project.status).toBe("project_ready");
      expect(project.project_dir).toContain("renders");
      expect(project.output_mp4).toBe("renders/hyperframes_smoke_1080x1920.mp4");
      expect(meta.title).toBe("Attention Is All You Need HyperFrames Smoke");
      expect(html).toContain("data-composition-id=\"ep01-hyperframes-smoke\"");
      expect(html).toContain("id=\"smoke-panel\"");
      expect(html).toContain("data-width=\"1080\"");
      expect(html).toContain("data-height=\"1920\"");
      expect(fs.existsSync(path.join(tempRoot, "episodes/ep01_attention_is_all_you_need/renders/hyperframes_smoke_1080x1920.mp4"))).toBe(false);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("adds local media binaries and preserves explicit browser overrides", () => {
    const explicitBrowser = "C:\\tools\\chrome-headless-shell.exe";
    const env = buildHyperframesRenderEnv({
      PATH: "C:\\Windows\\System32",
      HYPERFRAMES_BROWSER_PATH: explicitBrowser
    });

    expect(env.PATH).toContain("node_modules");
    expect(env.HYPERFRAMES_FFMPEG_PATH).toContain("@ffmpeg-installer");
    expect(env.HYPERFRAMES_FFPROBE_PATH).toContain("ffprobe-static");
    expect(env.HYPERFRAMES_BROWSER_PATH).toBe(explicitBrowser);
    expect(env.PRODUCER_HEADLESS_SHELL_PATH).toBe(explicitBrowser);
  });

  it("keeps MP4 render smoke out of the default P0 Dagu workflow", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep01.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));

    expect(steps.video_render_smoke_mp4).toBeUndefined();
    expect(steps.video_render.run).toBe("npm run video:hyperframes-draft");
    expect(steps.publish_pack.depends).toBe("video_render");
  });

  it("keeps the real-audio workflow away from fast noisy F5-TTS review settings", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep01-real-audio.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));
    const nfeStep = Number(steps.full_tts.run.match(/-NfeStep\s+(\d+)/)?.[1]);
    const speed = Number(steps.full_tts.run.match(/-Speed\s+([0-9.]+)/)?.[1]);

    expect(steps.voiceover_duplicate_guard.run).toBe("npm run voiceover:duplicate-guard");
    expect(steps.voiceover_duplicate_guard.depends).toBe("sync_runtime");
    expect(steps.f5_reference_safety.run).toBe("npm run audio:f5-check-reference");
    expect(steps.f5_reference_safety.depends).toBe("voiceover_duplicate_guard");
    expect(steps.prepare_tts_segments.run).toBe("npm run audio:f5-prepare-segments");
    expect(steps.prepare_tts_segments.depends).toBe("f5_reference_safety");
    expect(steps.sample.run).toBe("npm run audio:f5-generate-samples");
    expect(steps.sample.depends).toBe("prepare_tts_segments");
    expect(steps.asr_diff.run).toBe("npm run audio:asr-transcript-diff");
    expect(steps.asr_diff.depends).toBe("sample");
    expect(steps.human_approval.run).toBe("npm run audio:sample-review-gate");
    expect(steps.human_approval.depends).toBe("asr_diff");
    expect(steps.full_tts.run).toContain("-Device cuda");
    expect(steps.full_tts.run).toContain("-SegmentSubdir segments");
    expect(steps.full_tts.depends).toBe("human_approval");
    expect(nfeStep).toBeGreaterThanOrEqual(16);
    expect(speed).toBeGreaterThanOrEqual(0.75);
    expect(speed).toBeLessThanOrEqual(0.85);
    expect(steps.full_tts.run).not.toContain("-NfeStep 4");
    expect(steps.merge.run).toBe("npm run audio:f5-merge-segments");
    expect(steps.apply_audio_timings.run).toBe("npm run audio:apply-segment-timings");
    expect(steps.apply_audio_timings.depends).toBe("merge");
    expect(steps.audio_postprocess.run).toContain("--input audio/voiceover.segmented.wav");
    expect(steps.audio_postprocess.depends).toBe("apply_audio_timings");
    expect(steps.import_voiceover.run).toContain("audio/voiceover.postprocessed.wav");
    expect(steps.import_voiceover.depends).toBe("audio_postprocess");
    expect(steps.captions.depends).toBe("import_voiceover");
    expect(steps.render.run).toBe("npm run video:hyperframes-render-formal");
    expect(steps.render.depends).toBe("captions");
  });
});
