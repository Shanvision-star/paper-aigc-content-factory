---
name: platform-format-adapter
description: Use when preparing or validating local cover, video, caption, and metadata variants for multiple publishing platforms without auto-publishing.
---

# Platform Format Adapter

## Purpose

Map approved episode assets into local platform packages. This skill is the project-level counterpart to one-design-to-many-platform resize patterns such as Canva social resize, but it stays local and deterministic unless a separate explicit tool task is requested.

## Inputs

- `platform_profiles/*.yaml`
- `episodes/{paper_id}/video_script/FRAME.md`
- Approved cover assets.
- Rendered video or HTML draft status.
- Captions.
- Approved title, description, hashtags, and language mode.

## Outputs

- `episodes/{paper_id}/publish/platform_manifest.json`
- Per-platform review notes for cover, video, captions, and metadata.
- A partial failure report when one platform cannot be packaged but others can still be checked.

## Required Variants

- Douyin / TikTok / Xiaohongshu / YouTube Shorts: vertical `1080x1920`.
- Bilibili / YouTube: landscape `1920x1080`.
- X and cross-platform feed preview: square `1080x1080` or landscape when the platform profile selects it.

## Manifest Fields

Each manifest entry must include:

- platform
- language mode
- cover path
- video path
- caption path
- title
- description
- hashtags
- safe-area note
- status

## Rules

- Preserve the `safe90` cover rule for vertical short-video covers unless a platform profile explicitly overrides it.
- Use exact sizes from `platform_profiles/*.yaml`; do not guess dimensions.
- Treat missing cover, video, captions, or metadata as partial failure, not success.
- Continue validating other variants after one platform fails and report partial failure clearly.

## Forbidden Actions

- Do not auto-publish.
- Do not upload media.
- Do not invent metadata that was not derived from approved script, blog, or platform profile inputs.
- Do not treat a missing cover/video/caption as success.
- Do not run provider, LLM, TTS, HyperFrames, Manim, or network calls.
