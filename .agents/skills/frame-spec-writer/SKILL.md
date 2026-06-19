---
name: frame-spec-writer
description: Use when creating, updating, or reviewing global DESIGN.md, global FRAME.md, or an episode-level video_script/FRAME.md for AI paper explainer videos.
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
- `docs/visual_system/MATLAB.md` when assigning MATLAB-generated formulas, plots, animations, keyframes, HTML previews, or MP4 previews
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
- Formula asset contract: canonical formula text or LaTeX, acceptable source type, minimum raster/vector quality, annotation targets, safe-area placement, and keyframe review rule.
- MATLAB adapter contract when an episode uses MATLAB: reference `docs/visual_system/MATLAB.md`, then declare script path, MATLAB release or executable, render environment, Windows text-size expectation, rendererinfo/GPU evidence requirement, canvas size, safe areas, fps or static format, font map, terminology contract, source evidence, output paths, deterministic settings, overlap review, and review keyframes.
- Beat table with spoken cue, frame treatment, visual engine, required assets, and platform notes.
- Caption rules derived from `spoken_text`.
- Ogilvy layout and typography hard rules: no reverse type, no colored body panels behind long text, readable type floor with `9pt` minimum and `11pt` preferred print baseline scaled up for phone video, readable serif/traditional faces for dense copy, large sans-serif only for poster/hook frames, stable font system, sufficient leading, no all-caps sentences, no headline-over-image layout, and five-second poster rule for cover/opening frames.
- Pronunciation constraints, including Chinese `地` as `de` when TTS normalization is needed.
- Render QA: no black frame, no subtitle overlap, figure attribution, formula legibility, key-frame review, and MATLAB render-environment evidence when MATLAB generated or regenerated assets.

## Hard Boundaries

- Do not invent paper facts.
- Do not rewrite spoken narration.
- Do not run real HyperFrames render.
- Do not run real Manim render.
- Do not run real MATLAB render.
- Do not run provider, LLM, or network calls.
- Do not run TTS or voice cloning.
- Do not replace technical script review.
- Do not replace human approval before final render.
- Do not put hidden narration cues into `spoken_text`.
- Only report required Manim scenes or missing Manim assets; rendering belongs to a separately routed task outside this skill.

## Workflow

1. Read global `DESIGN.md` and `FRAME.md`; read `docs/visual_system/MATLAB.md` before assigning any `matlab` visual engine.
2. Read the paper research report, storyboard, voice segments, and assets manifest.
3. Identify required original paper figures and formulas.
4. Map each beat to one frame treatment.
5. Assign visual engines: `hyperframes`, `manim`, `matlab`, `svg`, `paper_image`, or `python_chart`.
6. Check caption safe area, formula completeness, formula legibility, annotation targets, and platform variants.
7. Write or update episode `video_script/FRAME.md`.
8. Report missing assets or unresolved review risks instead of fabricating content.

## Quality Bar

- A future agent can build HyperFrames compositions from the episode `FRAME.md` without guessing visual scale, safe area, required assets, or MATLAB handoff rules.
- A human reviewer can see which paper figures and formulas must appear.
- Platform variants are explicit.
- Default tests remain deterministic.
