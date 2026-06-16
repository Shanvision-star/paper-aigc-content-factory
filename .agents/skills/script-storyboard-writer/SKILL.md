---
name: script-storyboard-writer
description: Use when drafting platform-aware hooks, voiceover, segments, storyboard, and blog copy from grounded claims.
---

# Script Storyboard Writer

## Inputs

- `research/claims.json`
- `research/timeline.json`
- `review/creative_direction.md` or `ogilvy-creative-director` notes when available
- Hook patterns and Hook Lab constraints
- `platform_profiles/*.yaml`
- Topic and audience intent

## Outputs

- `script/hooks.json`
- `storyboard/hook_variants.json`
- `script/voiceover.md`
- `script/voice_segments.json`
- `storyboard/storyboard.json`
- `blog/blog.md`
- PDF outline draft

## Allowed Actions

- Write hooks, voiceover, segments, storyboard beats, and blog draft from sourced claims.
- Adapt opening style and pacing to the selected platform profiles.
- Keep one core thesis and make the first scene reference the selected hook.
- Record hook choices, rejected variants, and source-backed rationale.
- Apply the `Ogilvy Creative Contract`: Big Idea, headline as mini-ad, facts before decoration, visual hero, proof object, and brand consistency.
- Apply the second-layer Ogilvy rules: research before creative, caption as micro-headline, consumer language, numbered facts, news-style layout, image captions, avoid reverse type, and avoid ornate fonts.
- Route weak hooks or unfocused first screens through `ogilvy-creative-director` after technical review and before `short-video-opening-optimizer`.
- Make the `proof object` explicit in the storyboard when a beat depends on a paper figure, formula, code snippet, benchmark, or source-backed diagram.
- Treat each subtitle beat as a caption as micro-headline: it should carry a mechanism, benefit, or curiosity gap instead of repeating filler.
- Use numbered facts when a complex explanation has multiple proof points, and keep each item tied to a claim or proof object.
- Add pronunciation notes for ambiguous Chinese particles and technical terms when drafting voiceover prompts; in particular, `动态地` uses the adverbial particle `地` and must be read as `de`, not `di`.
- Prefer low-ambiguity spoken phrasing for TTS-sensitive lines, such as `以动态方式建立关系`, when the visible script may contain `动态地建立关系`.

## Forbidden Actions

- Do not use generic openers in the short-video first scene.
- Do not render video, generate keyframes, or synthesize audio.
- Do not use unsourced exaggeration as clickbait.
- Do not change or invent claim evidence while writing scripts.
- Do not decorate before the claim is clear.
- Do not use a headline as mini-ad if the promised proof object cannot appear in the episode assets.
- Do not use puns, obscure references, long negative constructions, reverse type assumptions, or ornate font assumptions as the basis of the hook.
