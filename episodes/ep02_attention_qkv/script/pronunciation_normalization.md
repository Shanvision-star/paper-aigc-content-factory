# EP02 Pronunciation Normalization

## Purpose

This file locks EP02 的 TTS 发音规范。`source_text` 是人工审核过的口播文稿，保留给字幕、博客和技术审查；`spoken_text` 是给 IndexTTS2、IndexTTS 1.5、CosyVoice、F5-TTS、GPT-SoVITS 或其他 TTS 引擎的发音友好文本。`spoken_text` 只能解决读音、停顿、英文整体词、数字和公式符号，不能新增未审核观点或隐藏提示句。

## Opening Anchor

EP02 必须承接第一集结尾，不重复第一集背景：

```text
Attention 像一张不断变化的关系图。
这一集，我们把这张图拆开。
先看最关键的一步：
Q 乘 K 转置。
```

## Chinese Pronunciation Table

| Source phrase | Spoken text | Reason |
| --- | --- | --- |
| 更准确地说 | 准确一点说 | `地` 在这里应读轻声 `de`，TTS 易误读成 `di`。 |
| “它” | 它 | 避免中文引号让 TTS 在代词前后产生不必要停顿。 |
| Attention 会在每一层里，动态地生成一张软关系矩阵 | Attention 会在每一层里，以动态方式生成一张软关系矩阵 | 避免 `动态地` 中的 `地` 被读成 `di`。 |
| 一个 token 地往后生成 | 逐个 token 往后生成 | 避免结构助词 `地` 误读，也让口播更自然。 |
| 神奇地理解一句话 | 不是模型突然就理解了这句话 | 避免 `地` 误读，同时降低拟人化。 |
| 按行归一化 | 对每个当前 token 的那一组分数，分别做归一化 | 让 `row-wise softmax` 的意思更清楚，避免 `行` 的读法和矩阵方向歧义。 |
| 一整行注意力权重 | 一组注意力权重 | 口播更自然，减少矩阵术语负担。 |
| 这一行权重加起来等于一 | 这一组权重加起来等于一 | 避免 `行` 的读法歧义。 |
| 重新算 / 重复计算 | 从头再算 / 一遍又一遍计算 | `重` 在这里应读 `chong`，必要时用无歧义表达。 |
| 当前这个 token，应该重点看上下文里的谁 | 当前这个 token，应该重点读取上下文里的哪些信息 | 避免把 Attention 说成主观决策。 |
| 当 ChatGPT 或 Claude 生成回答时 | 当 ChatGPT，或者 Claude，生成回答时 | 为混合中英文 TTS 增加轻停顿，保持 `ChatGPT` 和 `Claude` 英文整体词，不拆成字母或中文音译。 |
| 逐个 token 往后生成 | 逐个 token，往后生成 | 为 `token` 后增加轻停顿，避免连续中英混排导致英文词漂移。 |
| 每生成一个新 token | 每生成一个新的 token | 让 `token` 前后的中文节奏更自然，减少 F5-TTS 吞词或改读。 |

## Formula And English Term Table

| Canonical text | Spoken text | Notes |
| --- | --- | --- |
| `QK^T` | Q 乘 K 转置 | `转置` 读 `zhuan3 zhi4`，不要读成“转职”。 |
| `sqrt(d_k)` | 根号下 d k | 表达论文里的 `\sqrt{d_k}`，也就是根号下是 `d_k`。 |
| `d_k` | d k | 不读成中文词。 |
| `Q = XW_Q` | Q 等于 X 乘 W Q | 公式动画可显示下标，口播保持简洁。 |
| `K = XW_K` | K 等于 X 乘 W K | 同上。 |
| `V = XW_V` | V 等于 X 乘 W V | 同上。 |
| `softmax` | softmax | 保持英文整体词，不拆成字母。 |
| `ChatGPT` | ChatGPT | 保持英文整体词，不拆成 `Chat G P T`，也不改成中文音译。 |
| `Claude` | Claude | 保持英文整体词，不改成中文音译。 |
| `token` | token | 保持英文整体词。 |
| `Attention` | Attention | 保持英文整体词。 |
| `FlashAttention` | FlashAttention | 保持英文整体词，不拆成 Flash 和 Attention 的中文解释。 |
| `GQA` | G Q A | 缩写按字母读。 |
| `MQA` | M Q A | 缩写按字母读。 |
| `KV Cache` | K V Cache | `K`、`V` 按字母读，`Cache` 保持英文词。 |
| `vLLM` | v L L M | 按项目名读清楚。 |
| `Multi-Head Attention` | Multi-Head Attention | 保持英文整体短语，避免逐字母拆分。 |

## TTS Guard

- Before TTS, run duplicate and near-duplicate checks against both `source_text` and `spoken_text`.
- The reference audio must be neutral 8-10s and unrelated to Attention, QKV, Transformer, or `为什么重要`.
- Representative sample review should still cover `seg_001`, the modern LLM term segment `seg_010`, and CTA or ending segment `seg_014` unless the user explicitly overrides the gate for this run.
- ASR transcript diff, when available, must compare generated audio against `spoken_text` and check for missing English terms, leaked reference phrases, repeated phrases, long silence, and formula misreads.
- Sound cue labels must never enter `spoken_text`; they belong in storyboard, FRAME, sound cue plan, or HyperFrames prompt.

## Caption Display Guard

- 字幕和画面可视文字优先显示语义准确的技术写法，例如 `QK^T`、`√(d_k)`、`d_k`、`softmax`、`KV Cache` 和 `Multi-Head Attention`。
- 字幕中的英文产品名和技术词保持整体词，不拆成字母：`ChatGPT`、`Claude`、`token`、`Attention`、`FlashAttention`。
- 多词英文术语在字幕层使用不可断开空格或不可断开连字符保护，例如 `KV Cache`、`Q Cache`、`Scaled Dot-Product Attention`、`Multi-Head Attention`。
- `spoken_text` 可以把公式写成发音友好形式，字幕和画面公式必须回到数学显示形式，避免观众看到“根号 d k”这类非公式文字；涉及 `sqrt(d_k)` 时必须表达为“根号下 d k”。
