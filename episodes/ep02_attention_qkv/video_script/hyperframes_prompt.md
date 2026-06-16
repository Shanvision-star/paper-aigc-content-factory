# EP02 HyperFrames Animation Prompt

## Objective

Create a vertical short-video animation for EP02, "QKV 到底在算什么？". The video must connect from EP01 without repeating EP01 background. The first spoken beat is:

```text
Attention 像一张不断变化的关系图。
这一集，我们把这张图拆开。
先看最关键的一步：
Q 乘 K 转置。
```

The animation teaches Q/K/V and Scaled Dot-Product Attention with the formula as the central visual object, not a decorative overlay.

## Source And Technical Alignment

Primary formula/code reference:

```text
https://nlp.seas.harvard.edu/annotated-transformer/
```

Align with Harvard Annotated Transformer concepts:

- `self_attn(x, x, x, mask)` means Q/K/V usually start from the same token representation in self-attention.
- `Q = XW_Q`, `K = XW_K`, `V = XW_V` are learned projection spaces, not three different raw datasets.
- Attention pipeline: `QK^T` scores -> divide by `sqrt(d_k)` -> row-wise softmax -> weighted sum over V.
- `sqrt(d_k)` means the square root of `d_k`, where `d_k` is the query/key vector dimension. Display it as `√(d_k)` or as a proper radical with `d_k` under the root overbar; do not display it as ambiguous `√d_k` text.
- Use the complete formula: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`.
- Explain Attention as a dynamic weighted relation matrix / soft adjacency matrix, not a static GNN graph.

## Visual Style

Use a Hybrid Paper System:

- Opening: Deep Navy `#0B1020` for impact.
- Formula teaching area: Paper White `#F7F7F5` with Ink Black `#1C1C1C`.
- Engineering extension: Soft Dark Blue `#1B2A41`.
- Query/Q: blue `#4C78FF`.
- Key/K: orange `#F58518`.
- Value/V: green `#54A24B`.
- Attention weights: purple-gray `#B279A2`.
- Critical highlight: red `#E45756`, only for one key formula step at a time.

Typography should feel like a clean technical notebook, not cyberpunk. Keep text inside safe areas for `1080x1920`, with large short titles and no crowded paragraphs.

## Scene Plan

1. Hook relation graph
   - Dark navy canvas.
   - Center token node connects to surrounding token nodes.
   - Edges animate with different weights.
   - Label: `soft adjacency matrix`.
   - Sync sound cue: `cue_001_opening`.

2. QK reveal
   - Zoom from one edge into a formula panel.
   - Reveal `QK^T` as the score generator.
   - Show one dot product: `s_ij = q_i · k_j`.
   - Sync sound cue: `cue_002_qk_reveal`.

3. Projection layer
   - Paper white canvas.
   - Show `X` splitting through three learned projections:
     - `Q = XW_Q`
     - `K = XW_K`
     - `V = XW_V`
   - Use Q blue, K orange, V green.
   - Sync sound cue: `cue_003_qkv_cards`.

4. Score matrix
   - Animate shapes:
     - Q `(m x d_k)`
     - K transpose `(d_k x n)`
     - score matrix S `(m x n)`
   - One row is current token's score list.
   - Keep the row label as `current token scores`.

5. Scaling
   - Divide matrix by `sqrt(d_k)`.
   - Show large raw scores compressing into a stable range.
   - Sync sound cue: `cue_004_scale`.

6. Row-wise softmax
   - Animate one row at a time into a distribution.
   - Display `row-wise softmax`.
   - Each highlighted row sums to one.
   - Sync sound cue: `cue_005_softmax` after the word `softmax` is spoken.

7. Weighted V aggregation
   - Attention weights flow into V cards.
   - Weighted streams merge into output representation `O = A V`.
   - Sync sound cue: `cue_006_weighted_v`.

8. Complete formula
   - Show the full formula clearly:
     `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`
   - Annotate in four steps:
     1. match scores
     2. scale
     3. normalize
     4. read values
   - This scene must be a derivation poster, not a simple formula card. It must show current token -> Q, Q fanout to K tokens, score matrix, row-wise softmax weights, V stack, output O, full formula, and four step cards in one coherent frame.

9. Modern engineering extension
   - Three cards stacked by layer:
     - Compute/kernel level: `FlashAttention`
     - Model architecture level: `GQA / MQA`
     - Runtime/inference state level: `KV Cache`
   - State visually that these optimize the same Attention path from different layers.
   - Sync sound cue: `cue_007_engineering_layers`.

10. CTA
   - Return to multi-head preview.
   - Text: `下一集：为什么一个 Attention 视角还不够？`
   - Sync sound cue: `cue_008_cta`.

## Formula Rendering Rules

- Formula must be complete and readable on mobile.
- Use MathJax/KaTeX/SVG or a clear formula image; do not rely on tiny raw text.
- `sqrt(d_k)` must be visually unambiguous: use `√(d_k)` or a radical sign with a horizontal overbar over `d_k`.
- Keep formula in caption-safe area.
- If using screenshots from Harvard or paper sources, crop tightly and keep attribution in metadata or notes.
- Formula labels must not overlap subtitles.
- When explaining `row-wise softmax`, animate rows independently so the viewer understands each current token gets its own distribution.

## Audio And Caption Rules

- Use `episodes/ep02_attention_qkv/script/pronunciation_normalization.md` for spoken term normalization.
- Use `episodes/ep02_attention_qkv/video_script/sound_cue_plan.md` for sound cue timing.
- Use `episodes/ep02_attention_qkv/video_script/sound_cue_timeline.json` as the executable sound-cue timing source.
- Sound cues must follow animation progression: trigger by `scene_id`, `visual_action_anchor`, and `offset_sec`, not by freehand absolute timestamps.
- Sound cues are auditory bookmarks only; do not overpower voiceover.
- Keep effects about `12-18 dB` below spoken voice.
- Do not place high-frequency effects over `Attention`, `softmax`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, `vLLM`, or `Multi-Head Attention`.
- Do not put cue labels or hidden sound directions inside `spoken_text`.
- If mixed audio hurts ASR transcript diff or English-term clarity, lower or remove the cue.
- Voice-only audio must pass clarity review before sound cues are mixed. Sound cues are removed, not raised, when the narration sounds unclear or too AI-like.
