# Shot-By-Shot Storyboard V4 Full

## Visual Principle

Every abstract concept follows the Feynman learning path:

1. Everyday analogy.
2. Animated mental model.
3. Paper or formula anchor.

## Timeline

| Time | Voiceover Goal | Feynman Analogy | Visual Insert | Asset IDs | Animation Notes |
|---|---|---|---|---|---|
| 00:00-00:07 | Hook modern relevance | Familiar AI tools | Product-name chips converge into paper title | `diagram_system_layers` | Chips: ChatGPT, Claude, Agent. Avoid brand logos. |
| 00:07-00:17 | Establish paper authority and question | Original source card | arXiv / paper title card with attribution | `paper_original_readme`, `diagram_title_card` | Zoom from paper title to the question: "必须排队读吗？" |
| 00:17-00:33 | Explain old bottleneck | 排队传话 | RNN chain and fading message | `diagram_rnn_chain` | Message bubble moves token by token and fades as chain grows. |
| 00:33-00:45 | Introduce self-attention | 圆桌会议 | Tokens connect to all tokens | `diagram_self_attention` | Center token draws direct lines outward; queue line disappears. |
| 00:45-01:00 | Make relation modeling intuitive | “它” asking who matters | Pronoun card asks all word cards | `diagram_self_attention` | Heat rises on relevant token links while weak links fade. |
| 01:00-01:16 | Explain Q/K/V | 问题 / 标签 / 信息 | Three animated cards | `diagram_qkv_cards` | Plain-language labels flip into Q, K, V. |
| 01:16-01:32 | Explain formula | 先匹配，再选择，再读取 | Formula highlight sequence | `formula_attention` | Highlight QK^T, softmax, and V in narration order. |
| 01:32-01:47 | Explain multi-head | 多个专家同时看 | Expert panels become heads | `diagram_multihead` | Syntax, reference, and long-range panels merge into Multi-Head. |
| 01:47-02:00 | Explain position encoding | 给词贴坐标 | Wave and coordinate overlay | `formula_positional_encoding`, `diagram_position_encoding` | Coordinates attach first, then sin/cos wave appears. |
| 02:00-02:15 | Connect to model families | 技术家族树 | BERT / GPT / Claude lineage | `diagram_model_timeline` | Timeline scrolls from 2017 to today. |
| 02:15-02:30 | Separate modern AI layers | 底座 / 编排 / 工具接口 | Model, Agent, MCP layer map | `diagram_system_layers` | Build layer stack bottom-up to avoid saying Agent/MCP are Transformer variants. |
| 02:30-02:43 | Explain cost and optimization | 所有人互相对话会变贵 | Dense relation graph plus O(n^2) | `diagram_attention_cost` | Lines crowd as token count grows; FlashAttention/KV Cache/vLLM appear as responses. |
| 02:43-02:54 | Summarize Feynman insight | 看见关系 | Relation map resolves into one sentence | `diagram_self_attention` | Lines simplify into "同时看见关系". |
| 02:54-03:00 | Tease next episode | 拆 QK 相乘 | Q and K cards move toward dot product | `formula_attention` | End card: 下一集：QK 到底怎么算？ |

## Original Paper Image Rule

Original paper visuals should appear briefly as authority anchors, then the video should switch to redrawn explanatory assets. Every original paper image must show:

```text
Source: Vaswani et al., Attention Is All You Need, NeurIPS 2017 / arXiv:1706.03762
```

## Subtitle Rule

- Keep one short sentence per subtitle block.
- Avoid placing subtitles over formula terms.
- Use upper safe area for formula, lower safe area for captions.
