# Douyin Voiceover V5 Focus-Cue Audio-Timed

## Title

《Attention Is All You Need》为什么改变了今天的 AI？

## Production Notes

- Target platform: Douyin / Xiaohongshu Chinese vertical draft.
- Final configured duration: 06:47.0 from segmented voiceover audio.
- Teaching method: Feynman learning method first, formula second.
- Core thesis: Transformer changed AI by moving sequence understanding from sequential message passing to global relationship modeling.
- Source boundary: Transformer claims trace to the paper; Sora/MCP references stay at system-layer context and do not imply they are Transformer variants.
- Focus cue strategy: use short oral prompts such as "重点来了", "需要关注", and "公式不用背" to help short-video viewers notice conceptual turns.
- Timing source: audio/indextts2/segments/segmented_merge_report.json.

## Voiceover

### 00:00.0-00:29.0

Attention 像一张不断变化的关系图。
这一集，我们把这张图拆开。
先看最关键的一步：Q 乘 K 转置。
如果你只记住一个问题，就记这个：模型怎么判断，当前这个 token，应该重点看上下文里的谁？这里的 token，可以先理解成：模型正在处理的词片段。
答案，就藏在 Q 和 K 的匹配里。

### 00:29.0-00:54.9

注意，这里说的关系图，不是固定不变的图结构，也不是图神经网络那种静态边。
更准确地说，Attention 会在每一层里，动态生成一张软关系矩阵。
也就是：一张由 token 相似度驱动的，动态加权关系矩阵。
这张矩阵告诉模型：当前 token 和其他 token，分别有多相关。

### 00:54.9-01:21.1

那 Q、K、V 到底是什么？很多人一看到这三个字母，就以为模型里有三份不同的数据。
其实在 Self-Attention 里，它们通常来自同一份 token 表示。
同一个 token，经过三次不同的线性投影，变成 Q，变成 K，变成 V。
它们不是三种新数据，而是同一份输入，在三个不同投影空间里的表示。

### 01:21.1-01:58.1

Q 在检索空间里表达：我现在要找什么。
K 在索引空间里表达：我可以怎么被匹配。
V 在内容空间里保存：真正要被读取的信息。
用生活里的例子理解：你走进一个会议室，带着一个问题。
这个问题，就是 Q。
会议室里每个人身上，都有一些标签。
这些标签，就是 K。
但真正有用的，不是标签本身，而是每个人手里掌握的信息。
这些信息，就是 V。
所以 Q 和 K 负责匹配，V 负责提供内容。

### 01:58.1-02:22.9

比如一句话里有一个“它”。
模型要判断，“它”到底指谁。
它不会凭空理解，也不是只选一个词。
它会拿着当前 token 的 Q，去和上下文里所有 token 的 K 做匹配。
谁更相关，谁的分数就更高。
这一步，就是 Q 乘 K 转置。
它得到的不是最终答案，而是一组相关性分数。

### 02:22.9-02:48.8

接下来，模型会把这些分数，除以根号下 d k。
这里的 d k，指的是 Q 和 K 的向量维度。
为什么要缩放？因为维度越大，点积结果就越容易变大。
分数太大，softmax 会变得过于极端，训练时也更不稳定。
所以除以根号下 d k，不是数学装饰，而是在帮助模型稳定学习。

### 02:48.8-03:15.3

然后，这些缩放后的分数，会进入 softmax。
softmax 做的事，不是只挑一个最重要的词。
它会按行归一化。
也就是说，对每一个当前 token，都会得到一整行注意力权重。
这一行权重加起来等于一。
换句话说，每个 token 都会分到一个比例。
有的多一点，有的少一点。

### 03:15.3-03:43.7

最后一步，模型按照这些权重，去读取每个 token 对应的 V。
再把这些 V 加权汇总，得到新的表示。
所以 Attention 的核心过程，可以记成三句话：先匹配。
再分权。
最后汇聚信息。
如果画成公式，就是：Q 和 K 先算匹配分数，再除以根号下 d k，经过 softmax 变成权重，最后加权读取 V。

### 03:43.7-04:03.1

这就是 Scaled Dot-Product Attention，也就是缩放点积注意力。
在完整 Transformer 里，这些汇聚结果后面，还会接输出投影。
但这一集，先抓住 Attention 的核心闭环：匹配，分权，汇聚。

### 04:03.1-04:38.0

现在看一个今天大模型还在用的例子。
当 ChatGPT 或 Claude 生成回答时，它通常不是一次性把整段话吐出来。
它会一个 token，一个 token 地往后生成。
每生成一个新 token，模型都会产生新的 Q，去匹配前面上下文里的 K，再读取对应的 V。
问题来了：前面那些 token 的 K 和 V，如果每次都重新算，推理会很慢，显存也会浪费。
所以推理系统会用 KV Cache。

### 04:38.0-05:08.0

注意，KV Cache 缓存的不是原始 token。
它缓存的是：历史 token 经过线性投影之后，得到的 K 和 V。
下一步生成时，新的 Q 直接去匹配这些缓存好的 K，再读取对应的 V。
这就是为什么你经常听到 KV Cache，而很少听到 Q Cache。
因为生成新 token 时，Q 是当前这一步新来的查询。
而过去上下文的 K 和 V，可以被复用。

### 05:08.0-05:51.2

再往外看，今天很多优化，也还在围绕这条链路展开。
FlashAttention，主要是在计算层面，让 Attention 更快、更省显存。
GQA 和 MQA，是在模型结构层面，减少 K 和 V 这一侧的推理成本。
KV Cache，是在推理运行时，复用历史 token 的 K 和 V，避免重复计算。
所以这三者不是同一层东西。
一个偏计算。
一个偏结构。
一个偏推理状态。
但它们都说明一件事：QKV 不是入门黑话。
它仍然是今天大模型推理系统里，非常核心的一条路径。

### 05:51.2-06:36.2

最后用费曼方式总结：你可以把 Attention 想成一次查资料。
Q 是你手里的问题。
K 是资料上的索引标签。
V 是资料真正包含的内容。
Q 和 K 先匹配，得到一张软关系矩阵。
softmax 按行归一化，把相关性变成比例。
最后，模型按照这些比例，从 V 里读取信息，合成当前 token 的新表示。
所以 Attention 不是神奇地理解一句话。
它更像一个可微分的信息路由机制：把上下文关系，变成可以计算、可以加权、可以复用的信息流。

### 06:36.2-06:47.0

下一集，我们继续拆：如果一个 QKV 视角已经能看关系，为什么 Transformer 还要一次开很多个 head？也就是：Multi-Head Attention。

