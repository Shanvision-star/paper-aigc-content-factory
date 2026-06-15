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
- Note-video vertical: `1080x1440` when the platform profile selects it, such as Xiaohongshu.
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

## Formula Asset Contract

- Required formulas must appear as complete visual objects, not cropped fragments.
- Acceptable formula sources are clear paper crops, high-resolution formula-editor screenshots, KaTeX/MathJax/SVG output, Manim stills, or Manim scenes.
- Raster formula screenshots must be rendered at least `2x` the target display size; vector SVG or HTML math is preferred when possible.
- Each formula scene must preserve a full bounding box inside the safe area and keep captions outside that box.
- Formula assets must declare canonical formula text or LaTeX, source type, output path, and annotation targets in the episode frame contract or assets manifest.
- Annotated formulas must highlight the exact operation order used by the narration, such as `QK^T -> scale by sqrt(d_k) -> softmax -> weighted V`.
- Pre-render keyframes must prove the full formula is sharp, complete, and readable on phone-sized playback.

## Source-Backed HyperFrames Composition Hard Gate

- Paper figures and formulas are not just style references. They must become source-backed assets before HyperFrames composition.
- Required chain: `source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render`.
- If a scene explains a technical derivation, the animation must preserve the reasoning path instead of falling back to generic explanatory cards.
- For formula-heavy scenes, the frame contract must specify the source asset, full formula bounding box, annotation targets, operation order, caption exclusion zone, and keyframe review points.
- The composition must fail review if original paper figures, formula crops, or required operation steps are missing from the rendered keyframes.
- Reference infographics can inspire layout, but they do not count as implementation unless their structure is translated into explicit components, coordinates, assets, and review gates.

## Formula Derivation Chain Hard Gate

- Formula animation must show the computation sequence that the narration describes, not only the final equation.
- Use staged reveal for dense equations: source figure or formula first, then operation blocks, then the complete formula.
- Each formula scene must identify whether it needs an original formula crop, a derivation animation, an explanatory card, or a combination of all three.
- For Scaled Dot-Product Attention, the minimum derivation chain is `Q -> K matching -> score matrix QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V -> output O`.
- Visual, caption, and spoken channels must preserve the same formula meaning. Example: the visual shows `√(d_k)` or a true radical form, while spoken text says the square root of d k.
- Do not place formula fragments inside normal paragraph text when the scene requires mathematical inspection; use a protected formula object or source-backed image instead.

## Connector And Arrow Geometry Hard Gate

- Diagrams that use arrows, weighted lines, graph edges, or data-flow connectors must use explicit source and target anchors.
- Connectors must start and end on the visible boundary of the intended object, not inside cards, nodes, formulas, labels, or icons.
- Arrowheads must point to a clear semantic target such as a card edge midpoint, node boundary point, matrix cell, formula term, or callout anchor.
- Arrowheads must use fixed marker sizing across the scene. Emphasis should use color, opacity, or reveal timing, not larger arrowheads.
- Arrowheads and connector strokes must not pass through load-bearing text, formula symbols, node centers, card interiors, subtitles, or source labels unless the overlap is an intentional highlight with enough padding.
- Fan-out or fan-in diagrams should use symmetrical or consistently spaced target anchors when the concept is parallel, such as one `Q` matching multiple `K` cards.
- Use SVG paths, Manim vectors, or a layout engine with computed bounding boxes for connectors; do not use rotated CSS rectangles or hard-coded line spans as final arrows.
- Connector types must be chosen by semantic role:
  - step-by-step process: straight process arrows;
  - relation fan-out or fan-in: single-segment flow arcs with consistent curvature;
  - aggregation into one output: aligned flow arcs converging to the target boundary;
  - callouts: short leader lines that never cross the main equation or subtitle band.
- Do not use arbitrary multi-bend curves for technical flow. If a curve is required, use a readable single flow arc with stable curvature and a clean terminal tangent.
- Connector curves should preserve visual rhythm: consistent stroke width, rounded caps, clear z-index behind foreground objects, and enough spacing between adjacent arrows.
- Pre-render keyframes must check connector geometry before approval: no穿模, no漂移, no ambiguous target, no inconsistent arrowhead size, no arbitrary bending, and no broken visual hierarchy.

## Visual Centering And Whitespace Hard Gate

- Load-bearing diagrams, icons, formulas, and step labels must sit around the visible center of the phone frame, not drift into the top third.
- Do not leave large unused gaps between the primary visual object and the supporting step rail, caption, formula, or legend.
- Asset frames must be content-fit: shrink the frame, scale the visual, or tighten internal rows instead of filling unused canvas with blank paper.
- Repeated cards, icons, or graph nodes should use balanced horizontal and vertical spacing so the viewer can scan without feeling the content is floating.
- Visual review must inspect the rendered keyframe, not only the HTML source: the dominant object should pass a squint test at phone size.
- If a scene intentionally uses negative space, the episode `FRAME.md` must document the reason and identify the single focal object preserved by that space.

## Specific Scene Matcher Priority Hard Gate

- HyperFrames scene selection must match the most specific `visual_type` or component contract before any generic fallback.
- Composite names such as `kv_cache_cached_projection`, `formula_derivation_complete`, or `softmax_rowwise_matrix` must not be swallowed by generic checks such as `projection`, `formula`, or `matrix`.
- Scene matchers should be ordered from specific to generic, or use an explicit registry map keyed by full `visual_type`.
- If a scene falls back to a generic explanatory card while a specific asset/component exists in the episode `FRAME.md`, the render is a visual contract failure.
- Keyframe review must compare scene title, asset id, and rendered component role. A `KV Cache` scene must show runtime reuse of projected Key/Value, not generic QKV projection cards.

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
- Formula completeness test: each required formula is fully visible, has a canonical text/LaTeX record, and includes any required annotation targets.
- Platform crop test: vertical, note-video vertical, landscape, and square variants declare what is preserved or adapted.
- Render boundary test: real HyperFrames render remains outside default `npm test`.
