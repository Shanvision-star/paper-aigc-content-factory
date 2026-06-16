# 第3集 HyperFrames Prompt: 为什么一个 Head 不够？

Use this prompt only after `script/voiceover.md`, `captions/caption_script.md`, and this episode `FRAME.md` are approved. This prompt is for keyframe-first HyperFrames composition. Do not run a full render before keyframes pass review.

## Role

You are composing a source-backed AI paper explainer video for 第3集 of the Attention Is All You Need series.

The goal is not to make decorative motion. The goal is to prove one idea clearly:

> Multi-Head Attention is not many fixed experts. It sends the same input into multiple learned representation spaces, computes attention in parallel, then mixes the results back through Concat and W O.

## Source Alignment

Align the video with:

- Harvard Annotated Transformer: https://nlp.seas.harvard.edu/annotated-transformer/
- The original paper's Multi-Head Attention structure, especially Figure 2.
- The code chain shown by the Harvard explanation: linear projections -> split heads -> attention -> concat -> final linear.

Required source-backed visual objects:

1. Original Figure 2 spotlight or source-backed crop.
2. Rendered formula: `head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)`.
3. Rendered formula: `MultiHead(Q,K,V)=Concat(head_1,...,head_h)W^O`.
4. Rendered dimension rule: `d_k=d_v=d_model/h`.

If these assets are not captured, stop after a missing-input report or generate only layout placeholders marked as missing. Do not fake source-backed assets.

## Audio And Sound Direction

- Voice direction: use the EP02-approved personal timbre baseline. Do not switch to native AI or built-in voice unless the user explicitly approves the fallback.
- TTS gate: generate representative samples first (`seg_001`, `seg_006`, `seg_010`, `seg_011`), then ASR diff if available, then human approval, then full TTS.
- English clarity gate: `Transformer`, `Attention`, `softmax`, `Concat`, `W O`, `Multi-Head Attention`, and `FlashAttention` must stay clear and stable.
- Sound cues are comprehension bookmarks only. They may mark hook, projection split, formula reveal, parallel heads, `Concat -> W O`, dimension split, Figure 2 spotlight, engineering boundary, and CTA.
- Keep sound cues about 12-18 dB below the voice and never place high-frequency hits over English terms or formula words.

## Visual Style

- Use the final 第2集 Chinese Soft Lab style.
- No dark background.
- Background: warm paper research-workbench style, not plain PPT. Use light grid paper, subtle source/formula watermarks, editorial side rail, annotation tabs, and source-backed proof objects.
- Main visual objects: centered infographic panels with source labels, formula strips, mini charts, and explanatory captions. Avoid empty white cards that only contain text.
- Q blue, K orange, V green, Concat purple, W O red.
- Use source notes for paper figures and formula/code anchors.
- Avoid decorative particles, noisy glow, or cyberpunk/matrix style.

## EP02 Experience Reuse Hard Gate

This episode must follow the successful EP02 Chinese production path, not a loose image-generation preview.

- Do not ask image generation to guess formulas, arrows, or paper diagrams.
- Do not treat reference images as style prompts only. Convert them into explicit assets and components.
- Required chain: `source_capture -> crop_formula_or_figure -> visual_asset_manifest -> formula_svg/html_component -> keyframe_review -> HyperFrames composition`.
- Formula scenes must use deterministic SVG/HTML math components or source-backed crops. Raw paragraph text such as `d_k=d_v=d_model/h` is not acceptable as the only formula display.
- Text wrapping must be designed with fixed line breaks or measured fitting for English technical terms. Do not rely on browser auto-wrap for long mixed Chinese/English conclusion sentences.
- Build the end-state static layout first. Only after the still frame is readable may GSAP entrance animation be added.
- Keyframe approval blocks full render if any scene looks like a generic PPT card, lacks the original formula/source object, or misses the formula derivation/proof path.
- Final keyframes are audience-facing. Do not place design rationale, reviewer reminders, prompt instructions, or production QA wording inside the visible frame.
- Forbidden visible wording examples include `字幕写全称`, `画面保留专业符号`, `Proof path`, `redraw`, `公式完整`, `不使用深色背景`, and `source-backed visual contract`.
- Put design rationale in this prompt, `FRAME.md`, `assets_manifest.json`, or QA notes only. On-screen text must explain the paper concept to viewers.

## Scene Plan

### S01 Hook: 一个 Head 不够

- Show one token row and one attention map.
- The map looks compressed or averaged.
- Caption: `第3集｜为什么一个注意力头不够？`
- Do not re-explain 第2集 QKV.

### S02 Projection Spaces

- Same input `X` splits into several head lanes.
- Each lane contains `W Q`, `W K`, `W V` cards.
- First-mention glossary appears in side callouts:
  - `W Q：Query Projection Matrix，Q 投影矩阵`
  - `W K：Key Projection Matrix，K 投影矩阵`
  - `W V：Value Projection Matrix，V 投影矩阵`

### S03 `head_i` Formula

- Formula must be one complete rendered object:
  `head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)`
- Highlight `QW_i^Q`, `KW_i^K`, `VW_i^V` step by step.
- Keep formula centered and readable on phone.
- No subtitle overlaps formula bounding box.

### S04 Parallel Heads

- Show `head_1 ... head_h` as parallel lanes.
- Each lane computes its own attention pattern.
- Do not imply manual expert assignment.
- Use aligned lanes, consistent arrows, and no crossing through text.

### S05 Concat -> W O

- Head outputs flow into `Concat`.
- `Concat` flows into `W O`.
- `W O` must be visibly an output projection matrix, not a decoration.
- Arrows attach to outer boundaries of cards, never inside the cards.

### S06 Dimension Split

- Show `d_k=d_v=d_model/h`.
- Visualize `d_model` as one model-width bar split into `h` equal slices.
- Explain: multiple heads do not mean naive compute stacking.

### S07 Figure 2 Spotlight

- Show the original Figure 2 crop or source-backed image.
- Add source label: `Source: Attention Is All You Need / Harvard Annotated Transformer`.
- Then transition to the phone-readable Soft Lab redraw.
- Do not use Figure 2 only as decoration.

### S08 Modern Engineering Boundary

- Four cards: MHA, MQA, GQA, MoE.
- Captions:
  - `MHA：Multi-Head Attention，多头注意力`
  - `MQA：Multi-Query Attention，多查询注意力，共享 K/V`
  - `GQA：Grouped-Query Attention，分组查询注意力，共享 K/V`
  - `MoE：Mixture of Experts，混合专家机制`
- Show MoE as a separate sparse routing mechanism, not an MHA replacement.

### S09 Feynman Summary And CTA

- Show one lens for one head, multiple projection spaces for multiple heads.
- Then show `Concat -> W O`.
- Final caption:
  `Multi-Head Attention = 表示空间的分解与重组`
- CTA:
  `第4集：Position Encoding，位置编码`

## Formula And Connector Hard Gates

Block keyframe approval if:

- Any formula is garbled, truncated, raw LaTeX, cropped, or split without a complete formula object.
- Formula exceeds safe area or is covered by captions.
- `W_i^Q / W_i^K / W_i^V / W^O` is rendered incorrectly.
- A connector arrow enters the interior of a card, node, formula, matrix, source label, or caption.
- Arrowheads are inconsistent in size.
- Process arrows become arbitrary bent curves.
- Multi-head flow arcs drift away from target boundaries.
- Repeated process lanes do not share one horizontal centerline.
- Lane labels such as `head_1`, `head_2`, `head_h` float outside fixed label boxes or crowd arrow endpoints.
- Right-side labels such as `子空间 1` are clipped, edge-hugging, or not aligned with the same lane centerline.
- The composition falls back to generic explanatory cards while source-backed assets are required.

## Required Keyframe Outputs

Before rendering, export stills for:

- `kf_01_hook`
- `kf_02_projection`
- `kf_03_head_formula`
- `kf_04_parallel_heads`
- `kf_05_concat_wo`
- `kf_06_dimension_split`
- `kf_07_figure2`
- `kf_08_engineering`

Only after these pass human review may the composition proceed to full HyperFrames animation.
