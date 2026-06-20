# EP06 技术审查 V2

## blocking_issues

无阻塞项。当前版本已经修正了前序草稿和附件动画稿中的高风险表达：

- 不再说 `RoPE 让 KV Cache 失效`。
- 不再说 `旧 Key 每次都必须重新旋转一次`。
- 不再把 `n - m` 说成显式距离标签，而是说点积结果隐式依赖相对位移。
- 不说 `RoPE 保证长上下文能力`；只说它把相对位置关系带入 Q/K 匹配，长输入仍需要缓存、窗口、稀疏、缩放和 IO 工程。
- 不把 `参数` 和 `KV Cache` 混成同一种记忆：参数是长期能力类比，KV Cache 是推理时工作记忆类比。

## clarity_fixes

- `KV Cache` 首次解释为 `缓存 Key 和 Value，不缓存 token，也不缓存 Query`。
- `大显存` 解释为 `token 数 × 层数 × KV heads × head dim × bytes` 的线性增长，普通观众能理解为“书架越来越长”。
- `RoPE 与 cache` 的关系改成：cache 可以复用，但位置坐标系、RoPE 缩放规则和当前解码步必须一致。
- `FlashAttention` 单独标为显存读写优化，不归类为 KV Cache 压缩。
- 采纳附件中的系统链路：`Attention -> 自回归生成 -> KV Cache -> RoPE 位置用法 -> 显存/带宽压力 -> Window/Sparse/MQA/GQA/PagedAttention/FlashAttention`。
- 采纳附件中的费曼总结，但收紧为：`参数像模型的大脑；KV Cache 像当前工作记忆`。

## engineering_notes

- `Sliding Window Attention` 和 `Sparse Attention` 是减少可见连接或计算范围。
- `MQA/GQA` 是减少 Key/Value 头数，降低 KV Cache 和显存带宽压力。
- `PagedAttention` 是缓存块管理与复用策略。
- `FlashAttention` 是 Attention 计算和 GPU IO 优化。
- 这些方法可以在现代推理系统里组合，但不是同一个机制。
- MATLAB 适合本集的局部证明物：KV Cache 增长曲线、RoPE 二维旋转、attention mask、MHA/MQA/GQA 存储对比。HyperFrames 仍是最终合成层。

## tts_risks

- `Q/K`、`K/V`、裸 `K`、裸 `V`：TTS 容易误读，必须用 `spoken_text`。
- `长上下文`：口播输入优先改为 `上下文长度变大` 或 `更大输入范围`。
- `PagedAttention`：口播建议读作 `Paged Attention`，可见字幕写 `PagedAttention（分页注意力）`。
- `FlashAttention`：口播建议读作 `Flash Attention`。
- `d_k`、`QK^T`、`sqrt(d_k)`：需要 visual/spoken 分离。
- `q'_m`、`k'_n`：可见字幕解释为旋转后的 Query/Key；不要直接送进 TTS。
- `工作记忆`：TTS 可读，但字幕/口播必须明确它是 KV Cache 的推理时类比。

## stage_gate_risks

- `caption`: 字幕不能退回只写微标题；公式、RoPE、KV Cache、MQA/GQA 首次出现必须带解释。
- `voiceover`: `RoPE 保证长上下文`、`KV Cache 是模型记忆`、`n-m 是距离标签` 都是禁用表达。
- `visual`: RoPE 圆盘必须声明是二维维度块示意，不表示 token 在句子平面移动。
- `frame`: MATLAB 只做局部证明物；不生成整页海报式 MP4。
- `quality-gate`: 进入 render 前必须有 assets manifest、关键帧、字幕重叠检查和 audience-visible hygiene scan。

## approval

`approved_with_minor_fixes`

说明：可进入第一轮人工审稿和分镜设计；不能直接进入 TTS 或最终 render。缺少真实音频，所以字幕时间轴只是草稿，不可声明完成对齐。
