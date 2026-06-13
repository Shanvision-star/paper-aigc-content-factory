---
name: caption-aligner
description: Use when aligning voiceover audio and segment text into subtitle files with readability checks.
---

# Caption Aligner

## Inputs

- `script/voice_segments.json`
- `audio/voiceover.wav`
- `audio/voiceover_manifest.json`
- Platform subtitle constraints

## Outputs

- `captions/subtitles.srt`
- `captions/subtitles.vtt`
- Caption timing and readability warnings
- Missing-audio status when alignment cannot run

## Allowed Actions

- Generate SRT and VTT captions from segment text and real voiceover audio.
- Check line length, duration, timeline consistency, and safe-zone risk.
- Make readability-only subtitle wording adjustments that preserve claims.
- Report partial status when audio is missing or unusable.

## Forbidden Actions

- Do not change claims, source meaning, or factual assertions.
- Do not claim alignment succeeded without audio.
- Do not synthesize, edit, or replace voiceover audio.
- Do not hide caption overlap or timing risks from the quality gate.
