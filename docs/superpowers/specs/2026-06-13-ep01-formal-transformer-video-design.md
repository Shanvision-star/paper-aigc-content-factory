# EP01 Formal Transformer Video Design

## Gap Classification

This task is a content production design gap and a visual asset contract gap.
The existing EP01 pipeline has already proven the local runtime path for F5-TTS,
captions, Dagu, and HyperFrames smoke rendering. It has not yet defined the
formal publishable content package for the first Attention Is All You Need
episode.

This spec upgrades EP01 from a contract-smoke episode into a formal Chinese
short-video and engineer-facing blog package. Implementation must remain
separate from default deterministic tests.

## Goal

Produce the first formal Chinese vertical video package for:

```text
Attention Is All You Need 为什么改变了今天的 AI
```

The episode should explain the paper with Feynman-style analogies while making
clear why today's ChatGPT, Claude, Agent workflows, Sora-style video models,
and MCP/tool layers still depend on the Transformer lineage.

The first formal target is a Chinese 9:16 short-video master for Douyin and
Xiaohongshu review, plus a reusable engineer-facing article and visual asset
folder. English and multi-platform derivatives remain second-pass outputs.

## Feynman Learning Rule

The formal EP01 video must be understandable to ordinary viewers before it is
impressive to engineers. Every abstract concept must pass a three-part Feynman
test:

1. Plain-language analogy: explain the idea as a familiar action.
2. Animated mental model: show the analogy moving on screen.
3. Paper or formula anchor: briefly reveal the original technical object after
   the viewer already understands the intuition.

This means the viewer should first see "排队传话", "圆桌会议", "贴标签",
"多个专家", and "位置坐标", then see RNN chains, self-attention graphs, Q/K/V,
multi-head attention, and positional encoding formulas.

Do not show a formula before giving the viewer an everyday handle for it.
Do not leave an analogy as pure metaphor; each analogy must snap back to the
paper concept within the same scene.

## Source Boundary

Allowed source anchors:

- Primary paper: `Attention Is All You Need`, arXiv `1706.03762`.
- Local research input:
  `D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md`.
- Official Sora technical overview may be used only for the narrow statement
  that Sora is described by OpenAI as a diffusion transformer.
- MCP official specification may be used only to define MCP as a protocol for
  connecting LLM applications with external data sources and tools.

Do not claim that Agent systems or MCP are Transformer variants. The correct
layering is:

- Transformer: model architecture layer.
- ChatGPT, Claude, Gemini, BERT/GPT-style systems: model/product families built
  on Transformer-style architectures or their descendants.
- Agent frameworks: orchestration layer above the model.
- MCP: context and tool connection protocol layer.
- FlashAttention, KV Cache, vLLM: inference and attention engineering layer.

## Output Contract

The formal content package should create or update:

```text
episodes/ep01_attention_is_all_you_need/
├── papers.json
├── research_report.md
├── blog.md
├── visuals/
│   ├── paper_original/
│   ├── formulas/
│   ├── diagrams/
│   └── manim_or_frames/
└── video_script/
    ├── douyin_voiceover.md
    ├── shot_by_shot_storyboard.md
    ├── storyboard.json
    ├── cover_copy.md
    └── hyperframes_plan.json
```

The existing canonical runtime files remain valid:

```text
script/voiceover.md
script/voice_segments.json
storyboard/storyboard.json
audio/voiceover.wav
captions/subtitles.srt
renders/
qa/qa_report.json
```

The new `video_script/` folder is the human-review writing surface. The existing
runtime files can be regenerated from it in implementation.

## Formal Voiceover V3

Target duration: 105 to 115 seconds after natural personal-voice synthesis.
The written timing below is a pacing guide, not a strict audio timestamp.

```text
《Attention Is All You Need》为什么改变了今天的 AI？

00:00-00:06
如果你每天都在用 ChatGPT、Claude，或者 AI Agent，
但不知道它为什么能理解上下文，
那你其实绕不开一篇 2017 年论文。

00:06-00:13
它叫《Attention Is All You Need》。
这篇论文问了一个问题：
机器读一句话，真的必须一个词一个词排队读吗？

00:13-00:24
在 Transformer 之前，很多模型像排队传话。
前面的词，把信息传给后面的词。
句子越长，信息越容易变弱，训练也很难并行。

00:24-00:34
Transformer 的反常识点在这里：
它不让词排队。
它让每个词，直接看见整句话里的其他词。
这就是 Self-Attention。

00:34-00:45
用费曼方式理解：
一句话里有个“它”。
模型要判断，“它”到底指谁。
Self-Attention 做的事，就是让“它”去问整句话：
谁和我关系最大？

00:45-00:57
这时候 Q、K、V 出现了。
先别背公式。
Q 是：我在找什么？
K 是：你有什么标签？
V 是：你真正能提供的信息。

00:57-01:09
所以论文里的 Attention 公式可以这样读：
先用 Q 和 K 算匹配程度，
再用 softmax 变成权重，
最后按权重读取 V。
一句话：先匹配，再选择，再读取。

01:09-01:20
但一个视角不够。
所以有 Multi-Head Attention。
你可以理解成：
同一句话，让多个专家同时看。
一个看语法，一个看指代，一个看远距离关系。

01:20-01:30
不过 Attention 还有个问题：
它天生不知道顺序。
所以论文加入位置编码，
用正弦和余弦，给每个词一个位置坐标。

01:30-01:43
这就是它真正改变 AI 的地方：
机器不再只是按顺序读语言，
而是开始全局建模关系。
从 BERT，到 GPT，再到 Claude，
核心都离不开这种 Transformer 思路。

01:43-01:55
到了今天，这条线还在延伸。
Sora 这类视频模型，也开始使用 Transformer 思路处理时空片段。
而 Agent 和 MCP，则是在模型之上，
把工具、上下文和工作流接进来。

01:55-02:06
但 Transformer 也留下了新问题：
Attention 很强，但成本很高。
序列越长，计算和显存压力越大。
所以才有 FlashAttention、KV Cache、vLLM 这些工程优化。

02:06-02:15
最后用一句话记住：
Transformer 不是让 AI 一个字一个字读得更快。
它是让 AI 学会，
同时看见信息之间的关系。

02:15-02:20
这，就是今天大模型时代的起点。
下一集，我们拆开 QK 相乘，看 Attention 到底在算什么。
```

## Hook Strategy

Selected hook pattern: pain point plus modern relevance.

The first six seconds must connect the paper to tools the viewer already knows:
ChatGPT, Claude, and AI Agent. The hook must not start with a generic greeting.
It should create the question: "Why can these systems understand context?"

Rejected hook patterns for the first formal version:

- Pure QKV hook: too narrow and sounds like another formula tutorial.
- Pure paper-history hook: credible but weak for short-video retention.
- Pure fear or hype hook: risks unsourced exaggeration.

## Visual Storyboard

| Time | Visual | Engine | Notes |
|---|---|---|---|
| 00:00-00:06 | ChatGPT / Claude / Agent labels converge into paper title | HyperFrames | Familiar products create relevance before the paper appears. |
| 00:06-00:13 | Original paper title page or arXiv card | Paper asset + HyperFrames | Add source attribution after the hook. |
| 00:13-00:24 | RNN chain as "排队传话" | SVG or Python diagram + HyperFrames | Show words passing a message one by one; fade early information. |
| 00:24-00:34 | Self-attention as "圆桌会议" | SVG or Python diagram + HyperFrames | Each token gets direct lines to all others; no queue. |
| 00:34-00:45 | Pronoun "它" asks the whole sentence | HyperFrames | Feynman analogy: one token asks every other token who matters most. |
| 00:45-00:57 | Q/K/V as "问题 / 标签 / 信息" cards | HyperFrames | Cards move from plain analogy to technical labels Q, K, V. |
| 00:57-01:09 | Attention formula revealed after analogy | Paper formula + SVG | Highlight `QK^T`, `softmax`, and `V` in the same order as the narration. |
| 01:09-01:20 | Multi-head as "多个专家同时看" | SVG or Manim frames + HyperFrames | Expert cards become attention heads, then merge. |
| 01:20-01:30 | Position encoding as "给每个词贴坐标" | Python chart or Manim frames | Coordinates appear first, then sin/cos wave overlay. |
| 01:30-01:43 | BERT / GPT / Claude lineage timeline | Mermaid/SVG + HyperFrames | Connect intuition to the modern model family. |
| 01:43-01:55 | Three-layer map: model / agent / MCP tools | Mermaid/SVG + HyperFrames | Explain "底座、编排、工具接口" as layers ordinary viewers can separate. |
| 01:55-02:06 | Attention cost as "所有人互相对话会变贵" | SVG/Python chart | Then reveal O(n^2), FlashAttention, KV Cache, vLLM. |
| 02:06-02:20 | Summary card and next-episode teaser | HyperFrames | Restate the Feynman summary: AI learns relationships, not just order. |

## Feynman Animation Mapping

| Paper concept | Everyday explanation | Required animation | Technical snap-back |
|---|---|---|---|
| RNN/LSTM bottleneck | 排队传话 | A message bubble travels token by token and becomes weaker. | RNN chain / sequential recurrence. |
| Self-Attention | 圆桌会议 | All tokens sit around a table and draw direct relation lines. | Self-attention graph. |
| Q | 我在找什么 | A token holds a question card. | Query projection. |
| K | 你有什么标签 | Other tokens reveal label cards. | Key projection. |
| V | 你能给我什么信息 | The selected token sends information back. | Value projection. |
| Softmax weights | 投票权重 | Relation lines become thicker or hotter. | `softmax(QK^T / sqrt(d_k))`. |
| Multi-Head | 多个专家同时分析 | Expert panels inspect syntax, reference, and long-range dependency. | Parallel attention heads. |
| Positional Encoding | 给每个词贴坐标 | Coordinates and wave patterns attach to tokens. | Sin/cos positional encoding. |
| Attention cost | 所有人都互相说话会变贵 | Dense line graph becomes crowded as tokens increase. | Quadratic attention cost. |

## Original Paper Images And Formula Policy

Use original paper images as citation anchors, not as the main explanatory
animation. The formal video should use:

- Original title page or arXiv card for authority.
- Original Transformer architecture figure as a brief reference.
- Original attention formula or paper formula crop as a source cue.
- Redrawn formula and diagrams for animation and readability.

Every original paper image must include a visible attribution:

```text
Source: Vaswani et al., Attention Is All You Need, NeurIPS 2017 / arXiv:1706.03762
```

## Engineer Blog Requirement

`blog.md` should be an engineer-facing "Annotated Transformer" style article,
not a transcript dump. It should include:

1. Why the paper mattered in 2017.
2. The old sequence-modeling bottleneck.
3. Self-attention as relation modeling.
4. Q/K/V as both Feynman analogy and math.
5. Multi-head attention.
6. Positional encoding.
7. Encoder-decoder architecture.
8. Why GPT and Claude-style systems inherit the Transformer idea.
9. Why attention cost created modern inference optimization work.
10. How Agent and MCP sit above the model layer.

The blog must keep technical claims traceable to `claims.json`, the primary
paper, or explicitly listed official sources.

## Skill And Workflow Mapping

Existing skills should be used before adding new skills:

- `script-storyboard-writer`: formal voiceover, hooks, storyboard, blog outline.
- `visual-orchestrator`: visual manifest and engine assignment.
- `voiceover-adapter`: personal voice audio generation/import.
- `caption-aligner`: subtitles.
- `hyperframes-composer`: final composition.
- `quality-gate`: publish readiness.

Potential later skill:

- `ai-system-mapper`: maps paper concepts to modern AI system layers.

Do not create `script-enhancer-skill` or `visual-injector-skill` as separate
skills in this iteration. Their responsibilities belong inside the existing
script and visual workflow boundaries.

## Quality Gates

The formal EP01 package can be marked review-ready only when:

- `video_script/douyin_voiceover.md` contains the approved V3 script.
- `video_script/shot_by_shot_storyboard.md` contains the timing and visual
  plan.
- `visuals/` contains generated or extracted assets with manifest metadata.
- Original paper images include attribution.
- Formula visuals include `Attention(Q,K,V)`, Multi-Head, and positional
  encoding at minimum.
- `audio/voiceover.wav` is regenerated or explicitly imported from the approved
  script.
- `captions/subtitles.srt` matches the approved script.
- HyperFrames renders a formal `renders/douyin_zh_1080x1920_draft.mp4`.
- `qa_report.json` no longer blocks on the formal Douyin draft.
- `auto_publish` remains false.

## Non-Goals

- Do not generate English platform variants in the first formal implementation.
- Do not auto-publish.
- Do not use unlicensed third-party screenshots from the referenced YouTube
  Short.
- Do not state that MCP or Agent frameworks are Transformer variants.
- Do not attribute hallucination solely to Transformer architecture.
- Do not replace the blog with a transcript-only article.

## Open Implementation Decisions

The implementation plan must decide:

- Whether paper PDF extraction uses local PDF tooling, arXiv download, or both.
- Whether formula crops are extracted from the paper or redrawn entirely.
- Whether Manim is introduced now or Python/SVG plus HyperFrames is sufficient.
- Whether the formal draft reuses the existing F5-TTS generated audio path or
  regenerates a new voiceover from the approved V3 script.

The recommended first implementation path is:

1. Generate the writing artifacts and visual manifest.
2. Extract or create paper/formula assets.
3. Generate a new personal-voice audio pass from the approved V3 text.
4. Create formal HyperFrames composition.
5. Render `douyin_zh_1080x1920_draft.mp4`.
6. Refresh captions, publish pack, pipeline map, and quality report.
