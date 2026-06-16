# EP02 QKV Sound Cue Plan

## Purpose

EP02 QKV 的音效只作为公式教学的 auditory bookmarks。它帮助观众识别 `QK` 匹配、缩放、softmax normalization、weighted V aggregation 和工程层级切换，但不能替代口播解释，也不能写入 `spoken_text`。

## Mix Boundary

- Sound cues must do not overpower voiceover.
- Short cues should sit about `12-18 dB` below spoken voice.
- Background music, if added, should sit about `18-24 dB` below spoken voice.
- Avoid high-frequency cues around `Attention`, `token`, `softmax`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, `vLLM`, and `Multi-Head Attention`.
- Final audio with cues must pass human listening review; if available, run ASR transcript diff after mix review.

## Cue Map

| Cue ID | Script Moment | Visual Sync | Sound Type | Duration | Risk | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| cue_001_opening | `Attention 像一张不断变化的关系图。` | Frozen relation graph appears | restrained sonic logo | 0.4-0.6s | Can feel too branded | Confirm voice remains first focus |
| cue_002_qk_reveal | `Q 乘 K 转置。` | Edge zoom reveals `QK^T` | QK reveal hit, clean and short | 0.2-0.35s | May sound like alert if too sharp | Check it marks the core operation without alarm tone |
| cue_003_qkv_cards | `变成 Q，变成 K，变成 V。` | Q/K/V cards enter in semantic colors | Q/K/V card taps | 3 taps under 0.5s total | Can become childish if too playful | Check taps support memory and do not distract |
| cue_004_scale | `除以根号下 d k。` | Score matrix compresses by `sqrt(d_k)` | soft squeeze / compression cue | 0.25-0.45s | Can mask `d k` pronunciation | Keep cue after the phrase, not over it |
| cue_005_softmax | `会进入 softmax。` | Row scores become weights that sum to one | softmax normalization rise | 0.4-0.7s | Can mask `softmax` | Start after word is spoken |
| cue_006_weighted_v | `去读取每个 token 对应的 V。` | Weighted V streams merge into output | weighted V aggregation merge | 0.5-0.8s | Can make the scene feel emotional rather than precise | Keep restrained and low |
| cue_007_engineering_layers | `一个偏计算。一个偏结构。一个偏推理状态。` | FlashAttention, GQA/MQA, KV Cache cards stack by layer | three subdued card hits | 0.6-0.9s total | Can flatten layer distinction | Use different tones for compute, architecture, runtime |
| cue_008_cta | `为什么一个 Attention 视角还不够...` | CTA card to Multi-Head Attention | gentle upward tail | 0.5-0.8s | Can feel like auto-promo | Keep academic and quiet |

## Animation-Locked Cue Timeline

音效必须跟随动画推进，而不是只跟随口播文本。每个 cue 都绑定 `scene_id + visual_action + offset_sec`，并且只能落在视觉动作点或短句间隙。

| Cue ID | Scene | Scene Start | Offset | Absolute Time | Visual Action Anchor | Mix Target |
| --- | --- | ---: | ---: | ---: | --- | --- |
| cue_001_opening | S01 | 0.0s | +0.54s | 0.54s | Relation graph / center token appears | -18 dB under voice |
| cue_002_qk_reveal | S01 | 0.0s | +1.12s | 1.12s | Active `QK^T` step rail enters and edge weight is visible | -16 dB under voice |
| cue_003_qkv_cards | S03 | 54.894s | +0.90s | 55.794s | Q/K/V projection cards enter in semantic colors | -18 dB under voice |
| cue_004_scale | S06 | 142.890s | +1.12s | 144.010s | `sqrt(d_k)` step becomes active after formula appears | -18 dB under voice |
| cue_005_softmax | S07 | 168.826s | +1.12s | 169.946s | Row-wise softmax weights animate after score matrix appears | -18 dB under voice |
| cue_006_weighted_v | S08 | 195.346s | +0.90s | 196.246s | V stack and weighted aggregation output enter | -18 dB under voice |
| cue_007_engineering_layers | S12 | 307.980s | +0.90s | 308.880s | FlashAttention / GQA / KV Cache cards enter as three layers | -18 dB under voice |
| cue_008_cta | S14 | 396.226s | +0.54s | 396.766s | Multi-Head Attention CTA layout appears | -20 dB under voice |

## Animation Sync Rules

- If the animation timing changes, update this table and `sound_cue_timeline.json` before mixing.
- Cue timing follows the visual animation anchor; if it masks an English term or formula phrase, shift the cue later by `0.20-0.35s`, never earlier.
- Do not place high-frequency attacks over `Attention`, `token`, `softmax`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, or `Multi-Head Attention`.
- Cue tails must finish before the next subtitle line becomes dense; remove the cue if clarity drops.
- Final review must listen to voice-only audio first, then voice + cues, and reject the mix if the cue makes the voice sound more AI-like.

## Forbidden Sounds

- Phone notification sounds.
- Alarm or warning sounds.
- Game, meme, or variety-show stingers.
- Harsh high-frequency beeps.
- Dense template transitions that compete with narration.

## HyperFrames Prompt Addition

```text
Use EP02 sound cues as auditory bookmarks only.
Follow the animation-locked cue timeline in sound_cue_timeline.json.
Each cue must be triggered by scene_id + visual_action + offset_sec, not by a freehand absolute timestamp.
Sync cue_002_qk_reveal to the QK reveal frame.
Sync cue_003_qkv_cards to Q/K/V card taps.
Sync cue_005_softmax to softmax normalization after the word softmax is spoken.
Sync cue_006_weighted_v to weighted V aggregation.
Do not overpower voiceover.
Keep effects about 12-18 dB below spoken voice.
Do not put cue labels or hidden sound directions inside spoken_text.
If mixed audio hurts ASR transcript diff or English-term clarity, lower or remove the cue.
```
