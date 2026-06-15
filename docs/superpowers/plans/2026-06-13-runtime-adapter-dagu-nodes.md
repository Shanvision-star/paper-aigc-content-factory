# Runtime Adapter Dagu Nodes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the blocked voiceover, caption, video, and publish-pack stages into explicit local adapter steps that Dagu can run and inspect.

**Architecture:** Keep P0 deterministic by default. Runtime adapters check real inputs, write manifests or missing-input reports, and only create real audio/video artifacts when an explicit local input or configured provider is available.

**Tech Stack:** TypeScript CLI scripts, Vitest, Dagu YAML, local filesystem manifests.

---

### Task 1: Voiceover Runtime Adapter

**Files:**
- Create: `scripts/voiceover_adapter.ts`
- Test: `tests/runtime_adapters.test.ts`

- [ ] **Step 1: Write failing tests**

Verify that missing personal voice files keep `voice_profile_manifest.json.status` as `recording_needed`, and verify that importing a real `.wav` writes `audio/voiceover.wav` plus `audio/voiceover_manifest.json`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime_adapters.test.ts`

- [ ] **Step 3: Implement minimal adapter**

Implement `--mode check` and `--mode import-audio --input <wav>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime_adapters.test.ts`

### Task 2: Caption Runtime Adapter

**Files:**
- Create: `scripts/caption_align.ts`
- Test: `tests/runtime_adapters.test.ts`

- [ ] **Step 1: Write failing tests**

Verify missing audio writes `captions/caption_status.json` without pretending alignment succeeded. Verify real audio plus `voice_segments.json` writes `subtitles.srt` and `subtitles.vtt`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime_adapters.test.ts`

- [ ] **Step 3: Implement minimal adapter**

Implement deterministic segment-timed SRT/VTT from existing `voice_segments.json` only when `audio/voiceover.wav` exists.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime_adapters.test.ts`

### Task 3: HyperFrames Draft Adapter

**Files:**
- Create: `scripts/hyperframes_draft.ts`
- Test: `tests/runtime_adapters.test.ts`

- [ ] **Step 1: Write failing tests**

Verify missing audio/captions write `renders/render_status.json`. Verify available inputs write a HyperFrames HTML composition file without fabricating `.mp4`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/runtime_adapters.test.ts`

- [ ] **Step 3: Implement minimal adapter**

Write `renders/hyperframes/ep01_draft.html` and render status. Keep `.mp4` generation gated for a future explicit renderer.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/runtime_adapters.test.ts`

### Task 4: Publish Pack Adapter and Dagu Wiring

**Files:**
- Create: `scripts/publish_pack.ts`
- Modify: `package.json`
- Modify: `dagu/ai-paper-content-factory-ep01.yaml`
- Modify: `scripts/lib/pipelineMap.ts`
- Test: `tests/pipeline_map.test.ts`

- [ ] **Step 1: Write failing tests**

Verify Dagu includes `voiceover_audio`, `captions`, `video_render`, and `publish_pack` steps after `pipeline_map`. Verify pipeline map shows real commands instead of `future:`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pipeline_map.test.ts`

- [ ] **Step 3: Implement wiring**

Add npm scripts and Dagu steps. Update pipeline map commands and status logic from artifact existence.

- [ ] **Step 4: Run targeted and full verification**

Run: `npm test`, `npm run typecheck`, `dagu validate`, and `dagu dry`.
