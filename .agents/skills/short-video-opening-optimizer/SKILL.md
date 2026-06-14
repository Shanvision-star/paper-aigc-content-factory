---
name: short-video-opening-optimizer
description: Use when generating or scoring platform-aware opening hooks for AI paper short videos before storyboard or FRAME lock.
---

# Short Video Opening Optimizer

## Purpose

Create or review the first `0-3s` of a paper explainer so the viewer understands why the episode matters before they scroll away. This skill replaces the missing exact GitHub `short-video-opening-optimizer` repository with a local project skill built from reviewed short-video copywriter, social-content, editing-coach, and thumbnail patterns.

## Use When

- Drafting platform hooks before `script-storyboard-writer` locks a script.
- Reviewing a first frame, title card, or opening spoken line.
- Preparing first-frame notes for `frame-spec-writer`.

## Hook Score

Score each opening variant on:

- visual hook
- verbal hook
- text overlay
- audience promise
- technical credibility
- platform fit
- non-clickbait integrity

## Platform Families

- Chinese short-video: Douyin, Xiaohongshu, Bilibili.
- Overseas short-video: TikTok, YouTube Shorts.
- Long/feed variants: YouTube, X.

## Paper Explainer Defaults

- Prefer knowledge-gap, contradiction, modern-AI relevance, and Feynman analogy hooks.
- Keep the first visual inspectable on a phone.
- Use a short on-screen text overlay, not a paragraph.
- Make the first claim technically reviewable and not clickbait.
- Record which hook feeds `script-storyboard-writer` and which first-frame note feeds `frame-spec-writer`.

## Forbidden Actions

- Do not invent paper claims.
- Do not weaken technical accuracy for retention.
- Do not output title or caption variants that contradict the reviewed script.
- Do not auto-publish.
- Do not run provider, LLM, TTS, HyperFrames, Manim, or network calls.
