# 第3集 Frame Contract: 为什么一个 Head 不够？

## Paper Identity

- Paper: Attention Is All You Need
- Episode: 第3集 为什么一个 Head 不够？
- Thesis: Multi-Head Attention is not a manual expert split. It projects the same representation into multiple learned subspaces, computes attention in parallel, concatenates the head outputs, and uses `W^O` to mix them back into the model stream.
- Primary source: https://nlp.seas.harvard.edu/annotated-transformer/
- Style baseline: continue the final 第2集 Chinese Xiaohongshu / Soft Lab style: warm paper background, centered hero object, semantic colors, source-backed formula cards, no dark background.

## Creative Direction And Proof Objects

- Big Idea: Multi-Head Attention is not "many fixed experts"; it sends the same input into multiple learned representation spaces and then mixes the results back together.
- Headline as mini-ad: `第3集｜为什么一个 Head 不够？`
- Visual hero: one input token sequence splits into parallel head lanes, then converges through `Concat -> W O`.
- Proof objects:
  - Harvard Annotated Transformer page and code path: linear projections -> split heads -> attention -> concat -> final linear.
  - Original paper / Harvard Figure 2 spotlight for Multi-Head Attention.
  - Formula object: `head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)`.
  - Formula object: `MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O`.
  - Dimension split object: `d_k=d_v=d_model/h`.
- Facts before decoration: all motion, arrows, glossary cards, and sound cues must point to one of the proof objects above.
- Voice baseline: use the EP02 approved personal timbre as the default audio direction. `native_ai` or built-in TTS is only a fallback after user approval, not the mainline for this episode.
- Sound cues: use restrained auditory bookmarks for hook, projection split, formula reveal, `Concat -> W O`, dimension split, source spotlight, engineering boundary, and CTA. Cues must stay below the voice and must not mask English terms or formula words.

## Required Source-Backed Assets

| Asset id | Required in scenes | Source type | Purpose |
| --- | --- | --- | --- |
| `ep03_formula_multi_head_svg` | S03, S04, S05, S08 | `katex_mathjax_svg` | Complete formula object: `head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)` |
| `ep03_formula_concat_wo_svg` | S04, S05, S08 | `katex_mathjax_svg` | Complete formula object: `MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O` |
| `ep03_dimension_split_svg` | S06 | `svg` or `manim_still` | Explain `d_k=d_v=d_model/h` without shrinking notation. |
| `ep03_paper_figure2_crop` | S07 | `paper_crop` | Original paper Figure 2 spotlight for Multi-Head Attention structure. |
| `ep03_mha_mqa_gqa_moe_cards_svg` | S09 | `svg` | Modern engineering boundary: MHA, MQA, GQA, MoE. |

## Source Alignment Workflow

Before HyperFrames composition, these assets must be created or declared missing:

1. `source_capture`: capture the Harvard Annotated Transformer section for Multi-Head Attention and the original paper Figure 2 reference.
2. `crop_formula_or_figure`: crop Figure 2 and any source formula/code references needed for spotlight scenes.
3. `visual_asset_manifest`: record source URL, asset id, source type, intended scene, bounding box, and attribution text.
4. `component implementation`: convert each source-backed object into a phone-readable Soft Lab frame component.
5. `review keyframes`: inspect keyframes before rendering the full video.

If the source capture does not exist, the composition may generate only a missing-input report or placeholder-free layout plan. It must not pretend the source-backed scene is complete.

## Formula Asset Contract

- Formula display text:
  - `head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)`
  - `MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O`
  - `d_k=d_v=d_model/h`
- Spoken form:
  - `第 i 个 head，分别有自己的 Q 投影矩阵、K 投影矩阵和 V 投影矩阵。`
  - `多个 head 先拼接，再经过输出投影矩阵 W O。`
  - `d k 和 d v，等于 d model 除以 h。`
- Caption form:
  - `W Q：Query Projection Matrix，Q 投影矩阵`
  - `W K：Key Projection Matrix，K 投影矩阵`
  - `W V：Value Projection Matrix，V 投影矩阵`
  - `W O：Output Projection Matrix，输出投影矩阵`
- Required annotation targets: `W_i^Q`, `W_i^K`, `W_i^V`, `head_i`, `Concat`, `W^O`, `d_model/h`.
- The full formula must appear as one unbroken visual object before or during the main formula explanation beat.
- Captions, source labels, and connector arrows must not overlap the formula bounding box.

## Formula Formatting Red Lines

Block keyframe approval if any of these appear:

- Formula乱码, missing glyphs, broken superscripts, or broken subscripts.
- Formula cropped by the frame, card, mask, viewport, or safe area.
- Raw LaTeX appears as final visible formula instead of rendered math.
- `W_i^Q`, `W_i^K`, `W_i^V`, or `W^O` is visually ambiguous, flattened into plain text, or semantically mismatched with subtitle labels `W Q`, `W K`, `W V`, `W O`.
- Formula is split into disconnected fragments without a complete formula object in the same beat.
- Subtitle, source label, or connector overlaps the formula bounding box.
- Formula is placed inside a normal paragraph when the scene needs mathematical inspection.

Preferred formula sources are SVG, KaTeX/MathJax HTML/SVG, Manim stills, or high-resolution formula screenshots rendered at least `2x` target size.

## Audience-Facing Final Keyframe Rule

- Review stills and final keyframes must be audience-facing visuals, not design notes.
- Internal production reminders such as `字幕写全称`, `画面保留专业符号`, `Proof path`, `redraw`, `公式完整`, `不使用深色背景`, or `source-backed visual contract` must stay in `FRAME.md`, prompt files, manifests, or QA notes only.
- Visible frame text may include episode title, paper/source attribution, technical terms, formula labels, short explanations, and source labels.
- If a sentence explains how to design the scene rather than what the viewer should learn, it must not appear on screen.
- Keyframe approval is blocked when reviewer-facing wording leaks into the video frame, even if the layout is otherwise correct.

## Beat Table

| Scene | Spoken cue | Frame treatment | Visual engine | Required assets | Platform notes |
| --- | --- | --- | --- | --- | --- |
| S01 | `为什么一个 head 不够？` | Hook card with one-head relation map splitting into several parallel head lanes | hyperframes + svg | none | No dark background; one dominant hero object |
| S02 | `同一份输入进入多个投影空间` | Input `X` flows into three labeled projection cards per head: `W Q`, `W K`, `W V` | hyperframes + svg | `ep03_formula_multi_head_svg` | First term callouts must include full names |
| S03 | `head_i 公式` | Hero formula card for `head_i` with semantic colors for Q/K/V | hyperframes + formula | `ep03_formula_multi_head_svg` | Formula readable for at least 4 seconds |
| S04 | `Concat + W O` | Multiple head outputs merge into Concat, then flow through boundary-anchored `W O` card | hyperframes + svg + formula | `ep03_formula_concat_wo_svg` | Arrows must attach to card boundaries, not interiors |
| S05 | `W O 不是装饰` | Output projection card expands into `重新融合多个子空间` note | hyperframes | `ep03_formula_concat_wo_svg` | Caption uses `矩阵 W O` |
| S06 | `d_k=d_v=d_model/h` | Dimension split diagram: one model width divided into `h` head slices | hyperframes + svg | `ep03_dimension_split_svg` | Explain compute is not naive stacking |
| S07 | `原论文 Figure 2` | Paper figure spotlight, then redraw in phone-readable Soft Lab diagram | paper_image + hyperframes | `ep03_paper_figure2_crop` | Show source note and image caption |
| S08 | `费曼总结` | Multi-lens analogy maps back to projection, attention, Concat, `W O` | hyperframes + formula | `ep03_formula_multi_head_svg`, `ep03_formula_concat_wo_svg` | Avoid saying heads are manually assigned experts |
| S09 | `2026 工程延伸` | Four cards: MHA, MQA, GQA, MoE with full names and short Chinese meanings | hyperframes + svg | `ep03_mha_mqa_gqa_moe_cards_svg` | Separate MoE from MHA layer |
| S10 | `Position Encoding 预告` | Attention relation map fades into ordered token row | hyperframes + svg | none | Next episode CTA only |

## Caption Rules / Terminology Contract

Follow `episodes/ep03_multi_head_attention/captions/caption_terminology_contract.md`.

## Conclusion Card Terminology Rule

- Animation conclusion cards must keep professional terms in English first, with Chinese explanations only in parentheses.
- Preferred format: `English Term（中文注释）`.
- Do not replace key concepts with Chinese-only wording in conclusion cards.
- Examples:
  - `Multi-Head Attention（多头注意力）`
  - `learned projection subspaces（学习到的投影子空间）`
  - `Head patterns（注意力模式）`
  - `cost center（成本中心）`
  - `optimization layer（优化层）`

Minimum first-mention captions:

- `QKV：Query-Key-Value，查询、索引、内容三组投影表示`
- `W Q：Query Projection Matrix，Q 投影矩阵`
- `W K：Key Projection Matrix，K 投影矩阵`
- `W V：Value Projection Matrix，V 投影矩阵`
- `softmax：把分数变成注意力权重`
- `Concat：拼接多个 head 的输出`
- `W O：Output Projection Matrix，输出投影矩阵`
- `MHA：Multi-Head Attention，多头注意力`
- `MQA：Multi-Query Attention，多查询注意力，共享 K/V`
- `GQA：Grouped-Query Attention，分组查询注意力，分组共享 K/V`
- `MoE：Mixture of Experts，混合专家机制`

Later captions may use the stable short forms: `QKV`, `W Q`, `W K`, `W V`, `softmax`, `Concat`, `矩阵 W O`, `MHA`, `MQA`, `GQA`, `MoE`.

## Pronunciation Constraints

- `Multi-Head Attention`, `softmax`, `Concat`, `token`, `MHA`, `MQA`, `GQA`, and `MoE` must remain stable English technical terms.
- `head_i` spoken form is `第 i 个 head`.
- `W_i^Q / W_i^K / W_i^V` should not be read literally as raw formula. Spoken text should say `Q 投影矩阵、K 投影矩阵、V 投影矩阵`.
- `W^O` spoken form is `W O 输出投影` or `输出投影矩阵 W O`.
- `d_k=d_v=d_model/h` spoken form is `d k 和 d v，等于 d model 除以 h`.
- Chinese adverbial `地` should be normalized to `de` or rewritten in `spoken_text` when needed.
- Personal voice generation must follow `sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render`.
- EP03 representative samples are `seg_001`, `seg_006`, `seg_010`, and `seg_011`.
- Stop before full generation if any sample has English drift, segment disconnection, reference-text leakage, duplicate phrases, electrical noise, clipping, or swallowed formula words.

## Layout Rules

- No dark background for 第3集 Chinese version. Use warm paper / light grid background from the 第2集 final Chinese style.
- Build each technical scene around one visual hero: formula card, projection lanes, dimension split, or engineering comparison cards.
- Use semantic colors consistently: Q blue, K orange, V green, `Concat` purple, `W O` red, engineering cards in soft pastel blocks.
- Repeated process lanes must use fixed column geometry: left label column, center process cards, right output label column, all aligned on one horizontal centerline.
- Lane labels such as `head_1`, `head_2`, and `head_h` must sit in their own label boxes. Do not let labels float beside arrows or rely on manual text spacing.
- Right-side labels such as `子空间 1` must sit inside their own bounded pill or card with enough padding. Do not place them at the frame edge where they can be clipped.
- Do not let arrows cross through text, formulas, captions, cards, or source labels.
- All connector arrows must attach to outer boundaries of nodes, cards, matrices, or formula callout boxes.
- Arrowheads must keep consistent size across a scene.
- Relation lines use smooth flow arcs with stable curvature, not arbitrary multi-bend curves.
- Formula scenes reserve a no-caption zone around the full formula object.
- Long first-mention glossary text should appear as side callouts or compact lower-third cards, not karaoke captions over the main formula.
- Process arrows such as `projection -> attention -> concat -> W O` should be straight boundary-to-boundary arrows.
- Fan-out or fan-in arrows for multiple heads may use single-segment flow arcs, but curvature, stroke width, and arrowhead size must stay consistent.
- No arbitrary multi-bend curves, oversized arrowheads, floating CSS line fragments, or connector endpoints inside object interiors.

## Required Keyframe Review Points

Generate review stills before full animation:

| Review id | Required keyframe | Must prove |
| --- | --- | --- |
| `kf_01_hook` | Hook: one head is not enough | One visual hero, no dark background, no repeated QKV explanation. |
| `kf_02_projection` | Same input into `W Q / W K / W V` | First-mention terminology is readable and not covering arrows. |
| `kf_03_head_formula` | `head_i` formula | Full formula is complete, sharp, centered, and annotated. |
| `kf_04_parallel_heads` | Multiple heads run in parallel | Head lanes are aligned; relation paths do not cross text. |
| `kf_05_concat_wo` | `Concat -> W O` | Arrows attach to outer boundaries and `W O` is a clear output projection step. |
| `kf_06_dimension_split` | `d_k=d_v=d_model/h` | Dimension split is visible and not confused with extra compute stacking. |
| `kf_07_figure2` | Original Figure 2 spotlight | Source label appears; original image and redraw are both aligned with narration. |
| `kf_08_engineering` | MHA / MQA / GQA / MoE cards | MQA/GQA are K/V efficiency variants; MoE is separated from MHA. |

Do not proceed to full render until these keyframes pass: no乱码, no断裂, no超框, no穿模, no漂移, no subtitle overlap, no inconsistent arrowheads, and no generic explanatory-card fallback.

## Render QA

- Block render approval if any required formula appears only as paragraph text.
- Block render approval if Figure 2 is used as style reference but not shown or reimplemented as a source-backed visual asset.
- Block render approval if `W Q`, `W K`, `W V`, `W O`, `MHA`, `MQA`, `GQA`, or `MoE` lack first-mention explanations.
- Block render approval if `MoE` appears as a direct replacement or upgrade of `MHA`.
- Block render approval if arrows穿模, drift away from targets, use inconsistent arrowhead sizes, or obscure formula terms.
- Review keyframes at hook, projection, `head_i` formula, `Concat -> W O`, dimension split, Figure 2 spotlight, and modern engineering comparison.
