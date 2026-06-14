---
name: tts-voiceover-quality-gate
description: Use when generating, reviewing, or approving cloned or personal-voice TTS for paper explainer episodes before full audio, captions, or video render.
---

# TTS Voiceover Quality Gate

## Core Rule

Treat personal-voice TTS as a gated runtime workflow, not a one-shot render. The canonical chain is:

```text
sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render
```

Do not proceed to `full_tts`, audio merge, captions, or HyperFrames render until representative samples are approved.

## Required Gates

- Use a neutral 8-10s reference audio and reference text for F5-TTS, CosyVoice, GPT-SoVITS, or similar engines.
- Block topic-specific reference text that can cause reference-text leakage, including phrases like `为什么重要` or reviewed script sentences.
- Generate representative samples first: `seg_001`, one mid-script technical segment such as `seg_010`, and the ending or CTA segment such as `seg_014`.
- Run ASR transcript diff when transcripts exist. If local ASR is missing, report that clearly and keep human listening review mandatory.
- Keep `source_text` and `spoken_text` separate. `source_text` is the reviewed narration; `spoken_text` may normalize numbers, English terms, formulas, and pronunciation.
- Run duplicate and near-duplicate checks before TTS so repeated narration is blocked before audio exists.
- Import only approved, postprocessed WAV files into the canonical `audio/voiceover.wav` slot.

## Stop Conditions

Stop and request human review when:

- Sample audio repeats words or leaks reference text.
- English terms such as `Claude`, `Attention`, `KV Cache`, or `vLLM` are skipped, split incorrectly, or unclear.
- Audio contains electrical noise, clipping, long silence, or obvious segment discontinuity.
- ASR transcript diff shows drift from `spoken_text` or detects leak-prone phrases.
- `review/sample_audio_review.json.status` is not `approved` for the current segment text hash.

## Verification

Use the existing project commands when available:

```bash
npm run voiceover:duplicate-guard
npm run audio:f5-check-reference
npm run audio:f5-prepare-segments
npm run audio:f5-generate-samples
npm run audio:asr-transcript-diff
npm run audio:sample-review-gate
```

Only after those gates pass should the workflow continue to `full_tts -> merge -> captions -> render`.
