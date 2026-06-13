import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { buildQualityReport, writeQualityReport } from "../scripts/lib/quality.js";
import { buildPipelineMap, writePipelineMap } from "../scripts/lib/pipelineMap.js";
import { runContractSmoke } from "../scripts/run_pipeline.js";

const topicPath = "episodes/ep01_attention_is_all_you_need/topic.yaml";

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
    expect(stageById.quality_gate.blocking_items).toHaveLength(4);
    expect(stageById.voiceover_audio.status).toBe("blocked");
    expect(stageById.voiceover_audio.inputs.map((item) => item.path)).toContain("script/voiceover.md");
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
});

describe("Dagu workflow", () => {
  it("connects the existing npm scripts in dependency order", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep01.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));

    expect(steps.validate_topic.run).toBe("npm run validate:topic");
    expect(steps.hooks_score.depends).toBe("validate_topic");
    expect(steps.contract_smoke.run).toBe("npm run episode:contract-smoke");
    expect(steps.quality_gate.depends).toBe("contract_smoke");
    expect(steps.pipeline_map.run).toBe("npm run pipeline:map");
  });
});
