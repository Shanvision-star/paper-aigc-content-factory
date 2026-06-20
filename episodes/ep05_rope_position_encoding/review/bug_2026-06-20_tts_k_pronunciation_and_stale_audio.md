# Bug Record: TTS `K` 发音偏移与旧音频复用

## Original

- 用户审片发现 `K` 被读成近似 “kai” 的声音。
- 部分片段的口播文稿已更新，但最终 MP4 仍可能复用旧的 `audio/indextts2/segments/*.wav`。
- 旧流程只检查 manifest 文本，没有强制证明高风险音频文件晚于 manifest 生成时间。

## Revised

- `spoken_text` 中不再保留裸 `Q`、`K`、`V`、`Q/K`、`KV cache` 这类容易误读的符号形式。
- TTS 输入层把专业符号改写为语义读法，例如 `Query 向量`、`Key 向量`、`Value 向量`、`Key Value cache`。
- `spoken_text` 中禁止保留 `长上下文`，统一改写为 `上下文长度变大` 或 `更大输入范围`，避免多音字误读。
- 最终 MP4 构建前必须同时通过：
  - `audio:pronunciation-gate:ep05`
  - `audio:freshness-gate:ep05-critical`
- freshness gate 要求关键片段 wav 文件存在、可读、且修改时间晚于当前 manifest。

## Reason / Impact

这不是单纯的发音偏差，而是“文本规范化不足 + 旧 wav 未失效 + 最终构建缺少硬门禁”的链路问题。

如果只修改文稿，不重新生成对应 wav，最终视频仍会保留旧发音；如果只重新生成音频，但不加门禁，后续同类问题仍可能回归。

## Root Cause

1. `K` 在中文 TTS 语境中容易被模型按英语音节或近似拼读处理。
2. `Q/K` 这种压缩写法适合视觉字幕和公式，不适合作为 TTS 直接输入。
3. 片段式 TTS 会缓存每段 wav；文稿更新后，如果没有 freshness 校验，最终合成可能仍拿到旧音频。
4. IndexTTS2 批量重跑时曾出现 Windows `os error 1455`：页面文件太小，无法完成操作。原因是模型加载阶段的系统虚拟内存提交失败，不是脚本文稿错误；处理方式是清理残留进程后，先单段验证，再继续小批次重跑。

## Fix

- 在 TTS prepare 阶段只对 `spoken_text` 做发音消歧；字幕和源稿仍保留专业视觉写法。
- 新增 pronunciation manifest gate，拒绝高风险 spoken token。
- 新增 audio freshness gate，阻止旧 wav 进入最终 MP4。
- 最终构建脚本在授权个人音色模式下强制执行两个 gate。
- 最终构建脚本禁止静默退回无 SFX 的 `audio/voiceover.wav`；必须使用最新的 `audio/voiceover.with_sfx.wav`。

## Regression Checklist

- `npm run audio:indextts2-prepare-segments:ep05`
- `npm run audio:pronunciation-gate:ep05`
- `npm run audio:freshness-gate:ep05-critical`
- 重新合并 voiceover、重新生成动态字幕、重新混音 SFX、再构建 MP4。

## Reviewer Note

公式和字幕可以显示 `Q/K`、`n - m`、`θ_i`；TTS 口播不应机械朗读这些符号。口播应解释为 `Query 向量和 Key 向量`、`相对位移`、`theta 下标 i` 等语义读法。
