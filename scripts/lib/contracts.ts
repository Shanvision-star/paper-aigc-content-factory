import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

export const ProfileIdSchema = z.string().regex(/^[a-z0-9-]+\.(zh-CN|en-US)$/);

export function loadYamlFile(filePath: string): unknown {
  const absolutePath = path.resolve(filePath);
  const raw = fs.readFileSync(absolutePath, "utf8");
  return YAML.parse(raw);
}

export const TopicSchema = z.object({
  episode_id: z.string().regex(/^ep[0-9]+_[a-z0-9_]+$/),
  title: z.string().min(1),
  paper: z.object({
    title: z.string().min(1),
    arxiv_id: z.string().regex(/^[0-9]{4}\.[0-9]{4,5}$/),
    local_research_report: z.string().min(1)
  }),
  audience: z.object({
    primary: z.string().min(1)
  }),
  targets: z.array(ProfileIdSchema).min(1),
  outputs: z.object({
    blog: z.boolean(),
    pdf: z.boolean(),
    video: z.boolean(),
    voiceover: z.boolean(),
    publish_pack: z.boolean()
  }),
  constraints: z.object({
    auto_publish: z.literal(false),
    require_primary_sources: z.boolean(),
    require_citation_gate: z.boolean(),
    require_human_review: z.boolean(),
    voice_mode: z.enum(["personal_voice_or_builtin_fallback", "builtin_voice_only"])
  })
});

export type Topic = z.infer<typeof TopicSchema>;

export const PlatformProfileSchema = z.object({
  id: ProfileIdSchema,
  language: z.enum(["zh-CN", "en-US"]),
  surface: z.string().min(1),
  aspect_ratio: z.string().min(1),
  resolution: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }),
  subtitle: z.object({
    hard_subtitle: z.boolean(),
    max_chars_per_line: z.number().int().positive()
  }),
  hook_strategy: z.object({
    first_seconds: z.number().positive(),
    primary_patterns: z.array(z.string().min(1)).min(1),
    banned_openers: z.array(z.string()).optional(),
    cover_first: z.boolean().optional(),
    allow_context_setup: z.boolean().optional(),
    avoid_cn_context: z.boolean().optional(),
    center_safe_area: z.boolean().optional()
  })
});

export type PlatformProfile = z.infer<typeof PlatformProfileSchema>;

export const HookPatternsSchema = z.object({
  scoring_dimensions: z.array(z.enum([
    "hook_strength",
    "clarity",
    "truthfulness",
    "platform_fit",
    "visual_potential"
  ])).length(5),
  patterns: z.array(z.object({
    id: z.string().min(1),
    zh_name: z.string().min(1),
    risk: z.enum(["low", "medium", "high"]),
    template_zh: z.string().optional(),
    template_en: z.string().optional(),
    visual_cue: z.string().min(1)
  })).min(1)
}).superRefine((value, context) => {
  const seenPatternIds = new Set<string>();
  const duplicatePatternIds = new Set<string>();

  for (const pattern of value.patterns) {
    if (seenPatternIds.has(pattern.id)) {
      duplicatePatternIds.add(pattern.id);
    }
    seenPatternIds.add(pattern.id);
  }

  if (duplicatePatternIds.size > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Duplicate hook pattern id(s): ${Array.from(duplicatePatternIds).sort().join(", ")}`,
      path: ["patterns"]
    });
  }
});

export type HookPatterns = z.infer<typeof HookPatternsSchema>;

export function readTopic(topicPath: string): Topic {
  return TopicSchema.parse(loadYamlFile(topicPath));
}

export function readPlatformProfile(profileId: string): PlatformProfile {
  const validProfileId = ProfileIdSchema.parse(profileId);
  const profilePath = `platform_profiles/${validProfileId}.yaml`;
  const profile = PlatformProfileSchema.parse(loadYamlFile(profilePath));

  if (profile.id !== validProfileId) {
    throw new Error(`Platform profile id mismatch for ${profilePath}: expected ${validProfileId}, got ${profile.id}`);
  }

  return profile;
}

export function readHookPatterns(): HookPatterns {
  return HookPatternsSchema.parse(loadYamlFile("data/hook_patterns.yml"));
}
