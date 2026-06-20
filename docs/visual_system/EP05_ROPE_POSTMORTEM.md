# EP05 RoPE 问题复盘与后续设计参考

## Edit Comparison

- Original: EP05 制作过程中的问题分散在用户截图反馈、单个 bug 记录、QA closeout 和全局 Frame/MATLAB 规则里，后续 episode 需要靠人工回忆才能避免同类问题。
- Revised: 本文把 EP05 的问题按语义、证据、广告学、MATLAB、字幕、TTS、音效、布局、质量门禁九个层面归纳，并给出“现象 -> 推导原因 -> 预防规则 -> 验证方式”。
- Reason / Impact: 后续 EP06+ 的分镜、动画、TTS、字幕、MATLAB 资产和 PR 审核可以直接复用本文，不再把同类错误带入最终 MP4。

## 适用范围

本文适用于所有 AI paper explainer 短视频，尤其是包含以下元素的 episode：

- 公式推导或论文公式解释；
- MATLAB、Manim、HyperFrames 混合视觉资产；
- 个人音色 TTS、IndexTTS2、F5-TTS 或分段音频缓存；
- 动态字幕烧录；
- 长上下文、KV cache、Attention、RoPE、ALiBi、GQA、MLA 等专业术语解释；
- 用生活类比解释论文机制的 Feynman 场景。

## 总推导

EP05 的问题不是单点 bug，而是跨通道合同没有先锁死：

1. `source_text`、`spoken_text`、`caption_text`、`visual_text` 没有一开始分开管理，导致专业符号既想给观众看，又被 TTS 直接读。
2. MATLAB 资产一度被当成“整页图片或整页动画”，而不是局部证明物，导致缩小、空白、遮挡和静态伪动画。
3. HyperFrames 最终合成一度把字幕、公式、卡片和 MATLAB 资产当成同一个视觉层处理，导致抖动、缩放、漂移和重叠。
4. 广告学审核没有在每张动画图片进入成片前强制执行，导致局部来源名、制作提示词、空白页和弱证明物出现在观众画面里。
5. 音频链路缺少“当前文稿 -> 当前 wav -> 当前 SFX -> 当前 MP4”的新鲜度门禁，导致旧音频和错误读音有机会混进最终视频。

后续制作的核心规则是：先锁合同，再生成资产；先抽帧审核，再渲染 MP4；先证明音频新鲜，再进入最终合成。

## 问题矩阵

| 层面 | EP05 现象 | 推导原因 | 预防规则 | 验证方式 |
| --- | --- | --- | --- | --- |
| 技术语义 | 曾出现“RoPE 返回相对距离”“点积后只剩距离”“RoPE 提高准确度”这类容易过度简化的表达 | Big Idea 先行，但技术限定没有同步写进口播和字幕 | 表达为“Q/K 旋转后做点积，位置相关项依赖相对位移”；同时说明内容向量仍参与匹配，RoPE 是位置归纳偏置，不是万能准确率开关 | `technical-script-reviewer` 审稿；检索禁用表达；最终口播和字幕一致 |
| 证据边界 | ChatGPT、Qwen2.5-Omni、DeepSeek、gpt-oss 等例子一度混用 | 现代模型例子没有分成“公开实现证据”和“产品语境” | 公开模型证据必须落到 source-backed 文档；专有模型未公开位置编码细节时只能作为语境，不作实现证据 | `research-to-claims` 或人工来源表；画面 source label；QA 记录 |
| 标题与 Hook | 页面标题曾缺少 EP05，或用 Harvard/RoFormer 局部来源名替代集标题 | 局部证明物标题抢占了 episode identity | 每页顶部固定 `EP05 · 为什么现代大模型都绕不开 RoPE？`；来源名只作为卡片标题或 source label | 抽帧检查所有主场景标题；广告学逐帧 checklist |
| 广告学画面 | 画面一度有大面积空白、多个 competing hero、绿色主色、弱 proof object | 动画图片没有逐张回答 Big Idea / Proof Object / Visual Hero / Caption as Micro-headline | 每张动画图片进入成片前必须通过广告学四问；空白处补公式、代码、计算结果、类比映射或 source-backed diagram，不用装饰填充 | `ep05_frame_ad_gate_checklist.md` 类型的 per-frame checklist |
| MATLAB 资产 | 整页 MATLAB 图被缩成小图，动画和图片尺寸不匹配，局部公式/图表太小 | MATLAB 被当成完整页面渲染器，而不是局部视觉 adapter | MATLAB 只产出局部证明物：公式、旋转图、数值条、关键帧；HyperFrames 负责最终排版和字幕 | MATLAB manifest 记录 asset role；HyperFrames 抽帧确认局部资产可读 |
| MATLAB 动画 | MP4 看起来像静态图，或文字/公式跟着动、缩放、闪烁 | Motion 目标不明确，静态文字层和运动几何层混在一起 | 文字、公式、标题、字幕槽固定；只移动 Q/K 向量、箭头、相对位移条、局部高亮、计数填充 | 抽取相邻帧；检查静态层像素位置不漂移，运动层有语义变化 |
| 公式表达 | 公式曾像字符拼凑，公式框偏移，高亮框不对齐 | 公式没有作为 protected math object 管理 | 公式用 LaTeX/KaTeX/MathJax/MATLAB 数学资产或清晰论文 crop；高亮必须绑定 exact formula term | 公式 bounding box 和 highlight target 检查；手机尺寸预览 |
| RoPE 圆盘语义 | 箭头与圆盘脱离、箭头头太大、看起来像 token 在句子平面移动 | 圆盘语义没有和论文机制绑定，几何锚点不稳定 | 圆盘只表示二维维度块旋转；箭头从圆心出发，端点清楚；旁注说明不是 token 平面移动 | 关键帧检查箭头锚点、端点、颜色、标签和旁注 |
| 字幕 | 动态字幕曾被误解成进度条；字幕面积过大；字幕与口播不匹配；制作提示词烧录 | 没有区分 subtitle timing、micro-headline、production cue | 动态字幕是固定槽位按口播时间替换；不得显示 `读作`、`视觉焦点`、`教学边界`、`Hook`、`QA` 等制作词 | caption JSON overlap scan；禁词 scan；final MP4 burned subtitle 抽帧 |
| TTS 发音 | `K` 被读成近似 kai；`长上下文`多音字读错；`Q/K`、`KV cache`风险高 | 视觉符号被直接送进 TTS；专业缩写未做 spoken_text 合同 | `source_text` 保留专业写法，`spoken_text` 改为语义读法：`Key 向量`、`Query 向量和 Key 向量`、`Key Value cache`、`更大输入范围` | pronunciation manifest gate；必要时 ASR / 人工听审 |
| 音频新鲜度 | 文稿已改但 MP4 可能复用旧 wav；IndexTTS2 批量失败后残留旧片段 | 分段 TTS 缓存没有强制失效和 freshness 校验 | 最终构建前检查关键 wav 修改时间晚于当前 manifest；失败后单段重跑，再小批次合成 | `audio:freshness-gate`；segment manifest 与 wav mtime 对比 |
| 音效 | 最终视频曾未按项目要求加入 SFX，或构建有机会退回无 SFX 音轨 | final build 允许静默 fallback 到普通 voiceover | 最终 MP4 必须使用 `voiceover.with_sfx.wav`；缺 SFX mix status 直接失败 | 构建脚本硬门禁；ffprobe 确认音轨；SFX mix report |
| 布局与重叠 | 标尺文字压线、公式高亮框漂移、字幕/底部卡片重叠、Outro “与”字异常 | 文本、线段、公式、字幕没有独立层和 bounding box；CJK/Latin 大字号混排存在 fallback 风险 | label / brace / track 分层；高亮用 exact bounding box；大字号 `English + 与 + 中文` 优先改写为 `和` 或顿号 | 抽帧 + phone-size preview；禁用短语检索；glyph 风险清单 |
| 空白页 | 某些场景中间大面积空白，缺少公式、代码或机制图 | 场景没有回答 viewer question，只靠字幕补解释 | 每屏必须有 proof object 或 mechanism object：公式、代码、数值表、旋转图、类比映射、source card 至少其一 | Squint test；frame checklist；大空白人工 P1 |
| MATLAB 版本 | R2026a 卡住时需要切换；后来要求 R2021b 优先 | 没有固定 render runtime policy | 本项目 MATLAB 资产默认 R2021b 优先；R2021b 卡住、崩溃、无有效输出或图形异常时记录原因并 fallback R2026a | invocation log；rendererinfo；keyframe evidence |
| QA 流程 | HTML 预览或单张截图看着没问题，最终 MP4 仍出现音频、字幕、重叠问题 | 中间产物被误当成最终验收 | 最终验收只认 final MP4：抽帧、音轨探测、字幕烧录、发音清单、音频新鲜度、SFX、人工听审 | final closeout + keyframe set + ffprobe + gate reports |

## 后续 Episode 的必备合同

每个 episode 在进入 TTS 或 render 前，必须至少有四份合同：

1. `claim_contract`: 哪些句子是论文事实、哪些是工程语境、哪些是类比。
2. `visual_contract`: 每个场景的 Big Idea、Proof Object、Visual Hero、Caption as Micro-headline。
3. `notation_contract`: 每个公式符号的 `visual_text`、`caption_text`、`spoken_text` 和读法边界。
4. `render_contract`: 使用的视觉引擎、局部资产、safe area、caption band、review keyframes、audio/SFX gate。

缺少任何一份，都不得进入最终 MP4 渲染。

## PR / 完成前审核清单

- [ ] 标题统一：每页保留 episode 标题，局部来源名不替代集标题。
- [ ] 证据明确：每个模型、论文、代码、公式都能追溯到 source-backed 证据或被标记为产品语境。
- [ ] 技术表达不过度简化：不说“RoPE 返回相对距离”“点积后只剩距离”“必然提高准确率”。
- [ ] MATLAB 资产局部化：不把整页 MATLAB MP4 缩进画面；公式、旋转图、数值条可读。
- [ ] 动画有语义运动：运动的是向量、箭头、相对位移或高亮，不是文字、公式和字幕槽。
- [ ] 公式是真公式资产：不是 HTML 字符拼凑；高亮框准确落在对应符号上。
- [ ] 字幕动态且同步：字幕跟口播时间一致，不用进度条，不显示制作提示词。
- [ ] TTS 发音已消歧：`Q`、`K`、`Q/K`、`KV cache`、`长上下文` 等高风险词通过 pronunciation gate。
- [ ] 音频是新音频：关键 wav 晚于当前 manifest，最终 MP4 不复用旧缓存。
- [ ] 音效已混入：最终视频使用带 SFX 的音轨，不静默 fallback。
- [ ] 抽帧无重叠：字幕、公式、线段、卡片、source label、CTA 不互相遮挡。
- [ ] 无空白页：每屏有 proof object、mechanism object 或 Feynman-to-mechanism mapping。
- [ ] 最终 MP4 探测通过：视频流、音频流、尺寸、时长符合预期。
- [ ] 人工听审记录：完整听过高风险片段，尤其专业缩写、多音字和下一集 CTA。

## 推荐执行顺序

1. 先写技术主张和禁用表述。
2. 再写广告学 Hook 和每帧 Big Idea。
3. 锁定 `source_text / spoken_text / caption_text / visual_text` 四通道合同。
4. 生成局部公式或 MATLAB 资产，不直接整页塞图。
5. 抽 keyframes，先修视觉问题，再生成音频。
6. 生成 TTS 后跑 pronunciation gate 和 freshness gate。
7. 混入 SFX 后才构建最终 MP4。
8. 从最终 MP4 抽帧和探测音轨，不用 HTML 预览替代验收。
9. 写 closeout，明确已验证和未验证项。

## EP05 可复用参考文件

- `episodes/ep05_rope_position_encoding/video_script/FRAME.md`
- `episodes/ep05_rope_position_encoding/review/ep05_frame_ad_gate_checklist.md`
- `episodes/ep05_rope_position_encoding/review/bug_2026-06-20_tts_k_pronunciation_and_stale_audio.md`
- `episodes/ep05_rope_position_encoding/review/bug_2026-06-20_context_distance_label_overlap.md`
- `episodes/ep05_rope_position_encoding/review/bug_2026-06-20_outro_yu_glyph_rendering.md`
- `episodes/ep05_rope_position_encoding/qa/ep05_final_mp4_closeout_2026-06-20.md`
