# 从 Attention 到 ChatGPT、Agent 与 MCP：Transformer 到底改写了什么

> 工程师版 Annotated Transformer 精读 01  
> 主题：为什么《Attention Is All You Need》仍然是今天 AI 系统的入口论文

## 1. 先别背 QKV，先问一个更大的问题

《Attention Is All You Need》最值得讲的地方，不是 Q、K、V 三个符号，而是它问了一个更底层的问题：

> 机器读一句话，真的必须一个词一个词按顺序读吗？

在 Transformer 之前，很多序列模型的直觉更像“排队传话”。信息从第一个 token 传到第二个，再传到第三个。这个方式并不是错的，但它天然带来两个问题：

1. 长距离依赖的路径更长。
2. 训练并行化更难。

Transformer 的回答是：不一定要排队。让每个 token 都有机会直接看见其他 token。

这就是 Self-Attention 的教育切入点：它不是先让模型更大，而是先改变了模型组织信息的方式。

## 2. Self-Attention：从排队传话到圆桌会议

用费曼学习法解释，RNN 像排队传话，Self-Attention 像圆桌会议。

在圆桌会议里，每个人不需要等前一个人转述。他可以直接听所有人说话，然后判断谁的信息对自己最重要。

放到句子里，一个 token 会和其他 token 计算关系权重，再根据这些权重聚合信息。

这就是关系建模：

```text
token_i 不只是接收 token_{i-1} 的信息，
而是直接估计 token_i 与所有 token_j 的关系。
```

## 3. Q、K、V：问题、标签和信息

论文中的 Q、K、V 可以先不要当数学符号背，而是当三个角色理解：

- Query：我在找什么？
- Key：你有什么标签可以被匹配？
- Value：你真正能提供什么信息？

因此 attention 的工作顺序是：

1. Q 和 K 计算匹配程度。
2. softmax 把匹配程度变成权重。
3. 权重去加权汇总 V。

公式是：

```text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
```

这个公式可以读成一句人话：

> 先匹配，再选择，再读取信息。

## 4. 为什么要除以 sqrt(d_k)

当 query 和 key 的维度变大时，点积结果容易变大，softmax 会进入更极端的区域，梯度会变得不稳定。论文使用 `sqrt(d_k)` 进行缩放，让 attention score 的数值更稳定。

短视频里不需要展开这个细节，但工程师版文章应该保留它，因为这是从“直觉解释”走向“可实现模型”的关键一步。

## 5. Multi-Head Attention：不是重复看，而是多视角看

一个 attention head 只是在一个投影空间里看关系。Multi-Head Attention 的价值，是让模型在多个投影空间里同时看关系。

费曼类比：

> 同一句话，请多个专家同时读。一个看语法，一个看指代，一个看远距离依赖。最后把他们的判断合起来。

对应公式：

```text
head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O
```

这不是简单重复，而是让模型拥有多个关系视角。

## 6. Positional Encoding：Attention 需要位置坐标

Self-Attention 让每个 token 都能直接看见其他 token，但这也带来一个问题：

> 如果大家都在同一张圆桌上，模型怎么知道谁在前、谁在后？

论文的做法是加入位置编码。用正弦和余弦函数为不同位置生成可区分的向量，再加到 token 表示上。

短视频里的费曼表达是：

> 给每个词贴一个位置坐标。

工程师版表达是：

```text
PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
```

## 7. Transformer 真正改变了什么

Transformer 真正改变的不是“多一个公式”，而是模型理解语言的方式：

- 从顺序传递，到全局关系。
- 从难并行，到更适合大规模训练。
- 从单一序列模型，到后来的模型家族底座。

这就是为什么 BERT、GPT、Claude 这类模型都绕不开 Transformer 思路。

需要注意：这些产品不是论文里的原始 Transformer，具体实现、训练数据、对齐方式、推理系统都有巨大变化。但它们继承了一个核心观念：

> 用 attention 组织信息，用并行计算扩大规模。

## 8. Sora、Agent、MCP 怎么放到这条线里

这部分要分层讲，不能混成一句“它们都是 Transformer”。

更准确的分层是：

```text
Transformer: 模型结构层
GPT / Claude / Gemini / Sora-style models: 模型或产品层
Agent frameworks: 编排层
MCP: 工具与上下文连接协议层
```

OpenAI 对 Sora 的技术介绍中，将其描述为 diffusion transformer。这说明 Transformer 思路已经延伸到视频生成等多模态领域。

Agent 和 MCP 则不是 Transformer 本体。它们解决的是模型如何接工具、接上下文、接工作流的问题。

这对工程师很重要：不要把所有 AI 系统能力都归因到模型架构。现代 AI 系统至少包括模型层、推理层、工具层、编排层和产品层。

## 9. Attention 很强，也很贵

Self-Attention 的直觉是“所有 token 彼此看见”。这带来强大的关系建模能力，也带来成本问题。

费曼类比：

> 所有人互相对话，信息更全，但会议成本也更高。

工程表达：

> 序列越长，token 之间需要比较的关系越多，attention 的时间和显存压力都会上升。

因此，今天你会看到一整条工程优化线：

- FlashAttention：优化 attention 计算和显存访问。
- KV Cache：在自回归推理中缓存历史 key/value。
- vLLM：面向高吞吐 serving 的推理系统。

这说明 Transformer 不只是论文概念，也是现代 AI 工程优化的起点。

## 10. 本集的最终记忆点

如果只记住一句话：

> Transformer 不是让 AI 一个字一个字读得更快。它是让 AI 学会，同时看见信息之间的关系。

这句话解释了为什么《Attention Is All You Need》不只是一篇 NLP 论文，而是今天大模型时代的入口。

下一集可以继续拆：

```text
QK 相乘到底在算什么？
softmax 为什么变成注意力？
V 为什么是被读取的信息？
```

这会自然进入 Attention 公式的逐步推导。
