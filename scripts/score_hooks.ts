import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { buildHooksForTopic, writeHookArtifacts } from "./lib/hooks.js";

const topicPath = process.argv[2];

if (!topicPath) {
  throw new Error("Usage: tsx scripts/score_hooks.ts <topic.yaml>");
}

const topic = readTopic(topicPath);
const profiles = topic.targets.map((profileId) => readPlatformProfile(profileId));
const patterns = readHookPatterns();
const results = buildHooksForTopic(topic, profiles, patterns);

writeHookArtifacts(episodeDirForTopic(topic), results);

console.log(`OK hooks platforms=${results.length}`);
