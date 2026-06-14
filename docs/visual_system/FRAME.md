# Global Frame System

## Purpose

This file translates `docs/visual_system/DESIGN.md` into camera-ready frame rules for paper explainer videos. It applies to every paper unless an episode-level `FRAME.md` narrows the rule with a documented reason.

## Authority Chain

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `DESIGN.md`: account-level identity.
- `FRAME.md`: global video-frame grammar.
- `episodes/{paper_id}/video_script/FRAME.md`: paper-specific execution contract.

## Frame Sizes

- Primary vertical: `1080x1920`.
- Landscape: `1920x1080`.
- Square: `1080x1080`.

## Safe Area

- Vertical short video is the strictest default.
- Load-bearing titles, formulas, captions, and paper figure labels stay inside the safe area.
- Full-bleed backgrounds may cross the safe area.
- Cover export follows `safe90` when generating Douyin/Xiaohongshu/TikTok-style covers.

## Caption Safe Area

- Captions live in a reserved bottom band unless the scene uses a formula or paper figure that requires captions above the visual object.
- Caption text must not overlap formulas, figure labels, axes, or author/source labels.
- Karaoke or highlighted captions must be derived from `spoken_text`, not hidden visual notes.
- English terms remain whole words unless an approved pronunciation cue says otherwise.

## Typography Floor

- Load-bearing text must be readable on a phone screen.
- Dense formula notation uses zoom, staged reveal, or callouts instead of shrinking below readability.
- Eyebrow labels and source captions can be smaller only when they are not required to understand the beat.

## Frame Treatments

### Hook Title

Use for the first 3-8 seconds. One dominant claim, one visual anchor, no dense paragraphs.

### Feynman Analogy

Use a simple object or relation before showing the technical form. Example: pronoun reference before Self-Attention.

### Paper Figure Spotlight

Use the original paper image as the main visual. Pan, zoom, or crop only when the source remains identifiable and attributed.

### Formula Explanation

Reveal operation order first, then notation. For Attention, show QK matching, softmax weights, and weighted V reading before the full formula.

### Modern LLM Connection

Connect the paper mechanism to current GPT, Claude, Gemini, Qwen, DeepSeek, Sora, Agent, MCP, KV Cache, vLLM, or FlashAttention context only when the technical-script review has approved the connection.

### Engineering Risk

Use for cost, latency, hallucination, long-context, or scaling constraints. The warning must be specific and sourced from the script or research notes.

### Recap And Next-Episode CTA

Summarize the paper's core mental model and preview the next technical decomposition.

## Motion Grammar

- Multi-scene HyperFrames compositions use transitions between scenes.
- Each scene needs visible entrance motion.
- Exit motion is avoided except on final closeout scenes; transitions handle scene changes.
- Formula animation should privilege comprehension over speed.
- Paper figure movement should be slow enough to inspect.
- Do not use random, wall-clock, or nondeterministic motion in default composition source.

## Paper Genre Treatment Registry

- Architecture papers: system diagram, data flow, layer comparison, tradeoff frame.
- LLM systems papers: model family timeline, inference pipeline, optimization risk frame.
- Diffusion and video-generation papers: latent-space map, temporal token frame, before/after sample frame.
- Benchmark and evaluation papers: metric ledger, failure case grid, leaderboard caveat frame.
- Agent and tooling papers: tool-call graph, protocol boundary, orchestration timeline, human-review gate frame.

## Pre-Render Frame Audit

- Squint test: one thing should dominate each frame.
- Safe-area test: title, caption, formula, and figure labels fit platform safe regions.
- Subtitle overlap test: captions do not cover formulas, faces, or paper labels.
- Figure attribution test: original paper figures stay identifiable and referenced in `assets_manifest.json`.
- Formula legibility test: formulas are readable without shrinking below the typography floor.
- Platform crop test: vertical, landscape, and square variants declare what is preserved or adapted.
- Render boundary test: real HyperFrames render remains outside default `npm test`.
