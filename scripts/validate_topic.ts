import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";

const topicPath = process.argv[2];

if (!topicPath) {
  console.error("Usage: tsx scripts/validate_topic.ts <topic.yaml>");
  process.exit(1);
}

const topic = readTopic(topicPath);
const profiles = topic.targets.map((target) => readPlatformProfile(target));
const hookPatterns = readHookPatterns();

const knownPatternIds = new Set(hookPatterns.patterns.map((pattern) => pattern.id));
const missingHookPatterns = profiles.flatMap((profile) =>
  profile.hook_strategy.primary_patterns
    .filter((patternId) => !knownPatternIds.has(patternId))
    .map((patternId) => `${profile.id}:${patternId}`)
);

if (missingHookPatterns.length > 0) {
  console.error(`Missing hook patterns: ${missingHookPatterns.join(", ")}`);
  process.exit(1);
}

console.log(`OK topic=${topic.episode_id} targets=${profiles.length} hook_patterns=${hookPatterns.patterns.length}`);
