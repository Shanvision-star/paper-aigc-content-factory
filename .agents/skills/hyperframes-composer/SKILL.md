---
name: hyperframes-composer
description: Use when composing storyboard, assets, audio, and captions into HyperFrames draft outputs.
---

# HyperFrames Composer

## Inputs

- `video_script/FRAME.md`
- `storyboard/storyboard.json`
- `visuals/assets_manifest.json` or `assets/assets_manifest.json`
- `audio/voiceover.wav`
- `captions/subtitles.srt` or `captions/subtitles.vtt`
- Platform render profile

## Outputs

- HyperFrames composition files
- Draft `.mp4` output when explicit rendering is enabled outside default tests
- Keyframes or screenshots for review
- Render status and missing-input report

## Allowed Actions

- Compose storyboard scenes, assets, audio, captions, and transitions into a HyperFrames draft.
- Produce keyframes or draft video only when the run explicitly permits rendering.
- Keep low-resolution draft and platform final outputs distinct.
- Record render inputs, output paths, duration, and any skipped render reason.
- Preserve formula assets as complete visual objects. Formulas may come from a clear paper crop, a high-resolution screenshot from a formula editor, KaTeX/MathJax/SVG output, or a Manim-rendered still/scene, but the composition must not crop, truncate, wrap, or blur the formula.
- Add or preserve annotation layers for formulas when the episode `FRAME.md` requests explanation points such as `QK^T`, `sqrt(d_k)`, `softmax`, or weighted `V`.
- Keep captions, titles, and callouts outside the formula bounding box unless the callout is an intentional annotation with enough padding.
- Match scene components from the most specific `visual_type` or explicit registry entry before any generic fallback. For example, `kv_cache_cached_projection` must render the KV Cache component, not a generic QKV projection card.

## Formula Asset Contract

Before composing a formula scene, verify that the episode `FRAME.md` or asset manifest provides:

- `formula_latex` or canonical formula text.
- source type: `paper_crop`, `formula_editor_screenshot`, `katex_mathjax_svg`, `manim_still`, or `manim_scene`.
- minimum render target: `2x` the target frame size for raster formula screenshots, or vector SVG/HTML math when possible.
- full formula bounding box and safe-area placement.
- annotation targets and labels for the parts explained in narration.
- keyframe review requirement proving the formula is complete, sharp, and readable on phone-sized playback.

## Forbidden Actions

- Do not run P0 video render during default tests.
- Do not add Remotion as a P0 render path.
- Do not compose a paper episode when `video_script/FRAME.md` is missing; report the missing frame contract instead.
- Do not bypass missing audio, captions, or assets by fabricating outputs.
- Do not use raw, unrendered LaTeX text as the final visible formula.
- Do not split a single required formula into disconnected fragments unless the full formula also appears in the same beat or immediately adjacent staged reveal.
- Do not let generic substring matchers such as `projection`, `formula`, or `matrix` swallow more specific scene contracts such as `kv_cache_cached_projection`, `formula_derivation_complete`, or `softmax_rowwise_matrix`.
- Do not publish rendered media to any platform.
