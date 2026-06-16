# 第3集：为什么一个 Head 不够？

上一集我们拆开了 Q、K、V：Q 和 K 先匹配，`softmax` 再分权，最后从 V 里读取信息。  
这一集继续问一个更关键的问题：

> 如果一个 attention head 已经能建立关系，为什么 Transformer 还要一次开很多个 head？

## 先给结论

Multi-Head Attention（多头注意力）不是多个固定专家，也不是程序员手动安排“一号 head 看语法，二号 head 看指代”。

更准确地说，它把同一份输入投影到多个 learned projection subspaces（学习到的投影子空间）里，让每个子空间并行计算 attention pattern，最后再通过 `Concat` 和 `W^O` 输出投影重新融合。

## 一个 head 的限制

单个 head 只能生成一张注意力权重图。  
如果一句话里同时存在局部关系、长距离依赖、位置偏好和指代关系，这些信息都要压进同一个分布里。

多个 head 的意义，是让模型在不同投影空间里并行建模关系，然后把结果重新组合。

## 论文里的公式

原论文对第 `i` 个 head 的定义是：

```text
head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)
```

也就是说，同一组 `Q`、`K`、`V` 会经过第 `i` 个 head 自己的投影矩阵：

- `W Q`：Query Projection Matrix，Q 投影矩阵
- `W K`：Key Projection Matrix，K 投影矩阵
- `W V`：Value Projection Matrix，V 投影矩阵

多个 head 计算完以后，论文不是直接把它们丢给下一层，而是：

```text
MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O
```

这里的 `W^O` 是 Output Projection Matrix（输出投影矩阵）。它负责把多个子空间里的结果重新混回模型主干能继续处理的表示。

## 为什么头变多，计算没有无脑暴涨？

论文有一个重要设计：

```text
d_k = d_v = d_model / h
```

如果总表示维度是 `d_model`，就把它拆给 `h` 个 head。每个 head 只处理一部分维度。  
所以多头不是简单把计算乘以 `h`，而是在相近计算规模下换来更丰富的表示分解能力。

## 和 2026 大模型工程的关系

今天的大模型仍然没有抛弃 Multi-Head Attention，反而一直在改造它。

- `MHA`：Multi-Head Attention，多头注意力，是注意力结构本身。
- `MQA`：Multi-Query Attention，多查询注意力，让多个 query heads 共享同一组 Key/Value，降低推理成本。
- `GQA`：Grouped-Query Attention，分组查询注意力，在 MHA 和 MQA 之间折中，分组共享 Key/Value。
- `FlashAttention`：主要优化 attention 计算和显存访问，不改变多头注意力的数学定义。
- `MoE`：Mixture of Experts，混合专家机制，不是 MHA 的升级版，而是另一层稀疏路由设计。

这几者不要混成一条线。MHA 是注意力结构；MQA/GQA 改的是 Key/Value 侧推理成本；MoE 是模块级路由。

## 费曼式总结

一个 head 像一副镜片。  
多个 head 不是多个固定专家，而是把同一段文本投影到多个不同的表示子空间里。

每个子空间都计算一张自己的 attention pattern。  
最后先 `Concat` 拼接，再经过矩阵 `W^O` 融合成统一表示。

所以这一集真正要记住的不是“head 越多越高级”，而是：

> Multi-Head Attention 是对注意力表示空间的分解与重组。

下一集我们继续拆另一个问题：Attention 可以建立关系，但它本身并不知道顺序。那 Transformer 怎么知道谁在前、谁在后？这就是 Position Encoding（位置编码）。
