# EP05 RoPE 口播稿 V2 待审核

## 版本目标

- 核心主张：位置编码从“加到输入”，走向“转进 Q/K 的关系”。
- 面向观众：普通 AI 用户、产品经理、内容创作者、对大模型感兴趣但不想啃公式的人。
- 技术边界：只把公开可验证模型写成 RoPE 例子；ChatGPT 只作为长上下文产品需求例子，专有 GPT / Claude 家族未公开的位置编码细节，不做断言。

## 一句话 Big Idea

原始 Positional Encoding 把位置加到 token 表示里；RoPE 把位置转进 Q 和 K 的匹配里，让 Attention 更直接看到相对距离。

## 口播稿

| 时间 | 口播 |
| --- | --- |
| 00:00-00:07 | 上一集我们讲到，Attention 自己不懂顺序。它能比较 token 之间的关系，但不会天然知道谁在前、谁在后。 |
| 00:07-00:16 | 所以原始 Transformer 做了一件很聪明的事：给每个 token 加上 Positional Encoding，也就是位置编码。 |
| 00:16-00:25 | 在 Harvard Annotated Transformer 的实现里，这一步可以概括成一句话：`x = x + pe`。注意，它不是新增一个位置 token，也不是把位置拼到句子最后。 |
| 00:25-00:33 | 它的意思是：token embedding 和位置编码在同一个 `d_model` 维度里逐元素相加，形状不变，但输入多了位置信息。 |
| 00:33-00:42 | 你可以把它想成连续座标：第 37 号位置、第 42 号位置。它不是离散编号 token，而是同维度的位置向量。 |
| 00:42-00:51 | 但 Attention 真正做判断时，不只是问“你在几号座位”，而是在问：“你和我有多相关？你离我有多远？” |
| 00:51-01:00 | 这就是 RoPE 出场的地方。RoPE，全称 Rotary Position Embedding，旋转位置编码。 |
| 01:00-01:12 | 它不是再给 token 加一段位置向量。准确一点说，在每个二维子空间里，位置 `m` 的 Q 按“m 乘 theta 下标 i”这个角度旋转；位置 `n` 的 K 按“n 乘 theta 下标 i”这个角度旋转。 |
| 01:12-01:21 | 这里的 `θ_i`，读作 theta 下标 i，表示第 i 个二维块的旋转频率。然后 Q 和 K 做点积时，位置相关的相位差会依赖 `n - m`。 |
| 01:21-01:30 | 这句话很关键：原始位置编码更像“给 token 一组座位坐标”；RoPE 更像“在 Q/K 比较前，把相隔多远写进关系里”。 |
| 01:30-01:39 | 所以 RoPE 在现代大模型里很重要，不是因为“旋转”听起来高级，而是因为长上下文场景特别依赖稳定的位置与距离建模。 |
| 01:39-01:50 | 公开资料里，OpenAI 已公开的 gpt-oss 写明使用 RoPE；DeepSeek-V4 Preview 的公开实现文档写到 Partial RoPE；ChatGPT 则说明长上下文产品越来越需要稳定的位置工程。 |
| 01:50-01:59 | 所以这一集你只需要记住一句话：现代大模型没有抛弃 Transformer，而是把位置编码从输入层的小组件，推进成了 Attention 和长上下文工程里的核心问题。 |
| 01:59-02:08 | 原始 PE 回答：“模型怎么知道第几个位置？”RoPE 进一步回答：“模型在比较 Q 和 K 时，怎么直接看到相隔多远？” |
| 02:08-02:20 | 用费曼方式说：原始 PE 像把每个人的座位坐标写在名牌上；RoPE 像两个人对话时，顺手把“相隔几排”算进这次关系里。 |
| 02:20-02:28 | 下一集我们继续看：既然位置已经进入了 Attention，它为什么又会影响 KV cache、长上下文，甚至推理速度？ |

## 技术审核记录

- 保留 `x = x + pe`，但解释为逐元素相加，避免误解成拼接或新增 token。
- 保留 RoFormer 的核心性质：Q/K 在二维维度块里按位置旋转，点积中的位置相关相位差依赖相对位置差。
- 现代模型段只用公开可验证例子；ChatGPT 只作产品层长上下文例子，专有模型段明确“不公开不猜”。
- TTS 生成前必须把 `mθ_i` 读作“m 乘 theta 下标 i”，把 `nθ_i` 读作“n 乘 theta 下标 i”；不要直接把符号交给 TTS 自动读。
- 没说“RoPE 一定提高所有任务准确度”，改成“在公开模型与长上下文工程中重要且常见”。
- 避免把 ALiBi、YaRN、LongRoPE 塞进主口播，减少术语堆叠；可放进长图或加餐。

## TTS spoken_text 合同

| source_text / 画面显示 | spoken_text / 音频读法 | 读法目的 |
| --- | --- | --- |
| `mθ_i` | m 乘 theta 下标 i | 表达“位置 m 乘以第 i 个二维块的旋转频率”，避免 TTS 误读希腊字母或漏掉下标。 |
| `nθ_i` | n 乘 theta 下标 i | 表达“位置 n 乘以第 i 个二维块的旋转频率”。 |
| `θ_i` | theta 下标 i，也就是第 i 个二维块的旋转频率 | 第一次出现时必须解释含义。 |
| `n - m` | n 减 m，也就是相对位移 | 读成位置差，不读成孤立算式。 |

TTS 生成时，`01:00-01:21` 段不要直接投喂 Markdown 里的符号版本；使用上表的 spoken_text 读法。

## 主要来源

- Harvard Annotated Transformer: https://nlp.seas.harvard.edu/annotated-transformer/
- RoFormer: https://arxiv.org/abs/2104.09864
- OpenAI gpt-oss: https://openai.com/index/introducing-gpt-oss/
- DeepSeek-V4 Preview Release: https://api-docs.deepseek.com/news/news260424
- DeepSeek-V4 Transformers doc: https://huggingface.co/docs/transformers/en/model_doc/deepseek_v4
- ChatGPT context windows: https://help.openai.com/en/articles/11909943
