# AI Paper Content Factory

<p align="center">
  <a href="#中文">中文</a> | <a href="#english">English</a>
</p>

<a id="中文"></a>

## 中文

AI Paper Content Factory 是一个本地优先的论文内容生产线模板仓库，用来把 AI 论文或 AIGC 主题转成可审核的多平台内容资产包：博客、口播脚本、字幕、结构图、HyperFrames 视频草稿、封面约束、平台发布包和质量门禁。

### 核心功能

- 论文输入到结构化资产：`topic.yaml -> claims.json -> voiceover.md -> storyboard.json -> FRAME.md`。
- 多平台适配：抖音、小红书、B 站、YouTube Shorts、YouTube、TikTok、X。
- 中英文模式：国内平台中文表达，海外平台英文表达，平台 profile 控制尺寸、字幕和 hook 风格。
- 视频编排：HyperFrames 负责最终 HTML composition 和显式视频渲染；默认测试不跑真实渲染。
- 公式标准化：公式必须完整、清晰、可标注，可用论文截图、公式软件截图、KaTeX/MathJax/SVG 或 Manim。
- 广告创意方向：用 `Ogilvy Creative Contract` 把 Big Idea、headline as mini-ad、facts before decoration、visual hero、proof object、brand consistency 固定为脚本、封面和首屏视觉约束。
- 口播 TTS 主线：IndexTTS2 优先；IndexTTS 1.5 / CosyVoice 作为备选；个人音色相似度暂时降级为实验分支，必须 sample-first、ASR diff 和人工审核。
- 发布前质量门：`qa_report.json`、pipeline map、render freshness fingerprint、封面 safe area、字幕避让和人工审核。

### Skills

| Skill | 作用 |
| --- | --- |
| `episode-orchestrator` | 创建 episode 工作区并协调流程 |
| `source-harvester` | 采集论文、arXiv、GitHub、官方文档等来源 |
| `research-to-claims` | 把研究资料转成可追溯 claims |
| `script-storyboard-writer` | 生成 hook、口播、分镜和博客草稿 |
| `technical-script-reviewer` | 审核论文解释是否技术准确 |
| `script-humanizer-zh` | 中文自然化，但不改变技术含义 |
| `short-video-opening-optimizer` | 优化 0-3 秒开场、首帧和平台 hook |
| `ogilvy-creative-director` | 把论文主张转成 Big Idea、封面标题、视觉主角和证据对象 |
| `frame-spec-writer` | 生成 `DESIGN.md -> FRAME.md -> episode FRAME.md` 视觉合同 |
| `visual-orchestrator` | 分配 SVG、Manim、HyperFrames、图表等视觉引擎 |
| `voiceover-adapter` | 管理授权声音、导入或生成口播音频 |
| `voiceover-emotion-coach` | 保留原版 AI 声线，生成低强度 `delivery_style` 和可选情绪提示 |
| `tts-voiceover-quality-gate` | 阻断噪音、重复、漏词、参考文本回灌等 TTS 风险 |
| `sound-cue-designer` | 设计克制音效，把关键公式节点变成 auditory bookmarks |
| `caption-aligner` | 根据口播音频生成 SRT/VTT 字幕 |
| `hyperframes-composer` | 组合 storyboard、资产、音频和字幕为 HyperFrames composition |
| `platform-format-adapter` | 生成本地多平台发布包和尺寸检查，不自动发布 |
| `quality-gate` | 汇总合同产物和运行态缺口 |
| `workflow-optimizer` | 从 QA 和人工审核中提炼下一轮改进建议 |

### 安全与边界

- 不提交 API key、`.env`、个人声音原始 wav、MP4 渲染产物或平台登录信息。
- 不自动发布到任何平台。
- 默认 `npm test` 不调用真实 LLM、TTS、HyperFrames render、Manim 或网络服务。
- 个人声音必须有授权录音和 voice profile manifest。

### 快速开始

```bash
npm install
npm run validate:topic
npm run hooks:score
npm run episode:contract-smoke
npm run quality:gate
npm test
npm run typecheck
```

<a id="english"></a>

## English

AI Paper Content Factory is a local-first template repository for turning AI papers or AIGC topics into reviewable multi-platform content packages: blog drafts, voiceover scripts, subtitles, diagrams, HyperFrames video drafts, cover constraints, publish packs, and quality gates.

### Features

- Paper-to-assets pipeline: `topic.yaml -> claims.json -> voiceover.md -> storyboard.json -> FRAME.md`.
- Multi-platform output: Douyin, Xiaohongshu, Bilibili, YouTube Shorts, YouTube, TikTok, and X.
- Chinese and English modes: domestic platforms use Chinese-native writing, overseas platforms use English adaptation, while platform profiles control size, subtitles, and hook style.
- Video composition: HyperFrames builds the final HTML composition and explicit renders; default tests never run real rendering.
- Formula standardization: formulas must be complete, sharp, and annotatable via paper crops, formula-editor screenshots, KaTeX/MathJax/SVG, or Manim.
- Creative direction: the `Ogilvy Creative Contract` turns Big Idea, headline as mini-ad, facts before decoration, visual hero, proof object, and brand consistency into script, cover, and first-frame constraints.
- Voiceover TTS workflow: IndexTTS2 is the preferred mainline; IndexTTS 1.5 and CosyVoice are fallbacks; personal timbre cloning is an experimental branch behind sample-first, ASR diff, and human approval gates.
- Review-before-render gates: `qa_report.json`, pipeline maps, render freshness fingerprints, cover safe areas, subtitle overlap checks, and human review.

### Skills

| Skill | Purpose |
| --- | --- |
| `episode-orchestrator` | Creates episode workspaces and coordinates the workflow |
| `source-harvester` | Collects paper, arXiv, GitHub, and official documentation sources |
| `research-to-claims` | Converts research material into traceable claims |
| `script-storyboard-writer` | Produces hooks, voiceover, storyboard, and blog drafts |
| `technical-script-reviewer` | Checks technical correctness of paper explanations |
| `script-humanizer-zh` | Improves Chinese readability without changing technical meaning |
| `short-video-opening-optimizer` | Optimizes the first 0-3 seconds, first frame, and platform hooks |
| `ogilvy-creative-director` | Turns paper claims into a Big Idea, cover headline, visual hero, and proof object |
| `frame-spec-writer` | Builds the `DESIGN.md -> FRAME.md -> episode FRAME.md` visual contract |
| `visual-orchestrator` | Assigns SVG, Manim, HyperFrames, and chart engines |
| `voiceover-adapter` | Manages authorized voice input and voiceover import/generation |
| `voiceover-emotion-coach` | Preserves the original AI voice character with low-intensity `delivery_style` controls |
| `tts-voiceover-quality-gate` | Blocks noise, repetition, skipped words, and reference-text leakage |
| `sound-cue-designer` | Designs restrained auditory bookmarks for formula and scene turns |
| `caption-aligner` | Generates SRT/VTT subtitles from voiceover audio |
| `hyperframes-composer` | Combines storyboard, assets, audio, and captions into HyperFrames compositions |
| `platform-format-adapter` | Builds local platform publish manifests and format checks without auto-publishing |
| `quality-gate` | Reports contract artifacts and runtime gaps |
| `workflow-optimizer` | Turns QA and human review feedback into workflow improvements |

### Safety Boundaries

- Do not commit API keys, `.env` files, raw personal-voice wav files, MP4 render outputs, or platform login material.
- Do not auto-publish to any platform.
- Default `npm test` does not call real LLM, TTS, HyperFrames render, Manim, or network services.
- Personal voice workflows require consent audio and a voice profile manifest.

### Quick Start

```bash
npm install
npm run validate:topic
npm run hooks:score
npm run episode:contract-smoke
npm run quality:gate
npm test
npm run typecheck
```

---

## 详细中文文档

本仓库用于把 AI 论文或 AIGC 主题生产成可审核的多平台内容资产包。P0 阶段的目标不是生成最终成片或自动发布，而是先把每集内容生产的输入、平台适配、Hook、合同烟测产物和质量报告固定下来，让后续真实声音、字幕、视频渲染和发布包可以在明确边界内继续推进。

## P0 Scope

P0 只验证合同层：

- episode topic contract
- platform profile contract
- Hook Lab generation/scoring
- P0 contract-smoke artifacts
- runtime adapter status for voice, captions, video draft, and publish pack
- quality gate report

P0 不调用真实 LLM、TTS、HyperFrames MP4 渲染、Manim 或发布平台。默认验证必须保持确定性和低成本；真实 provider smoke 只能作为显式的独立检查，不进入 `npm test` 基线。

## First Episode

第一集使用 `episodes/ep01_attention_is_all_you_need/topic.yaml` 作为入口，按下面命令验证 P0 合同链路：

```bash
npm install
npm run validate:topic
npm run hooks:score
npm run episode:contract-smoke
npm run voiceover:check
npm run captions:align
npm run video:hyperframes-draft
npm run publish:pack
npm run quality:gate
npm run pipeline:map
npm test
npm run typecheck
```

预期质量门输出：

```text
OK quality status=partial blocking_items=3
```

`partial` 是正确结果，因为真实个人声音、字幕和 MP4 视频渲染尚未完成。当前阶段只确认可审核资产包的合同骨架、运行态适配器和质量门能如实报告缺口；不要把真实声音克隆、真实视频生成或真实平台发布理解为已经完成。

## Workflow Dashboard

本仓库提供一个 Dagu workflow 示例：

```text
dagu/ai-paper-content-factory-ep01.yaml
```

Dagu 面板负责串联 P0 命令：

```text
validate_topic -> hooks_score -> contract_smoke -> voiceover_audio -> captions -> video_draft -> publish_pack -> quality_gate -> pipeline_map -> test -> typecheck -> inspect_reports
```

完整内容生产链路在进入成片或发布包前还需要经过这些 skill 门禁：

```text
technical-script-reviewer -> ogilvy-creative-director -> script-humanizer-zh -> short-video-opening-optimizer -> frame-spec-writer -> hyperframes-composer -> platform-format-adapter
```

这个 workflow 使用当前本机仓库路径 `C:/Users/Rome/Documents/Paper_every_day` 作为 `working_dir`。如果仓库迁移到别的位置，需要同步调整 YAML 里的 `working_dir`。

本机 Dagu 安装路径：

```text
D:/Shanvisorin_platform/dagu-npm
D:/Shanvisorin_platform/dagu-home/dags/ai-paper-content-factory-ep01.yaml
```

打开面板：

```text
http://localhost:8080
```

第一次进入需要创建 Dagu 管理员账号。进入后在 `Definitions` 中打开 `ai-paper-content-factory-ep01`，点击运行即可看到每个节点的状态和日志。

## Task Retrospective Index

新开 episode、重做视频、切换 TTS 引擎或修改 HyperFrames 动画前，必须先读取相关前序复盘；不要只看当前 prompt 或当前脚本文稿。复盘文档是任务入口上下文，不等于所有候选规则已经晋升为主线规则。

默认读取顺序：

1. `episodes/{episode_id}/review/*.md`：人工审核、失败复盘、候选改进。
2. `episodes/{episode_id}/qa/*.json`：质量门禁、pipeline map、freshness 结果。
3. `episodes/{episode_id}/video_script/FRAME.md`：单集公式、图表、字幕避让和动画合同。
4. `docs/visual_system/FRAME.md`：账号级视觉和 HyperFrames 通用硬约束。
5. README 和 workflow spec 里的对应 contract：Voiceover、Pronunciation、Ogilvy、Review Before Render、HyperFrames。

当前已索引复盘：

- `episodes/ep03_multi_head_attention/review/ep03_retrospective_indextts2_animation_candidates.md`：记录 EP03 的 IndexTTS2 切换候选、F5 fallback 边界、字幕/英文术语风险、HyperFrames 静态 PPT 化、公式对象、Figure 2 source-backed 资产、箭头/布局/文字溢出等可沉淀问题。

## Voiceover Runtime

个人声音录制文件放在：

```text
episodes/ep01_attention_is_all_you_need/voice/enrollment/
```

需要至少：

```text
consent.wav
reference_01.wav
```

当前默认节点 `npm run voiceover:check` 只检查授权和参考音频，不会训练模型，也不会调用 TTS。若已经通过 GPT-SoVITS WebUI 或其他授权方式生成了真实口播 `.wav`，可以显式导入：

```bash
npm run voiceover:import -- --input D:/path/to/generated_voiceover.wav
npm run captions:align
npm run video:hyperframes-draft
npm run publish:pack
npm run quality:gate
npm run pipeline:map
```

导入后才会生成：

```text
episodes/ep01_attention_is_all_you_need/audio/voiceover.wav
episodes/ep01_attention_is_all_you_need/audio/voiceover_manifest.json
```

随后字幕节点会生成 `captions/subtitles.srt` 和 `captions/subtitles.vtt`，HyperFrames 节点会生成 HTML composition 草稿。MP4 渲染仍需后续显式接入 HyperFrames CLI，不属于默认 P0 测试。

## Voiceover Hard Gates

个人音色或克隆声音口播必须先过门禁，再进入完整音频、字幕和视频渲染。默认链路是：

```text
sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render
```

强约束：

- TTS 主线优先使用 IndexTTS2，目标是内容一致性、术语稳定、清晰度和音视频同步；不要把“像本人”放在“听清楚、少重复、术语不乱读”之前。
- IndexTTS 1.5 / CosyVoice 是备选；F5-TTS 和 GPT-SoVITS 保留为实验或兼容路径，不再作为 EP02 之后的默认主线。
- IndexTTS2 小样必须先覆盖 `seg_001`、`seg_010`、`seg_014`；三段通过后才允许全量分段生成。
- 个人声音必须有授权录音、voice profile manifest 和明确 allowed use。
- IndexTTS2、IndexTTS 1.5、CosyVoice、F5-TTS、GPT-SoVITS 等本地 TTS 引擎不能直接跑全量；必须 sample-first。
- F5-TTS 参考音频必须是 neutral 8-10s，不要包含本集主题词、`为什么重要` 或已审核口播句，避免 reference-text leakage。
- 代表性小样至少覆盖 `seg_001`、一个中段技术段如 `seg_010`、以及结尾或 CTA 段如 `seg_014`。
- 有本地 ASR 时必须运行 ASR transcript diff；没有 ASR 时要明确记录缺失，并保留人工听审为硬门禁。
- `source_text` 是已审核口播稿，`spoken_text` 是 TTS 友好稿；允许规范英文、数字、公式和多音字，但禁止偷偷注入未审核提示句。
- 重复句、参考文本回灌、英文术语读错、明显杂音、电流声、长静音或断点，都必须阻断全量生成。

对应项目 skill：

```text
.agents/skills/tts-voiceover-quality-gate/SKILL.md
```

## Voiceover Emotion Contract

口播可以更有重点，但默认不是换一种“老师表演风格”。`voiceover-emotion-coach` 在 `spoken_text` 锁定后、TTS 小样前运行，输出跨论文复用的 `delivery_style` 和可选引擎级 `engine_emotion_prompt`；第一原则是 `preserve_original_ai_voice`，保留原版 AI 声线特有的清晰、稳定和轻微机器感。

强约束：

- 默认目标是 `preserve_original_ai_voice`：不改变声音人格，不制造压迫感、主持腔、播音腔或老师训话感。
- `delivery_style` 只做 `low_intensity_prosody`：轻微重点、稳定节奏、公式和英文术语更清楚。
- IndexTTS2 默认使用 `use_emo_text=false`、`use_random=false`；`emo_text` / `emo_alpha` 只作为实验项，必须人工确认后再使用。
- 情绪提示不能写进 `source_text`、`spoken_text`、字幕或 HyperFrames 隐藏 narration cue；必须保持 no hidden narration cues。
- 情绪增强不能破坏 `ChatGPT`、`Claude`、`token`、`Attention`、`softmax`、`KV Cache`、`Multi-Head Attention` 等整体英文读法。
- 情绪增强仍然受 sample-first 约束；代表性小样、ASR transcript diff 和人工听审不被跳过。
- 每次听审反馈要进入 `workflow-optimizer` 的候选改进，而不是自动改 shared skill 或锁定脚本。

对应项目 skill：

```text
.agents/skills/voiceover-emotion-coach/SKILL.md
```

## Pronunciation Normalization Contract

进入 TTS 前必须把“审核稿”和“口播稿”分开。`source_text` 保留给字幕、博客和人工审核；`spoken_text` 只允许为发音、停顿、英文整体词、数字和公式符号做无歧义改写，不能加入未审核的新句子。

强约束：

- `更准确地说` 这类短语容易把 `地` 误读成 `di`；`spoken_text` 应写成 `准确一点说`。
- 状语里的 `地` 默认按轻声 `de` 处理；如果 TTS 不稳，改写为无 `地` 表达。
- `按行归一化` 可作为技术字幕，但口播优先改成 `对每个当前 token 的那一组分数，分别做归一化`。
- `QK^T` 的口播固定为 `Q 乘 K 转置`；`sqrt(d_k)` 固定为 `根号下 d k`；`d_k` 固定为 `d k`。
- 英文产品名和技术词保持整体英文读法，例如 `Attention`、`softmax`、`token`、`ChatGPT`、`Claude`、`FlashAttention`、`GQA`、`MQA`、`KV Cache`、`vLLM`、`Multi-Head Attention`。
- 发音规范必须进入 episode 级提示词，并在 ASR transcript diff 或人工听审中重点检查。

对应项目 skill：

```text
.agents/skills/voiceover-adapter/SKILL.md
```

## Script Quality Contract

口播稿不是普通论文解释，而是“这篇论文为什么影响今天的 modern LLM 时代”的解释。每个正式视频脚本必须满足：

- 一个核心 thesis，不能同时讲多个主问题。
- 开场必须有平台化 Hook，不能用“大家好，今天我们来讲...”。
- 用 Feynman 方式解释关键机制：先给直观例子，再映射回真实机制。
- 必须连接现代 AI 语境，例如 ChatGPT、Claude、Agent、Sora、MCP、KV Cache、FlashAttention 或 vLLM，但不能混淆模型层、系统层和协议层。
- Attention 应解释为 weighted aggregation，不要说成神奇地“看懂全句”。
- Q/K/V 是 learned projection spaces，不是三个固定语义角色。
- Multi-Head Attention 的 head 是训练中形成的表示子空间，不是人工指定专家。
- 结尾要有清晰的下一集 CTA，例如继续拆 Q 和 K 的相乘过程。

对应项目 skill：

```text
.agents/skills/technical-script-reviewer/SKILL.md
```

## Ogilvy Creative Contract

论文视频不是把知识点堆满屏幕，而是用一个可证明、可记住、可延展的创意主张带观众进入论文。`ogilvy-creative-director` 在 `technical-script-reviewer` 之后、`short-video-opening-optimizer` 和 `frame-spec-writer` 之前运行；它不改事实来源、不改技术判断，只把脚本、封面和首屏视觉统一到一个传播承诺。

强约束：

- `Big Idea`：每集只能有一个观众能复述的核心承诺，必须连接论文机制和今天的 AI 使用场景。
- `headline as mini-ad`：封面标题、首屏大字和开场第一句要像一条微型广告，直接说出观看收益，而不是普通章节标题。
- `facts before decoration`：先锁定 claim、公式、论文图、代码或工程证据，再决定动效、配色、光效、音效。
- `visual hero`：每个开场和关键段落只保留一个主视觉对象，让观众第一眼知道该看哪里。
- `proof object`：重要判断必须有可上屏证据对象，例如原论文 Figure、公式、代码片段、benchmark 或 source-backed 结构图。
- `brand consistency`：系列封面、标题语气、术语、色彩层级、字幕位置和 proof object 呈现方式要保持一致，避免每集像不同账号。
- `research before creative`：先研究论文、同类爆款解释、平台语境和受众语言，再写开场和封面。
- `caption as micro-headline`：每 5-8 秒字幕都应像一个微型标题，提供新信息、关键术语和明确观看收益。
- `consumer language`：先用观众日常语言命中问题，再映射到论文术语、公式或工程机制。
- `numbered facts`：多个证据点优先用编号事实表达，减少连词堆叠，让观众可扫描。
- `news-style layout`：版面像新闻解释页一样清楚自然，减少广告感装饰和无意义 logo 堆叠。
- `image captions`：每个论文图、公式截图、代码图或 benchmark 图都要有简短说明文字。
- `avoid reverse type`：长解释文本避免白字黑底，暗色画面也必须保留可读文字块。
- `avoid ornate fonts`：标题、字幕、公式和图注不使用花哨字体，优先可读性。

广告版式硬规则：

- `no reverse type or colored body panels`：正文、字幕、公式说明和图注必须使用深色文字配浅色或纸面背景；不要使用反白文字，不要把长正文放在黑色、深色或彩色底板上。
- `readable type floor`：正文可读性底线参考 9pt，正式解释文本优先不低于 11pt；视频端按手机观看放大执行，不能靠缩小字号塞内容。
- `serif for reading, sans for posters`：长段解释、研究介绍和机制说明优先使用高可读衬线或传统阅读字体；封面、户外式 5 秒信息和大标题可以使用大号无衬线字体。
- `one type system`：同一画面内标题、正文、图注尽量保持同一字体系统，少用字体、字号和粗细变化；不要靠混字体制造层级。
- `leading and paragraph air`：段落之间必须有足够行距和呼吸感；复杂信息拆成短段、编号或图标，不硬塞成一坨文字。
- `avoid all-caps`：英文标题和字幕不要整句全大写；保留 `QKV`、`MHA`、`GQA`、`MQA`、`MoE` 等必要专业缩写。
- `do not print headlines over images`：不要把标题、字幕或说明文字压在论文图、公式、代码截图的关键内容上；图文分区，图片下方用简短说明。
- `five-second poster rule`：封面、首屏和海报式帧必须 5 秒内读懂，元素不超过三类，颜色强烈但干净，主体和论文/机制名称一眼可见。

对应项目 skill：

```text
.agents/skills/ogilvy-creative-director/SKILL.md
```

## Review Before Render

不要把命令跑完当成视频完成。进入正式渲染、封面、发布包或对外发布前，必须有新鲜证据：

- `qa_report.json.status` 必须是 `pass`，否则只能说 `partial` 或 `failed`。
- 真实 TTS、真实 HyperFrames render、真实 provider smoke 必须和默认 `npm test` 分开记录。
- Dagu 节点要能看到关键门禁进度，而不只是一个长命令成功：`sample`、`asr_diff`、`human_approval`、`full_tts`、`merge`、`captions`、`render`。
- 每次音频或脚本变更后，重新跑小样门禁或说明没有重跑的原因。
- 最终结论必须报告验证项和未验证项，不能用旧报告替代当前产物。

## Sound Cue Design Contract

音效只服务理解，不服务热闹。每个音效必须是公式、视觉动作或段落转折的 auditory bookmarks，不能盖过个人口播，也不能影响字幕和 ASR transcript diff。

强约束：

- 默认只在 opening、QK reveal、Q/K/V card taps、softmax normalization、weighted V aggregation、工程层级切换和 CTA 使用短音效。
- 音效应放在句子间隙或视觉动作点，do not overpower voiceover。
- 短音效建议比人声低 `12-18 dB`；背景音乐如存在，建议比人声低 `18-24 dB`。
- 不使用手机通知音、警报音、游戏音效、综艺模板音或高频尖锐 beep。
- 英文术语附近避免叠高频音效，例如 `Attention`、`softmax`、`FlashAttention`、`GQA`、`MQA`、`KV Cache`、`vLLM`。
- 音效 cue 只能写在 storyboard、FRAME、sound cue plan 或 HyperFrames prompt；不能写进 `spoken_text`。
- 含音效的最终混音必须进入人工听审；如果影响 ASR transcript diff、英文清晰度、字幕对齐或个人声音质感，降低或移除音效。

对应项目 skill：

```text
.agents/skills/sound-cue-designer/SKILL.md
```

## Visual Frame Spec Workflow

每篇论文视频在进入 HyperFrames composition 前，必须先通过视觉规范链路：

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `docs/visual_system/DESIGN.md` 定义账号级视觉身份：颜色、字体、中英文模式、封面 `safe90`、论文图和公式处理原则。
- `docs/visual_system/FRAME.md` 把视觉身份转成视频镜头规则：`1080x1920`、`1080x1440`、`1920x1080`、`1080x1080`、safe area、Caption Safe Area、Typography Floor、Frame Treatments、Paper Genre Treatment Registry、Pre-Render Frame Audit。
- `episodes/{paper_id}/video_script/FRAME.md` 定义单篇论文的执行规则：paper figure spotlight、formula explanation、platform variants、需要出现的原论文图片、公式图片或 Manim 场景、字幕避让和渲染 QA。
- 公式必须按 Formula Asset Contract 进入 HyperFrames：完整公式对象、canonical LaTeX/文本、清晰截图或 SVG/MathJax/KaTeX/Manim 来源、标注目标、safe-area bounding box 和关键帧审核。

`frame-spec-writer` 负责生成或更新 episode FRAME；`hyperframes-composer` 必须读取 episode FRAME 后再生成 HTML composition。这个链路不运行真实 HyperFrames render，不替代 technical-script-reviewer、tts-voiceover-quality-gate 或人工审核。

## HyperFrames Animation Hard Gates

后续论文视频只要进入 HyperFrames 动画设计，就必须先满足下面的强约束：

- 论文公式和原论文图不能只当“风格参考图”。必须走 `source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render`。
- 含技术推导的场景必须展示 reasoning path，不能退化成概念说明卡片。Scaled Dot-Product Attention 的最低链路是 `Q -> K matching -> score matrix QK^T -> /√(d_k) -> row-wise softmax -> weighted V -> output O`。
- 公式必须是完整、清晰、可标注的独立对象；字幕不得覆盖公式 bounding box；视觉、字幕和口播必须锁定同一含义，例如视觉显示 `√(d_k)`，英文口播读作 `the square root of d k`，中文口播读作 `根号下 d k`。
- 箭头和连线必须连接到节点、卡片、矩阵、公式项或输出圆的外边界，不能插入图框内部，不能穿过文字、公式、字幕或 source label。
- 箭头头部和连线粗细必须保持一致；重点用颜色、透明度、逐步 reveal 或音效 cue 表达，不用放大箭头表达。
- 流程推导默认使用直线 process arrows；关系发散、信息汇聚和加权读取使用统一曲率的单段 flow arcs；禁止随意多段弯折曲线。
- HyperFrames 场景匹配必须“具体规则优先”：例如 `kv_cache_cached_projection` 先匹配 KV Cache 组件，不能被泛化的 `projection` 规则吞掉。
- 每个正式 render 前必须先生成并人工查看关键帧：QK 匹配、公式完整显示、softmax 按行归一化、weighted V 汇聚、KV Cache 或工程层级场景。
- 关键帧审核必须检查：无穿模、无漂移、无箭头大小不一致、无公式溢出、无字幕遮挡、视觉主体居中且没有大面积无意义留白。

这些规则来自 EP02 英文版动画问题复盘：当参考图只作为 style prompt、没有变成 frame contract 和组件实现时，HyperFrames 容易输出“文字卡片正确，但推导链、公式和指向关系不正确”的视频。

### HyperFrames Animation Hard Gates (English)

Any paper episode that enters HyperFrames animation design must satisfy these gates before render:

- Paper formulas and original figures must not be used only as style references. They must follow `source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render`.
- Technical derivation scenes must preserve the reasoning path instead of becoming generic explainer cards. For Scaled Dot-Product Attention, the minimum chain is `Q -> K matching -> score matrix QK^T -> /√(d_k) -> row-wise softmax -> weighted V -> output O`.
- Formulas must be complete, sharp, annotatable visual objects. Captions must not cover the formula bounding box. Visual, caption, and spoken forms must share the same meaning.
- Arrows and connectors must anchor to the outer edge of nodes, cards, matrices, formula terms, or output circles. They must not pierce the interior of visual objects or cross load-bearing text.
- Arrowheads and connector strokes must stay consistent. Use color, opacity, staged reveal, or restrained sound cues for emphasis instead of changing arrow size.
- Step derivations use straight process arrows by default. Relation fan-out, weighted reading, and aggregation use single-segment flow arcs with consistent curvature. Arbitrary multi-bend curves are not allowed.
- Scene matching must be specific-first. For example, `kv_cache_cached_projection` must match the KV Cache component before any generic `projection` fallback.
- Before final render, generate and inspect review keyframes for QK matching, full formula display, row-wise softmax, weighted V aggregation, and KV Cache or engineering-layer scenes.

## Platform Content Workflow Skills

脚本、开场和发布包现在拆成三个可复用 skill，避免每个平台临时改提示词：

- `script-humanizer-zh` 是可选中文自然化层，必须在 `technical-script-reviewer` 之后、`spoken_text` 锁定之前运行；它只能改善中文节奏和术语一致性，不能改 approved claim、公式或锁定口播。
- `short-video-opening-optimizer` 在 storyboard/frame lock 之前运行，按 Douyin、Xiaohongshu、Bilibili、TikTok、YouTube Shorts、YouTube、X 的平台语境评分 `0-3s` opening hook、visual hook、verbal hook 和 text overlay。
- `platform-format-adapter` 使用 `platform_profiles/*.yaml`，把 cover、video、captions 和 metadata 整理为本地 `publish/platform_manifest.json`；默认竖版 cover 仍遵守 `safe90`，尺寸只能来自 profile，当前包括 `1080x1920`、小红书 `1080x1440`、`1920x1080`、`1080x1080`。

这些 skill 只做本地审核、文本优化和平台包准备，不 auto-publish、不上传媒体、不绕过人工审核。

## Pipeline Map

运行：

```bash
npm run pipeline:map
```

会生成：

```text
episodes/ep01_attention_is_all_you_need/qa/pipeline_map.json
episodes/ep01_attention_is_all_you_need/qa/pipeline_map.md
```

`pipeline_map.md` 用 Mermaid 和 I/O 表展示每个流程节点的输入、输出、命令、状态和阻断项。`pipeline_map.json` 是同一份信息的机器可读版本，后续可以给自定义 Web 面板、Dagu artifact、Notion/飞书同步或发布包生成器使用。

## Cover Export Constraint

短视频竖版封面默认使用抖音安全区版本，后续生成、缩放、审核和发布包整理都按这个强约束执行：

```text
File: episodes/ep01_attention_is_all_you_need/video_script/cover_transformer_ai_v1_1080x1920_safe90.png
Format: PNG
Canvas: 1080x1920
Aspect ratio: 9:16
Content scale: 90%
Safe padding: 54px left/right, 96px top/bottom
Padding treatment: black padding
```

这个规则来自第一集封面实测：原始 1080x1920 全幅封面在抖音上传封面时容易边缘溢出，因此最终版保留 `1080x1920` 画布，把内容整体缩小到 `90%` 并补 `black padding`。不要为了填满画布再次放大内容，除非用户明确要求重新设计封面。

后续封面设计参考来源固定记录如下，避免每次重新搜索：

- `youtube-thumbnail`: https://github.com/charlie947/social-media-skills/blob/main/skills/youtube-thumbnail/SKILL.md
- `marketing-short-video-editing-coach`: https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-short-video-editing-coach.md
- `awesome-nanobanana-pro`: https://github.com/ZeroLu/awesome-nanobanana-pro

对应项目 skill：

```text
.agents/skills/short-video-cover-constraints/SKILL.md
```
