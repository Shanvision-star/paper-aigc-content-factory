---
name: voiceover-emotion-coach
description: Use when adjusting TTS delivery, preserving original AI voice character, controlling low-intensity prosody, pacing, emphasis, or optional IndexTTS2/CosyVoice emotion prompts for reusable paper explainer voiceovers.
---

# Voiceover Emotion Coach

## Core Rule

Preserve the original AI voice character first. Delivery direction belongs in `delivery_style` and optional `engine_emotion_prompt`; it must not replace the voice personality or be inserted into `source_text`, `spoken_text`, captions, or hidden narration cues.

## Workflow

Use this after `technical-script-reviewer` and pronunciation normalization, and before representative TTS samples.

```text
reviewed script -> spoken_text -> delivery_style -> optional engine_emotion_prompt -> sample-first TTS -> ASR/human review -> workflow-optimizer
```

## Output Contract

Create or update an episode-level delivery sidecar, usually near the TTS manifest. Default to `preserve_original_ai_voice`, not a new acting style:

```json
{
  "status": "planned",
  "scope": "reusable_across_episodes",
  "delivery_style": {
    "mode": "preserve_original_ai_voice",
    "prosody": "low_intensity_prosody",
    "tone": "clear, stable, lightly AI-like, not theatrical",
    "pace": "keep original pacing unless a formula needs clarity",
    "energy": "low to medium-low"
  },
  "engine_emotion_prompt": {
    "engine": "indextts2",
    "use_emo_text": false,
    "emo_text": null,
    "emo_alpha": 0.0,
    "use_random": false
  },
  "segment_overrides": {
    "seg_001": { "intent": "keep original AI voice, only clarify hook emphasis" },
    "seg_formula": { "intent": "preserve voice; slow formula words only if needed" },
    "seg_summary": { "intent": "stable recap without theatrical warmth" }
  }
}
```

## Reusable Delivery Palette

| Situation | Delivery direction |
| --- | --- |
| Opening hook | Original AI voice, slightly clearer emphasis |
| Feynman analogy | Clear and stable, not overly humanized |
| Formula or symbol | Precise, maybe slightly slower, no acting |
| Modern LLM example | Practical, steady, no forced excitement |
| Risk or caveat | Calm, credible, not alarming |
| Ending CTA | Conclusive, restrained, no hype |

## Engine Notes

- IndexTTS2: default to `use_emo_text=false`, `use_random=false`, and preserve the reference prompt's original delivery. Use `emo_text` only as an experimental escalation after human approval.
- CosyVoice: keep emotion and pacing instructions in the engine prompt or instruction field, not in `spoken_text`.
- F5-TTS or GPT-SoVITS: use only neutral reference audio and external delivery notes; do not put emotion tags in the target text.
- English terms such as `ChatGPT`, `Claude`, `token`, `Attention`, `softmax`, `KV Cache`, and `Multi-Head Attention` remain whole words. Emotion must never cause spelling, drifting, translation, or repeated terms.

## Self-Optimization Loop

After sample review, write improvement candidates instead of silently changing the mainline:

- If the voice is flat but still acceptable, prefer subtitle/visual/sound-cue support before changing voice character.
- If formulas are rushed, suggest formula-specific pacing overrides.
- If English terms drift, lower expressiveness and prioritize pronunciation normalization.
- If the delivery becomes theatrical, reduce energy and remove excited wording from `emo_text`.
- If the voice feels pressured, teacher-like, or unlike the original AI voice, switch back to `preserve_original_ai_voice` with `use_emo_text=false`.
- Route durable changes through `workflow-optimizer`; do not auto-update shared skills without human approval.

## Forbidden Actions

- Do not add emotion tags to spoken_text; keep all emotion hints in `delivery_style` or `engine_emotion_prompt`.
- Do not add cue words like "重点来了" unless they already exist in approved `source_text`.
- Do not skip sample-first, ASR transcript diff, or human listening review.
- Do not replace the original AI voice character with a teacher, host, broadcaster, or sales style.
- Do not use unlicensed emotion reference audio.
- Do not trade term clarity, formula clarity, or transcript fidelity for expressiveness.
