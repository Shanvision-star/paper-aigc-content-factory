---
name: voiceover-emotion-coach
description: Use when improving TTS delivery, teaching tone, emotional expressiveness, prosody, pacing, emphasis, or IndexTTS2/CosyVoice emotion prompts for reusable paper explainer voiceovers.
---

# Voiceover Emotion Coach

## Core Rule

Make the voice sound like a clear teacher, not like a new script. Emotional direction belongs in `delivery_style` and `engine_emotion_prompt`; it must not be inserted into `source_text`, `spoken_text`, captions, or hidden narration cues.

## Workflow

Use this after `technical-script-reviewer` and pronunciation normalization, and before representative TTS samples.

```text
reviewed script -> spoken_text -> delivery_style -> engine_emotion_prompt -> sample-first TTS -> ASR/human review -> workflow-optimizer
```

## Output Contract

Create or update an episode-level delivery sidecar, usually near the TTS manifest:

```json
{
  "status": "planned",
  "scope": "reusable_across_episodes",
  "delivery_style": {
    "role": "patient teacher explaining AI papers to smart beginners",
    "tone": "warm, clear, curious, lightly energetic",
    "pace": "slightly slower than fast short-video delivery",
    "energy": "medium, never salesy or theatrical"
  },
  "engine_emotion_prompt": {
    "engine": "indextts2",
    "use_emo_text": true,
    "emo_text": "像一位耐心的老师在给学生讲一个重要公式。整体温和、清晰、有启发感。重点句稍微提高能量，公式处放慢，英文术语读清楚。不要夸张，不要广告腔。",
    "emo_alpha": 0.45,
    "use_random": false
  },
  "segment_overrides": {
    "seg_001": { "intent": "curious hook, clearer emphasis" },
    "seg_formula": { "intent": "slow down around formulas" },
    "seg_summary": { "intent": "warm Feynman recap" }
  }
}
```

## Reusable Delivery Palette

| Situation | Delivery direction |
| --- | --- |
| Opening hook | Curious, focused, a little brighter |
| Feynman analogy | Warm, conversational, patient |
| Formula or symbol | Slower, precise, no drama |
| Modern LLM example | Practical, lightly excited |
| Risk or caveat | Calm, credible, not alarming |
| Ending CTA | Conclusive, inviting, no hype |

## Engine Notes

- IndexTTS2: prefer `use_emo_text=true`, `use_random=false`, and a restrained `emo_text` for teaching-style prosody. Record `emo_alpha` for comparability even if a local runner ignores it for text-emotion mode.
- CosyVoice: keep emotion and pacing instructions in the engine prompt or instruction field, not in `spoken_text`.
- F5-TTS or GPT-SoVITS: use only neutral reference audio and external delivery notes; do not put emotion tags in the target text.
- English terms such as `ChatGPT`, `Claude`, `token`, `Attention`, `softmax`, `KV Cache`, and `Multi-Head Attention` remain whole words. Emotion must never cause spelling, drifting, translation, or repeated terms.

## Self-Optimization Loop

After sample review, write improvement candidates instead of silently changing the mainline:

- If the voice is flat, suggest increasing warmth or curiosity in `delivery_style`.
- If formulas are rushed, suggest formula-specific pacing overrides.
- If English terms drift, lower expressiveness and prioritize pronunciation normalization.
- If the delivery becomes theatrical, reduce energy and remove excited wording from `emo_text`.
- Route durable changes through `workflow-optimizer`; do not auto-update shared skills without human approval.

## Forbidden Actions

- Do not add emotion tags to spoken_text; keep all emotion hints in `delivery_style` or `engine_emotion_prompt`.
- Do not add cue words like "重点来了" unless they already exist in approved `source_text`.
- Do not skip sample-first, ASR transcript diff, or human listening review.
- Do not use unlicensed emotion reference audio.
- Do not trade term clarity, formula clarity, or transcript fidelity for expressiveness.
