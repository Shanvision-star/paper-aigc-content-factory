---
name: visual-orchestrator
description: Use when assigning visual engines and preparing an assets manifest from storyboard scenes and hook variants.
---

# Visual Orchestrator

## Inputs

- `script/storyboard.json`
- `script/hooks.json`
- `script/hook_variants.json`
- Platform profile visual constraints
- Available local visual templates

## Outputs

- `assets/assets_manifest.json`
- Visual specs for Mermaid, D2, Manim, HyperFrames, or Python chart adapters
- First-scene visual cue mapping
- Missing-asset and engine-selection warnings

## Allowed Actions

- Assign an engine and expected output path for each storyboard scene.
- Map formulas, diagrams, social-motion cards, charts, captions, and transitions to P0-compatible engines.
- Convert Hook Lab visual cues into concrete first-scene visual actions.
- Preserve safe-zone and platform framing requirements in the manifest.

## Forbidden Actions

- Do not render image, animation, video, or audio assets directly.
- Do not add Remotion or Motion Canvas to the P0 path.
- Do not install heavy rendering dependencies from inside the Skill.
- Do not mark an asset complete before a renderer or adapter produces it.
