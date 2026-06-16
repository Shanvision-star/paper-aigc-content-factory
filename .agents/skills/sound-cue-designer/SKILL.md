---
name: sound-cue-designer
description: Use when planning sound effects, audio cues, sonic logos, notification-like prompts, background music, or mix boundaries for AI paper explainer videos before TTS merge, captions, HyperFrames render, or platform review.
---

# Sound Cue Designer

## Core Rule

Use sound cues as auditory bookmarks for comprehension, not as decoration. A cue is valid only when it marks a real cognitive turn such as hook, formula reveal, Q/K/V card entry, softmax normalization, weighted V aggregation, engineering-layer shift, or next-episode CTA.

## Required Checks

- Do not overpower voiceover. Keep short effects about `12-18 dB` below spoken voice; keep background music about `18-24 dB` below spoken voice.
- Avoid phone notification sounds, alarms, game sounds, meme stingers, harsh beeps, or dense template sound packs.
- Keep high-frequency cues away from English terms such as `Attention`, `softmax`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, and `vLLM`.
- Place cues between phrases or on visual action points; do not mask consonants, numbers, formulas, or subtitles.
- Treat the final mix as part of the TTS gate: if effects hurt ASR transcript diff, English clarity, or human listening review, lower or remove them.
- Do not add cue instructions into `spoken_text`; keep them in storyboard, FRAME, sound cue plan, or HyperFrames prompt.

## Paper Explainer Cue Map

| Moment | Cue | Purpose |
| --- | --- | --- |
| Opening | restrained sonic logo | Establish series identity |
| Core formula | QK reveal | Mark the episode's main operation |
| Concept cards | Q/K/V card taps | Help memory without adding narration |
| Scaling | compression or squeeze cue | Indicate `sqrt(d_k)` stabilization |
| Softmax | softmax normalization rise | Convert scores into distribution |
| Value read | weighted V aggregation merge | Show many streams becoming one output |
| Engineering layer | three subdued card hits | Separate compute, architecture, runtime |
| CTA | gentle upward tail | Lead into the next episode |

## Output Contract

When used for an episode, produce or update an episode-level sound cue plan with:

- cue id and spoken cue it supports
- visual action it syncs to
- sound type, duration, and relative loudness
- risk to voice clarity, ASR transcript diff, captions, or platform tone
- verification note for human listening review

## Boundaries

- Do not synthesize, download, or license sound assets.
- Do not mix final audio or replace voiceover.
- Do not change script claims, captions, formulas, or spoken text.
- Do not use sound cues to compensate for unclear narration; fix the script first.
