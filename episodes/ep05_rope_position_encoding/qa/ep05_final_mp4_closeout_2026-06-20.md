# EP05 final MP4 closeout - 2026-06-20

## 产物

- MP4: `episodes/ep05_rope_position_encoding/renders/ep05_rope_position_encoding_indextts2_sfx_final_review.mp4`
- 时长: 248.334 秒
- 尺寸: 1080 x 1920
- 音频: AAC, 24000 Hz, mono

## 本轮重点修复

- 删除面向制作的可见字幕提示，例如“读作”“视觉焦点”“教学边界”。
- 删除重复机械的 `n-m` 口播，把表达改成“相隔多远”“相对位移”“相隔 5 个位置”等自然解释。
- 对 `K`、`Q/K`、`KV cache`、`长上下文`做 spoken_text 发音消歧，避免 K 被读成 `kai`，避免“长上下文”被读成错误多音。
- 最终构建强制使用 `voiceover.with_sfx.wav`，不允许静默回退到无音效音频。
- 保持字幕按口播时间动态显示；字幕禁词和时间重叠门禁均通过。
- 本轮问题推导与后续设计参考已沉淀到 `docs/visual_system/EP05_ROPE_POSTMORTEM.md`，后续 episode 在公式动画、MATLAB 资产、动态字幕、TTS 和 SFX 进入最终 MP4 前需要对照该文档。

## 已验证

- `npm run audio:pronunciation-gate:ep05`: passed
- `npm run audio:freshness-gate:ep05-critical`: passed
- `npx tsc --noEmit --pretty false`: passed
- `git diff --check`: passed, only Windows LF/CRLF warning
- Caption scan: 95 entries, no banned production prompt, no overlaps
- ffprobe: video stream and audio stream both present
- Keyframes sampled: PE page, seat-distance page, RoPE rotation page, formula page, evidence/boundary page, Feynman summary page, outro page

## 仍需人工复核

- 完整 248 秒逐句听感与个人音色主观一致性。
- 平台上传后的压缩效果与字幕安全区。

## 证据边界

- gpt-oss 作为 RoPE 公开证据，以 OpenAI 发布页为准。
- DeepSeek-V4 的 Partial RoPE 以 Transformers 文档为公开技术证据。
- ChatGPT 只作为长上下文产品语境，不作为 RoPE 实现证据。
