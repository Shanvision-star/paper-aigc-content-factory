# Account Visual Identity

## Purpose

This file defines the reusable visual identity for AI paper explainer content. It is global across papers and platforms. Episode-specific claims, figures, formulas, dates, and statistics belong in episode files, not here.

## Audience

- Chinese platforms: Douyin, Xiaohongshu, Bilibili.
- Overseas platforms: TikTok, YouTube Shorts, YouTube, X.
- Primary viewer: curious builders who want AI papers explained through modern LLM, agent, and AIGC context.

## Color Tokens

- `ink`: `#F4F7FB` for primary text on dark surfaces.
- `paper`: `#10131A` for default dark technical canvas.
- `signal`: `#F6C85F` for one focal highlight per frame.
- `matrix`: `#61D394` for attention weights, graph edges, and data-flow emphasis.
- `trace`: `#6EA8FE` for timelines, model family connections, and protocol/system layers.
- `muted`: `#9CA3AF` for secondary labels.
- `danger`: `#F87171` for risk and cost warnings.
- `safe-paper`: `#F7F7F5` for vertical cover crop-safe background extension.

## Typography Roles

- `display`: large title or one-line hook; never used for dense technical text.
- `claim`: short explanatory statement, 1-2 lines.
- `body`: readable explanation text and subtitles.
- `mono`: formulas, tensor shapes, code-like labels, token ids, and model/system names.
- `caption`: platform subtitles and karaoke highlights.

## Chinese / English Modes

- Chinese mode uses Chinese narration and Chinese primary subtitles.
- English terms such as ChatGPT, Claude, Agent, Self-Attention, Multi-Head Attention, FlashAttention, KV Cache, vLLM, MCP, and Sora remain English words unless the script explicitly defines a pronunciation override.
- Overseas mode uses English narration or English subtitles while preserving the same visual frame logic.
- Chinese `地` in adverbial phrases should be prepared for TTS as `de` when pronunciation normalization is needed.

## Cover Constraint

- Default vertical cover uses `safe90`.
- Canvas remains `1080x1920`.
- Content scale is `90%`.
- Safe padding is `54px` left/right and `96px` top/bottom.
- Safe-area treatment is an invisible layout guard. Do not use black padding, black background, visible safety frames, or shrunken-poster exports.
- Series cover style follows the EP04 light-paper cover grammar: warm white paper canvas, subtle grid, dark headline, source-backed proof cards, and warm-orange/blue emphasis.
- Cover arrows and connectors are auxiliary: they must not be visually larger than the connected object, must not become the focal element, and must not point into empty decorative space. For RoPE/QK covers, use thin vectors, endpoint dots, short arcs, or small bridge lines before using large arrowheads.
- Cover output names should encode episode, platform, canvas, and constraint, such as `{episode_slug}_{platform}_cover_1080x1920_safe90.png`.

## Figure and Formula Treatment

- Original paper figures must remain inspectable and attributed in the episode asset manifest.
- Formula frames must explain the operation before showing dense notation.
- Manim is preferred for hand-authored mathematical motion such as attention matrices, QK multiplication, softmax, and positional encoding waves.
- MATLAB may be used as a deterministic visual adapter for source-backed formulas, matrix or heatmap views, curve plots, RoPE/positional-encoding geometry, and frame-to-video previews when the episode contract follows `docs/visual_system/MATLAB.md` and records the script, MATLAB release, canvas size, frame rate, font map, terminology contract, output paths, review keyframes, overlap checks, and source evidence.
- HyperFrames is preferred for final composition, captions, platform safe areas, transitions, paper figure spotlight frames, and recap cards.

## What Not To Do

- Do not invent paper facts, dates, benchmark numbers, or author claims.
- Do not put hidden narration cues inside spoken text.
- Do not use a one-note palette where every frame is the same hue family.
- Do not let subtitles overlap formulas, paper figures, or face/voiceover panels.
- Do not crop load-bearing text outside vertical platform safe areas.
- Do not treat rendered command success as final quality approval.
- Do not treat MATLAB-generated videos, HTML previews, or exported plots as approved until their keyframes pass the same source, formula, caption, and safe-area review as other visual assets.
