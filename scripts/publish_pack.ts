import fs from "node:fs";
import path from "node:path";
import { readPlatformProfile, readTopic } from "./lib/contracts.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { formalRenderOutputPath, formalRenderReadinessIssue } from "./lib/renderFreshness.js";
import { runtimeTimestamp, writeJson, writeText } from "./lib/runtimeAdapters.js";

export type PublishPackResult = {
  status: "partial" | "ready";
  outputs: string[];
  missing_inputs: string[];
};

type VoiceProfileManifest = {
  status?: string;
};

function platformName(profileId: string): string {
  return {
    "douyin.zh-CN": "抖音",
    "xiaohongshu.zh-CN": "小红书",
    "bilibili.zh-CN": "B 站",
    "tiktok.en-US": "TikTok",
    "youtube-shorts.en-US": "YouTube Shorts",
    "youtube-long.en-US": "YouTube",
    "x.en-US": "X"
  }[profileId] ?? profileId;
}

export function runPublishPack(topicPath: string, rootDir = "."): PublishPackResult {
  const topic = readTopic(topicPath);
  const episodeDir = path.join(path.resolve(rootDir), episodeDirForTopic(topic));
  const voiceManifestPath = path.join(episodeDir, "voice/voice_profile_manifest.json");
  const voiceStatus = fs.existsSync(voiceManifestPath)
    ? (JSON.parse(fs.readFileSync(voiceManifestPath, "utf8")) as VoiceProfileManifest).status
    : null;
  const renderIssue = formalRenderReadinessIssue(episodeDir);
  const missingInputs = [
    formalRenderOutputPath,
    ...(renderIssue ? [renderIssue] : []),
    ...(voiceStatus === "audio_ready" ? [] : [`voice/voice_profile_manifest.json#status=${voiceStatus ?? "missing"}`])
  ].filter((relativePath) => !fs.existsSync(path.join(episodeDir, relativePath)));
  const status = missingInputs.length > 0 ? "partial" : "ready";
  const platformRows = topic.targets.map((profileId) => {
    const profile = readPlatformProfile(profileId);
    return `| ${platformName(profileId)} | ${profile.language} | ${profile.aspect_ratio} | ${profile.resolution.width}x${profile.resolution.height} |`;
  });

  writeText(
    path.join(episodeDir, "publish/publish_pack.md"),
    [
      `# ${topic.title} Publish Pack`,
      "",
      status === "ready" ? "Status: Ready for human review." : "Status: Not ready to publish.",
      "",
      "Auto-publish remains disabled. This pack is for human review only.",
      "",
      "## Platform Targets",
      "",
      "| Platform | Language | Aspect Ratio | Resolution |",
      "|---|---|---|---|",
      ...platformRows,
      "",
      "## Suggested Titles",
      "",
      "- 中文短视频：看懂 QKV，才算真正入门 Transformer",
      "- English short: The QKV idea behind Transformers",
      "",
      "## Missing Inputs",
      "",
      ...(missingInputs.length > 0 ? missingInputs.map((input) => `- ${input}`) : ["- None"]),
      ""
    ].join("\n")
  );

  const result: PublishPackResult = {
    status,
    outputs: ["publish/publish_pack.md"],
    missing_inputs: missingInputs
  };

  writeJson(path.join(episodeDir, "publish/publish_status.json"), {
    ...result,
    generated_at: runtimeTimestamp,
    auto_publish: false
  });

  return result;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/publish_pack.ts <topic.yaml>");
    return 1;
  }

  console.log(JSON.stringify(runPublishPack(topicPath)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/publish_pack.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
