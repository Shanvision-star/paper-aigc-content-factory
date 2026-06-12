# AI Paper Content Factory 多平台模板仓库设计

## 目标

把一篇 AI 论文或一个 AIGC 主题，稳定生产为中文国内平台和英文海外平台都可发布的内容包：

- 博客长文
- PDF 推导文档
- 结构图与动态图资产
- 克隆音色或内置音色口播
- 字幕
- 多比例视频
- 多平台标题、简介、标签、封面和发布说明

第一集目标样例是《Attention Is All You Need》。系统不追求一次性全自动发布，而是先生成可人工审核的发布包。

## Authority Order

1. `AGENTS.md` / 项目执行约束
2. 本设计文档
3. `pipelines/*.yml` 单集流水线配置
4. `platform_profiles/*.yaml` 平台规格
5. `episodes/*/` 实际产物

当低层配置和高层设计冲突时，优先更新低层配置，不把临时实现写成事实。

## 系统边界

### 当前主线

当前主线是一个本地模板仓库，用 Codex + Skills + 渲染脚本完成“论文到多平台内容包”的生产闭环。

### 非目标

- 不自动发布到抖音、小红书、B 站、YouTube、TikTok、X 或 Instagram。
- 不在第一阶段做 SaaS 后台。
- 不把第三方 Skill 直接视为可信供应链。
- 不把同一条视频强行原样分发到所有平台。
- 不默认使用未经授权的人声音色。

## 核心架构

```text
Research Layer
  -> Content Planning Layer
  -> Visual Planning Layer
  -> Asset Rendering Layer
  -> Voice and Caption Layer
  -> Platform Adaptation Layer
  -> Video Rendering Layer
  -> Quality Gate Layer
  -> Publish Package Layer
```

### Research Layer

职责：抓取论文、官方文档、GitHub 案例和引用事实。

第一阶段 Skill：

- `paper-reader`

第二阶段 Skill：

- `paper-source-harvester`
- `citation-guard`
- `repo-case-miner`
- `aigc-timeline-curator`

### Content Planning Layer

职责：把研究素材变成内容母版。

第一阶段 Skill：

- `episode-architect`
- `storyboard-planner`

输出：

- `master/script.master.zh.md`
- `master/storyboard.master.json`
- `master/assets_manifest.json`

### Visual Planning Layer

职责：判断每个镜头用什么视觉表达，不直接渲染。

第一阶段 Skill：

- `visual-orchestrator`

决策规则：

- 公式、矩阵、attention score、softmax、位置编码：Manim
- 架构图、流程图、时间线：D2 或 Mermaid
- 社媒动效、字幕、转场、图文卡片：HyperFrames
- 复杂 React 模板化批量视频：Remotion，第二阶段加入
- 复杂口播同步矢量动画：Motion Canvas，第二阶段加入
- 热力图、柱状图、对比图：Python / matplotlib

### Asset Rendering Layer

职责：把视觉规格变成文件资产。

第一阶段 Skill：

- `diagram-renderer`
- `manim-derivation-renderer`

第二阶段 Skill：

- `motioncanvas-scene-renderer`
- `thumbnail-designer`

输出要求：

- 每个图像资产输出 SVG/PNG。
- 每个动画资产输出 MP4 和首帧 PNG。
- 每个资产必须有 `scene_id`、`engine`、`duration`、`source_spec` 和 `output_path`。

### Voice and Caption Layer

职责：把口播稿变成音频和字幕。

第一阶段 Skill：

- `voiceover-tts`
- `caption-aligner`

TTS 模式：

- `builtin_voice`：使用 OpenAI TTS 或其他内置声音，作为快速 fallback。
- `custom_voice_local`：使用 GPT-SoVITS / F5-TTS / CosyVoice 等本地引擎。
- `custom_voice_api`：仅在授权、合规和账号能力满足时使用。

安全规则：

- 自定义声音必须记录授权来源。
- 不使用未经授权的第三方真人音色。
- 口播生成后必须保留 `voiceover_manifest.json`，记录引擎、模型、声音、输入文本、音频路径和生成时间。

字幕规则：

- 中文短视频默认硬字幕。
- 英文海外短视频默认硬字幕。
- B 站和 YouTube 长视频可以同时输出硬字幕版和无字幕版。
- 每条字幕最多两行。
- 中文每行建议不超过 18 个汉字。
- 英文每行建议不超过 42 个字符。

### Platform Adaptation Layer

职责：把母版转成不同平台的语言、比例、标题和发布包。

第一阶段新增 Skill：

- `localization-adapter`
- `platform-profile-adapter`

第二阶段新增 Skill：

- `publish-packager`

关键原则：

- 中文国内版和英文海外版不是直译关系，而是按受众重写。
- 平台差异写入 `platform_profiles/*.yaml`，不要硬编码在视频工程里。
- 一个母版可以生成多个平台变体，每个变体都有独立 metadata。

第一阶段平台 profiles：

- `douyin.zh-CN.yaml`
- `xiaohongshu.zh-CN.yaml`
- `bilibili.zh-CN.yaml`
- `youtube-shorts.en-US.yaml`
- `youtube-long.en-US.yaml`
- `x.en-US.yaml`

第二阶段平台 profiles：

- `tiktok.en-US.yaml`
- `instagram-reels.en-US.yaml`
- `linkedin.en-US.yaml`

### Video Rendering Layer

职责：合成最终视频。

第一阶段 Skill：

- `hyperframes-video-composer`

第二阶段 Skill：

- `remotion-video-composer`

默认策略：

- HyperFrames 作为默认视频编排层，负责 HTML/CSS/GSAP 动效、字幕、转场和 MP4 输出。
- Remotion 作为高级模板化视频层，后续用于批量模板、React 组件化和复杂数据驱动视频。

### Quality Gate Layer

职责：不让不合格内容进入发布包。

第一阶段 Skill：

- `platform-quality-gate`

检查项：

- 分辨率和比例符合 profile。
- 字幕不超出安全区。
- 标题、简介、标签、封面存在。
- 音频存在且时长与视频接近。
- 无缺失资产。
- 无 2 秒以上黑屏，除非 storyboard 明确要求。
- PDF/博客引用不把未验证事实写成完成态。
- 输出 `quality_report.json`。

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

## 目录结构

```text
ai-paper-content-factory/
├── README.md
├── AGENTS.md
├── package.json
├── pyproject.toml
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
├── skills/
│   ├── paper-reader/
│   ├── episode-architect/
│   ├── storyboard-planner/
│   ├── visual-orchestrator/
│   ├── diagram-renderer/
│   ├── manim-derivation-renderer/
│   ├── voiceover-tts/
│   ├── caption-aligner/
│   ├── localization-adapter/
│   ├── platform-profile-adapter/
│   ├── hyperframes-video-composer/
│   └── platform-quality-gate/
├── data/
│   ├── style/
│   │   ├── brand_tokens.json
│   │   └── typography.json
│   └── taxonomy/
│       └── aigc_timeline.yml
├── episodes/
│   └── ep01_attention_is_all_you_need/
│       ├── inputs/
│       ├── research/
│       ├── master/
│       ├── localized/
│       │   ├── zh-CN/
│       │   └── en-US/
│       ├── assets/
│       ├── audio/
│       ├── captions/
│       ├── renders/
│       ├── blog/
│       ├── pdf/
│       └── publish/
└── scripts/
    ├── run_pipeline.ts
    ├── validate_assets.ts
    ├── render_video.ts
    └── quality_gate.ts
```

## MVP Skill 切分

第一阶段只实现 12 个 Skill：

1. `paper-reader`
2. `episode-architect`
3. `storyboard-planner`
4. `visual-orchestrator`
5. `diagram-renderer`
6. `manim-derivation-renderer`
7. `voiceover-tts`
8. `caption-aligner`
9. `localization-adapter`
10. `platform-profile-adapter`
11. `hyperframes-video-composer`
12. `platform-quality-gate`

暂不实现：

- dashboard
- 自动发布
- Remotion 主链路
- Motion Canvas 主链路
- 多集自动选题
- 自动运营数据回流

## MVP Pipeline

```yaml
id: ep01_attention_is_all_you_need
title: "Attention Is All You Need 改变了什么"
source_language: zh-CN
targets:
  - douyin.zh-CN
  - xiaohongshu.zh-CN
  - bilibili.zh-CN
  - youtube-shorts.en-US
  - youtube-long.en-US
  - x.en-US

stages:
  - skill: paper-reader
    output: research/paper_notes.md
  - skill: episode-architect
    output: master/episode_plan.yaml
  - skill: storyboard-planner
    output: master/storyboard.master.json
  - skill: visual-orchestrator
    output: master/assets_manifest.json
  - skill: diagram-renderer
    output: assets/diagrams/
  - skill: manim-derivation-renderer
    output: assets/manim/
  - skill: localization-adapter
    output: localized/
  - skill: voiceover-tts
    output: audio/
  - skill: caption-aligner
    output: captions/
  - skill: platform-profile-adapter
    output: publish/platform_manifests/
  - skill: hyperframes-video-composer
    output: renders/
  - skill: platform-quality-gate
    output: publish/quality_report.json
```

## 质量门禁

### 内容门禁

- 关键论断必须能追溯到论文、官方文档或明确标注为推断。
- 中文和英文版本必须分别适配受众，不允许直接机翻后发布。
- 标题不得夸大论文事实。

### 视觉门禁

- 每个平台必须输出截图或关键帧。
- 竖屏版本检查顶部、底部和中心安全区。
- 字幕不得遮挡公式关键部分。
- 图文卡片不得使用过小字号。

### 音频门禁

- 音频必须能播放。
- 时长必须与 storyboard 合理一致。
- 峰值不能削波。
- 自定义声音必须有授权记录。

### 文件门禁

- 每个平台必须有视频、封面、标题、简介、标签和质量报告。
- 所有输出路径必须写入 manifest。
- 缺失资产时停止，不生成“假完成”报告。

## 实施顺序

### Task Packet 1：仓库骨架与配置合同

写入目录结构、`episode.schema.json`、`platform_profiles/*.yaml` 和最小 README。

验证：

- JSON/YAML schema 校验通过。
- 平台 profile 能被脚本读取。

### Task Packet 2：内容母版与平台本地化

实现 `paper-reader`、`episode-architect`、`storyboard-planner`、`localization-adapter`。

验证：

- 同一母版能生成中文国内版和英文海外版。
- 输出不包含未替换占位符。

### Task Packet 3：视觉编排与资产生成

实现 `visual-orchestrator`、`diagram-renderer`、`manim-derivation-renderer`。

验证：

- 生成至少 1 个 Mermaid/D2 图。
- 生成至少 1 个 Manim 动画和首帧 PNG。

### Task Packet 4：口播、字幕与声音边界

实现 `voiceover-tts`、`caption-aligner`。

验证：

- 生成 wav/mp3。
- 生成 SRT/VTT。
- manifest 记录声音来源和授权状态。

### Task Packet 5：HyperFrames 多平台视频渲染

实现 `hyperframes-video-composer`。

验证：

- 生成抖音中文 9:16。
- 生成小红书中文 3:4。
- 生成 B 站中文 16:9。
- 生成 YouTube Shorts 英文 9:16。
- 生成 X 英文 1:1 或 16:9。

### Task Packet 6：平台质量门禁与发布包

实现 `platform-quality-gate` 和发布包生成。

验证：

- `quality_report.json` 列出每个平台的 pass/fail。
- 任一关键资产缺失时整体失败。

## 参考链接

- HyperFrames: https://github.com/heygen-com/hyperframes
- Remotion Agent Skills: https://www.remotion.dev/docs/ai/skills
- Manim Community: https://docs.manim.community/en/stable/
- Motion Canvas: https://github.com/motion-canvas/motion-canvas
- D2: https://d2lang.com/
- OpenAI Codex Skills: https://developers.openai.com/codex/skills
- OpenAI Text to Speech: https://developers.openai.com/api/docs/guides/text-to-speech
- OpenAI Speech to Text: https://developers.openai.com/api/docs/guides/speech-to-text

