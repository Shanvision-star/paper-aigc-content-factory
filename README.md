# AI Paper Content Factory

本仓库用于把 AI 论文或 AIGC 主题生产成可审核的多平台内容资产包。P0 阶段的目标不是生成最终成片或自动发布，而是先把每集内容生产的输入、平台适配、Hook、合同烟测产物和质量报告固定下来，让后续真实声音、字幕、视频渲染和发布包可以在明确边界内继续推进。

## P0 Scope

P0 只验证合同层：

- episode topic contract
- platform profile contract
- Hook Lab generation/scoring
- P0 contract-smoke artifacts
- quality gate report

P0 不调用真实 LLM、TTS、HyperFrames、Manim 或发布平台。默认验证必须保持确定性和低成本；真实 provider smoke 只能作为显式的独立检查，不进入 `npm test` 基线。

## First Episode

第一集使用 `episodes/ep01_attention_is_all_you_need/topic.yaml` 作为入口，按下面命令验证 P0 合同链路：

```bash
npm install
npm run validate:topic
npm run episode:contract-smoke
npm run quality:gate
npm run pipeline:map
npm test
npm run typecheck
```

预期质量门输出：

```text
OK quality status=partial blocking_items=4
```

`partial` 是正确结果，因为真实个人声音、字幕、视频渲染、发布包尚未进入 P0。当前阶段只确认可审核资产包的合同骨架和质量门能如实报告缺口；不要把真实声音克隆、真实视频生成或真实平台发布理解为已经完成。

## Workflow Dashboard

本仓库提供一个 Dagu workflow 示例：

```text
dagu/ai-paper-content-factory-ep01.yaml
```

Dagu 面板负责串联 P0 命令：

```text
validate_topic -> hooks_score -> contract_smoke -> quality_gate -> pipeline_map -> test -> typecheck -> inspect_reports
```

这个 workflow 使用当前本机仓库路径 `C:/Users/Rome/Documents/Paper_every_day` 作为 `working_dir`。如果仓库迁移到别的位置，需要同步调整 YAML 里的 `working_dir`。

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
