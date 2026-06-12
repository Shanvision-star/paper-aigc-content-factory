# AI Paper Content Factory P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the deterministic P0 skeleton for the AI Paper Content Factory: repository contracts, first episode input, 8+1 Skill boundaries, Hook Lab scoring, and a quality gate that produces a traceable contract-smoke report.

**Architecture:** P0 is a local Node/TypeScript contract pipeline. It validates YAML/JSON inputs, creates deterministic episode artifacts, generates and scores platform-specific hooks, and records blocking gaps for voice/video work without calling external LLMs, TTS engines, or renderers. Real GPT-SoVITS/OpenAI TTS, HyperFrames rendering, and full research extraction are separate follow-up plans after this P0 contract layer passes.

**Tech Stack:** Node.js 22+, TypeScript, `tsx`, `vitest`, `zod`, `yaml`, Markdown Skill files, JSON/YAML episode contracts.

---

## Scope Check

The approved spec covers research, writing, hooks, voice, captions, rendering, quality gates, and optimization. This implementation plan intentionally covers the first independently testable slice:

- Repository skeleton and configuration contracts.
- First episode `topic.yaml`.
- Platform profiles and hook pattern library.
- 8+1 Skill skeletons with allowed inputs, outputs, and forbidden actions.
- Deterministic Hook Lab generation and scoring.
- Contract-smoke pipeline that writes draft script/storyboard/review/qa artifacts.
- Quality gate that reports `partial` while real audio/video are absent.

This plan does not generate real cloned voice, real subtitles, real Manim assets, real HyperFrames video, or final publish-ready assets. Those are blocked until the P0 contracts and gates are stable.

## File Structure

Create these files:

- `AGENTS.md`  
  Project-local execution rules for this content factory.
- `package.json`, `tsconfig.json`, `.gitignore`  
  Node/TypeScript test and script baseline.
- `pipelines/episode.schema.json`  
  JSON Schema for `topic.yaml`.
- `pipelines/ep01_attention.yml`  
  P0 pipeline declaration for the first episode.
- `platform_profiles/*.yaml`  
  Platform-specific output and hook strategy profiles.
- `data/hook_patterns.yml`  
  Reusable Hook Lab pattern library.
- `.agents/skills/*/SKILL.md`  
  8+1 local Skill boundaries.
- `episodes/ep01_attention_is_all_you_need/topic.yaml`  
  First episode input contract pointing at the local deep research report.
- `scripts/lib/contracts.ts`  
  Zod contracts and YAML/JSON helpers.
- `scripts/lib/episodePaths.ts`  
  Canonical episode path builder.
- `scripts/lib/hooks.ts`  
  Hook candidate generation, scoring, and report logic.
- `scripts/lib/quality.ts`  
  Quality gate checks and report builder.
- `scripts/validate_topic.ts`  
  CLI validator for `topic.yaml`, platform profiles, and hook patterns.
- `scripts/score_hooks.ts`  
  CLI that writes `script/hooks.json`, `storyboard/hook_variants.json`, and `qa/hook_report.json`.
- `scripts/run_pipeline.ts`  
  Contract-smoke pipeline for P0.
- `scripts/quality_gate.ts`  
  CLI that writes `qa/qa_report.json`.
- `tests/contracts.test.ts`, `tests/hooks.test.ts`, `tests/quality.test.ts`, `tests/pipeline.test.ts`  
  Vitest coverage for the P0 contract layer.

Modify these files:

- `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md` only if implementation reveals a contract mismatch. If changed, preserve Original / Revised / Reason in the commit message body.

---

### Task 1: Project Baseline

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `AGENTS.md`
- Test: package scripts only

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "paper-aigc-content-factory",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "validate:topic": "tsx scripts/validate_topic.ts episodes/ep01_attention_is_all_you_need/topic.yaml",
    "episode:contract-smoke": "tsx scripts/run_pipeline.ts episodes/ep01_attention_is_all_you_need/topic.yaml --mode contract-smoke",
    "hooks:score": "tsx scripts/score_hooks.ts episodes/ep01_attention_is_all_you_need/topic.yaml",
    "quality:gate": "tsx scripts/quality_gate.ts episodes/ep01_attention_is_all_you_need/topic.yaml"
  },
  "dependencies": {
    "yaml": "^2.7.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["scripts/**/*.ts", "tests/**/*.ts"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
dist/
.env
.env.local
coverage/
*.log
episodes/**/renders/*.mp4
episodes/**/audio/*.wav
episodes/**/voice/enrollment/*.wav
episodes/**/voice/enrollment/*.mp3
```

- [ ] **Step 4: Create `AGENTS.md`**

```markdown
# AI Paper Content Factory Agent Rules

## Authority Order

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
3. `pipelines/*.yml`
4. `platform_profiles/*.yaml`
5. `.agents/skills/*/SKILL.md`
6. `episodes/*/` generated artifacts and review records

## Execution Rules

- Work in Chinese for reasoning and docs unless a target artifact is English.
- Decide whether each task is a code gap, documentation gap, verification gap, or product-boundary decision before editing.
- Keep P0 deterministic: no real LLM, TTS, HyperFrames, Manim, or network calls in default tests.
- Do not auto-publish to any platform.
- Do not use unlicensed voice samples.
- Do not claim full production readiness while `qa_report.json.status` is `partial` or `failed`.
- If personal voice files are missing, write `voice/enrollment/recording_needed.md` and keep `voice_profile_manifest.json.status` as `recording_needed`.
- Real provider smoke must be explicit and separate from `npm test`.
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and installation exits with code 0.

- [ ] **Step 6: Run baseline checks**

Run: `npm run typecheck`

Expected: FAIL with `No inputs were found` or an equivalent TypeScript message because scripts have not been created yet.

Run: `npm test`

Expected: FAIL with no tests found or no test files because tests have not been created yet.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore AGENTS.md
git commit -m "chore: add content factory project baseline"
```

---

### Task 2: Configuration Contracts and First Episode Inputs

**Files:**
- Create: `pipelines/episode.schema.json`
- Create: `pipelines/ep01_attention.yml`
- Create: `platform_profiles/douyin.zh-CN.yaml`
- Create: `platform_profiles/xiaohongshu.zh-CN.yaml`
- Create: `platform_profiles/bilibili.zh-CN.yaml`
- Create: `platform_profiles/youtube-shorts.en-US.yaml`
- Create: `platform_profiles/youtube-long.en-US.yaml`
- Create: `platform_profiles/x.en-US.yaml`
- Create: `data/hook_patterns.yml`
- Create: `episodes/ep01_attention_is_all_you_need/topic.yaml`
- Test: `tests/contracts.test.ts`

- [ ] **Step 1: Write failing contract tests**

Create `tests/contracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run contract test to verify it fails**

Run: `npx vitest run tests/contracts.test.ts`

Expected: FAIL with `Cannot find module '../scripts/lib/contracts.js'`.

- [ ] **Step 3: Create `pipelines/episode.schema.json`**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Paper Content Factory Episode",
  "type": "object",
  "required": ["episode_id", "title", "paper", "audience", "targets", "outputs", "constraints"],
  "properties": {
    "episode_id": { "type": "string", "pattern": "^ep[0-9]+_[a-z0-9_]+$" },
    "title": { "type": "string", "minLength": 1 },
    "paper": {
      "type": "object",
      "required": ["title", "arxiv_id", "local_research_report"],
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "arxiv_id": { "type": "string", "pattern": "^[0-9]{4}\\.[0-9]{4,5}$" },
        "local_research_report": { "type": "string", "minLength": 1 }
      }
    },
    "audience": {
      "type": "object",
      "required": ["primary"],
      "properties": {
        "primary": { "type": "string", "minLength": 1 }
      }
    },
    "targets": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string" }
    },
    "outputs": {
      "type": "object",
      "required": ["blog", "pdf", "video", "voiceover", "publish_pack"],
      "properties": {
        "blog": { "type": "boolean" },
        "pdf": { "type": "boolean" },
        "video": { "type": "boolean" },
        "voiceover": { "type": "boolean" },
        "publish_pack": { "type": "boolean" }
      }
    },
    "constraints": {
      "type": "object",
      "required": ["auto_publish", "require_primary_sources", "require_citation_gate", "require_human_review", "voice_mode"],
      "properties": {
        "auto_publish": { "const": false },
        "require_primary_sources": { "type": "boolean" },
        "require_citation_gate": { "type": "boolean" },
        "require_human_review": { "type": "boolean" },
        "voice_mode": { "enum": ["personal_voice_or_builtin_fallback", "builtin_voice_only"] }
      }
    }
  }
}
```

- [ ] **Step 4: Create `episodes/ep01_attention_is_all_you_need/topic.yaml`**

```yaml
episode_id: ep01_attention_is_all_you_need
title: "Attention Is All You Need 改变了什么"
paper:
  title: "Attention Is All You Need"
  arxiv_id: "1706.03762"
  local_research_report: "D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md"
audience:
  primary: "工程师 + AI 内容初学者"
targets:
  - douyin.zh-CN
  - xiaohongshu.zh-CN
  - bilibili.zh-CN
  - youtube-shorts.en-US
  - youtube-long.en-US
  - x.en-US
outputs:
  blog: true
  pdf: true
  video: true
  voiceover: true
  publish_pack: true
constraints:
  auto_publish: false
  require_primary_sources: true
  require_citation_gate: true
  require_human_review: true
  voice_mode: personal_voice_or_builtin_fallback
```

- [ ] **Step 5: Create `pipelines/ep01_attention.yml`**

```yaml
id: ep01_attention_is_all_you_need
topic: episodes/ep01_attention_is_all_you_need/topic.yaml
mode: contract-smoke
stages:
  - validate_topic
  - score_hooks
  - run_contract_smoke
  - quality_gate
```

- [ ] **Step 6: Create platform profile files**

Create `platform_profiles/douyin.zh-CN.yaml`:

```yaml
id: douyin.zh-CN
language: zh-CN
surface: short_video
aspect_ratio: "9:16"
resolution:
  width: 1080
  height: 1920
subtitle:
  hard_subtitle: true
  max_chars_per_line: 18
hook_strategy:
  first_seconds: 3
  primary_patterns:
    - pain_point
    - contrarian
    - conflict_compare
    - visual_promise
  banned_openers:
    - "大家好，今天我们来讲"
```

Create `platform_profiles/xiaohongshu.zh-CN.yaml`:

```yaml
id: xiaohongshu.zh-CN
language: zh-CN
surface: note_video
aspect_ratio: "3:4"
resolution:
  width: 1080
  height: 1440
subtitle:
  hard_subtitle: true
  max_chars_per_line: 18
hook_strategy:
  first_seconds: 5
  primary_patterns:
    - saveable_summary
    - learning_pain
    - note_summary
    - mistake_warning
  cover_first: true
```

Create `platform_profiles/bilibili.zh-CN.yaml`:

```yaml
id: bilibili.zh-CN
language: zh-CN
surface: long_video
aspect_ratio: "16:9"
resolution:
  width: 1920
  height: 1080
subtitle:
  hard_subtitle: true
  max_chars_per_line: 24
hook_strategy:
  first_seconds: 10
  primary_patterns:
    - authority_anchor
    - question_agenda
    - structure_preview
  allow_context_setup: true
```

Create `platform_profiles/youtube-shorts.en-US.yaml`:

```yaml
id: youtube-shorts.en-US
language: en-US
surface: short_video
aspect_ratio: "9:16"
resolution:
  width: 1080
  height: 1920
subtitle:
  hard_subtitle: true
  max_chars_per_line: 42
hook_strategy:
  first_seconds: 3
  primary_patterns:
    - result_first
    - contrarian
    - visual_promise
  avoid_cn_context: true
```

Create `platform_profiles/youtube-long.en-US.yaml`:

```yaml
id: youtube-long.en-US
language: en-US
surface: long_video
aspect_ratio: "16:9"
resolution:
  width: 1920
  height: 1080
subtitle:
  hard_subtitle: false
  max_chars_per_line: 42
hook_strategy:
  first_seconds: 30
  primary_patterns:
    - authority_anchor
    - question_agenda
    - structure_preview
  allow_context_setup: true
```

Create `platform_profiles/x.en-US.yaml`:

```yaml
id: x.en-US
language: en-US
surface: social_clip
aspect_ratio: "1:1"
resolution:
  width: 1080
  height: 1080
subtitle:
  hard_subtitle: true
  max_chars_per_line: 42
hook_strategy:
  first_seconds: 4
  primary_patterns:
    - bold_claim
    - visual_summary
    - thread_lead_in
  center_safe_area: true
```

- [ ] **Step 7: Create `data/hook_patterns.yml`**

```yaml
scoring_dimensions:
  - hook_strength
  - clarity
  - truthfulness
  - platform_fit
  - visual_potential
patterns:
  - id: pain_point
    zh_name: 痛点代入
    risk: medium
    template_zh: "如果你一看到 {concept} 就断片，先看这 {duration} 秒。"
    visual_cue: "{concept} 卡片快速入场，随后拆成三个可解释元素"
  - id: contrarian
    zh_name: 反常识
    risk: medium
    template_zh: "{subject} 最厉害的不是 {wrong_belief}，而是 {correct_shift}。"
    template_en: "{subject} did not just make models bigger. It changed how models read."
    visual_cue: "左右对比卡片，错误认知被划掉，正确变化放大"
  - id: conflict_compare
    zh_name: 冲突对比
    risk: low
    template_zh: "{old_way} 像 {old_metaphor}，{new_way} 像 {new_metaphor}。"
    visual_cue: "两列对比动画，从排队处理切到并行连线"
  - id: visual_promise
    zh_name: 视觉承诺
    risk: low
    template_zh: "我用一张动态图，把 {concept} 讲清楚。"
    template_en: "I will explain {concept} with one animated diagram."
    visual_cue: "空白画布生成动态图节点"
  - id: saveable_summary
    zh_name: 收藏承诺
    risk: low
    template_zh: "一张图看懂 {concept} 的核心。"
    visual_cue: "笔记封面式大标题和三点清单"
  - id: learning_pain
    zh_name: 学习痛点
    risk: low
    template_zh: "终于有人把 {concept} 讲成人话了。"
    visual_cue: "复杂公式淡出，换成卡片解释"
  - id: note_summary
    zh_name: 笔记感总结
    risk: low
    template_zh: "读 {paper_short_title}，我只抓这 {count} 个点。"
    visual_cue: "论文标题页切到收藏型笔记目录"
  - id: mistake_warning
    zh_name: 避坑提醒
    risk: low
    template_zh: "别一上来背公式，先理解 {concept} 在找什么。"
    visual_cue: "公式变暗，问题卡片浮现"
  - id: authority_anchor
    zh_name: 权威锚点
    risk: low
    template_zh: "{year} 年这篇论文，改写了后来的 AI 架构。"
    template_en: "This {year} paper changed how modern AI models are built."
    visual_cue: "论文标题和时间线入场"
  - id: question_agenda
    zh_name: 问题导向
    risk: low
    template_zh: "{paper_short_title} 到底解决了什么问题？"
    template_en: "What problem did {paper_short_title} actually solve?"
    visual_cue: "问题卡片进入，随后展开三段式议程"
  - id: structure_preview
    zh_name: 结构预告
    risk: low
    template_zh: "这一集只回答三个问题：{question_1}、{question_2}、{question_3}。"
    template_en: "This episode answers three questions: {question_1}, {question_2}, and {question_3}."
    visual_cue: "三张章节卡片依次出现"
  - id: result_first
    zh_name: 结果先行
    risk: low
    template_en: "Every modern LLM owes something to this {year} paper."
    visual_cue: "LLM logos as abstract blocks connect back to paper card"
  - id: bold_claim
    zh_name: 强观点
    risk: medium
    template_en: "Attention did not just scale AI. It changed how models read."
    visual_cue: "Bold claim text with reading-path animation"
  - id: visual_summary
    zh_name: 图解摘要
    risk: low
    template_en: "The shortest visual explanation of Q, K, and V."
    visual_cue: "Q/K/V cards align into attention output"
  - id: thread_lead_in
    zh_name: 串联引导
    risk: low
    template_en: "One diagram for the paper behind modern transformers."
    visual_cue: "Diagram thumbnail expands from center-safe frame"
```

- [ ] **Step 8: Run test again to confirm it still fails because loader code is absent**

Run: `npx vitest run tests/contracts.test.ts`

Expected: FAIL with `Cannot find module '../scripts/lib/contracts.js'`.

- [ ] **Step 9: Commit contract inputs**

```bash
git add pipelines platform_profiles data episodes tests/contracts.test.ts
git commit -m "test: define content factory contract fixtures"
```

---

### Task 3: Contract Loader and Topic Validator

**Files:**
- Create: `scripts/lib/contracts.ts`
- Create: `scripts/validate_topic.ts`
- Modify: `tests/contracts.test.ts`

- [ ] **Step 1: Create `scripts/lib/contracts.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

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
  targets: z.array(z.string().min(1)).min(1),
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
  id: z.string().min(1),
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
});

export type HookPatterns = z.infer<typeof HookPatternsSchema>;

export function readTopic(topicPath: string): Topic {
  return TopicSchema.parse(loadYamlFile(topicPath));
}

export function readPlatformProfile(profileId: string): PlatformProfile {
  return PlatformProfileSchema.parse(loadYamlFile(`platform_profiles/${profileId}.yaml`));
}

export function readHookPatterns(): HookPatterns {
  return HookPatternsSchema.parse(loadYamlFile("data/hook_patterns.yml"));
}
```

- [ ] **Step 2: Create `scripts/validate_topic.ts`**

```ts
import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";

const topicPath = process.argv[2];

if (!topicPath) {
  console.error("Usage: tsx scripts/validate_topic.ts <topic.yaml>");
  process.exit(1);
}

const topic = readTopic(topicPath);
const profiles = topic.targets.map((target) => readPlatformProfile(target));
const hookPatterns = readHookPatterns();

const missingHookPatterns = profiles.flatMap((profile) =>
  profile.hook_strategy.primary_patterns.filter(
    (patternId) => !hookPatterns.patterns.some((pattern) => pattern.id === patternId)
  ).map((patternId) => `${profile.id}:${patternId}`)
);

if (missingHookPatterns.length > 0) {
  console.error(`Missing hook patterns: ${missingHookPatterns.join(", ")}`);
  process.exit(1);
}

console.log(`OK topic=${topic.episode_id} targets=${profiles.length} hook_patterns=${hookPatterns.patterns.length}`);
```

- [ ] **Step 3: Run contract tests**

Run: `npx vitest run tests/contracts.test.ts`

Expected: PASS with 3 tests.

- [ ] **Step 4: Run topic validator**

Run: `npm run validate:topic`

Expected: `OK topic=ep01_attention_is_all_you_need targets=6 hook_patterns=15`

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/contracts.ts scripts/validate_topic.ts tests/contracts.test.ts
git commit -m "feat: validate episode and platform contracts"
```

---

### Task 4: 8+1 Skill Skeletons

**Files:**
- Create: `.agents/skills/episode-orchestrator/SKILL.md`
- Create: `.agents/skills/source-harvester/SKILL.md`
- Create: `.agents/skills/research-to-claims/SKILL.md`
- Create: `.agents/skills/script-storyboard-writer/SKILL.md`
- Create: `.agents/skills/visual-orchestrator/SKILL.md`
- Create: `.agents/skills/voiceover-adapter/SKILL.md`
- Create: `.agents/skills/caption-aligner/SKILL.md`
- Create: `.agents/skills/hyperframes-composer/SKILL.md`
- Create: `.agents/skills/quality-gate/SKILL.md`
- Create: `.agents/skills/workflow-optimizer/SKILL.md`
- Test: manual grep checks

- [ ] **Step 1: Create Skill directories and files**

Create each `SKILL.md` with this exact pattern, changing `name`, `description`, inputs, outputs, and forbidden actions according to the list below:

`episode-orchestrator/SKILL.md`

```markdown
---
name: episode-orchestrator
description: Orchestrate one AI paper content episode from topic.yaml through deterministic P0 contract smoke outputs.
---

# Episode Orchestrator

## Inputs

- `episodes/{episode_id}/topic.yaml`
- `pipelines/{episode_id}.yml`

## Outputs

- Episode workspace folders
- `qa/qa_report.json`

## Allowed Actions

- Validate `topic.yaml`
- Call local scripts in `scripts/`
- Create missing episode folders

## Forbidden Actions

- Do not call real LLM providers.
- Do not call real TTS providers.
- Do not publish to external platforms.
- Do not train or install voice models.
```

`source-harvester/SKILL.md`

```markdown
---
name: source-harvester
description: Convert verified paper and local research inputs into traceable source records.
---

# Source Harvester

## Inputs

- `topic.yaml`
- Local research report path from `paper.local_research_report`

## Outputs

- `research/sources.jsonl`
- `research/paper_notes.md`

## Allowed Actions

- Record primary paper metadata.
- Record local report as a research input.
- Mark unverifiable items as explanation or inference.

## Forbidden Actions

- Do not treat a local research report as a primary source.
- Do not write voiceover or storyboard files.
- Do not perform network access in default tests.
```

`research-to-claims/SKILL.md`

```markdown
---
name: research-to-claims
description: Turn paper notes into sourced claims, timeline records, and reusable explanation atoms.
---

# Research To Claims

## Inputs

- `research/sources.jsonl`
- `research/paper_notes.md`

## Outputs

- `research/claims.json`
- `research/timeline.json`

## Allowed Actions

- Create claims with `claim_id`, `source_ids`, `confidence`, and `used_in`.
- Flag unsourced statements before they enter scripts.

## Forbidden Actions

- Do not create final scripts from unsourced facts.
- Do not invent source IDs.
```

`script-storyboard-writer/SKILL.md`

```markdown
---
name: script-storyboard-writer
description: Create hook candidates, selected hooks, voiceover drafts, voice segments, and storyboards from sourced claims.
---

# Script Storyboard Writer

## Inputs

- `research/claims.json`
- `data/hook_patterns.yml`
- `platform_profiles/*.yaml`

## Outputs

- `script/hooks.json`
- `script/voiceover.md`
- `script/voice_segments.json`
- `storyboard/hook_variants.json`
- `storyboard/storyboard.json`
- `blog/blog.md`

## Allowed Actions

- Generate at least 3 hook candidates per platform.
- Score hooks on hook strength, clarity, truthfulness, platform fit, and visual potential.
- Use only sourced claims or clearly marked analogies.

## Forbidden Actions

- Do not use generic openers such as "大家好，今天我们来讲" for short video first scenes.
- Do not render video.
- Do not synthesize audio.
```

`visual-orchestrator/SKILL.md`

```markdown
---
name: visual-orchestrator
description: Convert storyboard and hook visual cues into an asset manifest and engine-specific visual specs.
---

# Visual Orchestrator

## Inputs

- `storyboard/storyboard.json`
- `storyboard/hook_variants.json`

## Outputs

- `assets/assets_manifest.json`

## Allowed Actions

- Assign HyperFrames for social motion graphics.
- Assign Manim for formula and matrix explanation specs.
- Preserve first-scene hook visual cues.

## Forbidden Actions

- Do not render HyperFrames or Manim assets in P0.
- Do not add Remotion or Motion Canvas to the P0 main path.
```

`voiceover-adapter/SKILL.md`

```markdown
---
name: voiceover-adapter
description: Manage personal voice enrollment state and route voice segment text to a configured TTS adapter.
---

# Voiceover Adapter

## Inputs

- `script/voice_segments.json`
- `voice/voice_profile_manifest.json`

## Outputs

- `voice/enrollment/recording_needed.md` when enrollment audio is missing
- `audio/voiceover_manifest.json`
- `audio/voiceover.wav` only when a configured TTS adapter succeeds

## Allowed Actions

- Record missing enrollment files as a blocking item.
- Use OpenAI TTS as fallback only when credentials and explicit execution mode are present.

## Forbidden Actions

- Do not use third-party voices.
- Do not install CUDA or GPT-SoVITS.
- Do not fake `voiceover.wav`.
```

`caption-aligner/SKILL.md`

```markdown
---
name: caption-aligner
description: Align generated or recorded voiceover with readable platform subtitles.
---

# Caption Aligner

## Inputs

- `script/voice_segments.json`
- `audio/voiceover.wav`

## Outputs

- `captions/subtitles.srt`
- `captions/subtitles.vtt`

## Allowed Actions

- Split captions for readability.
- Preserve claim meaning.

## Forbidden Actions

- Do not change factual claims while shortening subtitles.
- Do not claim alignment when audio is missing.
```

`hyperframes-composer/SKILL.md`

```markdown
---
name: hyperframes-composer
description: Compose storyboard, assets, audio, and captions into HyperFrames drafts after P0 contracts pass.
---

# HyperFrames Composer

## Inputs

- `storyboard/storyboard.json`
- `assets/assets_manifest.json`
- `audio/voiceover.wav`
- `captions/subtitles.srt`

## Outputs

- `renders/*_draft.mp4`
- Keyframe screenshots

## Allowed Actions

- Render low-resolution drafts before final outputs.
- Keep platform-specific aspect ratios separate.

## Forbidden Actions

- Do not make HyperFrames rendering part of P0 contract-smoke tests.
- Do not add Remotion to the P0 rendering path.
```

`quality-gate/SKILL.md`

```markdown
---
name: quality-gate
description: Validate episode artifacts and block incomplete publish packages with explicit qa reports.
---

# Quality Gate

## Inputs

- `topic.yaml`
- `research/claims.json`
- `script/hooks.json`
- `storyboard/storyboard.json`
- `qa/hook_report.json`

## Outputs

- `qa/qa_report.json`

## Allowed Actions

- Report `pass`, `partial`, or `failed`.
- Use `Not verified` for unavailable audio, captions, or renders.
- List blocking items explicitly.

## Forbidden Actions

- Do not report success when required artifacts are missing.
- Do not hide missing voice or video outputs.
```

`workflow-optimizer/SKILL.md`

```markdown
---
name: workflow-optimizer
description: Convert quality reports and human review feedback into reviewable improvement candidates.
---

# Workflow Optimizer

## Inputs

- `qa/qa_report.json`
- `qa/hook_report.json`
- `review/human_review.md`

## Outputs

- `review/improvement_candidates.json`

## Allowed Actions

- Suggest Skill, template, platform profile, script, or gate changes.
- Include reason, impact, risk, verification, and retention signal.

## Forbidden Actions

- Do not automatically edit `SKILL.md`.
- Do not lower quality gates.
- Do not bypass human review.
```

- [ ] **Step 2: Verify every Skill has forbidden actions**

Run:

```bash
node -e "const fs=require('fs');const path='.agents/skills';const dirs=fs.readdirSync(path);const missing=dirs.filter(d=>!fs.readFileSync(`${path}/${d}/SKILL.md`,'utf8').includes('## Forbidden Actions'));if(missing.length){console.error(missing.join(','));process.exit(1)}console.log(`OK skills=${dirs.length}`)"
```

Expected: `OK skills=10`

- [ ] **Step 3: Commit**

```bash
git add .agents/skills
git commit -m "docs: add local content factory skill skeletons"
```

---

### Task 5: Episode Path Helpers and Deterministic Hook Lab

**Files:**
- Create: `scripts/lib/episodePaths.ts`
- Create: `scripts/lib/hooks.ts`
- Create: `scripts/score_hooks.ts`
- Create: `tests/hooks.test.ts`

- [ ] **Step 1: Write failing Hook Lab tests**

Create `tests/hooks.test.ts`:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readHookPatterns, readPlatformProfile, readTopic } from "../scripts/lib/contracts.js";
import { buildHooksForTopic, writeHookArtifacts } from "../scripts/lib/hooks.js";

describe("Hook Lab", () => {
  it("generates at least three hooks per platform with complete scoring", () => {
    const topic = readTopic("episodes/ep01_attention_is_all_you_need/topic.yaml");
    const patterns = readHookPatterns();
    const profiles = topic.targets.map((target) => readPlatformProfile(target));

    const results = buildHooksForTopic(topic, profiles, patterns);

    expect(results).toHaveLength(6);
    for (const result of results) {
      expect(result.variants.length).toBeGreaterThanOrEqual(3);
      expect(result.selected_hook_id).toBe(result.variants[0].hook_id);
      expect(result.variants[0].score).toEqual({
        hook_strength: expect.any(Number),
        clarity: expect.any(Number),
        truthfulness: expect.any(Number),
        platform_fit: expect.any(Number),
        visual_potential: expect.any(Number)
      });
    }
  });

  it("writes hook artifacts to an episode directory", () => {
    const topic = readTopic("episodes/ep01_attention_is_all_you_need/topic.yaml");
    const patterns = readHookPatterns();
    const profiles = topic.targets.map((target) => readPlatformProfile(target));
    const results = buildHooksForTopic(topic, profiles, patterns);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hook-lab-"));

    writeHookArtifacts(tempDir, results);

    expect(fs.existsSync(path.join(tempDir, "script/hooks.json"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "storyboard/hook_variants.json"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "qa/hook_report.json"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run Hook Lab test to verify it fails**

Run: `npx vitest run tests/hooks.test.ts`

Expected: FAIL with `Cannot find module '../scripts/lib/hooks.js'`.

- [ ] **Step 3: Create `scripts/lib/episodePaths.ts`**

```ts
import path from "node:path";
import type { Topic } from "./contracts.js";

export function episodeDirForTopic(topic: Topic): string {
  return path.join("episodes", topic.episode_id);
}

export function episodePath(topic: Topic, relativePath: string): string {
  return path.join(episodeDirForTopic(topic), relativePath);
}
```

- [ ] **Step 4: Create `scripts/lib/hooks.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import type { HookPatterns, PlatformProfile, Topic } from "./contracts.js";

type HookScore = {
  hook_strength: number;
  clarity: number;
  truthfulness: number;
  platform_fit: number;
  visual_potential: number;
};

type HookVariant = {
  hook_id: string;
  pattern: string;
  spoken_line: string;
  on_screen_text: string;
  visual_cue: string;
  claim_ids: string[];
  risk_flags: string[];
  score: HookScore;
};

type PlatformHooks = {
  episode_id: string;
  platform: string;
  selected_hook_id: string;
  variants: HookVariant[];
};

function fillTemplate(template: string, topic: Topic): string {
  return template
    .replaceAll("{concept}", "QKV")
    .replaceAll("{duration}", "20")
    .replaceAll("{subject}", "Transformer")
    .replaceAll("{wrong_belief}", "更大")
    .replaceAll("{correct_shift}", "不再一个字一个字读")
    .replaceAll("{old_way}", "RNN")
    .replaceAll("{new_way}", "Transformer")
    .replaceAll("{old_metaphor}", "排队点名")
    .replaceAll("{new_metaphor}", "全班同时举手")
    .replaceAll("{paper_short_title}", "Attention Is All You Need")
    .replaceAll("{count}", "5")
    .replaceAll("{year}", "2017")
    .replaceAll("{question_1}", "Attention 是什么")
    .replaceAll("{question_2}", "QKV 怎么理解")
    .replaceAll("{question_3}", "它为什么改变大模型")
    .replaceAll("{paper}", topic.paper.title);
}

function scoreHook(profile: PlatformProfile, risk: "low" | "medium" | "high"): HookScore {
  const riskPenalty = risk === "high" ? 3 : risk === "medium" ? 1 : 0;
  const shortVideoBoost = profile.surface.includes("short") ? 1 : 0;
  return {
    hook_strength: Math.max(1, 8 + shortVideoBoost - riskPenalty),
    clarity: Math.max(1, 8 - riskPenalty),
    truthfulness: Math.max(1, 9 - riskPenalty),
    platform_fit: 9,
    visual_potential: 8 + shortVideoBoost
  };
}

function onScreenText(spokenLine: string, language: PlatformProfile["language"]): string {
  if (language === "en-US") {
    return spokenLine.length > 44 ? spokenLine.slice(0, 41).trimEnd() + "..." : spokenLine;
  }
  return spokenLine.length > 18 ? spokenLine.slice(0, 18) : spokenLine;
}

export function buildHooksForTopic(
  topic: Topic,
  profiles: PlatformProfile[],
  patterns: HookPatterns
): PlatformHooks[] {
  return profiles.map((profile) => {
    const variants = profile.hook_strategy.primary_patterns.slice(0, 3).map((patternId, index) => {
      const pattern = patterns.patterns.find((candidate) => candidate.id === patternId);
      if (!pattern) {
        throw new Error(`Missing hook pattern ${patternId} for ${profile.id}`);
      }
      const template = profile.language === "en-US" ? pattern.template_en ?? pattern.template_zh : pattern.template_zh ?? pattern.template_en;
      if (!template) {
        throw new Error(`Pattern ${pattern.id} has no template for ${profile.language}`);
      }
      const spokenLine = fillTemplate(template, topic);
      return {
        hook_id: `hook_${profile.id.replace(/[^a-zA-Z0-9]+/g, "_")}_${String(index + 1).padStart(2, "0")}`,
        pattern: pattern.id,
        spoken_line: spokenLine,
        on_screen_text: onScreenText(spokenLine, profile.language),
        visual_cue: fillTemplate(pattern.visual_cue, topic),
        claim_ids: ["c_attention_architecture_shift"],
        risk_flags: pattern.risk === "medium" ? ["needs_truthfulness_review"] : [],
        score: scoreHook(profile, pattern.risk)
      };
    });

    return {
      episode_id: topic.episode_id,
      platform: profile.id,
      selected_hook_id: variants[0].hook_id,
      variants
    };
  });
}

export function writeHookArtifacts(episodeDir: string, results: PlatformHooks[]): void {
  fs.mkdirSync(path.join(episodeDir, "script"), { recursive: true });
  fs.mkdirSync(path.join(episodeDir, "storyboard"), { recursive: true });
  fs.mkdirSync(path.join(episodeDir, "qa"), { recursive: true });

  fs.writeFileSync(path.join(episodeDir, "script/hooks.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(episodeDir, "storyboard/hook_variants.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(episodeDir, "qa/hook_report.json"), JSON.stringify({
    status: "pass",
    checked_at: new Date(0).toISOString(),
    platforms: results.map((result) => ({
      platform: result.platform,
      selected_hook_id: result.selected_hook_id,
      candidate_count: result.variants.length,
      rejected_hook_ids: result.variants.slice(1).map((variant) => variant.hook_id)
    }))
  }, null, 2) + "\n", "utf8");
}
```

- [ ] **Step 5: Create `scripts/score_hooks.ts`**

```ts
import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { buildHooksForTopic, writeHookArtifacts } from "./lib/hooks.js";

const topicPath = process.argv[2];

if (!topicPath) {
  console.error("Usage: tsx scripts/score_hooks.ts <topic.yaml>");
  process.exit(1);
}

const topic = readTopic(topicPath);
const profiles = topic.targets.map((target) => readPlatformProfile(target));
const patterns = readHookPatterns();
const results = buildHooksForTopic(topic, profiles, patterns);

writeHookArtifacts(episodeDirForTopic(topic), results);
console.log(`OK hooks platforms=${results.length}`);
```

- [ ] **Step 6: Run Hook Lab tests**

Run: `npx vitest run tests/hooks.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 7: Run Hook Lab CLI**

Run: `npm run hooks:score`

Expected: `OK hooks platforms=6`

Check:

```bash
node -e "const h=require('./episodes/ep01_attention_is_all_you_need/script/hooks.json'); console.log(h.length, h[0].variants.length)"
```

Expected: `6 3`

- [ ] **Step 8: Commit**

```bash
git add scripts/lib/episodePaths.ts scripts/lib/hooks.ts scripts/score_hooks.ts tests/hooks.test.ts episodes/ep01_attention_is_all_you_need/script episodes/ep01_attention_is_all_you_need/storyboard episodes/ep01_attention_is_all_you_need/qa
git commit -m "feat: add deterministic hook lab"
```

---

### Task 6: Contract-Smoke Pipeline Artifacts

**Files:**
- Create: `scripts/run_pipeline.ts`
- Test: `tests/pipeline.test.ts`
- Generated by command: `episodes/ep01_attention_is_all_you_need/research/*`
- Generated by command: `episodes/ep01_attention_is_all_you_need/blog/blog.md`
- Generated by command: `episodes/ep01_attention_is_all_you_need/voice/enrollment/recording_needed.md`
- Generated by command: `episodes/ep01_attention_is_all_you_need/voice/voice_profile_manifest.json`
- Generated by command: `episodes/ep01_attention_is_all_you_need/review/human_review.md`

- [ ] **Step 1: Write failing pipeline test**

Create `tests/pipeline.test.ts`:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runContractSmoke } from "../scripts/run_pipeline.js";

describe("contract-smoke pipeline", () => {
  it("writes deterministic P0 episode artifacts", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "episode-p0-"));

    runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);

    const episodeDir = path.join(tempRoot, "episodes/ep01_attention_is_all_you_need");
    expect(fs.existsSync(path.join(episodeDir, "research/sources.jsonl"))).toBe(true);
    expect(fs.existsSync(path.join(episodeDir, "research/claims.json"))).toBe(true);
    expect(fs.existsSync(path.join(episodeDir, "script/voiceover.md"))).toBe(true);
    expect(fs.existsSync(path.join(episodeDir, "storyboard/storyboard.json"))).toBe(true);
    expect(fs.existsSync(path.join(episodeDir, "voice/enrollment/recording_needed.md"))).toBe(true);
    expect(fs.existsSync(path.join(episodeDir, "review/human_review.md"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run pipeline test to verify it fails**

Run: `npx vitest run tests/pipeline.test.ts`

Expected: FAIL with `Cannot find module '../scripts/run_pipeline.js'`.

- [ ] **Step 3: Create `scripts/run_pipeline.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readHookPatterns, readPlatformProfile, readTopic } from "./lib/contracts.js";
import { buildHooksForTopic, writeHookArtifacts } from "./lib/hooks.js";

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath: string, value: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
}

export function runContractSmoke(topicPath: string, rootDir = "."): void {
  const topic = readTopic(topicPath);
  const episodeDir = path.join(rootDir, "episodes", topic.episode_id);
  const profiles = topic.targets.map((target) => readPlatformProfile(target));
  const hookPatterns = readHookPatterns();
  const hooks = buildHooksForTopic(topic, profiles, hookPatterns);

  fs.mkdirSync(episodeDir, { recursive: true });
  fs.copyFileSync(path.resolve(topicPath), path.join(episodeDir, "topic.yaml"));

  writeText(path.join(episodeDir, "research/sources.jsonl"), [
    JSON.stringify({
      id: "src_001",
      type: "paper",
      title: topic.paper.title,
      arxiv_id: topic.paper.arxiv_id,
      primary: true
    }),
    JSON.stringify({
      id: "src_002",
      type: "local_research_report",
      title: "attention_is_all_you_nedd_deep-research-report.md",
      path: topic.paper.local_research_report,
      primary: false
    })
  ].join("\n") + "\n");

  writeText(path.join(episodeDir, "research/paper_notes.md"), `# ${topic.paper.title}\n\nP0 contract-smoke notes. The local report is an input, not a primary source.\n`);

  writeJson(path.join(episodeDir, "research/claims.json"), [
    {
      claim_id: "c_attention_architecture_shift",
      claim: "Transformer replaced recurrent and convolutional sequence modeling with attention-centered sequence modeling.",
      source_ids: ["src_001"],
      confidence: "high",
      used_in: ["blog", "script", "pdf", "hook"]
    }
  ]);

  writeJson(path.join(episodeDir, "research/timeline.json"), [
    {
      year: 2017,
      event: "Attention Is All You Need introduced the Transformer architecture.",
      source_ids: ["src_001"]
    }
  ]);

  writeHookArtifacts(episodeDir, hooks);

  const selectedDouyinHook = hooks.find((item) => item.platform === "douyin.zh-CN")?.variants[0];
  const openingLine = selectedDouyinHook?.spoken_line ?? "今天的大模型，几乎都绕不开这篇 2017 年论文。";

  writeText(path.join(episodeDir, "script/voiceover.md"), `# Voiceover Draft\n\n${openingLine}\n\nTransformer 的核心变化，是让序列里的 token 可以直接互相看见关系。\n`);
  writeJson(path.join(episodeDir, "script/voice_segments.json"), [
    {
      segment_id: "seg_001",
      scene_id: "S00_hook",
      text: openingLine,
      target_duration_sec: 3
    },
    {
      segment_id: "seg_002",
      scene_id: "S01_core_shift",
      text: "Transformer 的核心变化，是让序列里的 token 可以直接互相看见关系。",
      target_duration_sec: 7
    }
  ]);
  writeJson(path.join(episodeDir, "storyboard/storyboard.json"), [
    {
      scene_id: "S00_hook",
      hook_id: selectedDouyinHook?.hook_id ?? "hook_missing",
      duration: 3,
      voiceover: openingLine,
      visual_type: "hook_cards",
      engine: "hyperframes"
    },
    {
      scene_id: "S01_core_shift",
      duration: 7,
      voiceover: "Transformer 的核心变化，是让序列里的 token 可以直接互相看见关系。",
      visual_type: "rnn_vs_attention",
      engine: "hyperframes"
    }
  ]);
  writeText(path.join(episodeDir, "blog/blog.md"), `# ${topic.title}\n\n本篇先建立 P0 内容骨架，所有关键事实必须回到 claims.json。\n`);
  writeText(path.join(episodeDir, "voice/enrollment/recording_needed.md"), "# Recording Needed\n\n请录制 consent.wav 和 reference_01.wav 后再启用个人声音模式。\n");
  writeJson(path.join(episodeDir, "voice/voice_profile_manifest.json"), {
    voice_profile_id: "rome_personal_zh_v1",
    owner: "user_self",
    consent_audio: "voice/enrollment/consent.wav",
    reference_audio: ["voice/enrollment/reference_01.wav"],
    allowed_use: ["personal_ai_paper_voiceover"],
    default_engine: "gpt_sovits_local",
    fallback_engine: "openai_tts",
    status: "recording_needed"
  });
  writeText(path.join(episodeDir, "review/human_review.md"), "# Human Review\n\n- Hook choice: Not reviewed\n- Voice quality: Not verified\n- Video rhythm: Not verified\n");
}

const topicPath = process.argv[2];
const modeArg = process.argv[3];
const mode = process.argv[4] ?? modeArg;

if (topicPath && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (mode !== "contract-smoke") {
    console.error("Usage: tsx scripts/run_pipeline.ts <topic.yaml> --mode contract-smoke");
    process.exit(1);
  }
  runContractSmoke(topicPath);
  console.log("OK contract-smoke");
}
```

- [ ] **Step 4: Run pipeline test**

Run: `npx vitest run tests/pipeline.test.ts`

Expected: PASS with 1 test.

- [ ] **Step 5: Run pipeline CLI**

Run: `npm run episode:contract-smoke`

Expected: `OK contract-smoke`

- [ ] **Step 6: Verify key artifacts exist**

Run:

```bash
node -e "const fs=require('fs'); const base='episodes/ep01_attention_is_all_you_need'; for (const f of ['research/claims.json','script/hooks.json','storyboard/storyboard.json','voice/enrollment/recording_needed.md','review/human_review.md']) { if (!fs.existsSync(`${base}/${f}`)) { throw new Error(f) } } console.log('OK artifacts')"
```

Expected: `OK artifacts`

- [ ] **Step 7: Commit**

```bash
git add scripts/run_pipeline.ts tests/pipeline.test.ts episodes/ep01_attention_is_all_you_need
git commit -m "feat: generate p0 episode contract artifacts"
```

---

### Task 7: Quality Gate and P0 Report

**Files:**
- Create: `scripts/lib/quality.ts`
- Create: `scripts/quality_gate.ts`
- Create: `tests/quality.test.ts`
- Generated by command: `episodes/ep01_attention_is_all_you_need/qa/qa_report.json`

- [ ] **Step 1: Write failing quality gate test**

Create `tests/quality.test.ts`:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runContractSmoke } from "../scripts/run_pipeline.js";
import { buildQualityReport, writeQualityReport } from "../scripts/lib/quality.js";

describe("quality gate", () => {
  it("reports partial when P0 contracts pass but real audio/video are missing", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quality-p0-"));
    runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);

    const report = buildQualityReport(path.join(tempRoot, "episodes/ep01_attention_is_all_you_need"));

    expect(report.status).toBe("partial");
    expect(report.not_verified).toContain("audio/voiceover.wav");
    expect(report.not_verified).toContain("renders/douyin_zh_1080x1920_draft.mp4");
    expect(report.passed).toContain("script/hooks.json");
  });

  it("writes qa_report.json", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quality-p0-"));
    runContractSmoke("episodes/ep01_attention_is_all_you_need/topic.yaml", tempRoot);
    const episodeDir = path.join(tempRoot, "episodes/ep01_attention_is_all_you_need");

    const report = buildQualityReport(episodeDir);
    writeQualityReport(episodeDir, report);

    expect(fs.existsSync(path.join(episodeDir, "qa/qa_report.json"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run quality test to verify it fails**

Run: `npx vitest run tests/quality.test.ts`

Expected: FAIL with `Cannot find module '../scripts/lib/quality.js'`.

- [ ] **Step 3: Create `scripts/lib/quality.ts`**

```ts
import fs from "node:fs";
import path from "node:path";

type QualityReport = {
  status: "pass" | "partial" | "failed";
  checked_at: string;
  passed: string[];
  failed: string[];
  not_verified: string[];
  blocking_items: string[];
};

function exists(episodeDir: string, relativePath: string): boolean {
  return fs.existsSync(path.join(episodeDir, relativePath));
}

export function buildQualityReport(episodeDir: string): QualityReport {
  const required = [
    "topic.yaml",
    "research/sources.jsonl",
    "research/claims.json",
    "script/hooks.json",
    "script/voiceover.md",
    "script/voice_segments.json",
    "storyboard/hook_variants.json",
    "storyboard/storyboard.json",
    "qa/hook_report.json",
    "blog/blog.md",
    "voice/voice_profile_manifest.json",
    "review/human_review.md"
  ];

  const futureRuntimeArtifacts = [
    "audio/voiceover.wav",
    "captions/subtitles.srt",
    "renders/douyin_zh_1080x1920_draft.mp4",
    "publish/publish_pack.md"
  ];

  const passed = required.filter((relativePath) => exists(episodeDir, relativePath));
  const failed = required.filter((relativePath) => !exists(episodeDir, relativePath));
  const notVerified = futureRuntimeArtifacts.filter((relativePath) => !exists(episodeDir, relativePath));
  const blockingItems = [
    ...failed.map((relativePath) => `missing required contract artifact: ${relativePath}`),
    ...notVerified.map((relativePath) => `Not verified: ${relativePath}`)
  ];

  return {
    status: failed.length > 0 ? "failed" : notVerified.length > 0 ? "partial" : "pass",
    checked_at: new Date(0).toISOString(),
    passed,
    failed,
    not_verified: notVerified,
    blocking_items: blockingItems
  };
}

export function writeQualityReport(episodeDir: string, report: QualityReport): void {
  fs.mkdirSync(path.join(episodeDir, "qa"), { recursive: true });
  fs.writeFileSync(path.join(episodeDir, "qa/qa_report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
}
```

- [ ] **Step 4: Create `scripts/quality_gate.ts`**

```ts
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
  process.exit(1);
}
```

- [ ] **Step 5: Run quality tests**

Run: `npx vitest run tests/quality.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 6: Run quality gate CLI**

Run: `npm run quality:gate`

Expected: `OK quality status=partial blocking_items=4`

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/quality.ts scripts/quality_gate.ts tests/quality.test.ts episodes/ep01_attention_is_all_you_need/qa/qa_report.json
git commit -m "feat: add p0 quality gate"
```

---

### Task 8: Full P0 Verification and Closeout

**Files:**
- Modify: `README.md`
- Verify: all P0 scripts and tests

- [ ] **Step 1: Create `README.md`**

```markdown
# AI Paper Content Factory

本仓库用于把 AI 论文或 AIGC 主题生产成可审核的多平台内容资产包。

## P0 Scope

P0 只验证合同层：

- episode topic contract
- platform profile contract
- Hook Lab generation and scoring
- P0 contract-smoke artifacts
- quality gate report

P0 不调用真实 LLM、TTS、HyperFrames、Manim 或发布平台。

## First Episode

```bash
npm install
npm run validate:topic
npm run episode:contract-smoke
npm run quality:gate
npm test
npm run typecheck
```

Expected P0 quality status:

```text
OK quality status=partial blocking_items=4
```

`partial` 是正确结果，因为真实个人声音、字幕、视频渲染和发布包尚未进入 P0。
```

- [ ] **Step 2: Run full P0 verification**

Run:

```bash
npm run validate:topic
npm run episode:contract-smoke
npm run quality:gate
npm test
npm run typecheck
```

Expected:

- `validate:topic`: `OK topic=ep01_attention_is_all_you_need targets=6 hook_patterns=15`
- `episode:contract-smoke`: `OK contract-smoke`
- `quality:gate`: `OK quality status=partial blocking_items=4`
- `test`: all Vitest tests pass
- `typecheck`: pass

- [ ] **Step 3: Inspect generated reports**

Run:

```bash
node -e "const q=require('./episodes/ep01_attention_is_all_you_need/qa/qa_report.json'); const h=require('./episodes/ep01_attention_is_all_you_need/qa/hook_report.json'); console.log(q.status, h.platforms.length)"
```

Expected: `partial 6`

- [ ] **Step 4: Commit closeout docs**

```bash
git add README.md episodes/ep01_attention_is_all_you_need/qa/qa_report.json
git commit -m "docs: document p0 contract smoke workflow"
```

---

## Self-Review

- Spec coverage: P0 covers repository skeleton, first episode topic, platform profiles, Hook Lab, 8+1 Skill boundaries, quality reports, and deterministic no-provider verification. Voice cloning, real TTS, captions, HyperFrames rendering, and workflow optimizer execution are intentionally blocked by `qa_report.json.not_verified` and need separate plans.
- Completeness scan: The plan contains no incomplete markers or deferred-fill instructions.
- Type consistency: `Topic`, `PlatformProfile`, `HookPatterns`, `buildHooksForTopic`, `writeHookArtifacts`, `runContractSmoke`, `buildQualityReport`, and `writeQualityReport` are defined before use in later tasks.
- Verification: Every code-producing task has a failing test step, implementation step, passing test step, and commit step.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-12-ai-paper-content-factory-p0.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints.
