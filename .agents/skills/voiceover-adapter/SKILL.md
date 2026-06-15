---
name: voiceover-adapter
description: Use when turning segment text and an authorized voice manifest into recording-needed status or audio artifacts.
---

# Voiceover Adapter

## Inputs

- `script/voice_segments.json`
- `voice/voice_profile_manifest.json`
- `voice/enrollment/recording_needed.md`, if present
- Available local TTS or voice adapter configuration

## Outputs

- `voice/enrollment/recording_needed.md`, when enrollment files are missing
- Updated `voice/voice_profile_manifest.json` status
- `audio/voiceover.wav`, only when an adapter succeeds
- `audio/voiceover_manifest.json`, only for real generated audio

## Allowed Actions

- Check whether personal voice enrollment and consent files exist.
- Keep `voice_profile_manifest.json.status` as `recording_needed` when required files are absent.
- Call an approved local or configured TTS adapter only when explicitly allowed for the run.
- Record engine, voice profile, input text hash, output path, generation time, and failure reason.
- Preserve a separate `source_text` and `spoken_text` contract so pronunciation fixes do not silently change reviewed captions.
- Apply or require pronunciation disambiguation before TTS. Example: `动态地` should read `de`; when an engine may read it as `di`, rewrite `spoken_text` to an unambiguous form such as `以动态方式...`.
- Enforce the Pronunciation Normalization Contract before generation:
  - Chinese particles and polyphones must be explicit in `spoken_text`. Examples: replace `更准确地说` with `准确一点说`, replace `一个 token 地往后生成` with `逐个 token 往后生成`, and replace ambiguous `重新算` with `从头再算` when `重` may be misread.
  - Formula phrases must have a stable spoken form. Examples: `QK^T` -> `Q 乘 K 转置`, `sqrt(d_k)` -> `根号下 d k`, and `d_k` -> `d k`.
  - Avoid ambiguous matrix wording before TTS. Example: replace `按行归一化` with `对每个当前 token 的那一组分数，分别做归一化` when clarity matters.
  - English terms should remain whole words unless they are formula symbols: `Attention`, `softmax`, `token`, `ChatGPT`, `Claude`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, `vLLM`, and `Multi-Head Attention`.

## Forbidden Actions

- Do not use third-party voices or unlicensed voice samples.
- Do not install CUDA, GPT-SoVITS WebUI, or heavy TTS training environments.
- Do not train voice models.
- Do not create fake, empty, placeholder, or mislabeled `.wav` files.
