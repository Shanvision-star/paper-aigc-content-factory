# EP05 V1.2 审核建议落地说明

## 本轮任务分类

这是内容专业性优化与验证 gap，不是代码主线改造。目标是读取 `deep-research-report_5_V1.2.md` 的审核建议后，修正第五集口播、字幕、动画样片证据卡与审核说明中的模型例子边界。

## 已采纳的审核建议

| 审核点 | 落地改法 | 原因 |
| --- | --- | --- |
| Harvard `x = x + pe` 不能说成完整原文公式 | 改成“Harvard 实现里可以概括成一句话：`x = x + pe`” | Harvard 代码还有切片与 dropout；短视频里用简写必须标成实现概括。 |
| “座位号”类比容易被理解成离散编号 | 改成“连续座标 / 同维度位置向量”，并注明不是新增编号 token | 原始 sinusoidal PE 是同维向量，不是额外 token 或 one-hot 座位号。 |
| `n - m` 不能写成整个 attention 只剩距离 | 改成“位置相关相位差依赖 `n - m`” | RoPE 仍保留 Q/K 内容相似度；变化的是位置相位关系。 |
| 现代模型证据必须限定公开可验证 | 删除旧的多模态位置编码示例，改为 `gpt-oss / DeepSeek-V4 / ChatGPT 边界` | 用户要求移除旧例子；ChatGPT 只能作产品层长上下文例子，不能作 RoPE 实现证据。 |

## 当前可说与不可说

| 对象 | 可以说 | 不可以说 |
| --- | --- | --- |
| gpt-oss | OpenAI 官方公开写明使用 RoPE，并支持 128k context。 | 不把 gpt-oss 的公开架构外推到所有专有 GPT。 |
| DeepSeek-V4 Preview | 官方发布页确认 V4 Preview、开源与 1M context；Transformers 文档写到 hybrid attention 和 Partial RoPE。 | 不简化成“DeepSeek-V4 就是普通 RoPE”。 |
| ChatGPT | 官方帮助中心公开了 ChatGPT 当前不同档位的 context window，可作为长上下文产品需求例子。 | 不说 ChatGPT / 专有 GPT 使用 RoPE，除非官方公开位置编码细节。 |
| Claude / Claude Code | 只可作为“专有模型或产品层未公开 PE 细节”的边界提示。 | 不断言其底层位置编码。 |

## 制作侧边界句

公开资料里，OpenAI 已公开的 gpt-oss 写明使用 RoPE；DeepSeek-V4 Preview 的公开实现文档写到 Partial RoPE；ChatGPT 只能说明长上下文产品越来越需要稳定的位置工程，不能被当成 RoPE 实现证据。这个边界留在制作侧审核记录里，不放入口播成片。

## 动画与字幕约束

- 证据墙只放 `gpt-oss: RoPE`、`DeepSeek-V4: Partial RoPE`、`ChatGPT: 长上下文需求`、`专有 GPT: 不猜 PE`。
- 公式层继续保留 `x = x + pe`、RoPE 二维旋转、`n - m` 高亮。
- 字幕中 `n - m` 的解释统一成“相对位移 / 相对距离”，并加辅助句“内容 q/k 仍在，变化的是位置相位”。
- 动态字幕使用固定字幕槽，按口播字幕稿的 `start_s/end_s` 时间段显示、替换或高亮；禁止让字幕块漂移、用进度条伪装动态字幕，或用大面积字幕面板挤压公式。
- MP4 动画审核必须检查抖动：标题、正文、公式和字幕槽应保持位置锁定；只允许机制对象运动，例如 Q/K 旋转、箭头、阶段焦点或相对角度条。
- 画面不能让观众以为 RoPE 是 token 在句子平面转圈；必须保持“二维子空间 / 维度块”的说明。
- 公式音频读法必须提前写入 spoken_text：`mθ_i` 读“m 乘 theta 下标 i”，`nθ_i` 读“n 乘 theta 下标 i”，`θ_i` 解释为“第 i 个二维块的旋转频率”。
- 观众可见动画不能出现“视觉焦点”“视觉爆点”“Hook”“教学边界”“给普通观众的一句话”等制作提示词。

## 本轮参考来源

- Harvard Annotated Transformer: https://nlp.seas.harvard.edu/annotated-transformer/
- Attention Is All You Need: https://arxiv.org/abs/1706.03762
- RoFormer: https://arxiv.org/abs/2104.09864
- OpenAI gpt-oss: https://openai.com/index/introducing-gpt-oss/
- DeepSeek-V4 Preview: https://api-docs.deepseek.com/news/news260424
- DeepSeek-V4 Transformers doc: https://huggingface.co/docs/transformers/en/model_doc/deepseek_v4
- ChatGPT context windows: https://help.openai.com/en/articles/11909943
