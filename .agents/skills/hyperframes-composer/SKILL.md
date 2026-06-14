---
name: hyperframes-composer
description: Use when composing storyboard, assets, audio, and captions into HyperFrames draft outputs.
---

# HyperFrames Composer

## Inputs

- `video_script/FRAME.md`
- `storyboard/storyboard.json`
- `visuals/assets_manifest.json` or `assets/assets_manifest.json`
- `audio/voiceover.wav`
- `captions/subtitles.srt` or `captions/subtitles.vtt`
- Platform render profile

## Outputs

- HyperFrames composition files
- Draft `.mp4` output when explicit rendering is enabled outside default tests
- Keyframes or screenshots for review
- Render status and missing-input report

## Allowed Actions

- Compose storyboard scenes, assets, audio, captions, and transitions into a HyperFrames draft.
- Produce keyframes or draft video only when the run explicitly permits rendering.
- Keep low-resolution draft and platform final outputs distinct.
- Record render inputs, output paths, duration, and any skipped render reason.

## Forbidden Actions

- Do not run P0 video render during default tests.
- Do not add Remotion as a P0 render path.
- Do not compose a paper episode when `video_script/FRAME.md` is missing; report the missing frame contract instead.
- Do not bypass missing audio, captions, or assets by fabricating outputs.
- Do not publish rendered media to any platform.
