import path from "node:path";
import { readTopic } from "./lib/contracts.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { buildPipelineMap, writePipelineMap } from "./lib/pipelineMap.js";

const topicPath = process.argv[2] ?? "episodes/ep01_attention_is_all_you_need/topic.yaml";
const topic = readTopic(topicPath);
const episodeDir = episodeDirForTopic(topic);
const map = buildPipelineMap(topicPath);

writePipelineMap(episodeDir, map);

console.log(`OK pipeline-map status=${map.summary.status} stages=${map.stages.length} output=${path.join(episodeDir, "qa/pipeline_map.md")}`);

if (map.summary.failed_stages > 0) {
  process.exitCode = 1;
}
