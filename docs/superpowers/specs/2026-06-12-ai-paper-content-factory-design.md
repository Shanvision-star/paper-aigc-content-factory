# AI Paper Content Factory 多平台模板仓库设计

## 目标

把一篇 AI 论文或一个 AIGC 主题，稳定生产为一套可审核、可复用、可持续优化的内容资产包：

- 博客长文
- PDF 推导文档
- 结构图与动态图资产
- 个人音色或内置音色口播
- 字幕
- 多比例视频草稿
- 多平台标题、简介、标签、封面和发布说明
- 质量报告和人工审核记录
- 多平台开场 Hook 候选、评分和选用记录

第一篇目标是《Attention Is All You Need》。系统第一阶段不追求全自动发布，而是生成可人工审核的发布包；人工确认后再由用户手动发布到抖音、小红书、B 站、YouTube、X 等平台。

## Gap Classification

当前任务是产品边界和文档设计缺口，不是代码缺口。

- 已确定：HyperFrames 可作为第一阶段默认视频编排层。
- 已确定：个人声音可进入第一篇口播链路，但必须通过授权、录音质量和 manifest 记录。
- 待实施：仓库骨架、数据契约、Skill 文件、脚本、质量门禁和第一篇 episode 目录。
- 非本阶段：自动发布、Dashboard、多个视频引擎并行主链路、未经审核的第三方 Skill 直接进入生产。

## Authority Order

1. `AGENTS.md` / 项目执行约束
2. 本设计文档
3. `pipelines/*.yml` 单集流水线配置
4. `platform_profiles/*.yaml` 平台规格
5. `.agents/skills/*/SKILL.md` 具体工作流说明
6. `episodes/*/` 实际产物和审核记录

当低层配置和高层设计冲突时，优先更新低层配置；不把临时实现写成完成态事实。

## 第一篇输入

第一篇使用已有深度研究报告作为本地研究起点：

```text
D:\Shanvisorin_platform\Paper_everyday\paper_desgin\attention_is_all_you_nedd_deep-research-report.md
```

该报告不能直接当作最终事实来源。第一阶段需要把它转成结构化研究资产：

- `research/sources.jsonl`
- `research/paper_notes.md`
- `research/claims.json`
- `research/timeline.json`

所有进入博客、PDF 和口播稿的关键事实，必须能追溯到 `claims.json` 的 `source_ids`。没有来源的内容只能标记为解释、类比或推断。

## 系统边界

### 当前主线

当前主线是一个本地模板仓库，用 Codex + Skills + 渲染脚本完成“论文到多平台内容包”的生产闭环。

### 非目标

- 不自动发布到抖音、小红书、B 站、YouTube、TikTok、X 或 Instagram。
- 不在第一阶段做 SaaS 后台。
- 不把第三方 Skill 直接视为可信供应链。
- 不把同一条视频强行原样分发到所有平台。
- 不默认使用未经授权的人声音色。
- 不把 GPT-SoVITS、F5-TTS、CosyVoice 等重模型运行环境塞进 Skill 本体。

### 设计原则

- 产物优先：先定义每集必须交付哪些文件，再决定工具。
- 契约优先：固定 `topic.yaml`、`claims.json`、`storyboard.json`、`assets_manifest.json`、`qa_report.json` 等状态文件。
- 少量 Skill：第一阶段只做 8 个生产 Skill + 1 个优化 Skill。
- 外部适配器：重模型和渲染器由脚本或本地服务承接，Skill 只管流程、输入输出和门禁。
- 人工审核前移：事实、叙事、低清视频三个关键点必须能被人工确认。
- Hook 是结构化产物，不是临时文案：每个平台至少生成 3 个开场候选，并记录选用理由、风险和评分。

## 核心架构

```text
topic.yaml
  -> episode-orchestrator
  -> source-harvester
  -> research-to-claims
  -> script-storyboard-writer (includes Hook Lab)
  -> visual-orchestrator
  -> parallel:
       visual assets
       voiceover audio
  -> caption-aligner
  -> hyperframes-composer
  -> quality-gate
  -> human-review
  -> workflow-optimizer
```

### 统一产物协议

Agent 会漂移，产物契约必须稳定。第一阶段固定以下文件：

```text
episodes/{episode_id}/
├── topic.yaml
├── research/
│   ├── sources.jsonl
│   ├── paper_notes.md
│   ├── claims.json
│   └── timeline.json
├── script/
│   ├── voiceover.md
│   ├── voice_segments.json
│   └── hooks.json
├── storyboard/
│   ├── storyboard.json
│   └── hook_variants.json
├── assets/
│   ├── assets_manifest.json
│   ├── diagrams/
│   ├── manim/
│   └── hyperframes/
├── voice/
│   ├── enrollment/
│   └── voice_profile_manifest.json
├── audio/
│   ├── voiceover.wav
│   └── voiceover_manifest.json
├── captions/
│   ├── subtitles.srt
│   └── subtitles.vtt
├── blog/
│   └── blog.md
├── pdf/
│   └── episode.pdf
├── renders/
├── publish/
│   ├── publish_pack.md
│   └── platform_manifests/
├── review/
│   ├── human_review.md
│   └── improvement_candidates.json
└── qa/
    ├── hook_report.json
    └── qa_report.json
```

### 数据合同

`topic.yaml` 是入口：

```yaml
episode_id: ep01_attention_is_all_you_need
title: "Attention Is All You Need 改变了什么"
paper:
  title: "Attention Is All You Need"
  arxiv_id: "1706.03762"
  local_research_report: "D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md"
audience:
  primary: "工程师 + AI 内容初学者"
targets:
  - douyin.zh-CN
  - xiaohongshu.zh-CN
  - bilibili.zh-CN
  - youtube-shorts.en-US
  - youtube-long.en-US
  - x.en-US
outputs:
  blog: true
  pdf: true
  video: true
  voiceover: true
  publish_pack: true
constraints:
  auto_publish: false
  require_primary_sources: true
  require_citation_gate: true
  require_human_review: true
  voice_mode: personal_voice_or_builtin_fallback
```

`claims.json` 是可信度核心：

```json
[
  {
    "claim_id": "c001",
    "claim": "Transformer 用 attention 取代 recurrent 和 convolutional sequence modeling。",
    "source_ids": ["src_001"],
    "confidence": "high",
    "used_in": ["blog", "script", "pdf"]
  }
]
```

`storyboard.json` 是视频和口播核心：

```json
[
  {
    "scene_id": "S01",
    "start": 0,
    "duration": 6,
    "voiceover": "你每天用的 ChatGPT、Claude，底层都绕不开一篇 2017 年论文。",
    "visual_type": "title_hook",
    "engine": "hyperframes",
    "caption": "今天的 AI，为什么都绕不开它？"
  }
]
```

`hooks.json` 是开场吸引力核心：

```json
{
  "episode_id": "ep01_attention_is_all_you_need",
  "platform": "douyin.zh-CN",
  "selected_hook_id": "hook_douyin_01",
  "variants": [
    {
      "hook_id": "hook_douyin_01",
      "pattern": "pain_point",
      "spoken_line": "如果你一看到 QKV 就断片，先看这 20 秒。",
      "on_screen_text": "QKV 到底是什么？",
      "visual_cue": "Q/K/V 三张卡片快速入场",
      "claim_ids": ["c_attention_qkv"],
      "risk_flags": [],
      "score": {
        "hook_strength": 9,
        "clarity": 8,
        "truthfulness": 9,
        "platform_fit": 9,
        "visual_potential": 9
      }
    }
  ]
}
```

## 8+1 Skill 切分

### 1. `episode-orchestrator`

职责：

- 读取 `topic.yaml`
- 创建 episode 工作区
- 按 DAG 调用其他 Skill
- 汇总 `dist/` 或 `publish/` 产物

边界：

- 不写长文内容。
- 不直接渲染视频。
- 不直接调用重模型。

### 2. `source-harvester`

职责：

- 读取本地深度研究报告。
- 抓取或记录论文、arXiv、官方文档、GitHub 项目等来源。
- 输出 `sources.jsonl`。

边界：

- 不写口播稿。
- 不把二手资料当 primary source。

### 3. `research-to-claims`

职责：

- 把论文和研究报告转成 `paper_notes.md`。
- 抽取 `claims.json`。
- 生成 `timeline.json`。

边界：

- 没有 `source_ids` 的关键事实不能进入最终脚本。

### 4. `script-storyboard-writer`

职责：

- 生成 `voiceover.md`。
- 生成 `voice_segments.json`。
- 生成 `hooks.json` 和 `hook_variants.json`。
- 生成 `storyboard.json`。
- 生成 `blog/blog.md` 和 PDF outline。

边界：

- 不直接生成音频。
- 不直接渲染视频。
- 不用无来源夸张结论做标题党。
- 不让通用开场白进入短视频第一幕。

### 5. `visual-orchestrator`

职责：

- 判断每个 scene 使用哪个视觉引擎。
- 生成 `assets_manifest.json`。
- 生成 Mermaid/D2/Manim/HyperFrames 的 visual specs。
- 将 Hook Lab 的 `visual_cue` 转成第一幕可渲染视觉动作。

决策规则：

- 公式、矩阵、attention score、softmax、位置编码：Manim
- 架构图、流程图、时间线：D2 或 Mermaid
- 社媒动效、字幕、转场、图文卡片：HyperFrames
- 热力图、柱状图、对比图：Python / matplotlib
- Remotion 和 Motion Canvas：第二阶段，不进 P0 主链路

### 6. `voiceover-adapter`

职责：

- 管理个人声音录制清单。
- 读取 `voice_segments.json`。
- 调用 `tts_openai.ts`、`tts_gpt_sovits_adapter.py` 或其他本地 adapter。
- 输出 `audio/voiceover.wav` 和 `audio/voiceover_manifest.json`。

边界：

- 不安装 CUDA。
- 不训练模型。
- 不维护 GPT-SoVITS WebUI。
- 不使用未经授权的他人声音。

### 7. `caption-aligner`

职责：

- 基于口播音频和脚本生成 `subtitles.srt` / `subtitles.vtt`。
- 检查字幕长度、时间轴和遮挡风险。

边界：

- 不改变原始事实内容。
- 字幕改写只能服务可读性，不改变论断。

### 8. `hyperframes-composer`

职责：

- 读取 `storyboard.json`、`assets_manifest.json`、`voiceover.wav` 和字幕。
- 生成 HyperFrames HTML composition。
- 先输出低清 draft，再输出平台 final render。

边界：

- 第一阶段只用 HyperFrames 做最终视频编排。
- 不同时维护 Remotion 主链路。

### 9. `workflow-optimizer`

职责：

- 读取 `qa_report.json`、截图/关键帧、音频检测、字幕检测、人工 `human_review.md`。
- 读取 `hook_report.json` 和人工对开场的保留/划走风险反馈。
- 输出 `review/improvement_candidates.json`。
- 提出可审核的 Skill、template、prompt、platform profile 或 quality gate 改进建议。

边界：

- 不自动改 `SKILL.md`。
- 不自动降低质量门禁。
- 不绕过人工审核。

## 个人声音录制与口播音频路径

个人声音可以进入第一篇，但必须走受控路径。

### 录音输入

建议先录两类样本：

- `voice/enrollment/consent.wav`：本人授权说明，说明该声音只用于个人论文内容口播。
- `voice/enrollment/reference_*.wav`：干净口播样本，建议 30-90 秒，环境安静、无背景音乐、无混响、语速自然。

录音内容建议包含：

- 日常自然句。
- 技术词，如 Transformer、Attention、QKV、Softmax、Embedding、AIGC。
- 短句和长句各一段。

### Voice Profile Manifest

```json
{
  "voice_profile_id": "rome_personal_zh_v1",
  "owner": "user_self",
  "consent_audio": "voice/enrollment/consent.wav",
  "reference_audio": [
    "voice/enrollment/reference_01.wav"
  ],
  "allowed_use": ["personal_ai_paper_voiceover"],
  "default_engine": "gpt_sovits_local",
  "fallback_engine": "openai_tts",
  "status": "pending_quality_check"
}
```

### TTS 模式

- `openai_tts`：第一阶段快速 fallback，用于先跑通口播文件和字幕链路。
- `gpt_sovits_local`：长期个人声音主引擎，通过本地 service 或 adapter 调用。
- `f5_tts_local` / `cosyvoice_local`：第二阶段 bakeoff，不阻塞第一篇。

### 音频质量门禁

- `voiceover.wav` 必须存在且可播放。
- `voiceover_manifest.json` 必须记录引擎、voice profile、输入文本 hash、输出路径、生成时间。
- 总时长与 storyboard 目标时长接近。
- 无明显削波、长静音或断裂。
- 若使用个人声音，必须存在 `consent.wav` 和 `voice_profile_manifest.json`。

## Hook Lab 与平台开场模式

Hook Lab 是 `script-storyboard-writer` 的子流程，不新增独立 Skill。它负责生成、评分和选择每个平台的开场方案。

### Hook 生成规则

每个平台至少生成 3 个候选，候选必须包含：

- 口播第一句。
- 屏幕大字。
- 首帧或前 3 秒视觉动作。
- 对应 claim 或说明其属于类比/解释。
- 风险标记，例如夸大、过度标题党、来源不足、受众不匹配。
- 五维评分：`hook_strength`、`clarity`、`truthfulness`、`platform_fit`、`visual_potential`。

### 常用 Hook Pattern

- 反常识：用一个合理但出乎意料的判断打断滑动。
- 结果先行：先告诉观众这篇论文改变了什么。
- 痛点代入：先命中学习障碍，如 QKV、Softmax、矩阵维度。
- 冲突对比：用 RNN vs Transformer 这类对比制造理解坡度。
- 视觉承诺：承诺用一张图或一段动画解释清楚。
- 权威锚点：说明论文、年份、影响范围，但不能夸大。
- 收藏承诺：强调这条内容值得保存和复看。
- 避坑提醒：先纠正常见误解，再进入解释。

### 平台开场策略

抖音中文：

- 前 0-3 秒必须有强钩子和明显视觉变化。
- 优先使用反常识、痛点代入、冲突对比、视觉承诺。
- 禁止用“大家好，今天我们来讲...”作为第一句。

小红书中文：

- 首屏优先服务封面和收藏价值。
- 优先使用收藏承诺、学习痛点、笔记感总结、避坑提醒。
- 标题和封面要能单独成立，视频第一句负责补充而不是重复封面。

B 站中文：

- 开场可以稍慢，但必须在 10 秒内给出本集问题和观看收益。
- 优先使用权威锚点、问题导向、结构预告。
- 允许保留论文上下文和公式路线。

YouTube Shorts 英文：

- 前 0-3 秒说明全球语境，减少中文平台梗。
- 优先使用结果先行、反常识、visual promise。
- 避免需要中文互联网背景才能理解的表达。

YouTube Long 英文：

- 开头要建立可信议程：why this paper matters, what viewers will understand, and how the episode is structured.
- 允许在 15-30 秒内铺垫，但不能失去问题意识。

X 英文：

- 开场要像一个观点或图解摘要，而不是完整讲课。
- 优先使用 bold claim、visual summary、thread lead-in。
- 画面中心安全区必须保留，方便 16:9 和 1:1 双版本裁切。

### 第一篇 Hook 示例

抖音：

- `如果你一看到 QKV 就断片，先看这 20 秒。`
- `Transformer 最厉害的不是更大，而是它不再一个字一个字读。`
- `今天的大模型，几乎都绕不开这篇 2017 年论文。`

小红书：

- `一张图看懂 Transformer 的核心。`
- `终于有人把 QKV 讲成人话了。`
- `读 Attention Is All You Need，我只抓这 5 个点。`

英文 Shorts：

- `Every modern LLM owes something to this 2017 paper.`
- `Attention did not make AI bigger first. It changed how models read.`
- `Q, K, and V sound abstract. Here is the simplest way to see them.`

## 多平台输出合同

### 抖音中文

用途：强钩子竖屏短视频。

默认输出：

- `renders/douyin_zh_1080x1920.mp4`
- `publish/douyin.md`
- `publish/douyin_cover.png`

内容要求：

- 语言：中文
- 比例：9:16
- 字幕：中文硬字幕
- 节奏：强钩子、短句、高密度视觉
- CTA：关注、收藏、下一集

### 小红书中文

用途：笔记感、收藏型、图文和视频兼容。

默认输出：

- `renders/xiaohongshu_zh_1080x1440.mp4`
- `publish/xiaohongshu.md`
- `publish/xiaohongshu_cover_3x4.png`
- `publish/xiaohongshu_cards/`

内容要求：

- 语言：中文
- 比例：优先 3:4，必要时补 9:16
- 字幕：中文硬字幕
- 标题：收藏型、解释型
- 额外输出：3-6 张图文卡片

### B 站中文

用途：横屏深度讲解和系列归档。

默认输出：

- `renders/bilibili_zh_1920x1080.mp4`
- `publish/bilibili.md`
- `publish/bilibili_cover_16x9.png`

内容要求：

- 语言：中文
- 比例：16:9
- 字幕：硬字幕版和可选无字幕版
- 节奏：允许更慢，保留公式、引用和上下文

### YouTube Shorts 英文

用途：海外短视频触达。

默认输出：

- `renders/youtube_shorts_en_1080x1920.mp4`
- `publish/youtube_shorts.md`

内容要求：

- 语言：英文
- 比例：9:16
- 字幕：英文硬字幕
- 文案：解释清楚背景，减少中文平台梗

### YouTube Long 英文

用途：海外长视频和系列沉淀。

默认输出：

- `renders/youtube_long_en_1920x1080.mp4`
- `publish/youtube_long.md`
- `publish/youtube_cover_16x9.png`

内容要求：

- 语言：英文
- 比例：16:9
- 字幕：SRT/VTT + 可选硬字幕版
- 描述：含章节、引用、GitHub/博客链接

### X 英文

用途：摘要传播和引流。

默认输出：

- `renders/x_en_1920x1080.mp4`
- `renders/x_en_1080x1080.mp4`
- `publish/x.md`

内容要求：

- 语言：英文
- 比例：16:9 和 1:1 双版本
- 文案：短观点 + 链接
- 视频：保留中心安全区，方便不同裁切

## 质量门禁

### Gate 0：输入门禁

- `topic.yaml` 存在。
- `paper.arxiv_id` 或可信本地研究输入存在。
- 目标平台明确。
- `auto_publish` 必须为 false。

### Gate 1：来源门禁

- 至少 1 个 primary source。
- 所有关键来源写入 `sources.jsonl`。
- 每个关键事实都有 `source_ids`。
- 本地深度研究报告只能作为研究输入，不能替代来源追踪。

### Gate 2：研究门禁

- `claims.json` 非空。
- 每条 claim 有 `source_ids` 和 `confidence`。
- 脚本、博客、PDF 的关键事实能回到 claim。

### Gate 3：Hook 门禁

- `script/hooks.json` 存在。
- `storyboard/hook_variants.json` 存在。
- 每个平台至少 3 个 hook 候选。
- 最终选中的 hook 必须有 `hook_id`、`pattern`、`spoken_line`、`on_screen_text`、`visual_cue` 和评分。
- 前 3 秒不能是泛泛介绍。
- Hook 不能使用无来源的夸张结论。
- 抖音版偏强钩子，小红书版偏收藏封面，B 站版偏可信议程，YouTube Shorts 版偏全球语境解释。
- `qa/hook_report.json` 必须记录候选得分、人工选择和淘汰原因。

### Gate 4：脚本门禁

- 全片只有一个核心 thesis。
- 口播时长在目标时长合理范围内。
- 每 8-12 秒有视觉变化。
- 中文和英文版本分别按受众重写，不允许直接机翻。
- 第一幕必须引用已选 `hook_id`。

### Gate 5：视觉门禁

- 每个 scene 有 `visual_type`。
- 每个 visual 有 `engine` 和 output。
- 每个平台至少输出截图或关键帧。
- 竖屏版本检查顶部、底部和中心安全区。
- 字幕不得遮挡公式关键部分。

### Gate 6：声音门禁

- `voiceover.wav` 存在且可播放。
- `voiceover_manifest.json` 存在。
- 总时长接近 storyboard。
- 无长静音、削波或明显断裂。
- 个人声音模式下必须有授权录音和 voice profile manifest。

### Gate 7：字幕门禁

- `subtitles.srt` 或 `subtitles.vtt` 存在。
- 中文每行建议不超过 18 个汉字。
- 英文每行建议不超过 42 个字符。
- 每条字幕建议 1.2s-4.5s。
- 字幕不遮挡核心图。

### Gate 8：发布门禁

- `blog.md` 存在。
- `episode.pdf` 存在。
- 视频 draft 存在。
- `cover.png` 或平台封面存在。
- `publish_pack.md` 存在。
- `qa_report.json` 通过。
- `auto_publish = false`。

## 持续优化闭环

持续优化必须由自动质量报告和人工审核共同驱动。

```text
qa_report.json
  + hook_report.json
  + human_review.md
  + screenshots/keyframes
  + audio/caption checks
  -> workflow-optimizer
  -> improvement_candidates.json
  -> human approval
  -> small patch
  -> eval regression
  -> skill/template/profile changelog
```

`workflow-optimizer` 输出建议，不直接改主线。每个候选改进必须包含：

- `target`：要改的 Skill、template、platform profile、脚本或质量门禁。
- `reason`：来自哪个失败项或人工反馈。
- `expected_impact`：预期减少什么返工。
- `risk`：可能带来的副作用。
- `verification`：修改后如何证明。
- `retention_signal`：Hook 相关建议需记录人工保留/划走风险、平台适配问题或首屏可读性问题。

示例：

```json
{
  "candidate_id": "opt_001",
  "target": "platform_profiles/xiaohongshu.zh-CN.yaml",
  "reason": "human_review: cover text too dense on mobile feed",
  "expected_impact": "reduce cover readability failures",
  "risk": "may reduce information density",
  "verification": "render 3:4 cover and screenshot check"
}
```

## 目录结构

```text
paper-aigc-content-factory/
├── README.md
├── AGENTS.md
├── package.json
├── pyproject.toml
├── .env.example
├── pipelines/
│   ├── ep01_attention.yml
│   └── episode.schema.json
├── platform_profiles/
│   ├── douyin.zh-CN.yaml
│   ├── xiaohongshu.zh-CN.yaml
│   ├── bilibili.zh-CN.yaml
│   ├── youtube-shorts.en-US.yaml
│   ├── youtube-long.en-US.yaml
│   └── x.en-US.yaml
├── .agents/
│   └── skills/
│       ├── episode-orchestrator/
│       ├── source-harvester/
│       ├── research-to-claims/
│       ├── script-storyboard-writer/
│       ├── visual-orchestrator/
│       ├── voiceover-adapter/
│       ├── caption-aligner/
│       ├── hyperframes-composer/
│       ├── quality-gate/
│       └── workflow-optimizer/
├── scripts/
│   ├── run_pipeline.ts
│   ├── validate_topic.ts
│   ├── build_claims.ts
│   ├── build_storyboard.ts
│   ├── score_hooks.ts
│   ├── render_hyperframes.ts
│   ├── render_manim.py
│   ├── tts_openai.ts
│   ├── tts_gpt_sovits_adapter.py
│   ├── align_captions.ts
│   └── quality_gate.ts
├── services/
│   └── gpt_sovits/
│       ├── README.md
│       ├── docker-compose.yml
│       └── client.py
├── templates/
│   ├── blog.md.j2
│   ├── pdf.typ.j2
│   ├── hooks/
│   ├── hyperframes/
│   └── manim/
├── data/
│   ├── style_tokens.json
│   ├── hook_patterns.yml
│   └── taxonomy/
└── episodes/
    └── ep01_attention_is_all_you_need/
```

## MVP Pipeline

```yaml
id: ep01_attention_is_all_you_need
title: "Attention Is All You Need 改变了什么"
source_language: zh-CN
research_input:
  local_report: "D:/Shanvisorin_platform/Paper_everyday/paper_desgin/attention_is_all_you_nedd_deep-research-report.md"
voice:
  mode: personal_voice_or_builtin_fallback
  voice_profile_id: rome_personal_zh_v1
  require_consent_audio: true
targets:
  - douyin.zh-CN
  - xiaohongshu.zh-CN
  - bilibili.zh-CN
  - youtube-shorts.en-US
  - youtube-long.en-US
  - x.en-US
stages:
  - skill: episode-orchestrator
    output: episode_workspace
  - skill: source-harvester
    output: research/sources.jsonl
  - skill: research-to-claims
    output: research/claims.json
  - skill: script-storyboard-writer
    outputs:
      - script/hooks.json
      - script/voiceover.md
      - script/voice_segments.json
      - storyboard/hook_variants.json
      - storyboard/storyboard.json
  - skill: visual-orchestrator
    output: assets/assets_manifest.json
  - skill: voiceover-adapter
    output: audio/voiceover.wav
  - skill: caption-aligner
    output: captions/subtitles.srt
  - skill: hyperframes-composer
    output: renders/
  - skill: quality-gate
    output: qa/qa_report.json
  - skill: workflow-optimizer
    output: review/improvement_candidates.json
```

## 实施顺序

### Task Packet 1：仓库骨架与配置合同

目标：建立最小可运行仓库形状，不接重模型。

写入：

- `AGENTS.md`
- `README.md`
- `pipelines/episode.schema.json`
- `platform_profiles/*.yaml`
- `episodes/ep01_attention_is_all_you_need/topic.yaml`

验证：

- JSON/YAML schema 校验通过。
- 平台 profile 能被脚本读取。
- `topic.yaml` 指向第一篇本地研究报告。

### Task Packet 2：8+1 Skill 骨架

目标：创建 Skill 边界和输入输出合同。

写入：

- `.agents/skills/*/SKILL.md`
- 每个 Skill 的 allowed inputs / outputs / forbidden actions

验证：

- 每个 Skill 能被 Codex 单独理解职责。
- 没有 Skill 直接承担重模型安装、自动发布或 Dashboard 职责。

### Task Packet 3：内容母版与可信 claims

目标：把本地深度研究报告转成可追溯研究资产。

写入：

- `research/sources.jsonl`
- `research/paper_notes.md`
- `research/claims.json`
- `research/timeline.json`

验证：

- 每条关键 claim 有 `source_ids`。
- 脚本和博客不能引用无来源事实。

### Task Packet 4：第一篇脚本、Hook Lab、storyboard 和平台语言策略

目标：形成中文母版、英文海外改写策略和平台化开场方案。

写入：

- `script/hooks.json`
- `script/voiceover.md`
- `script/voice_segments.json`
- `storyboard/hook_variants.json`
- `storyboard/storyboard.json`
- `blog/blog.md`
- 平台 publish draft
- `qa/hook_report.json`

验证：

- 每个平台至少 3 个 hook 候选。
- 第一幕引用已选 `hook_id`。
- Hook 评分包含吸引力、清晰度、真实性、平台适配和视觉潜力。
- 无来源夸张结论不能进入已选 hook。
- 中文国内版和英文海外版不是直译。
- 每 8-12 秒有视觉变化。

### Task Packet 5：个人声音录制与口播生成

目标：允许用户录制个人声音，并生成第一篇口播音频。

写入：

- `voice/enrollment/README.md`
- `voice/enrollment/consent.wav`，未录制时写入 `voice/enrollment/recording_needed.md`
- `voice/enrollment/reference_*.wav`，未录制时写入 `voice/enrollment/recording_needed.md`
- `voice/voice_profile_manifest.json`
- `audio/voiceover_manifest.json`

验证：

- 个人声音模式下授权文件存在。
- 若个人声音服务不可用，fallback 到 OpenAI TTS 或内置声音，且 manifest 明确记录。
- 生成 `audio/voiceover.wav`。

### Task Packet 6：HyperFrames 低清视频草稿

目标：把 storyboard、图像资产、字幕和音频合成低清 draft。

写入：

- HyperFrames base template
- 3 个可复用 scene 模板
- `renders/*_draft.mp4`
- 关键帧截图

验证：

- 至少生成抖音 9:16 draft。
- 字幕不遮挡核心图。
- 关键帧截图写入 qa report。

### Task Packet 7：质量门禁与人工审核

目标：输出可审核发布包。

写入：

- `qa/qa_report.json`
- `review/human_review.md`
- `publish/publish_pack.md`

验证：

- 任一关键资产缺失时整体失败。
- `auto_publish=false`。
- 未验证项必须写成 `Not verified`。

### Task Packet 8：持续优化闭环

目标：让每次生成都能反哺 Skill、模板、platform profile 和质量门禁。

写入：

- `review/improvement_candidates.json`
- `evals/cases/ep01_attention/*.yaml`
- `skills/*/CHANGELOG.md` 或 `.agents/skills/*/CHANGELOG.md`

验证：

- 每条优化建议有来源、影响、风险和验证方式。
- 未经人工确认不自动改主线 Skill。

## 第一阶段完成标准

第一篇完成不等于自动发布。第一阶段完成标准是：

- 一条命令能从 `topic.yaml` 生成可审核发布包。
- `claims.json` 能追溯关键事实。
- `hooks.json` 和 `hook_report.json` 能记录每个平台的开场候选、评分和选用理由。
- 个人声音或 fallback 声音能生成 `voiceover.wav`。
- HyperFrames 能生成至少一个低清竖屏视频草稿。
- `qa_report.json` 能发现缺引用、缺图、缺字幕、缺音频、缺封面的失败。
- 人工审核结果能进入 `workflow-optimizer`，生成下一轮改进建议。

## 参考链接

- HyperFrames: https://github.com/heygen-com/hyperframes
- Remotion Agent Skills: https://www.remotion.dev/docs/ai/skills
- Manim Community: https://docs.manim.community/en/stable/
- Motion Canvas: https://github.com/motion-canvas/motion-canvas
- D2: https://d2lang.com/
- GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Claude YouTube workflow reference: https://github.com/AgriciDaniel/claude-youtube
- Claude Shorts scoring reference: https://github.com/AgriciDaniel/claude-shorts
- Yao Open Prompts content references: https://github.com/yaojingang/yao-open-prompts
- Social Calendar Skill reference: https://github.com/Darthflute/social-calendar-skill
- Video Ad Generator hook reference: https://github.com/Creatify-AI/video-ad-generator
- OpenAI Codex Skills: https://developers.openai.com/codex/skills
- OpenAI Text to Speech: https://developers.openai.com/api/docs/guides/text-to-speech
- OpenAI Speech to Text: https://developers.openai.com/api/docs/guides/speech-to-text

这些 GitHub 项目只作为 Hook、留存评分和平台原生内容的设计参考；第一阶段不把它们直接安装为生产依赖。
