# Attention Is All You Need 改变了什么 Pipeline Map

Episode: `ep01_attention_is_all_you_need`

Generated at: `1970-01-01T00:00:00.000Z`

Dagu workflow: `dagu/ai-paper-content-factory-ep01.yaml`

## Flow

```mermaid
flowchart TD
  validate_topic["validate_topic<br/>topic/profile contracts"] --> hooks_score["hooks_score<br/>Hook Lab"]
  hooks_score --> contract_smoke["contract_smoke<br/>P0 artifacts"]
  contract_smoke --> quality_gate["quality_gate<br/>qa_report"]
  quality_gate --> pipeline_map["pipeline_map<br/>I/O map"]
  quality_gate -. blocked .-> voiceover_audio["voiceover_audio<br/>future"]
  voiceover_audio -. blocked .-> captions["captions<br/>future"]
  captions -. blocked .-> video_render["video_render<br/>future"]
  video_render -. blocked .-> publish_pack["publish_pack<br/>future"]
```

## Stage I/O

| Stage | Status | Inputs | Outputs | Command | Blocking Items |
|---|---|---|---|---|---|
| validate_topic | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok pipelines/episode.schema.json<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | - | npm run validate:topic | - |
| hooks_score | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | ok script/hooks.json<br/>ok storyboard/hook_variants.json<br/>ok qa/hook_report.json | npm run hooks:score | - |
| contract_smoke | PASS | ok episodes/ep01_attention_is_all_you_need/topic.yaml<br/>ok data/hook_patterns.yml<br/>ok platform_profiles/douyin.zh-CN.yaml<br/>ok platform_profiles/xiaohongshu.zh-CN.yaml<br/>ok platform_profiles/bilibili.zh-CN.yaml<br/>ok platform_profiles/youtube-shorts.en-US.yaml<br/>ok platform_profiles/youtube-long.en-US.yaml<br/>ok platform_profiles/x.en-US.yaml | ok research/sources.jsonl<br/>ok research/claims.json<br/>ok research/timeline.json<br/>ok script/voiceover.md<br/>ok script/voice_segments.json<br/>ok storyboard/storyboard.json<br/>ok voice/voice_profile_manifest.json<br/>ok voice/enrollment/recording_needed.md<br/>ok review/human_review.md<br/>ok blog/blog.md | npm run episode:contract-smoke | - |
| quality_gate | PARTIAL | ok script/hooks.json<br/>ok storyboard/hook_variants.json<br/>ok qa/hook_report.json<br/>ok research/sources.jsonl<br/>ok research/claims.json<br/>ok research/timeline.json<br/>ok script/voiceover.md<br/>ok script/voice_segments.json<br/>ok storyboard/storyboard.json<br/>ok voice/voice_profile_manifest.json<br/>ok voice/enrollment/recording_needed.md<br/>ok review/human_review.md<br/>ok blog/blog.md | ok qa/qa_report.json | npm run quality:gate | Not verified runtime artifact: audio/voiceover.wav<br/>Not verified runtime artifact: captions/subtitles.srt<br/>Not verified runtime artifact: renders/douyin_zh_1080x1920_draft.mp4<br/>Not verified runtime artifact: publish/publish_pack.md |
| pipeline_map | PASS | ok qa/qa_report.json<br/>ok qa/hook_report.json | ok qa/pipeline_map.json<br/>ok qa/pipeline_map.md | npm run pipeline:map | - |
| voiceover_audio | BLOCKED | ok script/voiceover.md<br/>ok voice/voice_profile_manifest.json | missing audio/voiceover.wav | future: personal voice or built-in TTS | Not verified runtime artifact: audio/voiceover.wav<br/>Missing output: audio/voiceover.wav |
| captions | BLOCKED | ok script/voice_segments.json<br/>missing audio/voiceover.wav | missing captions/subtitles.srt | future: caption alignment | Not verified runtime artifact: captions/subtitles.srt<br/>Missing input: audio/voiceover.wav<br/>Missing output: captions/subtitles.srt |
| video_render | BLOCKED | ok storyboard/storyboard.json<br/>missing audio/voiceover.wav<br/>missing captions/subtitles.srt | missing renders/douyin_zh_1080x1920_draft.mp4 | future: HyperFrames/Manim render | Not verified runtime artifact: renders/douyin_zh_1080x1920_draft.mp4<br/>Missing input: audio/voiceover.wav<br/>Missing input: captions/subtitles.srt<br/>Missing output: renders/douyin_zh_1080x1920_draft.mp4 |
| publish_pack | BLOCKED | missing renders/douyin_zh_1080x1920_draft.mp4<br/>ok qa/qa_report.json | missing publish/publish_pack.md | future: platform packaging | Not verified runtime artifact: publish/publish_pack.md<br/>Missing input: renders/douyin_zh_1080x1920_draft.mp4<br/>Missing output: publish/publish_pack.md |

## Summary

- Status: `partial`
- Passed stages: 4
- Partial stages: 1
- Failed stages: 0
- Blocked future stages: 4
