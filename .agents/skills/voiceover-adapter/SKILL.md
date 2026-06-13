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

## Forbidden Actions

- Do not use third-party voices or unlicensed voice samples.
- Do not install CUDA, GPT-SoVITS WebUI, or heavy TTS training environments.
- Do not train voice models.
- Do not create fake, empty, placeholder, or mislabeled `.wav` files.
