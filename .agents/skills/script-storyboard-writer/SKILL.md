---
name: script-storyboard-writer
description: Use when drafting platform-aware hooks, voiceover, segments, storyboard, and blog copy from grounded claims.
---

# Script Storyboard Writer

## Inputs

- `research/claims.json`
- `research/timeline.json`
- Hook patterns and Hook Lab constraints
- `platform_profiles/*.yaml`
- Topic and audience intent

## Outputs

- `script/hooks.json`
- `storyboard/hook_variants.json`
- `script/voiceover.md`
- `script/voice_segments.json`
- `storyboard/storyboard.json`
- `blog/blog.md`
- PDF outline draft

## Allowed Actions

- Write hooks, voiceover, segments, storyboard beats, and blog draft from sourced claims.
- Adapt opening style and pacing to the selected platform profiles.
- Keep one core thesis and make the first scene reference the selected hook.
- Record hook choices, rejected variants, and source-backed rationale.
- Add pronunciation notes for ambiguous Chinese particles and technical terms when drafting voiceover prompts; in particular, `动态地` uses the adverbial particle `地` and must be read as `de`, not `di`.
- Prefer low-ambiguity spoken phrasing for TTS-sensitive lines, such as `以动态方式建立关系`, when the visible script may contain `动态地建立关系`.

## Forbidden Actions

- Do not use generic openers in the short-video first scene.
- Do not render video, generate keyframes, or synthesize audio.
- Do not use unsourced exaggeration as clickbait.
- Do not change or invent claim evidence while writing scripts.
