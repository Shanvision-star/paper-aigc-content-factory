# Frame Spec Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable `DESIGN.md -> FRAME.md -> episode FRAME.md` workflow so every paper episode has a deterministic visual-spec contract before HyperFrames composition.

**Architecture:** Keep the visual system in `docs/visual_system/`, episode-specific frame requirements in `episodes/{paper_id}/video_script/FRAME.md`, and reusable agent behavior in `.agents/skills/frame-spec-writer/SKILL.md`. Deterministic Vitest checks protect README, the main spec, the new skill, global visual docs, the ep01 worked example, and the `hyperframes-composer` input boundary without running real HyperFrames, Manim, TTS, or network calls.

**Tech Stack:** Markdown docs, local Codex skills, Vitest, Node.js `fs` assertions, existing npm scripts.

---

## Scope Check

This plan implements one bounded subsystem: the frame-spec workflow. It does not render video, generate voiceover, publish to platforms, replace HyperFrames, or add a new runtime. It only adds documentation, one skill, one worked episode frame contract, and deterministic guard tests.

## File Structure

- Create: `tests/frame_spec_workflow.test.ts`
  - Deterministic guard test for the visual-spec chain.
- Create: `.agents/skills/frame-spec-writer/SKILL.md`
  - Skill instructions for creating/updating global and episode-level frame specs.
- Create: `docs/visual_system/DESIGN.md`
  - Global account-level visual identity contract.
- Create: `docs/visual_system/FRAME.md`
  - Global video-frame translation of the visual identity.
- Create: `episodes/ep01_attention_is_all_you_need/video_script/FRAME.md`
  - First paper episode worked example; must remain generic enough to model future papers.
- Modify: `README.md`
  - Add project-level explanation of the frame-spec workflow.
- Modify: `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
  - Integrate the new visual authority chain into the main factory spec.
- Modify: `.agents/skills/hyperframes-composer/SKILL.md`
  - Require episode-level `video_script/FRAME.md` as an input before composition.

---

### Task 1: Add Failing Frame-Spec Workflow Test

**Files:**
- Create: `tests/frame_spec_workflow.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/frame_spec_workflow.test.ts` with this exact content:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");
const exists = (relativePath: string) => fs.existsSync(path.join(rootDir, relativePath));

const readmePath = "README.md";
const mainSpecPath = "docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md";
const globalDesignPath = "docs/visual_system/DESIGN.md";
const globalFramePath = "docs/visual_system/FRAME.md";
const frameSkillPath = ".agents/skills/frame-spec-writer/SKILL.md";
const hyperframesComposerSkillPath = ".agents/skills/hyperframes-composer/SKILL.md";
const ep01FramePath = "episodes/ep01_attention_is_all_you_need/video_script/FRAME.md";

describe("frame-spec workflow constraints", () => {
  it("records the global-to-episode frame authority chain in README and main spec", () => {
    const readme = read(readmePath);
    const spec = read(mainSpecPath);

    for (const doc of [readme, spec]) {
      expect(doc).toContain("DESIGN.md -> FRAME.md -> episode FRAME.md");
      expect(doc).toContain("docs/visual_system/DESIGN.md");
      expect(doc).toContain("docs/visual_system/FRAME.md");
      expect(doc).toContain("episodes/{paper_id}/video_script/FRAME.md");
      expect(doc).toContain("frame-spec-writer");
      expect(doc).toContain("paper figure spotlight");
      expect(doc).toContain("formula explanation");
      expect(doc).toContain("platform variants");
      expect(doc).toContain("safe area");
    }
  });

  it("adds reusable global DESIGN and FRAME visual contracts", () => {
    expect(exists(globalDesignPath)).toBe(true);
    expect(exists(globalFramePath)).toBe(true);

    const design = read(globalDesignPath);
    const frame = read(globalFramePath);

    expect(design).toContain("Account Visual Identity");
    expect(design).toContain("Color Tokens");
    expect(design).toContain("Typography Roles");
    expect(design).toContain("Chinese / English Modes");
    expect(design).toContain("safe90");
    expect(design).toContain("Figure and Formula Treatment");
    expect(design).toContain("What Not To Do");

    expect(frame).toContain("Global Frame System");
    expect(frame).toContain("1080x1920");
    expect(frame).toContain("1920x1080");
    expect(frame).toContain("1080x1080");
    expect(frame).toContain("Caption Safe Area");
    expect(frame).toContain("Typography Floor");
    expect(frame).toContain("Frame Treatments");
    expect(frame).toContain("Paper Genre Treatment Registry");
    expect(frame).toContain("Pre-Render Frame Audit");
  });

  it("adds a frame-spec-writer skill with strict inputs, outputs, and boundaries", () => {
    expect(exists(frameSkillPath)).toBe(true);
    const skill = read(frameSkillPath);

    expect(skill).toContain("name: frame-spec-writer");
    expect(skill).toContain("docs/visual_system/DESIGN.md");
    expect(skill).toContain("docs/visual_system/FRAME.md");
    expect(skill).toContain("episodes/{paper_id}/video_script/FRAME.md");
    expect(skill).toContain("research_report.md");
    expect(skill).toContain("voice_segments.json");
    expect(skill).toContain("assets_manifest.json");
    expect(skill).toContain("Do not invent paper facts");
    expect(skill).toContain("Do not rewrite spoken narration");
    expect(skill).toContain("Do not run real HyperFrames render");
    expect(skill).toContain("Chinese `地`");
  });

  it("adds an ep01 frame contract that requires paper figures, formulas, and render QA", () => {
    expect(exists(ep01FramePath)).toBe(true);
    const episodeFrame = read(ep01FramePath);

    expect(episodeFrame).toContain("Attention Is All You Need");
    expect(episodeFrame).toContain("episode thesis");
    expect(episodeFrame).toContain("original paper figures");
    expect(episodeFrame).toContain("Transformer architecture");
    expect(episodeFrame).toContain("Attention formula");
    expect(episodeFrame).toContain("QK");
    expect(episodeFrame).toContain("softmax");
    expect(episodeFrame).toContain("Multi-Head Attention");
    expect(episodeFrame).toContain("Positional Encoding");
    expect(episodeFrame).toContain("modern LLM");
    expect(episodeFrame).toContain("no black frame");
    expect(episodeFrame).toContain("subtitle overlap");
  });

  it("makes hyperframes-composer consume episode FRAME.md without changing P0 render boundaries", () => {
    const skill = read(hyperframesComposerSkillPath);

    expect(skill).toContain("video_script/FRAME.md");
    expect(skill).toContain("Do not run P0 video render during default tests");
    expect(skill).toContain("Do not add Remotion as a P0 render path");
    expect(skill).toContain("Do not publish rendered media to any platform");
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
npm test -- tests/frame_spec_workflow.test.ts
```

Expected:

```text
FAIL tests/frame_spec_workflow.test.ts
```

Expected failure reason: missing `docs/visual_system/DESIGN.md`, missing `docs/visual_system/FRAME.md`, missing `.agents/skills/frame-spec-writer/SKILL.md`, missing README/spec references, or missing ep01 `FRAME.md`.

- [ ] **Step 3: Commit the failing test**

Run:

```powershell
git add -- tests/frame_spec_workflow.test.ts
git commit -m "test: add frame spec workflow guard"
```

Expected:

```text
[codex/multi-platform-content-factory-spec <sha>] test: add frame spec workflow guard
```

---

### Task 2: Add Global Visual System Docs and Frame Skill

**Files:**
- Create: `docs/visual_system/DESIGN.md`
- Create: `docs/visual_system/FRAME.md`
- Create: `.agents/skills/frame-spec-writer/SKILL.md`

- [ ] **Step 1: Create the visual system directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path docs/visual_system | Out-Null
New-Item -ItemType Directory -Force -Path .agents/skills/frame-spec-writer | Out-Null
```

Expected: no output and both directories exist.

- [ ] **Step 2: Add global DESIGN.md**

Create `docs/visual_system/DESIGN.md` with this exact content:

```markdown
# Account Visual Identity

## Purpose

This file defines the reusable visual identity for AI paper explainer content. It is global across papers and platforms. Episode-specific claims, figures, formulas, dates, and statistics belong in episode files, not here.

## Audience

- Chinese platforms: Douyin, Xiaohongshu, Bilibili.
- Overseas platforms: TikTok, YouTube Shorts, YouTube, X.
- Primary viewer: curious builders who want AI papers explained through modern LLM, agent, and AIGC context.

## Color Tokens

- `ink`: `#F4F7FB` for primary text on dark surfaces.
- `paper`: `#10131A` for default dark technical canvas.
- `signal`: `#F6C85F` for one focal highlight per frame.
- `matrix`: `#61D394` for attention weights, graph edges, and data-flow emphasis.
- `trace`: `#6EA8FE` for timelines, model family connections, and protocol/system layers.
- `muted`: `#9CA3AF` for secondary labels.
- `danger`: `#F87171` for risk and cost warnings.
- `safe-black`: `#000000` for vertical cover padding and crop-safe edges.

## Typography Roles

- `display`: large title or one-line hook; never used for dense technical text.
- `claim`: short explanatory statement, 1-2 lines.
- `body`: readable explanation text and subtitles.
- `mono`: formulas, tensor shapes, code-like labels, token ids, and model/system names.
- `caption`: platform subtitles and karaoke highlights.

## Chinese / English Modes

- Chinese mode uses Chinese narration and Chinese primary subtitles.
- English terms such as ChatGPT, Claude, Agent, Self-Attention, Multi-Head Attention, FlashAttention, KV Cache, vLLM, MCP, and Sora remain English words unless the script explicitly defines a pronunciation override.
- Overseas mode uses English narration or English subtitles while preserving the same visual frame logic.
- Chinese `地` in adverbial phrases should be prepared for TTS as `de` when pronunciation normalization is needed.

## Cover Constraint

- Default vertical cover uses `safe90`.
- Canvas remains `1080x1920`.
- Content scale is `90%`.
- Safe padding is `54px` left/right and `96px` top/bottom.
- Padding color is `black padding`.
- The reference cover is `cover_transformer_ai_v1_1080x1920_safe90.png`.

## Figure and Formula Treatment

- Original paper figures must remain inspectable and attributed in the episode asset manifest.
- Formula frames must explain the operation before showing dense notation.
- Manim is preferred for mathematical objects such as attention matrices, QK multiplication, softmax, and positional encoding waves.
- HyperFrames is preferred for final composition, captions, platform safe areas, transitions, paper figure spotlight frames, and recap cards.

## What Not To Do

- Do not invent paper facts, dates, benchmark numbers, or author claims.
- Do not put hidden narration cues inside spoken text.
- Do not use a one-note palette where every frame is the same hue family.
- Do not let subtitles overlap formulas, paper figures, or face/voiceover panels.
- Do not crop load-bearing text outside vertical platform safe areas.
- Do not treat rendered command success as final quality approval.
```

- [ ] **Step 3: Add global FRAME.md**

Create `docs/visual_system/FRAME.md` with this exact content:

```markdown
# Global Frame System

## Purpose

This file translates `docs/visual_system/DESIGN.md` into camera-ready frame rules for paper explainer videos. It applies to every paper unless an episode-level `FRAME.md` narrows the rule with a documented reason.

## Authority Chain

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `DESIGN.md`: account-level identity.
- `FRAME.md`: global video-frame grammar.
- `episodes/{paper_id}/video_script/FRAME.md`: paper-specific execution contract.

## Frame Sizes

- Primary vertical: `1080x1920`.
- Landscape: `1920x1080`.
- Square: `1080x1080`.

## Safe Area

- Vertical short video is the strictest default.
- Load-bearing titles, formulas, captions, and paper figure labels stay inside the safe area.
- Full-bleed backgrounds may cross the safe area.
- Cover export follows `safe90` when generating Douyin/Xiaohongshu/TikTok-style covers.

## Caption Safe Area

- Captions live in a reserved bottom band unless the scene uses a formula or paper figure that requires captions above the visual object.
- Caption text must not overlap formulas, figure labels, axes, or author/source labels.
- Karaoke or highlighted captions must be derived from `spoken_text`, not hidden visual notes.
- English terms remain whole words unless an approved pronunciation cue says otherwise.

## Typography Floor

- Load-bearing text must be readable on a phone screen.
- Dense formula notation uses zoom, staged reveal, or callouts instead of shrinking below readability.
- Eyebrow labels and source captions can be smaller only when they are not required to understand the beat.

## Frame Treatments

### Hook Title

Use for the first 3-8 seconds. One dominant claim, one visual anchor, no dense paragraphs.

### Feynman Analogy

Use a simple object or relation before showing the technical form. Example: pronoun reference before Self-Attention.

### Paper Figure Spotlight

Use the original paper image as the main visual. Pan, zoom, or crop only when the source remains identifiable and attributed.

### Formula Explanation

Reveal operation order first, then notation. For Attention, show QK matching, softmax weights, and weighted V reading before the full formula.

### Modern LLM Connection

Connect the paper mechanism to current GPT, Claude, Gemini, Qwen, DeepSeek, Sora, Agent, MCP, KV Cache, vLLM, or FlashAttention context only when the technical-script review has approved the connection.

### Engineering Risk

Use for cost, latency, hallucination, long-context, or scaling constraints. The warning must be specific and sourced from the script or research notes.

### Recap And Next-Episode CTA

Summarize the paper's core mental model and preview the next technical decomposition.

## Motion Grammar

- Multi-scene HyperFrames compositions use transitions between scenes.
- Each scene needs visible entrance motion.
- Exit motion is avoided except on final closeout scenes; transitions handle scene changes.
- Formula animation should privilege comprehension over speed.
- Paper figure movement should be slow enough to inspect.
- Do not use random, wall-clock, or nondeterministic motion in default composition source.

## Paper Genre Treatment Registry

- Architecture papers: system diagram, data flow, layer comparison, tradeoff frame.
- LLM systems papers: model family timeline, inference pipeline, optimization risk frame.
- Diffusion and video-generation papers: latent-space map, temporal token frame, before/after sample frame.
- Benchmark and evaluation papers: metric ledger, failure case grid, leaderboard caveat frame.
- Agent and tooling papers: tool-call graph, protocol boundary, orchestration timeline, human-review gate frame.

## Pre-Render Frame Audit

- Squint test: one thing should dominate each frame.
- Safe-area test: title, caption, formula, and figure labels fit platform safe regions.
- Subtitle overlap test: captions do not cover formulas, faces, or paper labels.
- Figure attribution test: original paper figures stay identifiable and referenced in `assets_manifest.json`.
- Formula legibility test: formulas are readable without shrinking below the typography floor.
- Platform crop test: vertical, landscape, and square variants declare what is preserved or adapted.
- Render boundary test: real HyperFrames render remains outside default `npm test`.
```

- [ ] **Step 4: Add frame-spec-writer skill**

Create `.agents/skills/frame-spec-writer/SKILL.md` with this exact content:

```markdown
---
name: frame-spec-writer
description: Use when creating or updating global DESIGN.md, global FRAME.md, or an episode-level video_script/FRAME.md for AI paper explainer videos.
---

# Frame Spec Writer

## Purpose

Create the visual bridge between research/script/storyboard assets and HyperFrames composition. The skill turns the global visual identity into a paper-specific frame contract without inventing paper facts or rewriting narration.

## Use When

- Creating `docs/visual_system/DESIGN.md`.
- Creating or updating `docs/visual_system/FRAME.md`.
- Creating or updating `episodes/{paper_id}/video_script/FRAME.md`.
- Preparing a paper episode before `hyperframes-composer`.
- Reviewing whether paper figures, formulas, captions, and platform variants are visually specified.

## Inputs

- `docs/visual_system/DESIGN.md`
- `docs/visual_system/FRAME.md`
- `episodes/{paper_id}/research_report.md`
- `episodes/{paper_id}/script/voice_segments.json`
- `episodes/{paper_id}/storyboard/storyboard.json`
- `episodes/{paper_id}/visuals/assets_manifest.json`
- `platform_profiles/*.yaml`

## Outputs

- `episodes/{paper_id}/video_script/FRAME.md`
- Review notes for missing figures, formulas, captions, or platform constraints.
- Optional recommendations for `STORYBOARD.md` when frame rules expose a missing visual beat.

## Required Episode FRAME.md Sections

- Paper identity: title, year, authors or organization, episode thesis.
- Required original paper figures.
- Required formulas or Manim scenes.
- Beat table with spoken cue, frame treatment, visual engine, required assets, and platform notes.
- Caption rules derived from `spoken_text`.
- Pronunciation constraints, including Chinese `地` as `de` when TTS normalization is needed.
- Render QA: no black frame, no subtitle overlap, figure attribution, formula legibility, key-frame review.

## Hard Boundaries

- Do not invent paper facts.
- Do not rewrite spoken narration.
- Do not run real HyperFrames render.
- Do not run real Manim render unless explicitly requested outside default tests.
- Do not run TTS or voice cloning.
- Do not replace technical script review.
- Do not replace human approval before final render.
- Do not put hidden narration cues into `spoken_text`.

## Workflow

1. Read global `DESIGN.md` and `FRAME.md`.
2. Read the paper research report, storyboard, voice segments, and assets manifest.
3. Identify required original paper figures and formulas.
4. Map each beat to one frame treatment.
5. Assign visual engines: `hyperframes`, `manim`, `svg`, `paper_image`, or `python_chart`.
6. Check caption safe area, formula legibility, and platform variants.
7. Write or update episode `video_script/FRAME.md`.
8. Report missing assets or unresolved review risks instead of fabricating content.

## Quality Bar

- A future agent can build HyperFrames compositions from the episode `FRAME.md` without guessing visual scale, safe area, or required assets.
- A human reviewer can see which paper figures and formulas must appear.
- Platform variants are explicit.
- Default tests remain deterministic.
```

- [ ] **Step 5: Run the focused test to verify remaining failures narrow to README/spec/episode/composer**

Run:

```powershell
npm test -- tests/frame_spec_workflow.test.ts
```

Expected:

```text
FAIL tests/frame_spec_workflow.test.ts
```

Expected remaining failures: README/spec references, episode `FRAME.md`, or `hyperframes-composer` input contract.

- [ ] **Step 6: Commit the global docs and skill**

Run:

```powershell
git add -- docs/visual_system/DESIGN.md docs/visual_system/FRAME.md .agents/skills/frame-spec-writer/SKILL.md
git commit -m "docs: add global frame spec workflow"
```

Expected:

```text
[codex/multi-platform-content-factory-spec <sha>] docs: add global frame spec workflow
```

---

### Task 3: Integrate Workflow Into README, Main Spec, Composer Skill, and Ep01 Frame

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
- Modify: `.agents/skills/hyperframes-composer/SKILL.md`
- Create: `episodes/ep01_attention_is_all_you_need/video_script/FRAME.md`

- [ ] **Step 1: Update README**

Add this section after the existing `Review Before Render` section and before `Cover Export Constraint`:

```markdown
## Visual Frame Spec Workflow

每篇论文视频在进入 HyperFrames composition 前，必须先通过视觉规范链路：

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `docs/visual_system/DESIGN.md` 定义账号级视觉身份：颜色、字体、中英文模式、封面 `safe90`、论文图和公式处理原则。
- `docs/visual_system/FRAME.md` 把视觉身份转成视频镜头规则：`1080x1920`、`1920x1080`、`1080x1080`、safe area、Caption Safe Area、Typography Floor、Frame Treatments、Paper Genre Treatment Registry、Pre-Render Frame Audit。
- `episodes/{paper_id}/video_script/FRAME.md` 定义单篇论文的执行规则：paper figure spotlight、formula explanation、platform variants、需要出现的原论文图片、公式图片或 Manim 场景、字幕避让和渲染 QA。

`frame-spec-writer` 负责生成或更新 episode FRAME；`hyperframes-composer` 必须读取 episode FRAME 后再生成 HTML composition。这个链路不运行真实 HyperFrames render，不替代 technical-script-reviewer、tts-voiceover-quality-gate 或人工审核。
```

- [ ] **Step 2: Update the main factory design spec**

In `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`, add this subsection near the existing HyperFrames or skill architecture sections:

```markdown
### Visual Frame Spec Workflow

视频视觉规范采用 `DESIGN.md -> FRAME.md -> episode FRAME.md` 链路。

- `docs/visual_system/DESIGN.md` 是账号级视觉身份。
- `docs/visual_system/FRAME.md` 是视频镜头级规范，约束 safe area、Caption Safe Area、Typography Floor、Frame Treatments、Paper Genre Treatment Registry 和 Pre-Render Frame Audit。
- `episodes/{paper_id}/video_script/FRAME.md` 是单篇论文的 frame contract，必须覆盖 paper figure spotlight、formula explanation、platform variants、原论文图、公式图或 Manim 场景、字幕避让和 render QA。

新增 `frame-spec-writer` skill，位于 `script-storyboard-writer` / `visual-orchestrator` 之后、`hyperframes-composer` 之前。它只写视觉规范，不改写 `spoken_text`，不运行真实 HyperFrames、Manim、TTS 或 provider。
```

- [ ] **Step 3: Update hyperframes-composer skill inputs**

Replace the input block in `.agents/skills/hyperframes-composer/SKILL.md` with:

```markdown
## Inputs

- `video_script/FRAME.md`
- `storyboard/storyboard.json`
- `visuals/assets_manifest.json` or `assets/assets_manifest.json`
- `audio/voiceover.wav`
- `captions/subtitles.srt` or `captions/subtitles.vtt`
- Platform render profile
```

Then add this bullet to `Forbidden Actions`:

```markdown
- Do not compose a paper episode when `video_script/FRAME.md` is missing; report the missing frame contract instead.
```

- [ ] **Step 4: Add ep01 episode FRAME.md worked example**

Create `episodes/ep01_attention_is_all_you_need/video_script/FRAME.md` with this exact content:

```markdown
# Attention Is All You Need Episode FRAME

## Paper Identity

- Title: Attention Is All You Need.
- Year: 2017.
- Authors / organization: Google research team.
- episode thesis: Transformer changed modern AI by replacing sequential recurrence with attention-based relation modeling, making today's modern LLM and agent systems possible at scale.

## Required Original Paper Assets

- original paper figures: Transformer architecture Figure 1 must appear as a paper figure spotlight.
- formula: Attention formula must appear as a formula explanation frame.
- formula content: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`.
- concepts that need visual support: QK matching, softmax attention weights, weighted V reading, Multi-Head Attention, Positional Encoding, O(n²) cost, modern LLM connection.

## Beat Table

| Beat | Spoken Cue | Frame Treatment | Visual Engine | Required Assets | Platform Notes |
| --- | --- | --- | --- | --- | --- |
| hook | ChatGPT, Claude, AI Agent all depend on this paper lineage | Hook Title | hyperframes | title card + Transformer silhouette | keep title inside vertical safe area |
| old-world | RNN/LSTM felt like queue-based message passing | Feynman Analogy | svg | queue vs direct relation diagram | captions bottom, diagram center |
| self-attention | every token computes relations with other tokens | Formula Explanation | manim | token graph + attention matrix | avoid subtitle overlap with matrix |
| qkv | Q asks, K labels, V provides content | Formula Explanation | hyperframes + svg | Q/K/V cards | English terms stay whole words |
| formula | QK, softmax, then weighted V | Formula Explanation | manim | Attention formula image or scene | formula must be readable |
| multi-head | multiple learned subspaces analyze relations | Formula Explanation | hyperframes | multi-head branch diagram | do not imply manual head assignment |
| positional | positional encoding adds order information | Formula Explanation | manim | sin/cos wave + token row | keep waves visible behind labels |
| paper-figure | original Transformer architecture appears | Paper Figure Spotlight | paper_image | original Figure 1 | source attribution required |
| modern-llm | BERT, GPT, Claude, Qwen, DeepSeek inherit Transformer lineage | Modern LLM Connection | hyperframes | model family timeline | separate model, agent, and MCP layers |
| engineering-risk | Attention cost grows with sequence length | Engineering Risk | python_chart + hyperframes | O(n²), KV Cache, FlashAttention, vLLM labels | risk color can use danger token |
| recap | AI learned to model relations, not just read faster | Recap And Next-Episode CTA | hyperframes | final relation graph | include next episode QK multiplication cue |

## Caption Rules

- Captions derive from `spoken_text`.
- Do not add hidden narration cues.
- English terms remain whole words: ChatGPT, Claude, Agent, Self-Attention, Multi-Head Attention, FlashAttention, KV Cache, vLLM, MCP, Sora.
- Chinese `地` in adverbial phrases should be pronounced `de` during TTS normalization.
- Captions must not overlap formulas, paper figure labels, or source attribution.

## Render QA

- no black frame at beat boundaries.
- no subtitle overlap.
- original paper figures stay identifiable.
- Transformer architecture Figure 1 appears long enough to inspect.
- Attention formula appears large enough to read on a phone.
- QK and softmax explanation must appear before the full formula or alongside a staged reveal.
- key frames must include hook, formula, paper figure, modern LLM connection, and engineering risk.
- platform variants must preserve the paper figure spotlight and formula explanation.
```

- [ ] **Step 5: Run focused test**

Run:

```powershell
npm test -- tests/frame_spec_workflow.test.ts
```

Expected:

```text
PASS tests/frame_spec_workflow.test.ts
```

- [ ] **Step 6: Commit integration changes**

Run:

```powershell
git add -- README.md docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md .agents/skills/hyperframes-composer/SKILL.md episodes/ep01_attention_is_all_you_need/video_script/FRAME.md
git commit -m "docs: integrate frame spec workflow"
```

Expected:

```text
[codex/multi-platform-content-factory-spec <sha>] docs: integrate frame spec workflow
```

---

### Task 4: Validate Deterministic Baseline and Skill Quality

**Files:**
- Verify: `tests/frame_spec_workflow.test.ts`
- Verify: `.agents/skills/frame-spec-writer/SKILL.md`
- Verify: existing deterministic test suite

- [ ] **Step 1: Run frame workflow focused test**

Run:

```powershell
npm test -- tests/frame_spec_workflow.test.ts
```

Expected:

```text
PASS tests/frame_spec_workflow.test.ts
```

- [ ] **Step 2: Run related documentation constraint tests**

Run:

```powershell
npm test -- tests/cover_constraints.test.ts tests/retrospective_constraints.test.ts tests/frame_spec_workflow.test.ts
```

Expected:

```text
PASS tests/cover_constraints.test.ts
PASS tests/retrospective_constraints.test.ts
PASS tests/frame_spec_workflow.test.ts
```

- [ ] **Step 3: Run full deterministic test suite**

Run:

```powershell
npm test
```

Expected:

```text
Test Files  all passed
Tests       all passed
```

The exact number of files and tests may be higher than the current baseline because this plan adds one test file.

- [ ] **Step 4: Run TypeScript typecheck**

Run:

```powershell
npm run typecheck
```

Expected:

```text
> paper-aigc-content-factory@ typecheck
> tsc --noEmit
```

No TypeScript errors should follow.

- [ ] **Step 5: Validate skills**

Run:

```powershell
skill quick_validate .agents/skills/frame-spec-writer
```

Expected:

```text
frame-spec-writer passed
```

If the local `skill` command is unavailable, record that explicitly in the final implementation summary and keep the Markdown/test validation evidence.

- [ ] **Step 6: Run whitespace check**

Run:

```powershell
git diff --check
```

Expected: no output.

- [ ] **Step 7: Commit validation-only fixes if needed**

If validation found formatting or wording fixes, stage only the files touched by this plan:

```powershell
git add -- tests/frame_spec_workflow.test.ts docs/visual_system/DESIGN.md docs/visual_system/FRAME.md .agents/skills/frame-spec-writer/SKILL.md README.md docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md .agents/skills/hyperframes-composer/SKILL.md episodes/ep01_attention_is_all_you_need/video_script/FRAME.md
git commit -m "docs: validate frame spec workflow"
```

Expected if fixes were needed:

```text
[codex/multi-platform-content-factory-spec <sha>] docs: validate frame spec workflow
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review

Spec coverage:

- Global `DESIGN.md -> FRAME.md -> episode FRAME.md` chain is implemented in Tasks 2 and 3.
- README and main spec authority integration is implemented in Task 3.
- `frame-spec-writer` skill is implemented in Task 2.
- Deterministic guard tests are implemented in Task 1.
- Ep01 worked example is implemented in Task 3.
- HyperFrames composer input boundary is implemented in Task 3.
- Default test boundary is verified in Task 4.

Red-flag scan:

- The plan contains no deferred-content markers, no incomplete file paths, and no generic edge-case-only steps.

Type and command consistency:

- Tests use existing Vitest and Node `fs` style.
- Commands use existing `npm test`, `npm run typecheck`, and `git diff --check` patterns.
- Real HyperFrames, Manim, TTS, and network calls are excluded from default validation.
