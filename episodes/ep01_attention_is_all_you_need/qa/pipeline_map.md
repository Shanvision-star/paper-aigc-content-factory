# Attention Is All You Need 改变了什么 Pipeline Map

Episode: `ep01_attention_is_all_you_need`

Generated at: `1970-01-01T00:00:00.000Z`

Dagu workflow: `dagu/ai-paper-content-factory-ep01.yaml`

## Flow

```mermaid
flowchart TD
  validate_topic["validate_topic<br/>topic/profile contracts"] --> hooks_score["hooks_score<br/>Hook Lab"]
  hooks_score --> contract_smoke["contract_smoke<br/>P0 artifacts"]
  contract_smoke --> voiceover_audio["voiceover_audio<br/>check/import"]
  voiceover_audio --> captions["captions<br/>alignment"]
  captions --> video_render["video_render<br/>HyperFrames draft"]
  video_render --> publish_pack["publish_pack<br/>review assets"]
  publish_pack --> quality_gate["quality_gate<br/>qa_report"]
  quality_gate --> pipeline_map["pipeline_map<br/>I/O map"]
```

## Stage I/O

| Stage | Status | Inputs | Outputs | Command | Blocking Items |
|---|---|---|---|---|---|
| validate_topic | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok pipelines/episode.schema.json<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | - | npm run validate:topic | - |
| hooks_score | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | ok script/hooks.json<br/>ok storyboard/hook_variants.json<br/>ok qa/hook_report.json | npm run hooks:score | - |
| contract_smoke | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | ok research/sources.jsonl<br/>ok research/claims.json<br/>ok research/timeline.json<br/>ok script/voiceover.md<br/>ok script/voice_segments.json<br/>ok storyboard/storyboard.json<br/>ok voice/voice_profile_manifest.json<br/>ok review/human_review.md<br/>ok blog/blog.md | npm run episode:contract-smoke | - |
| voiceover_audio | PASS | ok script/voiceover.md<br/>ok voice/voice_profile_manifest.json | ok audio/voiceover.wav | npm run voiceover:check | - |
| captions | PASS | ok script/voice_segments.json<br/>ok audio/voiceover.wav | ok captions/subtitles.srt | npm run captions:align | - |
| video_render | PASS | ok storyboard/storyboard.json<br/>ok audio/voiceover.wav<br/>ok captions/subtitles.srt | ok renders/hyperframes/ep01_draft.html<br/>ok renders/douyin_zh_1080x1920_draft.mp4 | npm run video:hyperframes-draft | - |
| publish_pack | PASS | ok renders/douyin_zh_1080x1920_draft.mp4<br/>ok qa/qa_report.json | ok publish/publish_pack.md | npm run publish:pack | - |
| quality_gate | PASS | ok script/hooks.json<br/>ok storyboard/hook_variants.json<br/>ok qa/hook_report.json<br/>ok research/sources.jsonl<br/>ok research/claims.json<br/>ok research/timeline.json<br/>ok script/voiceover.md<br/>ok script/voice_segments.json<br/>ok storyboard/storyboard.json<br/>ok voice/voice_profile_manifest.json<br/>ok review/human_review.md<br/>ok blog/blog.md | ok qa/qa_report.json | npm run quality:gate | - |
| pipeline_map | PASS | ok qa/qa_report.json<br/>ok qa/hook_report.json | ok qa/pipeline_map.json<br/>ok qa/pipeline_map.md | npm run pipeline:map | - |

## Summary

- Status: `pass`
- Passed stages: 9
- Partial stages: 0
- Failed stages: 0
- Blocked future stages: 0
