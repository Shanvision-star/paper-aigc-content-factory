# EP01 Formal Transformer Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the formal Chinese EP01 package for Attention Is All You Need, including V4 voiceover, visual insertion guide, engineer blog, reusable visuals, personal-voice audio, captions, and a Douyin 9:16 HyperFrames draft.

**Architecture:** Keep human-review writing artifacts in `video_script/`, reusable visual assets in `visuals/`, and runtime artifacts in the existing canonical `script/`, `storyboard/`, `audio/`, `captions/`, and `renders/` paths. Use deterministic local scripts for visual SVG generation and HyperFrames composition; keep real TTS and video rendering outside default `npm test`.

**Tech Stack:** TypeScript, Node.js, HyperFrames, SVG, F5-TTS local CLI, Dagu, Vitest, TypeScript typecheck.

---

### Task 1: Write V4 Script And Visual Review Docs

**Files:**
- Create: `episodes/ep01_attention_is_all_you_need/video_script/douyin_voiceover.md`
- Create: `episodes/ep01_attention_is_all_you_need/video_script/shot_by_shot_storyboard.md`
- Create: `episodes/ep01_attention_is_all_you_need/video_script/storyboard.json`
- Create: `episodes/ep01_attention_is_all_you_need/video_script/cover_copy.md`
- Create: `episodes/ep01_attention_is_all_you_need/video_script/hyperframes_plan.json`

- [ ] **Step 1: Create the V4 voiceover doc**

Write the approved V4 script with 14 timed beats, Feynman-style analogies, and source boundaries.

- [ ] **Step 2: Create the visual insertion storyboard**

For each beat, specify the animation, original paper/formula asset, and HyperFrames scene behavior.

- [ ] **Step 3: Create machine-readable storyboard JSON**

Write a JSON storyboard containing `scene_id`, `start`, `duration`, `voiceover`, `visual_type`, `engine`, `assets`, and `caption`.

- [ ] **Step 4: Create cover copy and HyperFrames plan**

Write cover title variants and a formal HyperFrames composition plan.

### Task 2: Create Papers, Research Report, And Engineer Blog

**Files:**
- Create: `episodes/ep01_attention_is_all_you_need/papers.json`
- Create: `episodes/ep01_attention_is_all_you_need/research_report.md`
- Create: `episodes/ep01_attention_is_all_you_need/blog.md`

- [ ] **Step 1: Write paper metadata**

Record arXiv ID, title, authors, source URL, PDF URL, and allowed paper-image attribution text.

- [ ] **Step 2: Write bilingual research report**

Summarize the local deep research report into a reviewable Chinese report with English technical annotations.

- [ ] **Step 3: Write engineer-facing blog**

Create an Annotated Transformer-style article that explains the same story at higher depth.

### Task 3: Generate Formal Visual Assets

**Files:**
- Create: `scripts/build_ep01_formal_visuals.ts`
- Create: `episodes/ep01_attention_is_all_you_need/visuals/assets_manifest.json`
- Create: `episodes/ep01_attention_is_all_you_need/visuals/diagrams/*.svg`
- Create: `episodes/ep01_attention_is_all_you_need/visuals/formulas/*.svg`
- Create: `episodes/ep01_attention_is_all_you_need/visuals/paper_original/README.md`
- Create: `episodes/ep01_attention_is_all_you_need/visuals/manim_or_frames/README.md`
- Modify: `package.json`

- [ ] **Step 1: Add visual build script**

Implement a TypeScript SVG generator for RNN chain, self-attention graph, QKV cards, attention formula, multi-head experts, positional encoding, system map, and attention cost scenes.

- [ ] **Step 2: Add npm script**

Add `visuals:ep01-formal` to run the visual asset generator.

- [ ] **Step 3: Run the generator**

Run: `npm run visuals:ep01-formal`

Expected: `assets_manifest.json` and SVG assets are created.

### Task 4: Sync Runtime Storyboard And Captions

**Files:**
- Modify: `episodes/ep01_attention_is_all_you_need/script/voiceover.md`
- Modify: `episodes/ep01_attention_is_all_you_need/script/voice_segments.json`
- Modify: `episodes/ep01_attention_is_all_you_need/storyboard/storyboard.json`

- [ ] **Step 1: Copy V4 into canonical voiceover**

Update `script/voiceover.md` from `video_script/douyin_voiceover.md`.

- [ ] **Step 2: Update voice segments**

Write 14 timed segments matching the V4 pacing.

- [ ] **Step 3: Update canonical storyboard**

Copy the machine-readable formal storyboard into the existing runtime path.

### Task 5: Generate New Personal-Voice Audio

**Files:**
- Modify: `episodes/ep01_attention_is_all_you_need/audio/f5_tts/full_voiceover_zh_v1.txt`
- Modify: `episodes/ep01_attention_is_all_you_need/audio/f5_tts/tts_status.json`
- Modify: `episodes/ep01_attention_is_all_you_need/audio/voiceover_manifest.json`
- Modify: `episodes/ep01_attention_is_all_you_need/audio/voiceover.wav`

- [ ] **Step 1: Export plain V4 text for F5-TTS**

Write only spoken lines to `audio/f5_tts/full_voiceover_zh_v1.txt`.

- [ ] **Step 2: Run F5-TTS**

Run `scripts/f5_tts_generate.ps1 -Force` to regenerate the formal V4 voiceover.

- [ ] **Step 3: Import generated audio**

Run `npx tsx scripts/voiceover_adapter.ts episodes/ep01_attention_is_all_you_need/topic.yaml --mode import-audio --input episodes/ep01_attention_is_all_you_need/audio/f5_tts/attention_full_voiceover_f5_v1.wav`.

### Task 6: Compose And Render Formal HyperFrames Draft

**Files:**
- Modify: `scripts/hyperframes_draft.ts`
- Create: `scripts/hyperframes_render_formal.ts`
- Create: `episodes/ep01_attention_is_all_you_need/renders/hyperframes_formal/*`
- Create: `episodes/ep01_attention_is_all_you_need/renders/douyin_zh_1080x1920_draft.mp4`

- [ ] **Step 1: Upgrade HyperFrames draft composition**

Read the formal storyboard and visual assets, then compose a 1080x1920 HTML draft using SVG assets, subtitles, and the generated audio.

- [ ] **Step 2: Add formal renderer**

Add a render script that outputs `renders/douyin_zh_1080x1920_draft.mp4`.

- [ ] **Step 3: Render formal draft**

Run the formal renderer and verify the MP4 exists.

### Task 7: Refresh QA, Publish Pack, And Tests

**Files:**
- Modify: `episodes/ep01_attention_is_all_you_need/captions/*`
- Modify: `episodes/ep01_attention_is_all_you_need/publish/*`
- Modify: `episodes/ep01_attention_is_all_you_need/qa/*`

- [ ] **Step 1: Regenerate captions**

Run `npm run captions:align`.

- [ ] **Step 2: Regenerate publish pack and quality gate**

Run `npm run publish:pack`, `npm run quality:gate`, and `npm run pipeline:map`.

- [ ] **Step 3: Run verification**

Run `npm test` and `npm run typecheck`.

- [ ] **Step 4: Report remaining gaps**

If quality remains `partial`, report the exact blocking items. Do not claim publish readiness unless `qa_report.json.status` is no longer `partial` or `failed`.
