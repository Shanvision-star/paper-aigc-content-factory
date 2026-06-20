# EP05 Hook + 广告学 + MATLAB 样片包

## 当前审核版本

- 口播稿：`ep05_voiceover_v3_225s_for_review.md`，当前节奏为 216 秒
- 动态字幕：`ep05_subtitles_v3_225s_for_review.md`，按口播时间动态显示
- 视频合成合同：`../video_script/FRAME.md`
- 成片节奏：目标约 216 秒，最终不得低于 180 秒
- 动画策略：MATLAB 动画不只做插图，而是承担三次解释任务：Annotated Transformer 输入加法示例、Q/K 旋转、`n - m` 相对位移

## Hook 选择

### 入选开场

> 位置不是加上去的，是转进 Attention 的。

### 选择理由

- `visual hook`: 第一屏可以直接看到左侧 `x + PE`、右侧 Q/K 旋转，适合手机端快速理解。
- `verbal hook`: “加上去 / 转进去”形成明确反差，能承接上一集 Positional Encoding。
- `audience promise`: 观众能在一集内弄懂为什么 RoPE 不只是“另一种位置编码”。
- `technical credibility`: 对应原始 Transformer 位置编码公式、Annotated Transformer 输入加法示例、RoFormer 的 Q/K 旋转和相对位置性质。
- `non-clickbait integrity`: 不说“所有模型都用 RoPE”，只说公开可验证生态中 RoPE family 常见。

### 备选但未采用

| Hook | 不采用原因 |
| --- | --- |
| 为什么现代大模型都离不开 RoPE？ | 容易过度承诺；专有模型细节未公开。 |
| RoPE 到底为什么提升准确度？ | “提升准确度”需要任务和实验边界，短视频不宜泛化。 |
| 一个旋转，解决长上下文？ | 暗示 RoPE 单独解决长上下文，容易误导。 |

## 广告学 Big Idea

原始 Positional Encoding 把“第几个位置”加到输入上；RoPE 把“相隔多远”写进 Q/K 的匹配关系里。

## 每帧广告学审核规则

每一张动画图片、MATLAB 局部资产、关键帧和 HyperFrames 场景都按 `ogilvy-creative-director` skill 过一遍，不允许只做“技术堆料”。

| 门禁 | EP05 要求 |
| --- | --- |
| Big Idea | 画面必须服务“PE 给绝对位置；RoPE 让 Q/K 比较带上相对位移” |
| Proof Object | 画面必须放入公式、代码、数值验证、旋转图或类比图之一，且来源可追溯 |
| Visual Hero | 一屏只让一个对象成为第一眼焦点，避免公式、字幕、装饰同权抢注意力 |
| Micro-headline | 动态字幕是 5-8 秒小标题，要给出新信息，不做进度条或制作提示 |
| Brand Consistency | 顶部统一写 `EP05 · 为什么现代大模型都绕不开 RoPE？`，局部来源名不替代集标题 |

## Proof Objects

| 画面 | 证明物 | 来源 |
| --- | --- | --- |
| 原始 PE | `x = x + pe` 与 sin/cos PE 公式 | 原始 Transformer 论文公式；Annotated Transformer 代码示例解释实现方式，画面不单独写 “Harvard” |
| Attention 关系 | `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V` | 原始 Transformer 论文公式；Annotated Transformer 页面提供注释实现 |
| RoPE 机制 | `(\mathbf{R}_m q)^T(\mathbf{R}_n k)=q^T\mathbf{R}_{n-m}k` | RoFormer |
| 工程边界 | gpt-oss 可作为 RoPE 证据；DeepSeek-V4 可作为 Partial RoPE 证据；专有 GPT / Claude 位置编码不猜 | 公开资料与项目审核规则；ChatGPT 产品语境只保留在审核说明，不作为成片独立记忆点 |

## 口播稿入口

口播使用同目录的 `ep05_voiceover_v3_225s_for_review.md`。本轮把节奏从 148 秒压缩版调整为 216 秒慢讲版，RoPE 公式段锁定为：

> 准确一点说，在每个二维子空间里，位置 `m` 的 Q 按“m 乘 theta 下标 i”这个角度旋转；位置 `n` 的 K 按“n 乘 theta 下标 i”这个角度旋转。
> Q 和 K 做点积时，位置相关的相位差会依赖 `n - m`，也就是两个 token 的相对位移。

## 动态字幕入口

字幕使用同目录的 `ep05_subtitles_v3_225s_for_review.md`。它采用：

- 主字幕：跟随口播主干。
- 辅助字幕：补机制、公式关键词和画面强调。
- 显示边界：不把字幕压在公式、source label 或 Q/K 动画上。
- 动态含义：字幕使用固定字幕槽，按口播字幕稿的 `start_s/end_s` 时间段显示、替换或高亮；不让字幕块漂移，不使用进度条，不做大面积底部面板。
- 慢讲要求：每个复杂机制段至少保留 9-30 秒视觉停留，MATLAB 动画可以重复播放或局部放大，但不能让字幕、公式、卡片整体抖动。
- MP4 稳定性：标题、正文、公式、字幕槽位置必须锁定；动效只服务机制表达，例如 Q/K 旋转、箭头、阶段焦点或相对角度条，避免移动文字徽标、脉冲描边和公式漂移造成抖动。
- MATLAB 参考：可参考 `ep05_rope_position_encoding_225s_final_review.mp4` 的局部证明卡与 MATLAB 绘制质感，但必须拆成局部公式、局部向量、局部高亮资产，不再把整页 MATLAB 长图缩放嵌入。
- 防闪烁：公式、代码、正文说明使用稳定 PNG/HTML 静态层；动画层只负责 Q/K 向量、箭头、相对位移条和局部高亮，禁止让公式、文字、字幕槽或整张卡片逐帧缩放、重排、漂移。
- MATLAB 回退：默认调用 R2021b；若 180 秒无有效输出、卡住、`-batch` 崩溃或图形启动异常，记录尝试命令和原因后切换 R2026a。
- 公式读法：`mθ_i` 不直接交给 TTS，统一写入 spoken_text 为“m 乘 theta 下标 i”；`nθ_i` 同理。
- 音轨要求：最终审片 MP4 必须使用授权参考音频生成的 `audio/voiceover.wav`；SAPI 只能作为显式标注的临时草稿，不能作为最终审片音轨。
- 公式资产：PE、Attention、RoPE 相对位移和 2×2 旋转矩阵均使用 MATLAB 渲染的局部公式资产插入对应动画，不用 HTML 字符拼公式。
- 画面填充：每一页主视觉区必须有对应的公式、代码、计算结果或动画机制，禁止空白页等待字幕解释。
- 色彩要求：本集不使用绿色作为 RoPE 主色，统一改为深蓝、琥珀、酒红和暖纸色。
- RoPE 向量要求：圆盘里的 Q/K 箭头是向量方向，不是视觉装饰。箭头必须小头、分色、从圆心锚定，不能出现大面积实心三角导致观众误读为“块在移动”。

## MATLAB 样片说明

脚本：

`experiments/matlab_transformer_poc/run_ep05_rope_hooked_animation_sample.m`

输出：

- `ep05_rope_hooked_animation_sample.gif`
- `ep05_rope_hooked_animation_sample.mp4`
- `ep05_rope_hooked_keyframe.png`
- `manifest.json`

样片用途：

- 检查 Hook 第一眼是否成立。
- 检查原始 Transformer 公式、Annotated Transformer 代码示例和 RoPE 公式是否用数学形式或代码形式准确显示。
- 检查字幕和公式是否语义一致。
- 检查 RoPE 二维旋转是否没有误导成 token 在句子平面移动。

## 审核风险

- 画面里不能写成“点积后只剩 n - m”；必须说“位置相关相位差依赖 n - m”。
- `Q`、`K` 是 learned projection spaces，不是固定语义角色。
- RoPE 的二维圆是维度块示意，不是词在纸面上移动。
- 公开模型证据只能作为公开实现示例；ChatGPT 产品语境只留在审核文档，不能推出专有 GPT / Claude 的内部 PE，也不能做成成片独立字幕。
- 动画画面不得出现“视觉焦点”“视觉爆点”“Hook”“教学边界”“给普通观众的一句话”等制作提示词；必要边界改写成观众可读句子。
- MATLAB 资产不得以整页 MP4 小图套大框方式进入 HyperFrames；应重渲比例或拆成公式、箭头、旋转块等局部资产后再合成。
- 英文来源名必须加中文注释，例如“Annotated Transformer 代码示例”“RoFormer 论文：旋转位置编码”，避免普通观众只看到英文名产生歧义。
