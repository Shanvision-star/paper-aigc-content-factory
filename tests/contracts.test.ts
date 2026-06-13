import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { loadYamlFile, TopicSchema, PlatformProfileSchema, HookPatternsSchema, ProfileIdSchema, readPlatformProfile } from "../scripts/lib/contracts.js";

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

  it("rejects unsafe profile identifiers", () => {
    expect(ProfileIdSchema.safeParse("../hook_patterns").success).toBe(false);
    expect(TopicSchema.safeParse({
      episode_id: "ep01_attention_is_all_you_need",
      title: "Attention Is All You Need 改变了什么",
      paper: {
        title: "Attention Is All You Need",
        arxiv_id: "1706.03762",
        local_research_report: "D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md"
      },
      audience: {
        primary: "工程师 + AI 内容初学者"
      },
      targets: ["../hook_patterns"],
      outputs: {
        blog: true,
        pdf: true,
        video: true,
        voiceover: true,
        publish_pack: true
      },
      constraints: {
        auto_publish: false,
        require_primary_sources: true,
        require_citation_gate: true,
        require_human_review: true,
        voice_mode: "personal_voice_or_builtin_fallback"
      }
    }).success).toBe(false);
  });

  it("rejects platform profile files whose internal id does not match the requested id", () => {
    const profileId = `tmp-contract-${randomUUID().replaceAll("-", "")}.zh-CN`;
    const profilePath = `platform_profiles/${profileId}.yaml`;

    try {
      fs.writeFileSync(profilePath, fs.readFileSync("platform_profiles/douyin.zh-CN.yaml", "utf8"), "utf8");

      expect(() => readPlatformProfile(profileId)).toThrow(
        `Platform profile id mismatch for platform_profiles/${profileId}.yaml: expected ${profileId}, got douyin.zh-CN`
      );
    } finally {
      if (fs.existsSync(profilePath)) {
        fs.unlinkSync(profilePath);
      }
    }
  });

  it("rejects duplicate hook pattern identifiers", () => {
    const scoring_dimensions = [
      "hook_strength",
      "clarity",
      "truthfulness",
      "platform_fit",
      "visual_potential"
    ];

    const duplicatePatterns = {
      scoring_dimensions,
      patterns: [
        {
          id: "pain_point",
          zh_name: "痛点代入",
          risk: "medium",
          template_zh: "如果你一看到 {concept} 就断片，先看这 {duration} 秒。",
          visual_cue: "{concept} 卡片快速入场，随后拆成三个可解释元素"
        },
        {
          id: "pain_point",
          zh_name: "重复痛点",
          risk: "low",
          template_zh: "重复",
          visual_cue: "重复"
        }
      ]
    };

    const result = HookPatternsSchema.safeParse(duplicatePatterns);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Duplicate hook pattern id(s): pain_point");
    }
  });
});
