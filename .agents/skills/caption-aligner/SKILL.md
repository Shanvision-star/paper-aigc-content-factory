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
- Keep dynamic subtitles aligned with the actual口播 timing. Captions can be shorter than the narration only when they preserve the same meaning and do not hide professional terms that need explanation.
- Add short viewer-facing annotations for professional English terms when needed, while keeping production-side reading cues out of visible subtitles.
- Scan caption text for production labels and internal cues such as `读作`, `Hook`, `视觉焦点`, `视觉爆点`, `教学边界`, `QA`, `placeholder`, local paths, or style prompts.
- Surface caption overlap risk for final MP4 burned subtitles, not only `.srt` or `.vtt` text files.

## Forbidden Actions

- Do not change claims, source meaning, or factual assertions.
- Do not claim alignment succeeded without audio.
- Do not synthesize, edit, or replace voiceover audio.
- Do not hide caption overlap or timing risks from the quality gate.
- Do not use a progress bar, large static subtitle panel, bouncing subtitle block, or moving formula text as a substitute for dynamic subtitles.
