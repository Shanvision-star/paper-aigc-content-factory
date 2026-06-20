# EP06 专业术语读法与歧义审查 V2

## TTS 总原则

- 画面和字幕可以保留专业符号，口播输入优先使用 `spoken_text`。
- 不把裸 `Q`、`K`、`V`、`Q/K`、`K/V` 直接交给 TTS。
- `长上下文` 在口播输入中优先改写为 `上下文长度变大` 或 `更大输入范围`。
- 英文缩写首次出现要给中文解释；TTS 输入里 `MQA`、`GQA`、`PE`、`RoPE` 优先分字母读，`KV Cache` 优先读成 `Key Value Cache`。
- 费曼类比必须紧跟机制边界：`参数像模型的大脑` 是长期能力类比；`KV Cache 像当前工作记忆` 是推理时历史状态类比，两者不能说成同一类存储。
- 可见字幕不得显示 `读作`、`TTS`、`发音提示` 等制作侧词。

## 术语读法

| 屏幕显示 | 口播读法 | 中文解释 |
| --- | --- | --- |
| Attention | Attention / 注意力机制 | 用 Query 匹配 Key，再加权读取 Value |
| Query / Q | Query 向量 | 当前 token 发出的查询 |
| Key / K | Key 向量 | 历史 token 的索引状态 |
| Value / V | Value 向量 | 被加权读取的信息状态 |
| KV Cache | Key Value Cache / K V 缓存 | 生成时缓存历史 Key 和 Value |
| RoPE | R O P E / 旋转位置编码 | 把位置写进 Q/K 的旋转相位 |
| PE | P E / 位置编码 | 原始 Transformer 输入端的位置编码 |
| `d_k` | d k / d 下标 k | Key 或 Query 的每头维度 |
| `QK^T` | Query 乘 Key 转置 | Attention 打分矩阵 |
| `sqrt(d_k)` | 根号下 d k | 缩放项，避免点积过大 |
| `n - m` | n 减 m，也就是相对位移 | 只解释一次，不机械重复 |
| `q'_m` | q prime m / 位置 m 旋转后的 Query | 可见公式符号，口播不读裸公式 |
| `k'_n` | k prime n / 位置 n 旋转后的 Key | 可见公式符号，口播不读裸公式 |
| Sliding Window Attention | Sliding Window Attention，滑动窗口注意力 | 只看最近窗口 |
| Sparse Attention | Sparse Attention，稀疏注意力 | 只算部分连接 |
| MQA | M Q A / Multi Query Attention | 多个 Query 头共享一组 Key/Value |
| GQA | G Q A / Grouped Query Attention | 分组共享 Key/Value |
| PagedAttention | Paged Attention / 分页注意力 | 用分页块管理 KV Cache |
| FlashAttention | Flash Attention | 优化 Attention 的显存读写 |
| GPU | G P U | 图形处理器，这里主要指推理硬件 |

## 多音字与易误读词

| 原词 | 风险 | 建议 |
| --- | --- | --- |
| 长上下文 | `长` 可能被误读，且 TTS 不稳 | spoken_text 改为 `上下文长度变大` |
| 缓存 | 一般稳定 | 保留，但首次用 `KV Cache（K V 缓存）` |
| 重新 | 一般稳定 | 可改为 `从头再算`，更口语 |
| 分组 | 一般稳定 | 与 GQA 同屏解释 |
| 稀疏 | 可能对普通观众陌生 | 字幕加 `只保留部分连接` |
| 显存带宽 | 容易抽象 | 费曼解释为 `搬运 Key 和 Value 的通道` |
| 工作记忆 | 可能被误解成模型参数 | 只用于解释 KV Cache 的推理时状态，不用于训练后参数 |
| 适合长上下文 | 容易过度承诺 | 改为 `把相对位置关系带入匹配；长输入仍需要工程优化` |

## 禁止进入 spoken_text

- `Q/K`
- `K/V`
- 裸 `K`、裸 `V`
- `q'_m`
- `k'_n`
- `KV cache 与推理速度`
- `RoPE 保证长上下文能力`
- `读作`
- `视觉焦点`
- `教学边界`
- `Hook`
- `QA`
