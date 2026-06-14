---
name: script-humanizer-zh
description: Use when applying a Chinese-native readability pass to approved AI paper scripts before spoken_text is locked for TTS.
---

# Script Humanizer ZH

## Purpose

Use the reusable pattern from `ai-zixun/humanizer-zh` inside this project's stricter paper-video workflow. Improve Chinese-native rhythm, remove translationese, trim empty big words, and normalize terminology without changing approved technical meaning.

## Use When

- `technical-script-reviewer` has approved or conditionally approved the script.
- The script still sounds mechanical, translated, slogan-like, or overly list-shaped.
- The episode needs a more natural Chinese voice before `spoken_text` is locked for TTS.

## Inputs

- Reviewed script or `source_text`.
- `technical-script-reviewer` notes.
- Episode glossary, formula list, and pronunciation constraints.
- Existing `voice_segments.json` when available.

## Output

Return a concise revision note:

- `changed`: sentences improved for Chinese-native rhythm, paragraph flow, or terminology consistency.
- `unchanged`: formulas, cited facts, technical claims, English terms, and locked phrases preserved.
- `needs_re_review`: any sentence whose meaning changed enough to require another technical review.

## Required Checks

- Preserve paper facts, formulas, tensor notation, citations, approved risk statements, and English technical terms.
- Keep English terms remain whole words.
- Keep Chinese `地` as `de` only when the TTS adapter needs a pronunciation-safe rewrite.
- Remove empty rhetorical inflation only when the underlying claim stays the same.

## Forbidden Actions

- Do not change approved technical claims.
- Do not rewrite locked spoken_text.
- Do not alter formulas.
- Do not alter benchmark numbers, dates, authors, paper titles, model names, or citations.
- Do not add hidden narration cues.
- Do not run TTS, ASR, HyperFrames, Manim, provider, LLM, or network calls.
- Do not replace `technical-script-reviewer`.
