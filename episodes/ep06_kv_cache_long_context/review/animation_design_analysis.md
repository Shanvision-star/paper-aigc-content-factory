# EP06 动画设计分析 V1

## 输入材料

- 当前口播稿与字幕稿。
- `contracts/visual_contract.md`
- `contracts/render_contract.md`
- 附件动画工程版建议。
- Global visual system: `docs/visual_system/DESIGN.md`, `FRAME.md`, `MATLAB.md`

## 采纳的思路

1. 保留 5 分钟左右的时长目标。当前 318 秒在建议范围内，不需要为了压缩而牺牲公式和术语解释。
2. 保留主线链路：`Attention -> autoregressive decoding -> KV Cache -> RoPE coordinate convention -> long-input memory pressure -> Window / Sparse / MQA / GQA / PagedAttention / FlashAttention`。
3. 采用 HyperFrames + MATLAB 分工：HyperFrames 做叙事包装、字幕、安全区和转场；MATLAB 做局部证明物，例如曲线、mask、RoPE 几何和 K/V 存储对比。
4. 采用 `参数=模型大脑；KV Cache=当前工作记忆` 的费曼类比，但只作为推理状态解释，不把参数和缓存混成同一种存储。

## 修正的风险表达

- 不采用“RoPE 特别适合长上下文”的强表达。修正为：RoPE 让 Q/K 匹配结果隐式依赖相对位移；长输入仍需要缩放、窗口、稀疏、缓存和 IO 工程。
- 不采用“位置进 Attention 就直接影响 KV Cache 结构”的强表达。修正为：RoPE 不改变 KV Cache 缓存 Key/Value 的事实，但改变 Q/K 使用位置坐标的方式。
- 不采用“KV Cache 等于模型记忆”的泛化表达。修正为：KV Cache 是推理时工作记忆，参数是模型长期能力。
- 不让字幕只显示微标题。公式和术语首次出现时必须给观众可理解的定义。

## 推荐动画拆分

| Scene | Recommended engine | Reason | Review gate |
| --- | --- | --- | --- |
| S02 Attention formula | MATLAB or formula SVG + HyperFrames | 公式需要完整显示和分步高亮。 | `QK^T -> /√d_k -> softmax -> V` 顺序不能断。 |
| S04 KV memory growth | MATLAB + HyperFrames | 曲线/柱状条最适合解释线性增长。 | 标记为 illustrative，不写真实测量值。 |
| S06 RoPE coordinate boundary | MATLAB + HyperFrames | 二维旋转和相位差需要几何动画。 | 明确“不是 token 在句子平面移动”。 |
| S08 Window/Sparse masks | MATLAB + HyperFrames | attention mask 是矩阵视觉，MATLAB 可生成稳定 keyframes。 | mask cells 手机端可读，字幕不压图例。 |
| S09 MHA/MQA/GQA and PagedAttention | MATLAB + HyperFrames | 存储对比和分页块需要定量/结构图。 | 不暗示所有模型同一实现。 |
| S10 FlashAttention boundary | HyperFrames | 这里重点是 IO 层边界，系统图比复杂计算动画更清晰。 | 必须写明不是 KV Cache 压缩。 |

## 视觉执行规则

- 每个镜头只表达一个重点，先概念、再图、再公式或标注。
- 公式必须是完整可读对象，不能放进普通段落里缩小。
- 字幕最多两行，固定在安全槽，不覆盖公式、矩阵、图例、显存条或 source label。
- MATLAB 动画只动机制对象：Q/K 向量、显存条、mask 高亮、分页块和 IO 箭头。标题、公式和字幕出现后保持位置锁定。
- Q/K/V 语义色沿用系列规则：Q 蓝、K 橙、V 绿；压力/风险用红色；attention/mask 权重用稳定辅助色。

## 当前结论

`approved_with_minor_fixes`

可以进入 assets manifest 设计和 keyframe 规格书阶段；不能直接进入 MATLAB render、HyperFrames render、TTS 或 SFX。下一步应先写 `assets/assets_manifest.json`，再逐个生成 review keyframes。
