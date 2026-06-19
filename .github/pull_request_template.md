# PR Review Checklist

## Scope

- [ ] Change type is clear: code gap, documentation gap, verification gap, or product-boundary decision.
- [ ] Default tests stay deterministic; real MATLAB, HyperFrames, Manim, TTS, provider, and network smoke are reported separately.

## MATLAB Visual Assets

Check this section when the PR adds or regenerates MATLAB formulas, plots, keyframes, HTML previews, or MP4 previews.

- [ ] Manifest or PR notes record MATLAB executable/release, script path, canvas, fps or static format, output paths, source evidence, canonical formula/LaTeX, and review keyframes.
- [ ] R2026a figure/export smoke was run, or the PR explains why it was not needed.
- [ ] PR notes record `rendererinfo`, actual renderer device, GPU, Windows text size, and display scaling from the render machine.
- [ ] Windows accessibility `Text size` is `100%` for final exports, or any exception is kept `needs_human_review` with full-size and phone-size keyframe evidence.
- [ ] Formula, axis, legend, source label, caption band, and HyperFrames import overlap checks are attached or summarized.

## Review Evidence

- [ ] Claims, formulas, and model-implementation statements are source-backed.
- [ ] Visual proof objects remain readable after platform crop and phone-size preview.
- [ ] Completion notes state exactly what was verified and what was not.
