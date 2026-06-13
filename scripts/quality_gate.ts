import { readTopic } from "./lib/contracts.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { buildQualityReport, writeQualityReport } from "./lib/quality.js";

const topicPath = process.argv[2];

if (!topicPath) {
  console.error("Usage: tsx scripts/quality_gate.ts <topic.yaml>");
  process.exit(1);
}

const topic = readTopic(topicPath);
const episodeDir = episodeDirForTopic(topic);
const report = buildQualityReport(episodeDir);

writeQualityReport(episodeDir, report);

console.log(`OK quality status=${report.status} blocking_items=${report.blocking_items.length}`);

if (report.status === "failed") {
  process.exitCode = 1;
}
