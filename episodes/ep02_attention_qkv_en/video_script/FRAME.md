# EP02 English Frame Contract: What Does QKV Compute?

## Boundary

- This is an English international derivative of EP02.
- It must not overwrite Chinese EP02 script, audio, captions, or renders.
- Target platforms: YouTube Shorts and X.
- Primary visual approach: source-backed Soft Lab / Paper System with the original paper Figure 2 and Harvard Annotated Transformer formula/code anchors.

## Source-Backed Asset Contract

The English video preserves the same technical visual chain:

`Q -> Key matching -> score matrix -> /√(d_k) -> row-wise softmax -> weighted Value -> output representation`.

Required original/source assets:

- original paper Figure 2 Scaled Dot-Product Attention crop: `video_script/source_assets/harvard_embedded_03.png`
- original paper Transformer architecture image: `video_script/source_assets/harvard_embedded_02.png`
- formula SVG: `visuals/ep02_formula_scaled_dot_product_attention.svg`
- Harvard attention code SVG: `visuals/ep02_harvard_attention_code.svg`
- QKV projection, QK graph, and KV Cache diagrams from the approved EP02 visual system.

## Formula Rules

- Visual/caption form: `Attention(Q,K,V)=softmax((QK^T)/√(d_k))V`.
- Spoken form: "Q times K transpose" and "the square root of d k".
- Meaning of `d_k`: the dimension of Query and Key vectors in the paper.
- The formula must appear as a complete visual object before the engineering section.
- Captions must not cover the formula bounding box.

## Connector Geometry Rules

- Relation lines must be SVG paths connected to the outer edge of nodes, cards, matrices, or output circles.
- Do not draw connectors from center point to center point when the path crosses the interior of a visual element.
- Arrowheads must use a fixed marker size across all scenes. Use color and opacity for emphasis, not larger arrowheads.
- Relation and aggregation connectors must use a single, readable flow arc with consistent curvature. Do not use arbitrary multi-bend curves.
- Step-by-step derivation connectors should use straight process arrows unless a flow arc is needed to avoid overlap.
- The last control point of a curved connector must align with the target center direction so the arrowhead points cleanly at the target boundary.
- Review frames must fail if arrows float, pierce a node/card interior, point away from the target, or use inconsistent arrowhead sizes.

## HyperFrames Animation Review Gates

The current English animation branch is blocked from final render until these review stills pass human inspection:

- `qa/animation_review_stills/01_qk_anchored_relation_graph.png`
- `qa/animation_review_stills/02_formula_derivation_chain.png`
- `qa/animation_review_stills/03_rowwise_softmax.png`
- `qa/animation_review_stills/04_weighted_value_to_output.png`
- `qa/animation_review_stills/05_kv_cache_runtime_state.png`

Required checks:

- QK relation lines use edge anchors and readable flow arcs.
- The full formula appears in one protected visual object and does not overflow.
- The derivation chain is visible: `QK^T -> /√(d_k) -> row-wise softmax -> weighted V -> output`.
- The row-wise softmax frame clearly shows one row becoming attention weights that sum to one.
- The weighted V frame shows the values flowing into output `O`, without arrows piercing the output circle.
- The KV Cache frame shows runtime reuse of projected K/V, not generic QKV cards.
- Captions and source labels stay outside formula and diagram reading zones.

Known failure modes to avoid:

- Treating the Chinese style reference or source infographic as only a visual prompt.
- Reusing projection-card skeletons for unrelated engineering concepts.
- Hand-laying formula fragments as paragraph text.
- Drawing connectors as hard-coded CSS spans, rotated rectangles, or arbitrary multi-bend curves.
- Rendering final video before keyframes prove no穿模, no漂移, no formula overflow, and no subtitle overlap.

## Pronunciation Rules For English TTS

- Do not split or spell out these terms unless explicitly written as letters: `ChatGPT`, `Claude`, `token`, `Attention`, `softmax`, `FlashAttention`, `GQA`, `MQA`, `KV Cache`, `Multi-Head Attention`.
- TTS input uses `spoken_text`, not raw formula notation.
- Captions may show `QK^T`, `√(d_k)`, and `KV Cache (Key-Value Cache)`.
- Keep English terms stable across all segments.

## Platform Notes

- YouTube Shorts: 1080x1920, hard captions, vertical safe area.
- X: 1080x1080 square variant, hard captions, center-safe layout.
- No auto-publishing.
