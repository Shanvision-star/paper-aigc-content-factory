import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCaptionAligner } from "../scripts/caption_align.js";
import { checkF5ReferenceSafety } from "../scripts/f5_reference_safety_check.js";
import { runHyperframesDraft } from "../scripts/hyperframes_draft.js";
import { buildRenderInputFingerprint } from "../scripts/lib/renderFreshness.js";
import { runPublishPack } from "../scripts/publish_pack.js";
import { runContractSmoke } from "../scripts/run_pipeline.js";
import { runAsrTranscriptDiffGate } from "../scripts/asr_transcript_diff_gate.js";
import { runTtsSampleReviewGate } from "../scripts/tts_sample_review_gate.js";
import { normalizeForTts } from "../scripts/voiceover_tts_prepare.js";
import { runVoiceoverDuplicateGuard } from "../scripts/voiceover_duplicate_guard.js";
import { runVoiceoverAdapter } from "../scripts/voiceover_adapter.js";

const topicPath = "episodes/ep01_attention_is_all_you_need/topic.yaml";

function withTempEpisode(testBody: (tempRoot: string, episodeDir: string) => void): void {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "runtime-adapters-"));
  const episodeDir = path.join(tempRoot, "episodes", "ep01_attention_is_all_you_need");

  try {
    runContractSmoke(topicPath, tempRoot);
    testBody(tempRoot, episodeDir);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function writeMinimalWav(filePath: string): void {
  const header = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x40, 0x1f, 0x00, 0x00, 0x80, 0x3e, 0x00, 0x00, 0x02, 0x00, 0x10, 0x00,
    0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
  ]);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, header);
}

function writeSegmentManifest(episodeDir: string): void {
  const manifestPath = path.join(episodeDir, "audio/f5_tts/segments/segment_manifest.json");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify({
      status: "prepared",
      engine_hint: "f5_tts_local_segmented",
      generated_at: "1970-01-01T00:00:00.000Z",
      source: "script/voice_segments.json",
      text_hash: "sample-manifest-hash",
      notes: [],
      segments: [
        {
          segment_id: "seg_001",
          source_text: "重点来了。如果你每天都在用 ChatGPT。",
          spoken_text: "重点来了。 如果你每天都在用 Chat G P T。",
          focus_terms: [],
          gen_file: "audio/f5_tts/segments/seg_001.txt",
          output_audio: "audio/f5_tts/segments/seg_001.wav"
        },
        {
          segment_id: "seg_010",
          source_text: "这就是它真正影响今天 AI 的原因。",
          spoken_text: "这就是它真正影响今天 AI 的原因。",
          focus_terms: [],
          gen_file: "audio/f5_tts/segments/seg_010.txt",
          output_audio: "audio/f5_tts/segments/seg_010.wav"
        },
        {
          segment_id: "seg_014",
          source_text: "下一集，我们把 Q 和 K 的相乘过程拆开。",
          spoken_text: "下一集， 我们把 Q 和 K 的相乘过程拆开。",
          focus_terms: [],
          gen_file: "audio/f5_tts/segments/seg_014.txt",
          output_audio: "audio/f5_tts/segments/seg_014.wav"
        }
      ]
    }, null, 2)}\n`,
    "utf8"
  );
}

describe("runtime adapters", () => {
  it("normalizes numbers while keeping English product and concept names continuous", () => {
    const spoken = normalizeForTts(
      "如果你每天都在用 ChatGPT、Claude，或者 AI Agent，那你绕不开一篇 2017 年的论文。",
      "seg_001"
    );
    const formula = normalizeForTts(
      "但 Transformer 也留下了新的工程问题：FlashAttention、KV Cache、vLLM。",
      "seg_012"
    );
    const explicitCue = normalizeForTts(
      "重点来了，Q、K、V 不要死背。",
      "seg_006"
    );

    expect(spoken).toContain("ChatGPT");
    expect(spoken).toContain("Claude");
    expect(spoken).not.toContain("克劳德");
    expect(spoken).toContain("AI Agent");
    expect(spoken).not.toContain("A I Agent");
    expect(spoken).not.toContain("Chat G P T");
    expect(spoken).toContain("二零一七年");
    expect(formula).not.toContain("这里的工程重点是");
    expect(formula.startsWith("但 Transformer")).toBe(true);
    expect(formula).toContain("Transformer");
    expect(formula).toContain("Flash Attention");
    expect(formula).toContain("KV Cache");
    expect(formula).toContain("vLLM");
    expect(explicitCue.match(/重点来了/g)?.length).toBe(1);
  });

  it("does not inject segment-level cue phrases that are absent from the source script", () => {
    const spoken = normalizeForTts(
      "这就是它真正影响今天 AI 的原因。它让模型从排队读词，变成同时判断词与词的关系。",
      "seg_010"
    );

    expect(spoken).not.toContain("这一段和今天的大模型直接相关");
    expect(spoken.startsWith("这就是它真正影响今天")).toBe(true);
  });

  it("disambiguates the adverbial particle 地 in 动态地 for TTS", () => {
    const spoken = normalizeForTts(
      "Self-Attention 让 token 和 token 之间动态地建立关系。",
      "seg_004"
    );

    expect(spoken).toContain("以动态方式建立关系");
    expect(spoken).not.toContain("动态地建立关系");
  });

  it("keeps personal voice enrollment blocked when consent and reference audio are missing", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const result = runVoiceoverAdapter({
        topicPath,
        rootDir: tempRoot,
        mode: "check"
      });

      const manifest = JSON.parse(fs.readFileSync(path.join(episodeDir, "voice/voice_profile_manifest.json"), "utf8"));
      const recordingNeeded = fs.readFileSync(path.join(episodeDir, "voice/enrollment/recording_needed.md"), "utf8");

      expect(result.status).toBe("recording_needed");
      expect(result.output_audio).toBeNull();
      expect(manifest.status).toBe("recording_needed");
      expect(manifest.tts_calls).toBe(false);
      expect(recordingNeeded).toContain("voice/enrollment/consent.wav");
      expect(recordingNeeded).toContain("voice/enrollment/reference_*.wav");
    });
  });

  it("blocks duplicated or near-duplicated voiceover sentences before TTS", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const segmentsPath = path.join(episodeDir, "script/voice_segments.json");
      const segments = JSON.parse(fs.readFileSync(segmentsPath, "utf8"));
      segments[1].text = `${segments[0].text} ${segments[1].text}`;
      fs.writeFileSync(segmentsPath, `${JSON.stringify(segments, null, 2)}\n`, "utf8");

      const result = runVoiceoverDuplicateGuard(topicPath, tempRoot);

      expect(result.status).toBe("failed");
      expect(result.issues.some((issue) => issue.kind === "exact")).toBe(true);
    });
  });

  it("flags topic-specific F5 reference text before audio generation", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const referenceTextPath = path.join(episodeDir, "audio/f5_tts/reference_text_f5_neutral.txt");
      fs.mkdirSync(path.dirname(referenceTextPath), { recursive: true });
      fs.writeFileSync(
        referenceTextPath,
        "如果你第一次看到 Attention Is All You Need，这篇论文会改变模型阅读序列的方式。\n",
        "utf8"
      );

      const result = checkF5ReferenceSafety(topicPath, {}, tempRoot);

      expect(result.status).toBe("recording_needed");
      expect(result.blocking_items.join("\n")).toContain("Missing neutral F5 reference wav");
      expect(result.blocking_items.join("\n")).toContain("topic-specific terms");
    });
  });

  it("blocks leak-prone neutral F5 reference phrases before audio generation", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/reference_neutral_f5_8s.wav"));
      const referenceTextPath = path.join(episodeDir, "audio/f5_tts/reference_text_f5_neutral.txt");
      fs.mkdirSync(path.dirname(referenceTextPath), { recursive: true });
      fs.writeFileSync(
        referenceTextPath,
        "今天我们用一个简单例子，把一个复杂问题讲清楚。先看现象，再看原因，最后看它为什么重要。\n",
        "utf8"
      );

      const result = checkF5ReferenceSafety(topicPath, {}, tempRoot);

      expect(result.status).toBe("unsafe_reference");
      expect(result.blocking_items.join("\n")).toContain("leak-prone phrases");
    });
  });

  it("blocks full segmented TTS until representative sample audio is approved", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      writeSegmentManifest(episodeDir);
      for (const segmentId of ["seg_001", "seg_010", "seg_014"]) {
        writeMinimalWav(path.join(episodeDir, "audio/f5_tts/segments", `${segmentId}.wav`));
      }

      const firstResult = runTtsSampleReviewGate(topicPath, tempRoot);
      const reviewPath = path.join(episodeDir, "review/sample_audio_review.json");
      const pendingReview = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

      expect(firstResult.status).toBe("pending_review");
      expect(firstResult.blocking_items).toContain("Sample audio review is not approved.");
      expect(pendingReview.status).toBe("pending_review");

      fs.writeFileSync(
        reviewPath,
        `${JSON.stringify({
          status: "approved",
          reviewed_at: "2026-06-14T00:00:00+08:00",
          reviewer: "Rome",
          approved_segment_ids: ["seg_001", "seg_010", "seg_014"],
          segment_text_hash: firstResult.segment_text_hash,
          notes: "Sample pronunciation and leakage checks approved."
        }, null, 2)}\n`,
        "utf8"
      );

      const approvedResult = runTtsSampleReviewGate(topicPath, tempRoot);

      expect(approvedResult.status).toBe("approved");
      expect(approvedResult.blocking_items).toEqual([]);
    });
  });

  it("fails ASR transcript diff when generated audio drifts from spoken_text or leaks reference phrases", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      writeSegmentManifest(episodeDir);
      const transcriptPath = path.join(episodeDir, "audio/asr/sample_transcripts.json");
      fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
      fs.writeFileSync(
        transcriptPath,
        `${JSON.stringify({
          engine: "test-asr",
          segments: [
            {
              segment_id: "seg_001",
              transcript: "重点来了 如果你每天都在用 Chat G P T 为什么重要 为什么重要"
            },
            {
              segment_id: "seg_010",
              transcript: "这就是它真正影响今天 AI 的原因"
            },
            {
              segment_id: "seg_014",
              transcript: "下一集 我们把 Q 和 K 的相乘过程拆开"
            }
          ]
        }, null, 2)}\n`,
        "utf8"
      );

      const result = runAsrTranscriptDiffGate(topicPath, tempRoot, {
        transcriptPath: "audio/asr/sample_transcripts.json"
      });

      expect(result.status).toBe("failed");
      expect(result.issues.some((issue) => issue.kind === "leak_prone_phrase")).toBe(true);
      expect(result.issues.some((issue) => issue.kind === "transcript_distance")).toBe(true);
    });
  });

  it("does not treat a directory named reference_01.wav as a valid reference recording", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/consent.wav"));
      fs.mkdirSync(path.join(episodeDir, "voice/enrollment/reference_01.wav"), { recursive: true });

      const result = runVoiceoverAdapter({
        topicPath,
        rootDir: tempRoot,
        mode: "check"
      });

      const manifest = JSON.parse(fs.readFileSync(path.join(episodeDir, "voice/voice_profile_manifest.json"), "utf8"));

      expect(result.status).toBe("recording_needed");
      expect(result.missing_inputs).toContain("voice/enrollment/reference_*.wav");
      expect(manifest.reference_audio).toEqual([]);
    });
  });

  it("clears stale recording_needed instructions after enrollment files are valid", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/consent.wav"));
      writeMinimalWav(path.join(episodeDir, "voice/enrollment/reference_01.wav"));

      const result = runVoiceoverAdapter({
        topicPath,
        rootDir: tempRoot,
        mode: "check"
      });

      expect(result.status).toBe("ready_for_tts");
      expect(fs.existsSync(path.join(episodeDir, "voice/enrollment/recording_needed.md"))).toBe(false);
    });
  });

  it("imports an explicitly supplied real wav as the voiceover artifact", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);

      const result = runVoiceoverAdapter({
        topicPath,
        rootDir: tempRoot,
        mode: "import-audio",
        inputAudioPath: sourceAudio
      });

      const outputAudio = path.join(episodeDir, "audio/voiceover.wav");
      const audioManifest = JSON.parse(fs.readFileSync(path.join(episodeDir, "audio/voiceover_manifest.json"), "utf8"));

      expect(result.status).toBe("audio_ready");
      expect(fs.existsSync(outputAudio)).toBe(true);
      expect(audioManifest.engine).toBe("manual_import");
      expect(audioManifest.output_audio).toBe("audio/voiceover.wav");
      expect(audioManifest.input_text_hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  it("reports missing audio instead of claiming captions are aligned", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const result = runCaptionAligner(topicPath, tempRoot);
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "captions/caption_status.json"), "utf8"));

      expect(result.status).toBe("missing_audio");
      expect(status.status).toBe("missing_audio");
      expect(fs.existsSync(path.join(episodeDir, "captions/subtitles.srt"))).toBe(false);
    });
  });

  it("writes SRT and VTT captions from existing voice segments when audio exists", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "import-audio", inputAudioPath: sourceAudio });

      const result = runCaptionAligner(topicPath, tempRoot);
      const srt = fs.readFileSync(path.join(episodeDir, "captions/subtitles.srt"), "utf8");
      const vtt = fs.readFileSync(path.join(episodeDir, "captions/subtitles.vtt"), "utf8");

      expect(result.status).toBe("captions_ready");
      expect(srt).toContain("00:00:00,000 --> 00:00:08,000");
      expect(srt).toContain("如果你一看到 QKV 就断片");
      expect(vtt.startsWith("WEBVTT")).toBe(true);
    });
  });

  it("reports missing HyperFrames inputs without fabricating a video", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const result = runHyperframesDraft(topicPath, tempRoot);
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "renders/render_status.json"), "utf8"));

      expect(result.status).toBe("missing_inputs");
      expect(status.missing_inputs).toContain("audio/voiceover.wav");
      expect(status.missing_inputs).toContain("captions/subtitles.srt");
      expect(fs.existsSync(path.join(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"))).toBe(false);
    });
  });

  it("writes a HyperFrames HTML composition when storyboard, audio, and captions exist", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "import-audio", inputAudioPath: sourceAudio });
      runCaptionAligner(topicPath, tempRoot);

      const result = runHyperframesDraft(topicPath, tempRoot);
      const html = fs.readFileSync(path.join(episodeDir, "renders/hyperframes/ep01_draft.html"), "utf8");
      const design = fs.readFileSync(path.join(episodeDir, "renders/hyperframes_formal/DESIGN.md"), "utf8");

      expect(result.status).toBe("composition_ready");
      expect(html).toContain("data-composition-id=\"ep01-attention-draft\"");
      expect(html).toContain("Attention Is All You Need");
      expect(design).toContain("Formula Asset Contract");
      expect(design).toContain("KaTeX/MathJax/SVG");
      expect(design).toContain("full formula bounding box");
      expect(fs.existsSync(path.join(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"))).toBe(false);
    });
  });

  it("writes a publish pack that stays partial while rendered video is missing", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const result = runPublishPack(topicPath, tempRoot);
      const pack = fs.readFileSync(path.join(episodeDir, "publish/publish_pack.md"), "utf8");
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "publish/publish_status.json"), "utf8"));

      expect(result.status).toBe("partial");
      expect(status.missing_inputs).toContain("renders/douyin_zh_1080x1920_draft.mp4");
      expect(pack).toContain("小红书");
      expect(pack).toContain("YouTube Shorts");
      expect(pack).toContain("Not ready to publish");
    });
  });

  it("does not mark the publish pack ready from a stale mp4 without formal render status", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "import-audio", inputAudioPath: sourceAudio });
      writeMinimalWav(path.join(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"));

      const result = runPublishPack(topicPath, tempRoot);
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "publish/publish_status.json"), "utf8"));

      expect(result.status).toBe("partial");
      expect(status.missing_inputs).toContain("renders/hyperframes_formal_status.json#status=missing");
    });
  });

  it("does not mark the publish pack ready from rendered status without input fingerprint", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "import-audio", inputAudioPath: sourceAudio });
      runCaptionAligner(topicPath, tempRoot);
      runHyperframesDraft(topicPath, tempRoot);
      writeMinimalWav(path.join(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"));
      fs.writeFileSync(path.join(episodeDir, "renders/hyperframes_formal_status.json"), JSON.stringify({ status: "rendered" }), "utf8");

      const result = runPublishPack(topicPath, tempRoot);
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "publish/publish_status.json"), "utf8"));

      expect(result.status).toBe("partial");
      expect(status.missing_inputs).toContain("renders/hyperframes_formal_status.json#input_fingerprint=missing");
    });
  });

  it("marks the publish pack ready only when formal render status matches current inputs", () => {
    withTempEpisode((tempRoot, episodeDir) => {
      const sourceAudio = path.join(tempRoot, "manual", "voiceover.wav");
      writeMinimalWav(sourceAudio);
      runVoiceoverAdapter({ topicPath, rootDir: tempRoot, mode: "import-audio", inputAudioPath: sourceAudio });
      runCaptionAligner(topicPath, tempRoot);
      runHyperframesDraft(topicPath, tempRoot);
      writeMinimalWav(path.join(episodeDir, "renders/douyin_zh_1080x1920_draft.mp4"));
      const fingerprint = buildRenderInputFingerprint(episodeDir);
      fs.writeFileSync(
        path.join(episodeDir, "renders/hyperframes_formal_status.json"),
        JSON.stringify({ status: "rendered", input_fingerprint: fingerprint.input_fingerprint }),
        "utf8"
      );

      const result = runPublishPack(topicPath, tempRoot);
      const status = JSON.parse(fs.readFileSync(path.join(episodeDir, "publish/publish_status.json"), "utf8"));

      expect(result.status).toBe("ready");
      expect(status.missing_inputs).toEqual([]);
    });
  });
});
