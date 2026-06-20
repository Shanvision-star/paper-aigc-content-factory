# EP06 最终口播审核稿

## 标题

RoPE 之后，为什么 KV Cache 和显存压力会变大？

## 副标题

从 Attention 公式，到长上下文推理工程

## 审核状态

- 版本：final_review_v1
- 总时长：约 318 秒
- 分段：21 段
- 状态：可进入人工审核；不可直接进入 TTS 或 render
- 前置合同：`claim_contract`、`visual_contract`、`notation_contract`、`render_contract` 已存在

## 核心主线

`Attention 公式 -> 自回归生成 -> KV Cache 出现 -> RoPE 改变 Q/K 位置用法 -> 长输入带来显存和带宽压力 -> Window / Sparse / MQA / GQA / PagedAttention / FlashAttention 分层优化`

## 专业边界

- 不说 RoPE 让 KV Cache 失效。
- 不说旧 Key 每次都必须重新旋转。
- 不说 RoPE 直接输出距离。
- 不说 RoPE 保证长上下文能力。
- 不说 KV Cache 缓存原始 token。
- 不把参数和 KV Cache 说成同一种存储。
- 不声称 GPT、Claude 等闭源模型的内部位置编码实现。

## 最终口播时间轴

| 时间 | 口播正文 |
| --- | --- |
| 00:00-00:08 | 上一集我们讲到，RoPE 把位置写进 Query 向量和 Key 向量的旋转关系里。问题来了：位置进了 Attention，为什么大模型就更吃显存了？ |
| 00:08-00:22 | 先回到 Harvard Annotated Transformer 里的核心公式：Attention 等于 softmax，括号里是 Query 乘 Key 转置，除以根号下 d k，再乘 Value。 |
| 00:22-00:35 | 这句公式翻成人话就是三步：第一，当前 token 拿 Query 去匹配所有历史 Key；第二，softmax 分配权重；第三，从 Value 里加权读取信息。 |
| 00:35-00:49 | 生成式大模型最麻烦的地方在这里：它不是一次把整段答案算完，而是逐个 token 往后生成。每生成一个新 token，都要重新面对全部历史。 |
| 00:49-01:05 | 如果没有 KV Cache，模型每一步都要把历史 token 的 Key 和 Value 从头再算一遍。KV Cache 做的事很朴素：把已经算好的 Key 和 Value 存起来。 |
| 01:05-01:20 | 注意，KV Cache 存的不是原始 token，也不是 Query。它存的是每一层里、每个历史位置对应的 Key 状态和 Value 状态。 |
| 01:20-01:36 | 为什么这会吃显存？因为每多一个 token，每一层就多一份 Key 和一份 Value。上下文长度越大，这个“记忆书架”就越长。 |
| 01:36-01:52 | 一个简化公式可以这样看：KV 显存大约正比于 token 数、层数、Key Value 头数、每个头的维度和数据字节数。所以长输入不是免费午餐。 |
| 01:52-02:08 | 用费曼方式说：不加缓存，就像你每写一个字都从头翻完整本书。加了 KV Cache，就像把查过的书签留在书架上，下次直接翻到那里。 |
| 02:08-02:24 | 那 RoPE 到底改变了什么？它不是把 KV Cache 弄坏了。它改变的是 Query 和 Key 被拿来比较之前，位置如何进入它们的表示。 |
| 02:24-02:40 | 公式上，位置 m 的 Query 会旋转成 R m 乘 Query；位置 n 的 Key 会旋转成 R n 乘 Key。两者做点积时，不是直接得到距离，而是让结果隐式依赖 n 减 m。 |
| 02:40-02:57 | 所以缓存仍然可以复用，但不能忘记位置坐标。每个缓存里的 Key，都必须和它原来的位置编号、RoPE 缩放规则、以及当前解码步保持一致。 |
| 02:57-03:14 | 上下文长度变大时，难点有两层：第一，历史 Key 和 Value 越存越多；第二，当前 Query 要和越来越长的历史 Key 做匹配，读缓存也会变贵。 |
| 03:14-03:31 | 这就是为什么很多人以为瓶颈只是算力，其实推理时常常还卡在显存和显存带宽上。GPU 不是只在算，也在不停搬运这些 Key 和 Value。 |
| 03:31-03:47 | 第一类解法是 Sliding Window Attention，滑动窗口注意力。它只让当前 token 看最近 W 个 token。好处是成本可控，代价是远处信息可能直接看不到。 |
| 03:47-04:04 | 第二类是 Sparse Attention，稀疏注意力。它不让所有 token 两两相连，而是只保留局部块、全局 token，或者少量稀疏连接。 |
| 04:04-04:21 | 第三类是 MQA 和 GQA。Multi Query Attention 让多个 Query 头共享一组 Key 和 Value；Grouped Query Attention 则按组共享。目的都是减少 KV Cache。 |
| 04:21-04:39 | 第四类是 PagedAttention 这样的缓存管理。它像操作系统分页一样，把 KV Cache 切成块，减少显存碎片，也方便不同请求复用相同前缀。 |
| 04:39-04:55 | 还有 FlashAttention。它主要不是压缩 KV Cache，而是优化 Attention 本身的显存读写，让 Query、Key、Value 的计算路径更少搬数据。 |
| 04:55-05:07 | 总结一下：参数像模型的大脑，KV Cache 像当前工作记忆。PE 告诉模型你在哪；RoPE 让比较时看到相对位置；长输入优化，就是少存、少看、少搬运。 |
| 05:07-05:18 | 下一集我们继续看：如果 Attention 不再总是全连接，而是窗口化、稀疏化、分组化，那 Transformer 为什么会走向稀疏化和专家化？ |

## TTS spoken_text 审核版

| 时间 | TTS 输入文本 |
| --- | --- |
| 00:00-00:08 | 上一集我们讲到，R O P E，也就是旋转位置编码，把位置写进 Query 向量和 Key 向量的旋转关系里。问题来了：位置进了 Attention，为什么大模型就更吃显存了？ |
| 00:08-00:22 | 先回到 Harvard Annotated Transformer 里的核心公式：Attention 等于 softmax，括号里是 Query 乘 Key 转置，除以根号下 d k，再乘 Value。 |
| 00:22-00:35 | 这句公式翻成人话就是三步：第一，当前 token 拿 Query 去匹配所有历史 Key；第二，softmax 分配权重；第三，从 Value 里加权读取信息。 |
| 00:35-00:49 | 生成式大模型最麻烦的地方在这里：它不是一次把整段答案算完，而是逐个 token 往后生成。每生成一个新的 token，都要重新面对全部历史。 |
| 00:49-01:05 | 如果没有 Key Value Cache，模型每一步都要把历史 token 的 Key 和 Value 从头再算一遍。Key Value Cache 做的事很朴素：把已经算好的 Key 和 Value 存起来。 |
| 01:05-01:20 | 注意，Key Value Cache 存的不是原始 token，也不是 Query。它存的是每一层里、每个历史位置对应的 Key 状态和 Value 状态。 |
| 01:20-01:36 | 为什么这会吃显存？因为每多一个 token，每一层就多一份 Key 和一份 Value。上下文长度越大，这个记忆书架就越长。 |
| 01:36-01:52 | 一个简化公式可以这样看：Key Value 显存大约正比于 token 数、层数、Key Value 头数、每个头的维度和数据字节数。所以更大输入范围不是免费午餐。 |
| 01:52-02:08 | 用费曼方式说：不加缓存，就像你每写一个字都从头翻完整本书。加了 Key Value Cache，就像把查过的书签留在书架上，下次直接翻到那里。 |
| 02:08-02:24 | 那 R O P E 到底改变了什么？它不是把 Key Value Cache 弄坏了。它改变的是 Query 和 Key 被拿来比较之前，位置如何进入它们的表示。 |
| 02:24-02:40 | 公式上，位置 m 的 Query 会旋转成 R m 乘 Query；位置 n 的 Key 会旋转成 R n 乘 Key。两者做点积时，不是直接得到距离，而是让结果隐式依赖 n 减 m，也就是相对位移。 |
| 02:40-02:57 | 所以缓存仍然可以复用，但不能忘记位置坐标。每个缓存里的 Key，都必须和它原来的位置编号，R O P E 缩放规则，以及当前解码步保持一致。 |
| 02:57-03:14 | 上下文长度变大时，难点有两层：第一，历史 Key 和 Value 越存越多；第二，当前 Query 要和越来越长的历史 Key 做匹配，读缓存也会变贵。 |
| 03:14-03:31 | 这就是为什么很多人以为瓶颈只是算力，其实推理时常常还卡在显存和显存带宽上。GPU 不是只在算，也在不停搬运这些 Key 和 Value。 |
| 03:31-03:47 | 第一类解法是 Sliding Window Attention，滑动窗口注意力。它只让当前 token 看最近 W 个 token。好处是成本可控，代价是远处信息可能直接看不到。 |
| 03:47-04:04 | 第二类是 Sparse Attention，稀疏注意力。它不让所有 token 两两相连，而是只保留局部块、全局 token，或者少量稀疏连接。 |
| 04:04-04:21 | 第三类是 M Q A 和 G Q A。Multi Query Attention 让多个 Query 头共享一组 Key 和 Value；Grouped Query Attention 则按组共享。目的都是减少 Key Value Cache。 |
| 04:21-04:39 | 第四类是 Paged Attention 这样的缓存管理。它像操作系统分页一样，把 Key Value Cache 切成块，减少显存碎片，也方便不同请求复用相同前缀。 |
| 04:39-04:55 | 还有 Flash Attention。它主要不是压缩 Key Value Cache，而是优化 Attention 本身的显存读写，让 Query，Key，Value 的计算路径更少搬数据。 |
| 04:55-05:07 | 总结一下：参数像模型的大脑，Key Value Cache 像当前工作记忆。P E 告诉模型你在哪；R O P E 让比较时看到相对位置；更大输入范围的优化，就是少存，少看，少搬运。 |
| 05:07-05:18 | 下一集我们继续看：如果 Attention 不再总是全连接，而是窗口化、稀疏化、分组化，那 Transformer 为什么会走向稀疏化和专家化？ |
