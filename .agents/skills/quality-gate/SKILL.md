---
name: quality-gate
description: Use when evaluating episode artifacts and reporting pass, partial, or failed production readiness.
---

# Quality Gate

## Inputs

- `topic.yaml`
- `research/claims.json`
- `script/hooks.json`
- `storyboard/storyboard.json`
- `qa/hook_report.json`
- Available audio, caption, visual, video, blog, and publish artifacts

## Outputs

- `qa/qa_report.json`
- Gate status: `pass`, `partial`, or `failed`
- Missing-artifact list
- Human-review checklist

## Allowed Actions

- Evaluate topic, sources, claims, hooks, script, visuals, voice, captions, video, and publish-pack readiness.
- Report `pass`, `partial`, or `failed` with explicit reasons.
- Preserve deterministic default checks and keep real provider smoke separate.
- Surface missing voice, video, captions, cover, blog, or publish artifacts.
- Surface MATLAB visual risks when present: missing render environment, missing `rendererinfo`, Windows text size above `100%` without reviewed keyframes, missing overlap check, or missing HyperFrames import review.
- Apply `docs/superpowers/specs/2026-06-20-ep05-stage-gate-map.md` when the episode has formulas, MATLAB/Manim/HyperFrames mechanism animation, dynamic subtitles, personal/cloned voice, SFX, long-context examples, or closed-source model caveats.
- Require final MP4 evidence when the output is a video: audio/video stream probe, duration/resolution, final keyframes, burned-subtitle scan, no production-label leakage, and explicit verified/not-verified closeout.
- Require pronunciation/freshness reports when TTS text or high-risk terms changed; require SFX mix status when sound cues are in scope.

## Forbidden Actions

- Do not report false success.
- Do not hide missing voice, video, caption, source, or publish artifacts.
- Do not claim full production readiness when status is `partial` or `failed`.
- Do not auto-publish or lower gates to make an episode pass.
- Do not treat command success, HTML preview, `.srt` generation, or individual asset screenshots as final video approval.
