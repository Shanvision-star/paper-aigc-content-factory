# Global Frame System

## Purpose

This file translates `docs/visual_system/DESIGN.md` into camera-ready frame rules for paper explainer videos. It applies to every paper unless an episode-level `FRAME.md` narrows the rule with a documented reason.

## Authority Chain

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `DESIGN.md`: account-level identity.
- `FRAME.md`: global video-frame grammar.
- `MATLAB.md`: dedicated MATLAB visual adapter contract when an episode uses MATLAB-generated formulas, plots, animations, or MP4 previews.
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

## Technical Terminology In Conclusion Cards

- Conclusion cards and recap cards must keep professional terms in English first, with Chinese only as a parenthetical explanation.
- Preferred format: `English Term（中文注释）`.
- Do not replace key concepts with Chinese-only wording when the frame is summarizing a technical mechanism.
- Examples: `Multi-Head Attention（多头注意力）`, `learned projection subspaces（学习到的投影子空间）`, `cost center（成本中心）`, `optimization layer（优化层）`.

## Frame Treatments

## Ogilvy Creative Contract

Every episode frame should support one memorable advertising idea without weakening research accuracy. Use `ogilvy-creative-director` before locking the episode frame contract when the hook, cover, first screen, or storyboard lacks a clear creative promise.

- Big Idea: the frame system must preserve one dominant learning promise across cover, opening, key diagrams, recap, and CTA.
- headline as mini-ad: title cards, cover lines, and first-screen text must read like a compact promise, not a generic section label.
- facts before decoration: motion, glow, texture, sound cue, and layout choices must come after the claim, source, formula, or paper figure is clear.
- visual hero: every hook and major scene needs one primary inspectable object; supporting badges, lines, captions, and particles remain secondary.
- proof object: claims should be grounded by a visible paper figure, formula, code snippet, benchmark, source-backed diagram, or explicit citation object.
- brand consistency: recurring series typography, caption bands, source labels, proof-object treatment, and cover hierarchy should stay recognizable across episodes and platform variants.
- research before creative: visual direction starts from the paper, competing explanations, platform behavior, and audience vocabulary, not from a style preset.
- caption as micro-headline: each 5-8 second subtitle or overlay caption should carry a complete mechanism, new information, or viewer benefit.
- consumer language: first-screen and callout text should name the viewer's problem in plain words before showing formal notation.
- numbered facts: use numbered proof cards when a scene needs several factual reasons, comparisons, or engineering implications.
- news-style layout: prefer a clear editorial layout with readable hierarchy, source labels, and proof objects instead of decorative clutter.
- image captions: paper figures, formula crops, code screenshots, and benchmark images need short captions that explain what the viewer is seeing.
- avoid reverse type: do not put long load-bearing paragraphs in white text on black backgrounds; use protected readable text surfaces when the scene is dark.
- avoid ornate fonts: avoid decorative, novelty, or low-legibility fonts for titles, subtitles, formulas, labels, and image captions.

## Ogilvy Layout And Typography Hard Gate

- Load-bearing text uses dark ink on a light paper or white surface. Do not use reverse type for body text, subtitles, formula explanations, or image captions.
- Do not put long text on black, dark, saturated, or decorative colored panels. Colored accents can identify Q/K/V or steps, but the reading surface stays light.
- Body and explanatory text must stay above the readability floor: print baseline is `9pt` minimum and `11pt` preferred; phone-video text must be visibly larger than that baseline.
- Long explanations prefer a high-readability serif or traditional reading face. Poster-like hook frames may use large sans-serif type, but not dense sans-serif paragraphs.
- Keep one type system per frame. Avoid unnecessary mixing of font families, font sizes, and weights; hierarchy should come from spacing, ordering, and one clear visual hero.
- Paragraphs need enough leading and separation. Use short paragraphs, numbered facts, icons, arrows, or proof cards instead of dense continuous copy.
- Avoid all-caps sentences in English. Necessary technical abbreviations such as `QKV`, `MHA`, `GQA`, `MQA`, and `MoE` are allowed.
- Do not place headlines, captions, or explanatory text over important paper figures, formulas, code, axes, or matrix cells. Put explanations beside or below the proof object with padding.
- Poster or cover-like frames must pass a five-second readability rule: no more than three element types, clean strong colors on a light field, and the paper name or mechanism name visible at a glance.

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
- Acceptable formula sources are clear paper crops, high-resolution formula-editor screenshots, KaTeX/MathJax/SVG output, Manim stills, Manim scenes, or MATLAB-generated SVG/PDF/PNG/HTML assets from source-backed scripts.
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

## MATLAB Figure And Animation Adapter Contract

- MATLAB is an optional deterministic visual engine for source-backed formula conversion, matrix and heatmap views, positional-encoding curves, RoPE rotation geometry, attention score illustrations, and frame-to-video previews.
- MATLAB does not replace HyperFrames as the final composition layer. A MATLAB scene should produce inspectable assets that HyperFrames or a later explicit render task can consume.
- Full MATLAB layout, animation, typography, terminology, overlap-check, manifest, invocation, and HyperFrames handoff rules live in `docs/visual_system/MATLAB.md`; episode contracts must reference it when `visual_engine=matlab`.
- Every MATLAB visual task must be canvas-first: declare `canvas_px`, `fps`, scene duration, expected frame count, safe-area policy, output formats, and target platform before drawing.
- Prefer R2026a `exportgraphics` with explicit `Units="pixels"`, `Width`, `Height`, and `Padding=0` for review frames. Avoid relying on screen state or raw `getframe` for final frames unless the episode contract documents the reason and review evidence.
- Before approving final MATLAB exports, record R2026a `rendererinfo`, actual renderer device, Windows accessibility text size, and display scaling. On the current Windows workstation, final R2026a graphics should resolve through ANGLE/D3D11 on `NVIDIA GeForce RTX 3050`; any deviation needs a PR note and reviewed keyframes.
- Windows accessibility `Text size` should be `100%` for final MATLAB exports. If it is greater than `100%`, the asset must stay `needs_human_review` until full-size and phone-size keyframes prove no font, formula, axis, or caption layout drift.
- MATLAB MP4 previews use `VideoWriter` with a fixed profile such as `MPEG-4`, fixed `FrameRate`, fixed `Quality`, and even pixel dimensions. Do not let the first frame implicitly set an accidental odd or cropped video size.
- Each MATLAB output must write or update a manifest with the MATLAB executable or release, script path, source URLs or local source captures, canonical formula text or LaTeX, annotation targets, frame count, output paths, and generation timestamp.
- Generate static keyframes before full MP4 review. HTML Web Canvas output may be useful for interactive inspection, but it does not replace PNG/SVG keyframes or final MP4 frame checks.
- MATLAB scripts must be deterministic by default: no unseeded random data, no wall-clock motion decisions, no live provider calls, and no network-dependent source fetching inside default tests.
- Third-party MATLAB animation/export libraries may inform constraints, but do not vendor or copy GPL or unclear-license code into this project without an explicit license review. Prefer project-local wrappers around built-in `exportgraphics` and `VideoWriter`.
- Audience-visible MATLAB frames must follow audience-frame hygiene: no internal asset names, QA notes, placeholder labels, style prompts, or reviewer instructions on screen.

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
- MATLAB adapter test: MATLAB-generated assets declare their script, MATLAB release, canvas, fps or static format, source evidence, and review keyframes in the manifest before they are used in an episode render.
- MATLAB render-environment test: PR review records Windows text size, display scaling, `rendererinfo`, renderer device, and a tiny R2026a figure/export smoke when MATLAB assets were generated or regenerated.
- Platform crop test: vertical, note-video vertical, landscape, and square variants declare what is preserved or adapted.
- Render boundary test: real HyperFrames render remains outside default `npm test`.
- Render boundary test: real MATLAB rendering also remains outside default `npm test` unless a future deterministic unit test uses a tiny synthetic fixture with no external files or network calls.
