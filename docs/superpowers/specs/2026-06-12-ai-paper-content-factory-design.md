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
  -> technical-script-reviewer
  -> ogilvy-creative-director
  -> script-humanizer-zh
  -> short-video-opening-optimizer
  -> visual-orchestrator
  -> parallel:
       visual assets
       voiceover audio
  -> caption-aligner
  -> hyperframes-composer
  -> platform-format-adapter
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

- 读取 `video_script/FRAME.md`、`storyboard.json`、`assets_manifest.json`、`voiceover.wav` 和字幕。
- 生成 HyperFrames HTML composition。
- 先输出低清 draft；平台 final render 只能在显式 render 任务中运行，不进入 P0 或默认测试。

边界：

- 第一阶段只用 HyperFrames 做最终视频编排。
- 不同时维护 Remotion 主链路。
- 缺少 episode FRAME 时不进入 composition，先报告 frame contract 缺口。

### Visual Frame Spec Workflow

视频视觉规范采用 `DESIGN.md -> FRAME.md -> episode FRAME.md` 链路。

- `docs/visual_system/DESIGN.md` 是账号级视觉身份。
- `docs/visual_system/FRAME.md` 是视频镜头级规范，约束 safe area、Caption Safe Area、Typography Floor、Frame Treatments、Paper Genre Treatment Registry 和 Pre-Render Frame Audit。
- `episodes/{paper_id}/video_script/FRAME.md` 是单篇论文的 frame contract，必须覆盖 paper figure spotlight、formula explanation、platform variants、原论文图、公式图或 Manim 场景、字幕避让和 render QA。
- 公式资产必须执行 Formula Asset Contract：完整公式对象、canonical formula text 或 LaTeX、来源类型、清晰截图/SVG/MathJax/KaTeX/Manim 输出、标注目标、safe-area bounding box 和关键帧审核。

新增 `frame-spec-writer` skill，位于 `script-storyboard-writer` / `visual-orchestrator` 之后、`hyperframes-composer` 之前。它只写视觉规范，不改写 `spoken_text`，不运行真实 HyperFrames、Manim、TTS 或 provider。

### HyperFrames Animation Hard Gates

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

### Platform Content Workflow Skills

以下是跨平台内容优化的附加 skill，不替代 8+1 主链路，只在对应门禁前后补充约束：

- `script-humanizer-zh`：可选中文自然化层，必须在 `technical-script-reviewer` 之后、`spoken_text` 锁定之前运行；它借鉴 `humanizer-zh` 的 Chinese-native rhythm、翻译腔清理和术语统一，但不能改变 approved claim、公式、数字或锁定口播。
- `ogilvy-creative-director`：在 `technical-script-reviewer` 之后、`short-video-opening-optimizer` 和 `frame-spec-writer` 之前运行，建立 `Ogilvy Creative Contract`；它把 Big Idea、headline as mini-ad、facts before decoration、visual hero、proof object、brand consistency 写成可复用创意约束，并补充 research before creative、caption as micro-headline、consumer language、numbered facts、news-style layout、image captions、avoid reverse type、avoid ornate fonts；但不改 claims、不造证据、不替代技术审核。
- `short-video-opening-optimizer`：在 storyboard/frame lock 前运行，按 Douyin、Xiaohongshu、Bilibili、TikTok、YouTube Shorts、YouTube、X 的平台语境评分 `0-3s` opening hook、visual hook、verbal hook、text overlay、技术可信度和 not clickbait 边界。
- `voiceover-emotion-coach`：在 `spoken_text` 锁定后、TTS sample-first 前运行，生成跨论文复用的 `delivery_style` 和可选 `engine_emotion_prompt`；默认 `preserve_original_ai_voice`，只做 `low_intensity_prosody`，不改 `source_text`、不改 `spoken_text`、不写字幕、保持 no hidden narration cues，并把听审反馈交给 `workflow-optimizer`。
- `sound-cue-designer`：在 storyboard/frame lock 和 HyperFrames prompt 前运行，把 opening、QK reveal、Q/K/V card taps、softmax normalization、weighted V aggregation、工程层级切换和 CTA 转成克制的 auditory bookmarks；它不生成音频素材，不改 `spoken_text`，不绕过 ASR transcript diff 或人工听审。
- `platform-format-adapter`：读取 `platform_profiles/*.yaml`、cover、video、captions 和 metadata，整理本地 `publish/platform_manifest.json`。默认竖版封面沿用 `safe90`，平台尺寸只能来自 profile，当前至少覆盖 `1080x1920`、小红书 `1080x1440`、`1920x1080` 和 `1080x1080`。

这些 skill 只做本地审核、文本优化和平台包准备，不 auto-publish、不上传媒体、不运行真实 TTS/HyperFrames/Manim/provider。

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

### Pronunciation Normalization Contract

- 文档生成、口播稿生成和 TTS 提示词必须记录中文多音字、结构助词、英文整体词和公式符号读法。
- `source_text` 是已审核文本；`spoken_text` 是 TTS 友好文本，只能为发音、停顿、英文、数字和公式做无歧义改写。
- `动态地` 或 `更准确地说` 里的 `地` 是状语助词，必须读轻声 `de`，不能读 `di`；若引擎不稳，`spoken_text` 应改写为 `以动态方式...` 或 `准确一点说`。
- `按行归一化` 可以保留在字幕或公式解释中，但口播优先改写为 `对每个当前 token 的那一组分数，分别做归一化`，避免 `行` 的读法和矩阵方向被误解。
- `QK^T` 的口播固定为 `Q 乘 K 转置`；`sqrt(d_k)` 固定为 `根号下 d k`；`d_k` 固定为 `d k`。
- 英文产品名和技术专名保持整体读法，例如 `ChatGPT`、`Claude`、`AI Agent`、`Attention`、`softmax`、`token`、`FlashAttention`、`GQA`、`MQA`、`KV Cache`、`vLLM`、`Multi-Head Attention`；只在公式符号如 `Q`、`K`、`V`、`QK` 中保留字母间停顿。
- 后续 prompt 模板必须包含“发音规范”段落，列出本集容易误读的中文词、英文词和公式符号，并把这些词纳入 ASR transcript diff 或人工听审。

### Voiceover Hard Gates

- 个人音色、克隆声音和本地 TTS 口播必须遵循 `sample -> asr_diff -> human_approval -> full_tts -> merge -> captions -> render`。
- TTS 主线优先使用 IndexTTS2，目标是内容一致性、术语稳定、清晰度和音视频同步；IndexTTS 1.5 / CosyVoice 是备选；个人音色相似度暂时降级为实验分支。
- IndexTTS2 小样必须先覆盖 `seg_001`、`seg_010`、`seg_014`；三段通过后才允许全量分段生成。
- IndexTTS2、IndexTTS 1.5、CosyVoice、F5-TTS、GPT-SoVITS 等引擎不能跳过 sample-first 直接跑全量音频。
- F5-TTS 参考音频必须使用 neutral 8-10s 内容，避免与本集主题、`为什么重要` 或正式口播句重叠。
- 有 ASR 输出时必须执行 ASR transcript diff；没有 ASR 时必须记录缺失，并保留人工听审。
- `source_text` 和 `spoken_text` 必须分离：前者是审核稿，后者只服务发音、数字、英文和公式口播规范。
- 小样审核、重复检测、reference-text leakage 检测和 postprocess 结果必须能进入 review 或 QA 记录。
- 该流程由 `.agents/skills/tts-voiceover-quality-gate/SKILL.md` 维护，`voiceover-adapter` 只负责生成或导入音频产物。

### Voiceover Emotion Contract

- 口播表达力必须作为可审核元数据存在，不能作为隐藏台词混入 `source_text`、`spoken_text`、字幕或 HyperFrames narration cue。
- `voiceover-emotion-coach` 在 `spoken_text` 锁定后、TTS 小样前运行，输出通用 `delivery_style` 和可选引擎级 `engine_emotion_prompt`，适用于后续不同论文和不同 episode。
- 默认风格是 `preserve_original_ai_voice`：保留原版 AI 声线特有的清晰、稳定和轻微机器感；只允许 `low_intensity_prosody`，不能改成老师训话感、主持腔、播音腔或广告腔。
- IndexTTS2 默认使用 `use_emo_text=false`、`use_random=false`；`emo_text` / `emo_alpha` 只作为实验项，必须人工确认后再使用。IndexTTS 1.5、CosyVoice 等备选引擎用各自 instruction/prompt 字段承接同一 `delivery_style`。
- 情绪增强不能破坏 `ChatGPT`、`Claude`、`token`、`Attention`、`softmax`、`KV Cache`、`Multi-Head Attention` 等整体英文读法，不能制造重复、漏词、长停顿或术语漂移。
- 该流程仍受 sample-first、ASR transcript diff 和人工听审约束；如果表达力影响文本一致性，优先降低情绪强度而不是放宽 TTS 质量门禁。
- 每次小样反馈只生成 `workflow-optimizer` 改进候选；未经人工确认，不自动更新共享 skill、锁定脚本或全局模板。

### Script Quality Contract

- 正式脚本必须解释论文为什么影响今天的 modern LLM 时代，而不是只复述论文结构。
- 每条视频保留一个核心 thesis，并用平台化 Hook 开场。
- 关键机制必须用 Feynman 方式讲清楚：直观例子之后回到真实机制。
- Attention 应解释为 weighted aggregation；不能误导成模型神奇地“看懂全句”。
- Q/K/V 必须说明为 learned projection spaces，不能只拟人化成固定角色。
- Multi-Head Attention 的 head 是训练中形成的表示子空间，不是人工指定专家。
- ChatGPT、Claude、Agent、Sora、MCP、KV Cache、FlashAttention、vLLM 等现代连接必须保持层级准确。
- 脚本进入 TTS 前应由 `.agents/skills/technical-script-reviewer/SKILL.md` 审查阻断项、清晰度、工程上下文和 TTS 风险。

### Review Before Render

- 不允许只用命令完成状态代表视频完成；必须检查 `qa_report.json`、小样审核、音频 manifest、字幕、封面和渲染状态。
- `qa_report.json.status` 为 `partial` 或 `failed` 时，不得宣称生产完成。
- 真实 TTS、真实 HyperFrames render 和真实 provider smoke 必须显式运行并与默认 `npm test` 分离。
- Dagu 工作流必须暴露关键门禁节点：`sample`、`asr_diff`、`human_approval`、`full_tts`、`merge`、`captions`、`render`。
- 每次脚本、音频参考、spoken_text 或字幕时长变化后，必须重新评估相关门禁或明确记录未重跑原因。

### Sound Cue Design Contract

- 音效只服务理解，不服务热闹；每个 cue 必须是公式、视觉动作或段落转折的 auditory bookmarks。
- 每集若使用音效，必须维护 episode-level sound cue plan，列出 cue id、对应 spoken cue、视觉同步点、声音类型、相对响度、风险和验证方式。
- EP02 默认 cue 集合是 opening sonic logo、QK reveal、Q/K/V card taps、softmax normalization、weighted V aggregation、工程层级切换和 CTA tail。
- 音效必须 do not overpower voiceover；短音效建议比人声低 `12-18 dB`，背景音乐如存在建议比人声低 `18-24 dB`。
- 不使用手机通知音、警报音、游戏音效、综艺模板音或高频尖锐 beep。
- 英文术语附近避免叠高频音效，例如 `Attention`、`softmax`、`FlashAttention`、`GQA`、`MQA`、`KV Cache`、`vLLM`。
- cue 说明只能写在 storyboard、FRAME、sound cue plan 或 HyperFrames prompt；不能写进 `spoken_text`。
- 含音效的最终混音必须进入人工听审；如果影响 ASR transcript diff、英文清晰度、字幕对齐或个人声音质感，降低或移除音效。
- 该流程由 `.agents/skills/sound-cue-designer/SKILL.md` 维护，并与 `tts-voiceover-quality-gate`、`caption-aligner`、`hyperframes-composer` 协同。

### 竖版封面导出硬约束

- 第一集抖音安全区封面是 `episodes/ep01_attention_is_all_you_need/video_script/cover_transformer_ai_v1_1080x1920_safe90.png`。
- 最终封面格式必须是 `PNG`，画布必须是 `1080x1920`，比例为 `9:16`。
- 面向抖音、小红书、B 站竖版和 YouTube Shorts 的默认封面内容缩放为 `90%`。
- `90%` 缩放后保留 `54px` 左右安全边距、`96px` 上下安全边距，并使用 `black padding`。
- 不要为了填满画布再次放大安全区封面；抖音上传封面时存在边缘溢出风险。
- 后续封面生成、缩放和审核应优先调用 `.agents/skills/short-video-cover-constraints/SKILL.md`。
- 封面设计参考来源固定为 `youtube-thumbnail`、`marketing-short-video-editing-coach`、`awesome-nanobanana-pro`，只作设计参考，不作为生产依赖。

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
- 公式不得被裁切、拆碎、低清化或以 raw LaTeX 暴露；必须有完整公式关键帧和必要标注。

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

### Task Retrospective Index

新开 episode、重做视频、切换 TTS 引擎或修改 HyperFrames 动画前，必须先读取前序复盘索引，再决定当前任务是代码缺口、文档缺口、验证缺口还是产品边界决策。复盘文档提供上下文和候选改进，不自动等同于已完成主线规则。

默认读取顺序：

1. `episodes/{episode_id}/review/*.md`：人工审核、失败复盘、候选改进。
2. `episodes/{episode_id}/qa/*.json`：质量门禁、pipeline map、freshness 结果。
3. `episodes/{episode_id}/video_script/FRAME.md`：单集公式、图表、字幕避让和动画合同。
4. `docs/visual_system/FRAME.md`：账号级视觉和 HyperFrames 通用硬约束。
5. README 与本 workflow spec 的 Voiceover、Pronunciation、Ogilvy、Review Before Render、HyperFrames 等 contract。

已索引复盘：

- `episodes/ep03_multi_head_attention/review/ep03_retrospective_indextts2_animation_candidates.md`：EP03 的 IndexTTS2 切换候选、F5 fallback 边界、字幕/英文术语风险、HyperFrames 静态 PPT 化、公式对象、Figure 2 source-backed 资产、箭头/布局/文字溢出等候选沉淀。

### Ogilvy Layout And Typography Discipline

奥美版式规则属于设计硬纪律，不是可选美术风格。后续脚本、字幕、FRAME 和 HyperFrames prompt 必须把可读性放在装饰前面：

- `no reverse type / colored body panels`：正文、字幕、公式说明和图注必须是深色文字配浅色或纸面背景；不要把长正文放在黑色、深色或彩色底板上。
- `readable type floor`：印刷正文底线参考 9pt，正式解释文本优先不低于 11pt；视频里要按手机观看放大，不允许用小字填满画面。
- `serif / sans`：长段解释优先高可读衬线 serif 或传统阅读字体；海报、封面、首屏大标题可以用大号无衬线 sans 字体，但同一画面不要混用太多字体、字号和粗细。
- `leading`：段落之间保留足够行距，复杂信息拆成短段、编号、图标或箭头引导。
- `avoid all-caps`：英文句子不做 all-caps；技术缩写如 `QKV`、`MHA`、`GQA`、`MQA`、`MoE` 可以保留。
- `headline-over-image ban`：不要把标题或说明覆盖在论文图、公式、代码截图的关键区域；图片、公式和文字各司其职，图片下方必须有说明。
- `five-second poster rule`：海报式帧遵守 5 秒规则，元素不超过三类，颜色强烈但干净，主体、论文名或机制名一眼可见。

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
  - skill: technical-script-reviewer
    output: review/technical_script_review.md
  - skill: ogilvy-creative-director
    output: review/creative_direction.md
  - skill: script-humanizer-zh
    output: script/voiceover_humanized.md
  - skill: short-video-opening-optimizer
    output: storyboard/hook_variants.json
  - skill: visual-orchestrator
    output: assets/assets_manifest.json
  - skill: voiceover-adapter
    output: audio/voiceover.wav
  - skill: caption-aligner
    output: captions/subtitles.srt
  - skill: hyperframes-composer
    output: renders/
  - skill: platform-format-adapter
    output: publish/platform_manifest.json
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
