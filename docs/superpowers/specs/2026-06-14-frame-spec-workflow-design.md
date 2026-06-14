# Paper Explainer Frame Spec Workflow Design

## Status

Proposed design. This document defines the visual-spec workflow for future paper episodes. It does not claim that the workflow has already been implemented.

## Gap Classification

- Gap type: documentation and product-boundary gap.
- Not a rendering bug: current HyperFrames draft generation can exist without this layer.
- Not a single-episode requirement: the workflow must apply to Attention Is All You Need and future papers.

## Original / Revised / Reason

Original:

- The project already has voiceover gates, script quality gates, cover safe-area constraints, and a HyperFrames composer skill.
- The project does not yet have a clear visual authority chain that turns a reusable account design system into per-paper video frame rules.
- Existing episode artifacts can contain storyboard, visuals, captions, and HyperFrames drafts, but there is no required `DESIGN.md -> FRAME.md -> episode FRAME.md` contract.

Revised:

- Add a visual-spec chain as a first-class project concept:
  `docs/visual_system/DESIGN.md -> docs/visual_system/FRAME.md -> episodes/{paper_id}/video_script/FRAME.md`.
- Treat global `DESIGN.md` as the account/brand visual source.
- Treat global `FRAME.md` as the video-camera translation layer: frame scale, safe area, typography floor, aspect-ratio behavior, motion grammar, caption bands, and pre-render visual audits.
- Treat episode-level `FRAME.md` as the paper-specific frame contract: paper thesis, required figures/formulas, visual engine selection, beat-level frame treatments, platform variants, and render QA expectations.

Reason / Impact:

- Future papers should share a recognizable visual language without forcing every episode into the same storyboard.
- Agents should not guess video scale, subtitle safe areas, figure placement, or formula animation rules from ordinary prose.
- This layer prevents style drift, prompt leakage into TTS, subtitle overflow, black-frame regressions, and platform-crop mistakes from being rediscovered per episode.

## External Patterns Reviewed

The design borrows patterns from these public repositories and docs:

- `heygen-com/hyperframes`: `frame.md` is described as a `DESIGN.md` superset that translates web-context design rules into video-frame rules.
- `heygen-com/hyperframes-launch-video`: production project layout with `SCRIPT.md`, `STORYBOARD.md`, `HANDOFF.md`, `index.html`, `compositions/`, assets, and renders.
- `heygen-com/hyperframes-launch-video/SCRIPT.md`: separates exact spoken VO from pronunciation cues, visual pauses, and revision notes.
- `heygen-com/hyperframes-launch-video/STORYBOARD.md`: beat-by-beat direction with timing, VO cue, visual concept, SFX, and production architecture.
- `heygen-com/hyperframes-launch-video/HANDOFF.md`: records real render issues, verification commands, beat schedule, audio tracks, and remaining work.
- `heygen-com/hyperframes-launches`: each video is a standalone composition directory with text source files and large assets separated.
- `heygen-com/hyperframes-launches/claude-paper-launch/FRAME-claude.md`: frame-scale visual constitution with tokens, typography floors, safe areas, aspect-ratio behavior, treatments, and self-audit checks.
- `nexu-io/open-design`: machine-readable prompt templates for HyperFrames video tasks.
- `nateherkai/hyperframes-student-kit`: repo-level workbench pattern for learning from `final.mp4`, `STORYBOARD.md`, `HANDOFF.md`, and composition source together.
- `ai-zixun/humanizer-zh`: mature Chinese prose humanizer skill with a single-directory skill package, on-demand `references/`, fact-preserving rewrite rules, terminology cleanup, and Chinese-native rhythm checks.
- `op7418/Humanizer-zh`: lightweight Chinese AI-writing cleanup pattern, useful as a simpler contrast but weaker than the `ai-zixun` package for project-level reuse.
- `wpsnote/wpsnote-skills/short-video-copywriter`: short-video script workflow with platform preference loading, `0-3s` opening hook, short oral sentences, storyboard rows, and AI image prompt handoff.
- `coreyhaines31/marketingskills/social`: social-content skill pattern with hook formulas, content repurposing, short-form video structures, and the `visual hook + verbal hook + text overlay` first-second rule.
- `msitarzewski/agency-agents/marketing-short-video-editing-coach`: post-production skill pattern covering hook timing, subtitle layout, audio quality, and multi-platform export optimization.
- `canva-sdks/canva-claude-skills/resize-for-social-media`: one-design-to-many-platforms resize workflow with exact target dimensions, parallel resize/export, and partial-failure reporting.
- `charlie947/social-media-skills/youtube-thumbnail`: thumbnail-first pattern emphasizing few large words, one focal element, small-screen readability, high contrast, and no load-bearing text in unsafe UI zones.
- `ZeroLu/awesome-nanobanana-pro`: visual prompt collection pattern useful for cover-image prompt benchmarking, not a direct execution dependency.

Search note:

- A credible GitHub repository named exactly `short-video-opening-optimizer` was not found during the 2026-06-14 review. The project should create its own local `short-video-opening-optimizer` skill by combining the reusable hook/opening ideas from the short-video copywriter, social-content, editing-coach, and thumbnail sources above.

## Authority Order

This workflow follows the repository authority order:

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
3. This spec, after user approval and integration into the main design spec
4. `README.md`
5. `.agents/skills/*/SKILL.md`
6. Episode generated artifacts

If this spec conflicts with the main factory design spec before integration, the main factory design spec wins.

## Design Goals

- Support many papers, not only Attention Is All You Need.
- Keep a stable account-level visual identity across Chinese and English outputs.
- Allow each paper to define its own diagrams, formulas, figures, and explanatory metaphors.
- Make vertical short-video output the default, while preserving Bilibili/YouTube/X landscape or square variants.
- Keep real HyperFrames rendering outside deterministic default tests.
- Keep Manim available for formulas and mathematical animation while HyperFrames remains the final composition layer.

## Non-Goals

- Do not replace HyperFrames with Remotion or Motion Canvas in the P0 chain.
- Do not require live network access during default tests.
- Do not auto-publish to Douyin, Xiaohongshu, Bilibili, X, TikTok, YouTube Shorts, or any overseas platform.
- Do not store unlicensed voices or copyrighted third-party assets as reusable defaults.
- Do not treat `FRAME.md` as a substitute for technical script review, TTS gates, or human review.
- Do not run `humanizer-zh` style rewriting after `spoken_text` is locked without returning to technical review and TTS quality gates.
- Do not treat platform export adaptation as a publish action; it only prepares local variants and manifest records.

## Proposed Artifact Layout

```text
docs/visual_system/
  DESIGN.md
  FRAME.md

.agents/skills/
  frame-spec-writer/
    SKILL.md
  script-humanizer-zh/
    SKILL.md
  short-video-opening-optimizer/
    SKILL.md
  platform-format-adapter/
    SKILL.md

episodes/{paper_id}/
  video_script/
    SCRIPT.md
    STORYBOARD.md
    FRAME.md
    HANDOFF.md
  visuals/
    assets_manifest.json
  renders/
  publish/
    platform_manifest.json
```

## Artifact Responsibilities

### `docs/visual_system/DESIGN.md`

Purpose:

- Defines the account-level visual identity.
- Works across episodes and platforms.

Required content:

- Brand mood and audience.
- Color tokens with roles.
- Typography roles.
- Chinese/English caption style.
- Cover constraints, including current `safe90` vertical cover rule.
- Figure and formula treatment philosophy.
- What not to do.

This file should not contain episode-specific claims, invented paper statistics, or one-off formulas.

### `docs/visual_system/FRAME.md`

Purpose:

- Converts visual identity into camera-ready frame rules.
- Makes HyperFrames composition decisions inspectable before HTML is written.

Required content:

- Frame sizes and aspect-ratio behavior:
  - primary short-video: `1080x1920`
  - optional landscape: `1920x1080`
  - optional square: `1080x1080`
- Load-bearing safe area.
- Caption safe area and subtitle bands.
- Typography floor for small-screen readability.
- Frame treatments:
  - hook title
  - Feynman analogy
  - paper figure spotlight
  - formula explanation
  - modern LLM connection
  - engineering risk
  - recap and next-episode CTA
- Motion grammar:
  - entrance style
  - transition style
  - formula reveal style
  - paper-figure pan/zoom style
  - caption highlight style
- Pre-render frame audit:
  - squint test
  - safe-area test
  - subtitle overlap test
  - figure attribution test
  - formula legibility test
  - platform crop test

This file should not choose the specific paper's formulas or figures.

### `episodes/{paper_id}/video_script/FRAME.md`

Purpose:

- Specializes global frame rules for one paper.
- Provides the bridge between research/script/storyboard and HyperFrames composition.

Required content:

- Paper identity:
  - title
  - year
  - authors or organization when relevant
  - episode thesis
- Required original assets:
  - paper figure images
  - formula images or Manim scenes
  - paper title screenshot if used
- Beat table:
  - beat id
  - start/end or duration source
  - spoken cue
  - frame treatment
  - required assets
  - visual engine: `hyperframes`, `manim`, `svg`, `paper_image`, `python_chart`
  - platform notes
- Caption rules:
  - exact source from `spoken_text`
  - no hidden narration cues
  - English terms remain whole words unless a pronunciation override is explicitly approved
  - Chinese `地` in adverbial phrases should be pronounced `de`
- Render QA:
  - no black frame at beat boundaries
  - no subtitle overlap
  - paper figure and formula visible long enough to understand
  - key frames exported for review

This file is the required input to `hyperframes-composer`.

### `episodes/{paper_id}/video_script/SCRIPT.md`

Purpose:

- Stores exact script inputs and script review context.

Required sections:

- `Spoken VO`: exact text that feeds TTS.
- `Pronunciation Cues`: separate from spoken text.
- `Silent Visual Beats`: separate from spoken text.
- `Technical Review Notes`: claims that passed or failed review.
- `Revision History`: why script changed.

The TTS pipeline must only consume the approved spoken block or its derived `voice_segments.json` / `spoken_text`.

### `episodes/{paper_id}/video_script/STORYBOARD.md`

Purpose:

- Human-readable beat-by-beat creative plan.

Required sections:

- Format and platform assumptions.
- Voiceover direction.
- Beat-by-beat plan.
- Timing table.
- Production architecture.
- Asset list.

### `episodes/{paper_id}/video_script/HANDOFF.md`

Purpose:

- Records actual render state and unresolved problems.

Required sections:

- Latest session summary.
- Preview command.
- Render command.
- Current beat schedule.
- Audio tracks.
- Transcript source.
- Known render issues.
- Verification evidence.
- Remaining work.

## Data Flow

```text
research_report.md
  -> claims.json
  -> blog.md
  -> SCRIPT.md
  -> voice_segments.json
  -> STORYBOARD.md
  -> assets_manifest.json
  -> episode FRAME.md
  -> HyperFrames index.html + compositions/
  -> draft render + key frames
  -> HANDOFF.md + qa_report.json
```

## Skill Boundary: `frame-spec-writer`

Trigger:

- Use when creating or updating `DESIGN.md`, global `FRAME.md`, or episode-level `video_script/FRAME.md`.
- Use before `hyperframes-composer` when a video is generated from a paper.

Inputs:

- `docs/visual_system/DESIGN.md`
- `docs/visual_system/FRAME.md`
- `episodes/{paper_id}/research_report.md`
- `episodes/{paper_id}/script/voice_segments.json`
- `episodes/{paper_id}/storyboard/storyboard.json`
- `episodes/{paper_id}/visuals/assets_manifest.json`
- `platform_profiles/*.yaml`

Outputs:

- `episodes/{paper_id}/video_script/FRAME.md`
- Optional updates to `STORYBOARD.md` when frame rules expose missing visuals.
- Review notes when required assets or safe-area constraints are missing.

Hard boundaries:

- Do not invent paper facts.
- Do not rewrite spoken narration.
- Do not run real HyperFrames render.
- Do not run real Manim render.
- Do not run provider, LLM, or network calls.
- Do not run TTS or voice cloning.
- Do not replace technical review, TTS gates, or human approval.
- Do not put hidden narration cues into `spoken_text`.
- Only report required Manim scenes, missing source images, missing formulas, or missing manifest entries; route real rendering to the appropriate explicit render task.

## Integration With Existing Skills

- `technical-script-reviewer`: validates technical correctness before visual framing.
- `script-humanizer-zh`: optional Chinese-native readability pass after technical claims are approved and before `spoken_text` is locked; it must preserve formulas, paper facts, approved claims, English terminology, and pronunciation constraints.
- `short-video-opening-optimizer`: creates platform-aware opening hooks and first-frame/first-second retention notes before storyboard lock; it must not invent claims or turn an educational paper explainer into clickbait.
- `script-storyboard-writer`: produces script and storyboard that `frame-spec-writer` can specialize.
- `visual-orchestrator`: assigns Manim/SVG/HyperFrames/Python chart engines.
- `voiceover-adapter`: prepares TTS-safe spoken text but does not receive visual notes.
- `tts-voiceover-quality-gate`: validates samples, transcript diff, duplicates, and pronunciation risk.
- `hyperframes-composer`: reads episode `FRAME.md`, storyboard, assets, captions, and audio to produce HTML composition.
- `platform-format-adapter`: reads `platform_profiles/*.yaml`, rendered media, covers, captions, and episode `FRAME.md` to prepare local publish variants and `publish/platform_manifest.json`; it never publishes automatically.
- `quality-gate`: checks final artifacts and QA status.
- `workflow-optimizer`: converts review feedback into future workflow improvements.

## Platform Compatibility

Default priority:

1. Douyin / TikTok / Xiaohongshu / YouTube Shorts vertical: `1080x1920`
2. Bilibili / YouTube landscape: `1920x1080`
3. X / cross-platform square or feed preview: `1080x1080`

Rules:

- Vertical safe area remains the strictest default for titles, captions, and cover crops.
- Chinese outputs use Chinese narration and Chinese primary subtitles.
- Overseas outputs use English narration or English subtitle mode, but visual structure should remain compatible.
- Platform-specific changes should live in platform profile files or episode frame notes, not hardcoded into composition templates.
- One-click platform adaptation should create or verify a manifest for cover, video, captions, title, description, hashtags, and language mode per target platform.
- Default cover rule remains `safe90` for Douyin/TikTok/Xiaohongshu-style vertical covers unless a platform profile explicitly overrides it.

## Validation Strategy

Default deterministic tests:

- Assert that README/spec mention the `DESIGN.md -> FRAME.md -> episode FRAME.md` chain.
- Assert that `frame-spec-writer` skill exists and references the required inputs/outputs.
- Assert that `script-humanizer-zh`, `short-video-opening-optimizer`, and `platform-format-adapter` skills exist and declare their hard boundaries.
- Assert that generated episode `FRAME.md` contract requires paper figures, formulas, caption safe area, platform variants, and render QA.
- Assert that README/spec record humanizer, hook optimizer, platform profiles, platform manifest, and safe90 platform-export constraints.
- Assert that default tests do not run real HyperFrames, Manim, TTS, or provider calls.

Manual or explicit smoke checks:

- `npx hyperframes lint`
- `npx hyperframes validate`
- `npx hyperframes inspect`
- draft render and key-frame extraction
- human review of voiceover, captions, original paper figures, and formulas

## Acceptance Criteria

- README explains the frame-spec workflow at a project level.
- Main factory design spec references the visual-spec authority chain.
- `.agents/skills/frame-spec-writer/SKILL.md` exists and defines hard boundaries.
- `.agents/skills/script-humanizer-zh/SKILL.md` exists and protects technical correctness while improving Chinese-native readability.
- `.agents/skills/short-video-opening-optimizer/SKILL.md` exists and defines hook/opening scoring for Chinese and overseas platforms.
- `.agents/skills/platform-format-adapter/SKILL.md` exists and maps covers, videos, captions, and metadata into platform-specific local publish variants.
- `publish/platform_manifest.json` is defined as the one-click adaptation output contract, without auto-publishing.
- A deterministic test fails if the frame-spec workflow is removed from README, spec, or skill.
- The Attention Is All You Need episode can add `video_script/FRAME.md` without becoming the only supported paper.
- No real rendering, real TTS, or network calls are added to default `npm test`.

## Initial Decisions

- Create both global files in the first implementation pass:
  - `docs/visual_system/DESIGN.md`
  - `docs/visual_system/FRAME.md`
- Keep the canonical human-readable `SCRIPT.md` in `episodes/{paper_id}/video_script/`.
- Keep machine-consumed spoken segments in the existing `episodes/{paper_id}/script/voice_segments.json` path.
- Global `FRAME.md` should include a small paper-genre treatment registry for:
  - architecture papers
  - LLM systems papers
  - diffusion and video-generation papers
  - benchmark and evaluation papers
  - agent and tooling papers

## Recommended Implementation Path

1. Add deterministic tests for the frame-spec workflow.
2. Add `frame-spec-writer` skill.
3. Update README with a short visual-spec workflow section.
4. Update the main factory design spec with the authority chain.
5. Add `script-humanizer-zh`, `short-video-opening-optimizer`, and `platform-format-adapter` skills with deterministic guard tests.
6. Add a minimal `episodes/ep01_attention_is_all_you_need/video_script/FRAME.md` for the first episode as a worked example.
7. Run focused tests first, then full deterministic test suite if the touched surface justifies it.
