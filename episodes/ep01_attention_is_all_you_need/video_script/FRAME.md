# Attention Is All You Need Episode FRAME

## Paper Identity

- Title: Attention Is All You Need.
- Year: 2017.
- Authors / organization: Google research team.
- episode thesis: Transformer changed modern AI by replacing sequential recurrence with attention-based relation modeling, making today's modern LLM and agent systems possible at scale.

## Required Original Paper Assets

- original paper figures: Transformer architecture Figure 1 must appear as a paper figure spotlight.
- formula: Attention formula must appear as a formula explanation frame.
- formula content: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`.
- concepts that need visual support: QK matching, softmax attention weights, weighted V reading, Multi-Head Attention, Positional Encoding, O(n²) cost, modern LLM connection.

## Formula Asset Contract

- canonical formula: `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V`.
- preferred visible form: a clean SVG or high-resolution formula-editor screenshot matching the paper notation.
- allowed sources: original paper formula crop, KaTeX/MathJax/SVG render, Manim still, Manim scene, or formula-editor screenshot.
- raster minimum: render at least `2x` the in-frame display size before HyperFrames imports it.
- full formula must appear before or during the staged explanation; do not show only `QK^T`, only `softmax`, or only `V` without the full formula in the same beat.
- required annotation targets: `QK^T`, `sqrt(d_k)`, `softmax`, attention weights, and weighted `V`.
- captions and callouts must not cover the formula bounding box.
- keyframe review must include one frame where the entire formula is sharp and readable on a phone.

## Beat Table

| Beat | Spoken Cue | Frame Treatment | Visual Engine | Required Assets | Platform Notes |
| --- | --- | --- | --- | --- | --- |
| hook | ChatGPT, Claude, AI Agent all depend on this paper lineage | Hook Title | hyperframes | title card + Transformer silhouette | keep title inside vertical safe area |
| old-world | RNN/LSTM felt like queue-based message passing | Feynman Analogy | svg | queue vs direct relation diagram | captions bottom, diagram center |
| self-attention | every token computes relations with other tokens | Formula Explanation | manim | token graph + attention matrix | avoid subtitle overlap with matrix |
| qkv | learned Q/K/V projections; show QK compatibility and weighted V aggregation | Formula Explanation | hyperframes + svg | Q/K/V cards | English terms stay whole words |
| formula | QK, softmax, then weighted V | Formula Explanation | manim + hyperframes | Attention formula SVG/screenshot or scene with annotation targets | full formula must be readable and annotated |
| multi-head | multiple learned subspaces analyze relations | Formula Explanation | hyperframes | multi-head branch diagram | do not imply manual head assignment |
| positional | positional encoding adds order information | Formula Explanation | manim | sin/cos wave + token row | keep waves visible behind labels |
| paper-figure | original Transformer architecture appears | Paper Figure Spotlight | paper_image | original Figure 1 | source attribution required |
| modern-llm | BERT, GPT, Claude, Qwen, DeepSeek inherit Transformer lineage | Modern LLM Connection | hyperframes | model family timeline | separate model, agent, and MCP layers |
| engineering-risk | Attention cost grows with sequence length | Engineering Risk | python_chart + hyperframes | O(n²), KV Cache, FlashAttention, vLLM labels | risk color can use danger token |
| recap | AI learned to model relations, not just read faster | Recap And Next-Episode CTA | hyperframes | final relation graph | include next episode QK multiplication cue |

## Caption Rules

- Captions derive from `spoken_text`.
- Do not add hidden narration cues.
- English terms remain whole words: ChatGPT, Claude, Agent, Self-Attention, Multi-Head Attention, FlashAttention, KV Cache, vLLM, MCP, Sora.
- Chinese `地` in adverbial phrases should be pronounced `de` during TTS normalization.
- Captions must not overlap formulas, paper figure labels, or source attribution.

## Render QA

- no black frame at beat boundaries.
- no subtitle overlap.
- original paper figures stay identifiable.
- Transformer architecture Figure 1 appears long enough to inspect.
- Attention formula appears large enough to read on a phone.
- Attention formula appears as a complete formula object, not a cropped or broken LaTeX fragment.
- Formula keyframe shows `QK^T`, `sqrt(d_k)`, `softmax`, and weighted `V` annotation targets.
- QK and softmax explanation must appear before the full formula or alongside a staged reveal.
- key frames must include hook, formula, paper figure, modern LLM connection, and engineering risk.
- platform variants must preserve the paper figure spotlight and formula explanation.
