# AI Paper Content Factory

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
technical-script-reviewer -> script-humanizer-zh -> short-video-opening-optimizer -> frame-spec-writer -> hyperframes-composer -> platform-format-adapter
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

- 个人声音必须有授权录音、voice profile manifest 和明确 allowed use。
- F5-TTS、GPT-SoVITS、CosyVoice 等本地 TTS 引擎不能直接跑全量；必须 sample-first。
- F5-TTS 参考音频必须是 neutral 8-10s，不要包含本集主题词、`为什么重要` 或已审核口播句，避免 reference-text leakage。
- 代表性小样至少覆盖 `seg_001`、一个中段技术段如 `seg_010`、以及结尾或 CTA 段如 `seg_014`。
- 有本地 ASR 时必须运行 ASR transcript diff；没有 ASR 时要明确记录缺失，并保留人工听审为硬门禁。
- `source_text` 是已审核口播稿，`spoken_text` 是 TTS 友好稿；允许规范英文、数字、公式和多音字，但禁止偷偷注入未审核提示句。
- 重复句、参考文本回灌、英文术语读错、明显杂音、电流声、长静音或断点，都必须阻断全量生成。

对应项目 skill：

```text
.agents/skills/tts-voiceover-quality-gate/SKILL.md
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

## Review Before Render

不要把命令跑完当成视频完成。进入正式渲染、封面、发布包或对外发布前，必须有新鲜证据：

- `qa_report.json.status` 必须是 `pass`，否则只能说 `partial` 或 `failed`。
- 真实 TTS、真实 HyperFrames render、真实 provider smoke 必须和默认 `npm test` 分开记录。
- Dagu 节点要能看到关键门禁进度，而不只是一个长命令成功：`sample`、`asr_diff`、`human_approval`、`full_tts`、`merge`、`captions`、`render`。
- 每次音频或脚本变更后，重新跑小样门禁或说明没有重跑的原因。
- 最终结论必须报告验证项和未验证项，不能用旧报告替代当前产物。

## Visual Frame Spec Workflow

每篇论文视频在进入 HyperFrames composition 前，必须先通过视觉规范链路：

`DESIGN.md -> FRAME.md -> episode FRAME.md`

- `docs/visual_system/DESIGN.md` 定义账号级视觉身份：颜色、字体、中英文模式、封面 `safe90`、论文图和公式处理原则。
- `docs/visual_system/FRAME.md` 把视觉身份转成视频镜头规则：`1080x1920`、`1080x1440`、`1920x1080`、`1080x1080`、safe area、Caption Safe Area、Typography Floor、Frame Treatments、Paper Genre Treatment Registry、Pre-Render Frame Audit。
- `episodes/{paper_id}/video_script/FRAME.md` 定义单篇论文的执行规则：paper figure spotlight、formula explanation、platform variants、需要出现的原论文图片、公式图片或 Manim 场景、字幕避让和渲染 QA。

`frame-spec-writer` 负责生成或更新 episode FRAME；`hyperframes-composer` 必须读取 episode FRAME 后再生成 HTML composition。这个链路不运行真实 HyperFrames render，不替代 technical-script-reviewer、tts-voiceover-quality-gate 或人工审核。

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
