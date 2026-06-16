# EP02 Frame Contract: QKV 到底在算什么？

## Paper Identity

- Paper: Attention Is All You Need
- Episode: EP02 QKV 到底在算什么？
- Thesis: QKV 不是三个独立数据源，而是同一 token 表示在三个 learned projection spaces 中的表示；Attention 的核心闭环是 `QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V`。
- Primary source: https://nlp.seas.harvard.edu/annotated-transformer/
- Source alignment: use the Harvard Annotated Transformer attention formula and attention code as the technical anchor.

## Required Source-Backed Assets

| Asset id | Required in scenes | Source type | Purpose |
| --- | --- | --- | --- |
| `ep02_formula_scaled_dot_product_attention_svg` | S06, S08, S09, S13 | `katex_mathjax_svg` | Complete formula object: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V` |
| `ep02_harvard_attention_code_svg` | S07, S09 | `paper_source_code_svg` | Harvard code anchor for `scores`, `softmax`, and `torch.matmul(..., value)` |
| `ep02_qk_relation_graph_svg` | S01, S02, S05 | `svg` | Smooth anchored relation graph; no CSS floating line segments |
| `ep02_qkv_projection_pipeline_svg` | S03, S04 | `svg` | `X -> Q/K/V` learned projection spaces |
| `ep02_kv_cache_engineering_svg` | S10, S11, S12 | `svg` | Modern LLM inference path: new Q reads cached K/V |

## Formula Asset Contract

- Canonical text: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`.
- Formula display text: `Attention(Q,K,V)=softmax((QK^T)/√(d_k))V`.
- Meaning of `d_k`: the vector dimension of queries and keys in the paper; the denominator is `sqrt(d_k)`, read as 根号下 d k.
- Spoken form: `Q 乘 K 转置` and `根号下 d k`.
- Caption form: `QK^T` and `√(d_k)`.
- Formula source type must be `katex_mathjax_svg`, `formula_editor_screenshot`, `paper_crop`, `manim_still`, or `manim_scene`.
- The full formula must appear in one unbroken visual object before or during the final formula explanation beat.
- Required annotation targets: `QK^T`, `sqrt(d_k)`, `softmax`, `V`, and `row-wise`.
- Captions and scene titles must not overlap the formula bounding box.
- Keyframe review must prove that the formula is complete, sharp, and readable on phone playback.

## Beat Table

| Scene | Spoken cue | Frame treatment | Visual engine | Required assets | Platform notes |
| --- | --- | --- | --- | --- | --- |
| S01 | `Attention 像一张不断变化的关系图` | Hook relation graph, centered token node, anchored SVG edges | hyperframes + svg | `ep02_qk_relation_graph_svg` | One dominant idea; no long paragraph |
| S02 | `动态生成一张软关系矩阵` | Matrix grows from relation graph; row/column labels visible | hyperframes + svg | `ep02_qk_relation_graph_svg` | Explain graph is soft matrix, not GNN |
| S03 | `Q、K、V 到底是什么` | `X` splits into three projection spaces | hyperframes + svg | `ep02_qkv_projection_pipeline_svg` | Q blue, K orange, V green |
| S04 | `会议室例子` | Feynman analogy card with question / label / content | hyperframes | `ep02_qkv_projection_pipeline_svg` | Keep analogy simple, centered |
| S05 | `它到底指谁` | Pronoun token row, Q fans out to K tokens | hyperframes + svg | `ep02_qk_relation_graph_svg` | Spoken text removes quote-pause risk around 它 |
| S06 | `除以根号下 d k` | Formula focus on denominator `sqrt(d_k)` | hyperframes + formula | `ep02_formula_scaled_dot_product_attention_svg` | Caption displays `√(d_k)` with the radicand clearly under the root |
| S07 | `softmax 按行归一化` | Row-wise softmax matrix, one row normalizes to sum one | hyperframes + source code | `ep02_harvard_attention_code_svg` | Keep `softmax` whole word |
| S08 | `最后加权读取 V` | Attention weights multiply V, merge into O | hyperframes + formula | `ep02_formula_scaled_dot_product_attention_svg` | Formula and V flow both visible |
| S09 | `Scaled Dot-Product Attention` | Full formula + Harvard code strip | hyperframes + formula + source code | `ep02_formula_scaled_dot_product_attention_svg`, `ep02_harvard_attention_code_svg` | This is the source-backed hero frame |
| S10 | `ChatGPT 或 Claude 生成回答` | Autoregressive generation timeline | hyperframes | `ep02_kv_cache_engineering_svg` | `ChatGPT` and `Claude` remain whole words |
| S11 | `KV Cache 缓存的不是原始 token` | New Q reads cached K/V projection blocks | hyperframes + svg | `ep02_kv_cache_engineering_svg` | Caption displays `KV Cache` as one phrase |
| S12 | `FlashAttention / GQA / MQA / KV Cache` | Three engineering cards by layer: compute, model, runtime | hyperframes | `ep02_kv_cache_engineering_svg` | Do not make these look like same-layer optimizations |
| S13 | `费曼方式总结` | One-page recap: Q question, K index, V content, formula strip | hyperframes + formula | `ep02_formula_scaled_dot_product_attention_svg` | Centered, high-density but readable |
| S14 | `Multi-Head Attention` | Preview: several heads read the same token from different spaces | hyperframes | none | CTA only, no new technical claims |

## Layout Rules

- Build every scene from its hero frame first; animation enters into that completed layout.
- The main visual object must be vertically centered inside a safe content column, not pushed down by long narration text.
- Avoid repeated scene skeletons. QK graph, projection, softmax, formula, KV Cache, and CTA scenes must use different component structures.
- Do not use CSS absolute line fragments for relation edges. Use SVG paths with node anchors and round caps.
- Each source-backed scene must show a small source note: `Source: Harvard Annotated Transformer`.
- Formula scenes reserve a no-caption zone around the formula bounding box.

## Caption Rules / Caption Display Guard

- Captions derive from reviewed narration or its approved display transform; they must not add hidden sound-cue instructions.
- English terms remain whole words: `ChatGPT`, `Claude`, `token`, `Attention`, `softmax`, `FlashAttention`, `KV Cache`, `Multi-Head Attention`.
- Formula display uses `QK^T`, `√(d_k)`, `d_k`, and `Attention(Q,K,V)` instead of spelling every symbol as Chinese text.
- Use non-breaking joins for multiword technical terms when writing SRT/VTT so platform wrapping does not split them.
- The pronoun `它` may appear without Chinese quote marks in `spoken_text` to avoid TTS pause; source text may keep the reviewed wording.

## Pronunciation Constraints

- Follow `episodes/ep02_attention_qkv/script/pronunciation_normalization.md`.
- Chinese adverbial `地` should be normalized to `de` or rewritten in `spoken_text`, for example `动态地` becomes `以动态方式`.
- `QK^T` spoken form is `Q 乘 K 转置`; visual/caption form is `QK^T`.
- `sqrt(d_k)` spoken form is `根号下 d k`; visual/caption form is `√(d_k)` or a proper radical with `d_k` under the overbar.
- Do not split `token`, `Attention`, `softmax`, `ChatGPT`, or `Claude` into letters.

## Render QA

- Block render approval if any EP02 source-required scene has empty `assets`.
- Block render approval if the HTML still contains the generic fallback relation graph for EP02.
- Block render approval if the full Attention formula is missing or visually fragmented.
- Block render approval if key English terms or formula tokens are broken across caption lines or converted into phonetic Chinese.
- Review keyframes at hook, formula, softmax, KV Cache, and recap beats.
