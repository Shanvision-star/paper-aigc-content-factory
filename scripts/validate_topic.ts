import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";
import { ZodError } from "zod";

const topicPath = process.argv[2];

if (!topicPath) {
  console.error("Usage: tsx scripts/validate_topic.ts <topic.yaml>");
  process.exit(1);
}

function formatValidationError(context: string, error: unknown): string {
  if (error instanceof ZodError) {
    const details = error.issues
      .map((issue) => `${issue.path.length > 0 ? issue.path.join(".") : "(root)"}: ${issue.message}`)
      .join("; ");
    return `Contract validation failed (${context}): ${details}`;
  }

  if (error instanceof Error) {
    return `Contract validation failed (${context}): ${error.message}`;
  }

  return `Contract validation failed (${context}): ${String(error)}`;
}

function failValidation(context: string, error: unknown): never {
  console.error(formatValidationError(context, error));
  process.exit(1);
}

function loadTopicOrExit(path: string) {
  try {
    return readTopic(path);
  } catch (error) {
    failValidation(`topic ${path}`, error);
  }
}

function loadProfileOrExit(profileId: string) {
  const profilePath = `platform_profiles/${profileId}.yaml`;

  try {
    const profile = readPlatformProfile(profileId);
    if (profile.id !== profileId) {
      throw new Error(`Profile id mismatch: target=${profileId} file_id=${profile.id}`);
    }
    return profile;
  } catch (error) {
    failValidation(`profile ${profilePath}`, error);
  }
}

function loadHookPatternsOrExit() {
  try {
    return readHookPatterns();
  } catch (error) {
    failValidation("hook-patterns data/hook_patterns.yml", error);
  }
}

const topic = loadTopicOrExit(topicPath);
const profiles = topic.targets.map((target) => loadProfileOrExit(target));
const hookPatterns = loadHookPatternsOrExit();

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
