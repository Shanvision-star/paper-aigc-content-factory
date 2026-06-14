import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { buildQualityReport, writeQualityReport } from "../scripts/lib/quality.js";
import { buildPipelineMap, writePipelineMap } from "../scripts/lib/pipelineMap.js";
import { runContractSmoke } from "../scripts/run_pipeline.js";
import { runVoiceoverAdapter } from "../scripts/voiceover_adapter.js";

const topicPath = "episodes/ep01_attention_is_all_you_need/topic.yaml";

function writeMinimalWav(filePath: string): void {
  const header = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x40, 0x1f, 0x00, 0x00, 0x80, 0x3e, 0x00, 0x00, 0x02, 0x00, 0x10, 0x00,
    0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
  ]);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, header);
}

describe("pipeline map", () => {
  it("shows each P0 stage input, output, and quality state", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-map-"));

    runContractSmoke(topicPath, tempRoot);
    const episodeDir = path.join(tempRoot, "episodes/ep01_attention_is_all_you_need");
    writeQualityReport(episodeDir, buildQualityReport(episodeDir));

    const map = buildPipelineMap(topicPath, tempRoot);
    const stageById = Object.fromEntries(map.stages.map((stage) => [stage.id, stage]));

    expect(map.episode_id).toBe("ep01_attention_is_all_you_need");
    expect(stageById.validate_topic.status).toBe("pass");
    expect(stageById.hooks_score.outputs.map((item) => item.path)).toContain("qa/hook_report.json");
    expect(stageById.contract_smoke.outputs.map((item) => item.path)).toContain("storyboard/storyboard.json");
    expect(stageById.quality_gate.status).toBe("partial");
    expect(stageById.quality_gate.blocking_items).toHaveLength(5);
    expect(stageById.quality_gate.blocking_items).toContain("Voice profile is not audio_ready: recording_needed");
    expect(stageById.voiceover_audio.status).toBe("blocked");
    expect(stageById.voiceover_audio.inputs.map((item) => item.path)).toContain("script/voiceover.md");
    expect(stageById.voiceover_audio.command).toBe("npm run voiceover:check");
    expect(stageById.captions.command).toBe("npm run captions:align");
    expect(stageById.video_render.command).toBe("npm run video:hyperframes-draft");
    expect(stageById.video_render_smoke_mp4).toBeUndefined();
    expect(stageById.publish_pack.command).toBe("npm run publish:pack");
  });

  it("writes json and markdown maps under qa", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-map-"));

    runContractSmoke(topicPath, tempRoot);
    const episodeDir = path.join(tempRoot, "episodes/ep01_attention_is_all_you_need");
    writeQualityReport(episodeDir, buildQualityReport(episodeDir));

    const map = buildPipelineMap(topicPath, tempRoot);
    writePipelineMap(episodeDir, map);

    const jsonPath = path.join(episodeDir, "qa/pipeline_map.json");
    const mdPath = path.join(episodeDir, "qa/pipeline_map.md");

    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(mdPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(jsonPath, "utf8")).stages).toHaveLength(map.stages.length);
    expect(fs.readFileSync(mdPath, "utf8")).toContain("```mermaid");
    expect(fs.readFileSync(mdPath, "utf8")).toContain("| Stage | Status | Inputs | Outputs |");
  });

  it("does not fail when recording_needed.md is cleared after valid voice enrollment", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-map-ready-"));

    try {
      runContractSmoke(topicPath, tempRoot);
      const episodeDir = path.join(tempRoot, "episodes/ep01_attention_is_all_you_need");
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/consent.wav"));
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/reference_01.wav"));
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "check" });
      writeQualityReport(episodeDir, buildQualityReport(episodeDir));

      const map = buildPipelineMap(topicPath, tempRoot);
      const stageById = Object.fromEntries(map.stages.map((stage) => [stage.id, stage]));

      expect(fs.existsSync(path.join(episodeDir, "voice/enrollment/recording_needed.md"))).toBe(false);
      expect(stageById.contract_smoke.status).toBe("pass");
      expect(stageById.quality_gate.status).toBe("partial");
      expect(map.summary.failed_stages).toBe(0);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("Dagu workflow", () => {
  it("connects the existing npm scripts in dependency order", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep01.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));

    expect(steps.validate_topic.run).toBe("npm run validate:topic");
    expect(steps.hooks_score.depends).toBe("validate_topic");
    expect(steps.contract_smoke.run).toBe("npm run episode:contract-smoke");
    expect(steps.voiceover_audio.run).toBe("npm run voiceover:check");
    expect(steps.voiceover_audio.depends).toBe("contract_smoke");
    expect(steps.captions.run).toBe("npm run captions:align");
    expect(steps.captions.depends).toBe("voiceover_audio");
    expect(steps.video_render.run).toBe("npm run video:hyperframes-draft");
    expect(steps.video_render.depends).toBe("captions");
    expect(steps.video_render_smoke_mp4).toBeUndefined();
    expect(steps.publish_pack.run).toBe("npm run publish:pack");
    expect(steps.publish_pack.depends).toBe("video_render");
    expect(steps.quality_gate.depends).toBe("publish_pack");
    expect(steps.pipeline_map.run).toBe("npm run pipeline:map");
    expect(steps.pipeline_map.depends).toBe("quality_gate");
  });
});
