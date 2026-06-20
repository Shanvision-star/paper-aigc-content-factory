---
name: visual-orchestrator
description: Use when assigning visual engines and preparing an assets manifest from storyboard scenes and hook variants.
---

# Visual Orchestrator

## Inputs

- `storyboard/storyboard.json`
- `script/hooks.json`
- `storyboard/hook_variants.json`
- Platform profile visual constraints
- Available local visual templates
- `docs/visual_system/MATLAB.md` before assigning any `matlab` visual engine

## Outputs

- `assets/assets_manifest.json`
- Visual specs for Mermaid, D2, Manim, MATLAB, HyperFrames, or Python chart adapters
- First-scene visual cue mapping
- Missing-asset and engine-selection warnings

## Allowed Actions

- Assign an engine and expected output path for each storyboard scene.
- Map formulas, diagrams, social-motion cards, charts, captions, and transitions to P0-compatible engines.
- Assign `matlab` only for deterministic source-backed formula conversion, matrix/heatmap views, curve plots, RoPE or positional-encoding geometry, attention score illustrations, and frame/video preview specs that will be rendered by a separately routed task.
- When assigning `matlab`, require manifest fields from `docs/visual_system/MATLAB.md`: canvas, safe areas, fps or static format, font map, terminology contract, render environment, Windows text-size status, rendererinfo/GPU evidence, source evidence, review keyframes, overlap check, and HyperFrames handoff status.
- For formula assets, write manifest metadata for canonical formula text or LaTeX, source type, render quality, annotation targets, and review status before HyperFrames composition.
- Convert Hook Lab visual cues into concrete first-scene visual actions.
- Preserve safe-zone and platform framing requirements in the manifest.
- Mark MATLAB, Manim, SVG, or chart outputs as local proof objects, not full-page screenshots to be shrunk inside another page.
- Require each visual asset to state its role: formula object, source figure, code proof, mechanism animation, analogy mapping, value table, or transition support.
- Flag blank proof areas, static pseudo-animation, detached arrows, shifted formula highlights, and text/formula jitter as unresolved visual risks before render.

## Forbidden Actions

- Do not render image, animation, video, or audio assets directly.
- Do not run MATLAB or mark MATLAB-rendered assets complete from inside this skill.
- Do not add Remotion or Motion Canvas to the P0 path.
- Do not install heavy rendering dependencies from inside the Skill.
- Do not mark an asset complete before a renderer or adapter produces it.
- Do not mark a formula asset complete if it is cropped, low-resolution, missing its canonical text, or lacks required annotation targets.
- Do not accept an asset whose only motion is text/formula/card scaling, subtitle drifting, or whole-page zoom when the scene claims to be a mechanism animation.
