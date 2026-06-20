# EP06 视频合成合同 V1

## 版本目标

- 集数：EP06
- 主题：RoPE 之后，KV Cache、上下文长度、显存和 Attention 工程优化如何连成一条推理链
- 目标时长：约 318 秒
- 当前状态：第一版脚本与字幕草稿；未生成音频；未渲染视频
- 合成边界：HyperFrames 负责最终排版、字幕和转场；MATLAB 只作为公式、RoPE/KV 几何、显存增长曲线、attention mask 和 MQA/GQA 对比的局部证明物；SVG/HyperFrames 负责信息卡、转场和最终包装

## Pre-TTS / Pre-Render 合同索引

- `contracts/claim_contract.md`
- `contracts/visual_contract.md`
- `contracts/notation_contract.md`
- `contracts/render_contract.md`

EP06 在进入 TTS、MATLAB、HyperFrames、字幕烧录、SFX 或最终 MP4 之前，必须先审核以上四份合同。当前 `render_contract` 明确标记 `render_allowed=false`，直到 `assets/assets_manifest.json`、关键帧审核、发音门禁、音频新鲜度门禁和 SFX gate 补齐。

## Big Idea

KV Cache 把重复计算换成显存占用；RoPE 不会让缓存失效，但会让位置坐标进入 Query 和 Key 的使用方式。上下文长度变大以后，现代推理系统必须同时控制存储、可见连接和显存读写。

## 叙事链路

`Attention 公式 -> 自回归生成 -> KV Cache 出现 -> RoPE 改变 Q/K 位置用法 -> 长输入带来显存和带宽压力 -> Window / Sparse / MQA / GQA / PagedAttention / FlashAttention 分层优化`

核心教学边界：RoPE 不是直接输出距离，也不保证长上下文能力；它让 Q/K 点积隐式依赖相对位移。长输入是否稳定、便宜、可服务，还取决于缓存、窗口、稀疏、KV 共享、分页管理和 IO 优化。

## 证明物

| 用途 | 画面证明物 | 来源边界 |
| --- | --- | --- |
| Attention 原公式 | `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V` | Attention Is All You Need；Harvard Annotated Transformer |
| KV Cache 定义 | Key/Value 状态缓存图，不显示 raw token cache | HF Transformers cache docs；TensorRT-LLM KV Cache docs |
| 显存增长 | `tokens × layers × kv_heads × head_dim × bytes` 简化条形图 | 作为工程估算解释，不写成精确 profiling 数值 |
| RoPE 边界 | `q'_m=R_m q_m`、`k'_n=R_n k_n`、点积依赖 `n-m` | RoFormer；方向约定只表达相对位移进入点积 |
| Sliding Window | 当前 token 只看最近 `W` 个 token 的窗口 mask | Longformer；HF cache docs 对 sliding layers 的说明 |
| Sparse / Block | local/global/random 或 block mask 网格 | BigBird；FlashAttention block-sparse 语境 |
| MQA/GQA | 多 Query 头共享较少 Key/Value 头 | MQA paper；GQA paper；TensorRT-LLM docs |
| PagedAttention | KV blocks / page table 风格图 | PagedAttention paper；TensorRT-LLM docs |
| FlashAttention | HBM/SRAM 读写减少示意 | FlashAttention paper；只作为 Attention IO 优化 |

## 视觉场景要求

| 时间 | 场景 | 视觉任务 |
| --- | --- | --- |
| 00:00-00:08 | Hook | EP05 RoPE 圆盘收束成 KV Cache 书架；标题不能写制作侧 `Hook` |
| 00:08-00:35 | Attention 公式 | MATLAB 或公式资产显示完整公式，分三步高亮 `QK^T`、`softmax`、`V` |
| 00:35-01:05 | 自回归生成 | token 流逐个生成；旧 Key/Value 进入 cache；新 Query 只来自当前 token |
| 01:05-01:52 | 显存增长 | MATLAB 曲线/柱状条展示每层、每 token 的 K/V 方块堆叠；显存条随 token 数线性增长 |
| 01:52-02:08 | 费曼书架 | 书签类比必须映射回 Key/Value，不暗示缓存原文 token |
| 02:08-02:57 | RoPE/cache 边界 | RoPE 圆盘只表示二维维度块；显示 `cache reusable` 与 `position coordinate required` |
| 02:57-03:31 | 长输入瓶颈 | 左侧 cache 变长，右侧 GPU memory bandwidth 通道变拥挤 |
| 03:31-04:04 | Window/Sparse | MATLAB attention mask：Full -> Sliding Window 对角带 -> Sparse local/global/block；避免全屏文字卡 |
| 04:04-04:39 | MQA/GQA/PagedAttention | MATLAB 对比图：MHA/MQA/GQA 的 K/V 存储形态；HyperFrames 叠加分页 block cache |
| 04:39-04:55 | FlashAttention | HBM 与 SRAM 两层内存，显示减少搬运；不要说它压缩 KV Cache |
| 04:55-05:18 | 总结/下集 | 四张小卡：PE / RoPE / KV Cache / Window-Sparse；下集只预告稀疏化和专家化 |

## 字幕安全区

- 主字幕固定在底部安全槽。
- 公式场景把字幕上移或缩短，不覆盖 `QK^T`、`sqrt(d_k)`、`R_{n-m}`。
- 字幕不得显示 `读作`、`视觉焦点`、`教学边界`、`QA`、`Hook`、本地路径。
- 大字号可见文案避免 `English term + 与 + 中文术语`，优先使用 `和` 或顿号。

## MATLAB / 公式资产要求

- MATLAB 只生成局部证明物，不输出整页海报式 MP4。
- 公式、标题、字幕、source label 固定，不做漂移动画。
- 运动只属于公式高亮、Q/K 向量、显存条、mask 高亮和 block 填充。
- 每个 MATLAB 资产需要后续补 `assets/assets_manifest.json`，记录 canvas、safe area、source refs、canonical formula、review keyframes 和 render environment。

## 推荐 MATLAB 资产拆分

| 资产 | 场景 | 动画目的 | 不能越界 |
| --- | --- | --- | --- |
| `ep06_kv_cache_memory_growth` | S04 | token 数增加时，K/V 缓存和显存条同步增长 | 不写成真实 GPU profiling 数值 |
| `ep06_rope_rotation_geometry` | S06 | 解释 RoPE 是二维维度块旋转，不是 token 在句子平面移动 | 不说 RoPE 直接输出距离 |
| `ep06_window_sparse_masks` | S08 | Full mask、Sliding Window、Sparse mask 的可见连接差异 | 不把所有稀疏机制合并成一种算法 |
| `ep06_mha_mqa_gqa_kv_compare` | S09 | MHA/MQA/GQA 的 K/V 头共享和缓存体积差异 | 不暗示具体模型都采用同一方案 |
| `ep06_paged_kv_blocks` | S09 | KV Cache 分页块管理和碎片控制 | 不说它改变 Attention 公式 |

## 审核检查

- 不出现“RoPE 让 KV Cache 失效”。
- 不出现“旧 Key 每次必须重新旋转一次”。
- 不出现“KV Cache 缓存 token”。
- 不出现“点积后只剩 n-m”。
- 不把闭源 GPT/Claude 的内部实现写成事实。
- `FlashAttention`、`PagedAttention`、`MQA/GQA`、`Sliding Window`、`Sparse Attention` 必须分层解释。
- 进入 TTS 前必须跑 pronunciation gate；进入最终 MP4 前必须跑 audio freshness gate、字幕重叠检查、关键帧检查和 ffprobe。
