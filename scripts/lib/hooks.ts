import fs from "node:fs";
import path from "node:path";
import type { HookPatterns, PlatformProfile, Topic } from "./contracts.js";

export type HookScore = {
  hook_strength: number;
  clarity: number;
  truthfulness: number;
  platform_fit: number;
  visual_potential: number;
};

export type HookVariant = {
  hook_id: string;
  pattern: string;
  spoken_line: string;
  on_screen_text: string;
  visual_cue: string;
  claim_ids: string[];
  risk_flags: string[];
  score: HookScore;
};

export type PlatformHookResult = {
  episode_id: string;
  platform: string;
  selected_hook_id: string;
  variants: HookVariant[];
};

type HookPattern = HookPatterns["patterns"][number];

const textValues = {
  concept: "QKV",
  concept_en: "Q, K, and V",
  duration: "20",
  subject: "Transformer",
  wrong_belief: "更大",
  correct_shift: "不再一个字一个字读",
  old_way: "RNN",
  old_metaphor: "排队读句子",
  new_way: "Transformer",
  new_metaphor: "全局连线看关系",
  paper_short_title: "Attention Is All You Need",
  count: "5",
  year: "2017",
  question_1: "它解决什么问题",
  question_2: "Attention 怎么工作",
  question_3: "为什么影响大模型",
  question_1_en: "what problem it solved",
  question_2_en: "how attention works",
  question_3_en: "why it shaped modern LLMs"
};

const fallbackTemplates: Record<string, { zh?: string; en?: string }> = {
  pain_point: {
    zh: "如果你一看到 {concept} 就断片，先看这 {duration} 秒。"
  },
  conflict_compare: {
    zh: "{old_way} 像 {old_metaphor}，{new_way} 像 {new_metaphor}。"
  },
  saveable_summary: {
    zh: "一张图看懂 {concept} 的核心。"
  },
  learning_pain: {
    zh: "终于有人把 {concept} 讲成人话了。"
  },
  note_summary: {
    zh: "读 {paper_short_title}，我只抓这 {count} 个点。"
  },
  mistake_warning: {
    zh: "别一上来背公式，先理解 {concept} 在找什么。"
  },
  result_first: {
    en: "Every modern LLM owes something to this {year} paper."
  },
  bold_claim: {
    en: "Attention did not just scale AI. It changed how models read."
  },
  visual_summary: {
    en: "The shortest visual explanation of Q, K, and V."
  },
  thread_lead_in: {
    en: "One diagram for the paper behind modern transformers."
  }
};

const onScreenText: Record<string, { zh: string; en: string }> = {
  authority_anchor: {
    zh: "2017：Transformer 诞生",
    en: "The 2017 Transformer paper"
  },
  bold_claim: {
    zh: "Attention 改变了读法",
    en: "Attention changed reading"
  },
  conflict_compare: {
    zh: "RNN vs Transformer",
    en: "RNN vs Transformer"
  },
  contrarian: {
    zh: "不是更大，是读法变了",
    en: "Not bigger. Different reading."
  },
  learning_pain: {
    zh: "QKV 讲成人话",
    en: "Q, K, V made visual"
  },
  mistake_warning: {
    zh: "先别背公式",
    en: "Do not start with formulas"
  },
  note_summary: {
    zh: "5 个关键点",
    en: "Five key points"
  },
  pain_point: {
    zh: "QKV 到底是什么？",
    en: "What are Q, K, and V?"
  },
  question_agenda: {
    zh: "它解决了什么问题？",
    en: "What did it solve?"
  },
  result_first: {
    zh: "现代大模型绕不开它",
    en: "The paper behind modern LLMs"
  },
  saveable_summary: {
    zh: "一张图看懂 Transformer",
    en: "Transformer in one diagram"
  },
  structure_preview: {
    zh: "3 个问题讲清楚",
    en: "Three questions"
  },
  thread_lead_in: {
    zh: "一张图串起 Transformer",
    en: "One diagram for Transformers"
  },
  visual_promise: {
    zh: "一张动态图看懂 Attention",
    en: "One animated diagram"
  },
  visual_summary: {
    zh: "QKV 一图讲清",
    en: "Q, K, V in one diagram"
  }
};

const englishVisualCues: Record<string, string> = {
  authority_anchor: "Paper card enters over a timeline of modern AI models",
  bold_claim: "Bold claim text appears with a reading-path animation",
  conflict_compare: "Two columns switch from sequential reading to parallel links",
  contrarian: "A crossed-out misconception flips into the correct model-reading shift",
  learning_pain: "Dense symbols fade into three plain-language cards",
  mistake_warning: "Formula layer dims while the core question card appears",
  note_summary: "Paper title turns into a compact five-point note outline",
  pain_point: "Q, K, and V cards enter quickly before splitting into roles",
  question_agenda: "Question card opens into a three-step agenda",
  result_first: "Abstract LLM blocks connect back to the 2017 paper card",
  saveable_summary: "Notebook-style cover with one diagram and three takeaways",
  structure_preview: "Three chapter cards appear in sequence",
  thread_lead_in: "Center-safe diagram thumbnail expands from the middle",
  visual_promise: "Blank canvas builds an attention diagram node by node",
  visual_summary: "Q/K/V cards align into the attention output"
};

const claimIdsByPattern: Record<string, string[]> = {
  authority_anchor: ["c_transformer_impact"],
  bold_claim: ["c_attention_reading_shift"],
  conflict_compare: ["c_transformer_parallelism"],
  contrarian: ["c_attention_reading_shift"],
  learning_pain: ["c_attention_qkv"],
  mistake_warning: ["c_attention_qkv"],
  note_summary: ["c_paper_summary"],
  pain_point: ["c_attention_qkv"],
  question_agenda: ["c_paper_problem"],
  result_first: ["c_transformer_impact"],
  saveable_summary: ["c_attention_core"],
  structure_preview: ["c_paper_problem"],
  thread_lead_in: ["c_transformer_impact"],
  visual_promise: ["c_attention_core"],
  visual_summary: ["c_attention_qkv"]
};

function platformSlug(profileId: string): string {
  return profileId.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function replaceTemplateValues(template: string, language: PlatformProfile["language"]): string {
  const values: Record<string, string> = {
    ...textValues,
    concept: language === "en-US" ? textValues.concept_en : textValues.concept,
    question_1: language === "en-US" ? textValues.question_1_en : textValues.question_1,
    question_2: language === "en-US" ? textValues.question_2_en : textValues.question_2,
    question_3: language === "en-US" ? textValues.question_3_en : textValues.question_3
  };

  const rendered = template.replace(/\{([a-z0-9_]+)\}/g, (_match, key: string) => values[key] ?? `{${key}}`);

  if (language === "zh-CN") {
    return rendered.replace(/([\u3400-\u9fff])\s+([\u3400-\u9fff])/gu, "$1$2");
  }

  return rendered;
}

function templateForPattern(pattern: HookPattern, language: PlatformProfile["language"]): string {
  const fallback = fallbackTemplates[pattern.id];

  if (language === "en-US") {
    const template = pattern.template_en ?? fallback?.en;
    if (!template) {
      throw new Error(`Missing English hook template for pattern ${pattern.id}`);
    }
    return template;
  }

  const template = pattern.template_zh ?? fallback?.zh;
  if (!template) {
    throw new Error(`Missing Chinese hook template for pattern ${pattern.id}`);
  }
  return template;
}

function scoreForPattern(pattern: HookPattern, profile: PlatformProfile, variantIndex: number): HookScore {
  const isShortSurface = profile.surface.includes("short") || profile.surface.includes("social");
  const truthfulness = pattern.risk === "high" ? 7 : pattern.risk === "medium" ? 8 : 9;
  const platformFit = Math.max(7, 9 - variantIndex);

  return {
    hook_strength: isShortSurface ? Math.max(7, 9 - variantIndex) : Math.max(7, 8 - variantIndex),
    clarity: 8,
    truthfulness,
    platform_fit: platformFit,
    visual_potential: pattern.visual_cue.length > 0 ? 9 : 7
  };
}

function riskFlagsForPattern(pattern: HookPattern): string[] {
  if (pattern.risk === "low") {
    return [];
  }

  return [`${pattern.risk}_risk_review_needed`];
}

function buildVariant(
  topic: Topic,
  profile: PlatformProfile,
  pattern: HookPattern,
  variantIndex: number
): HookVariant {
  const languageKey = profile.language === "en-US" ? "en" : "zh";
  const hookId = `hook_${platformSlug(profile.id)}_${String(variantIndex + 1).padStart(2, "0")}`;
  const template = templateForPattern(pattern, profile.language);

  return {
    hook_id: hookId,
    pattern: pattern.id,
    spoken_line: replaceTemplateValues(template, profile.language),
    on_screen_text: onScreenText[pattern.id]?.[languageKey] ?? topic.title,
    visual_cue: profile.language === "en-US" ? englishVisualCues[pattern.id] ?? pattern.visual_cue : replaceTemplateValues(pattern.visual_cue, profile.language),
    claim_ids: claimIdsByPattern[pattern.id] ?? ["c_attention_core"],
    risk_flags: riskFlagsForPattern(pattern),
    score: scoreForPattern(pattern, profile, variantIndex)
  };
}

export function buildHooksForTopic(
  topic: Topic,
  profiles: PlatformProfile[],
  patterns: HookPatterns
): PlatformHookResult[] {
  const patternById = new Map(patterns.patterns.map((pattern) => [pattern.id, pattern]));

  return profiles.map((profile) => {
    const primaryPatterns = profile.hook_strategy.primary_patterns.slice(0, 3);
    const variants = primaryPatterns.map((patternId, variantIndex) => {
      const pattern = patternById.get(patternId);
      if (!pattern) {
        throw new Error(`Missing hook pattern ${patternId} for platform ${profile.id}`);
      }

      return buildVariant(topic, profile, pattern, variantIndex);
    });

    const selectedHookId = variants[0]?.hook_id;
    if (!selectedHookId) {
      throw new Error(`No hook variants built for platform ${profile.id}`);
    }

    return {
      episode_id: topic.episode_id,
      platform: profile.id,
      selected_hook_id: selectedHookId,
      variants
    };
  });
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeHookArtifacts(episodeDir: string, results: PlatformHookResult[]): void {
  const totalVariants = results.reduce((sum, result) => sum + result.variants.length, 0);
  const selectedHooks = results.map((result) => ({
    platform: result.platform,
    selected_hook_id: result.selected_hook_id,
    selected_pattern: result.variants[0]?.pattern ?? null,
    selection_reason: "deterministic_first_primary_pattern"
  }));
  const platforms = results.map((result) => ({
    platform: result.platform,
    selected_hook_id: result.selected_hook_id,
    candidate_count: result.variants.length,
    rejected_hook_ids: result.variants.slice(1).map((variant) => variant.hook_id)
  }));
  const hookReport = {
    status: "partial",
    generated_at: new Date(0).toISOString(),
    platform_count: results.length,
    total_variants: totalVariants,
    checks: {
      min_three_variants_per_platform: results.every((result) => result.variants.length >= 3),
      selected_hook_is_first_variant: results.every((result) => result.selected_hook_id === result.variants[0]?.hook_id),
      provider_calls: false,
      tts_calls: false,
      render_calls: false,
      network_calls: false
    },
    platforms,
    selected_hooks: selectedHooks
  };

  writeJson(path.join(episodeDir, "script", "hooks.json"), results);
  writeJson(path.join(episodeDir, "storyboard", "hook_variants.json"), results);
  writeJson(path.join(episodeDir, "qa", "hook_report.json"), hookReport);
}
