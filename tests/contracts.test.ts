import { describe, expect, it } from "vitest";
import { loadYamlFile, TopicSchema, PlatformProfileSchema, HookPatternsSchema } from "../scripts/lib/contracts.js";

describe("content factory contracts", () => {
  it("loads the first episode topic", () => {
    const topic = TopicSchema.parse(loadYamlFile("episodes/ep01_attention_is_all_you_need/topic.yaml"));

    expect(topic.episode_id).toBe("ep01_attention_is_all_you_need");
    expect(topic.paper.arxiv_id).toBe("1706.03762");
    expect(topic.constraints.auto_publish).toBe(false);
    expect(topic.targets).toContain("douyin.zh-CN");
  });

  it("loads all P0 platform profiles", () => {
    const profilePaths = [
      "platform_profiles/douyin.zh-CN.yaml",
      "platform_profiles/xiaohongshu.zh-CN.yaml",
      "platform_profiles/bilibili.zh-CN.yaml",
      "platform_profiles/youtube-shorts.en-US.yaml",
      "platform_profiles/youtube-long.en-US.yaml",
      "platform_profiles/x.en-US.yaml"
    ];

    const profiles = profilePaths.map((path) => PlatformProfileSchema.parse(loadYamlFile(path)));

    expect(profiles.map((profile) => profile.id)).toEqual([
      "douyin.zh-CN",
      "xiaohongshu.zh-CN",
      "bilibili.zh-CN",
      "youtube-shorts.en-US",
      "youtube-long.en-US",
      "x.en-US"
    ]);
  });

  it("loads the hook pattern library", () => {
    const patterns = HookPatternsSchema.parse(loadYamlFile("data/hook_patterns.yml"));

    expect(patterns.patterns.map((pattern) => pattern.id)).toContain("pain_point");
    expect(patterns.scoring_dimensions).toEqual([
      "hook_strength",
      "clarity",
      "truthfulness",
      "platform_fit",
      "visual_potential"
    ]);
  });
});
