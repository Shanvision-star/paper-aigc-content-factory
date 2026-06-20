---
name: tts-voiceover-quality-gate
description: Use when generating, reviewing, or approving cloned or personal-voice TTS for paper explainer episodes before full audio, captions, or video render.
---

# TTS Voiceover Quality Gate

## Core Rule

Treat production voiceover TTS as a gated runtime workflow, not a one-shot render. The canonical chain is:

```text
sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render
```

Do not proceed to `full_tts`, audio merge, captions, or HyperFrames render until representative samples are approved.

## Required Gates

- Prefer IndexTTS2 as the mainline when content consistency, terminology stability, clarity, and audio-video timing matter more than personal timbre similarity.
- Use IndexTTS 1.5 or CosyVoice as fallback engines; keep personal timbre cloning as an experimental branch until it passes the same content-consistency gates.
- Use a neutral 8-10s reference audio and reference text for IndexTTS2, IndexTTS 1.5, CosyVoice, F5-TTS, GPT-SoVITS, or similar engines.
- Block topic-specific reference text that can cause reference-text leakage, including phrases like `为什么重要` or reviewed script sentences.
- Generate representative samples first: `seg_001`, one mid-script technical segment such as `seg_010`, and the ending or CTA segment such as `seg_014`.
- Run ASR transcript diff when transcripts exist. If local ASR is missing, report that clearly and keep human listening review mandatory.
- Keep `source_text` and `spoken_text` separate. `source_text` is the reviewed narration; `spoken_text` may normalize numbers, English terms, formulas, and pronunciation.
- If delivery tuning is needed, run `voiceover-emotion-coach` after `spoken_text` is locked and before sample generation. Its default is `preserve_original_ai_voice` with low-intensity prosody; it must not change `spoken_text` or replace the original AI voice character.
- Apply the Pronunciation Normalization Contract before sample generation. High-risk phrases such as `更准确地说`, adverbial `地`, ambiguous `重`, `按行归一化`, `QK^T`, `sqrt(d_k)`, and `d_k` must be rewritten or annotated in `spoken_text` so TTS does not guess the reading.
- Keep English technical and product terms as stable whole terms in `spoken_text`; for example `ChatGPT`, `Claude`, `token`, `Attention`, `softmax`, `KV Cache`, and `Multi-Head Attention` must not be split, translated, or phonetically rewritten unless the source script explicitly requires spelling an acronym.
- EP05-derived high-risk terms must be checked before sample or full generation when present: naked `Q`, `K`, `V`, `Q/K`, `KV cache`, `mθ_i`, `nθ_i`, `δ_i`, `θ_i`, `n-m`, and polyphonic phrases such as `长上下文`.
- Run duplicate and near-duplicate checks before TTS so repeated narration is blocked before audio exists.
- Import only approved, postprocessed WAV files into the canonical `audio/voiceover.wav` slot.
- For segmented TTS, require an audio freshness check before merge or final render whenever the manifest, `spoken_text`, or critical segment list changes.

## Stop Conditions

Stop and request human review when:

- Sample audio repeats words or leaks reference text.
- English terms such as `ChatGPT`, `Claude`, `token`, `Attention`, `KV Cache`, or `vLLM` are skipped, split incorrectly, phonetically rewritten, drift between segments, or unclear.
- Formula phrases such as `Q 乘 K 转置`, `根号下 d k`, `softmax`, or `Multi-Head Attention` are misread, swallowed, or split into unintended fragments.
- Audio contains electrical noise, clipping, long silence, or obvious segment discontinuity.
- ASR transcript diff shows drift from `spoken_text` or detects leak-prone phrases.
- `review/sample_audio_review.json.status` is not `approved` for the current segment text hash.
- A critical segment wav is older than the current manifest, missing, invalid, or produced by a failed batch rerun.

## Verification

Use the existing project commands when available:

```bash
npm run voiceover:duplicate-guard
npm run audio:f5-check-reference
npm run audio:indextts2-prepare-segments:ep02
npm run audio:indextts2-generate-samples:ep02
npm run audio:f5-generate-samples
npm run audio:asr-transcript-diff
npm run audio:sample-review-gate
npm run audio:pronunciation-gate:ep05
npm run audio:freshness-gate:ep05-critical
```

Only after those gates pass should the workflow continue to `full_tts -> merge -> captions -> render`.
