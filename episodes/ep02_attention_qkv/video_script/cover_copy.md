# EP02 Cover And Publishing Copy

## Cover

- File: `cover_ep02_qkv_final_1080x1920_safe90.png`
- Format: `PNG`
- Canvas: `1080x1920`
- Platform constraint: Douyin-safe `safe90`, key content kept inside `54px` left/right and `96px` top/bottom safe padding.
- Source-backed visual content:
  - original paper architecture image from `Attention Is All You Need`
  - original paper Figure 2 `Scaled Dot-Product Attention`
  - formula anchor from Harvard Annotated Transformer / Scaled Dot-Product Attention

## Douyin / Xiaohongshu Description

EP02｜QKV 到底在算什么？

上一集我们讲了 Transformer 为什么改变 AI。
这一集直接拆开 Attention 最关键的一步：Q 乘 K 转置。

很多人背过 Q、K、V，
但真正难的是理解：
模型到底怎么判断当前 token 应该看上下文里的谁？

这集用原论文 Figure 2 和公式一起讲清楚：
Q 是问题，
Key 是索引，
Value 是内容。

先匹配，
再除以根号下 d k，
经过 softmax 分权，
最后读取 Value。

这也是为什么今天的 ChatGPT、Claude、KV Cache、FlashAttention，
仍然绕不开这条 Attention 链路。

下一集继续拆：为什么 Transformer 要一次开很多个 head？

#AI论文精读 #AttentionIsAllYouNeed #Transformer #QKV #大模型 #ChatGPT #Claude #KVCache #FlashAttention #人工智能学习

## Bilibili Description

《Attention Is All You Need》精读 EP02：QKV 到底在算什么？

本集承接 EP01，从 Scaled Dot-Product Attention 的核心公式出发，解释 Q、K、V 为什么不是三份不同数据，而是同一输入在不同投影空间里的表示。重点拆解 QK^T、sqrt(d_k)、softmax、Value 加权汇聚，以及它们和现代大模型推理优化中 KV Cache、GQA/MQA、FlashAttention 的关系。

适合想系统理解 Transformer、Attention、LLM 推理机制的同学。

## English Short Description

EP02: What does QKV actually compute?

This episode breaks down Scaled Dot-Product Attention from the original Transformer paper: QK^T scoring, sqrt(d_k) scaling, row-wise softmax, and weighted Value aggregation. We also connect QKV to modern LLM inference systems such as KV Cache, GQA/MQA, and FlashAttention.
