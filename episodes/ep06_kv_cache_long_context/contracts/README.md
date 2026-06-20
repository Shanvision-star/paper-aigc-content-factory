# EP06 Pre-TTS / Pre-Render Contract Index

## Status

- Episode: `ep06_kv_cache_long_context`
- Purpose: block TTS and render until the four minimum contracts are present and reviewable.
- Current state: `draft_ready_for_human_review`
- Boundary: these contracts define facts, visuals, notation, and render gates only. They do not generate audio, images, MATLAB assets, HyperFrames output, or final MP4.

## Required Contracts

1. `claim_contract.md`: classifies narration as paper fact, engineering context, Feynman analogy, or CTA.
2. `visual_contract.md`: maps every storyboard scene to Big Idea, Proof Object, Visual Hero, and Caption as Micro-headline.
3. `notation_contract.md`: separates `visual_text`, `caption_text`, `spoken_text`, and pronunciation boundaries for formulas and technical terms.
4. `render_contract.md`: declares visual engines, local assets, safe areas, caption band, review keyframes, and audio/SFX gates.

## Gate Rule

EP06 must not enter TTS, MATLAB render, HyperFrames render, subtitle burn-in, SFX mix, or final MP4 assembly until all four contracts are reviewed and any blocking issue is either fixed or explicitly marked `accepted_by_human`.

## Cross References

- Script: `script/voice_segments.json`
- Technical review: `review/technical_script_review.md`
- Storyboard: `storyboard/storyboard.json`
- Episode frame contract: `video_script/FRAME.md`
- Sources and claims: `research/sources.jsonl`, `research/claims.json`
