import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  isValidWav,
  readVoiceSegments,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

const require = createRequire(import.meta.url);

type ReferenceSafetyStatus = "ready" | "recording_needed" | "unsafe_reference";

type ReferenceSafetyResult = {
  status: ReferenceSafetyStatus;
  reference_audio: string;
  reference_text: string;
  duration_sec: number | null;
  blocking_items: string[];
  warnings: string[];
};

type SafetyOptions = {
  referenceAudio?: string;
  referenceText?: string;
};

const neutralReferenceText = "今天我们用一个简单例子，把一个复杂问题讲清楚。先看现象，再看原因。";
const defaultReferenceAudio = "voice/enrollment/reference_neutral_f5_8s.wav";
const defaultReferenceText = "audio/f5_tts/reference_text_f5_neutral.txt";
const forbiddenTopicTerms = [
  "Attention",
  "Transformer",
  "QKV",
  "Q、K",
  "Self-Attention",
  "Multi-Head",
  "论文",
  "模型阅读序列",
  "阅读序列",
  "大模型时代"
];
const leakProneReferencePhrases = [
  "为什么重要",
  "最后看它为什么重要",
  "改变了模型阅读序列的方式",
  "改变了模型理解语言的方式"
];

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, "")
    .replace(/[，。！？：；、“”《》（）,.!?;:'"()[\]-]/g, "")
    .toLowerCase();
}

function textDurationSec(filePath: string): number | null {
  try {
    const ffprobeStatic = require("ffprobe-static") as { path: string };
    const output = execFileSync(
      ffprobeStatic.path,
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
      { encoding: "utf8" }
    ).trim();
    const duration = Number(output);

    return Number.isFinite(duration) ? Number(duration.toFixed(3)) : null;
  } catch {
    return null;
  }
}

function containsLongSharedPhrase(referenceText: string, targetText: string): string | null {
  const ref = normalizeText(referenceText);
  const target = normalizeText(targetText);

  for (let length = Math.min(18, ref.length); length >= 8; length -= 1) {
    for (let index = 0; index <= ref.length - length; index += 1) {
      const phrase = ref.slice(index, index + length);
      if (phrase && target.includes(phrase)) {
        return phrase;
      }
    }
  }

  return null;
}

function writeNeutralRecordingGuide(episodeDir: string): void {
  writeText(
    path.join(episodeDir, "voice/enrollment/neutral_reference_recording_guide.md"),
    [
      "# F5-TTS 中性参考音频重录指南",
      "",
      "这条参考音频只用于学习你的音色和语气，不应该包含本期论文、Transformer、QKV 或任何正式口播里的句子。",
      "",
      "## 录制要求",
      "",
      "- 时长：8-10 秒，最长不要超过 10.5 秒。",
      "- 环境：安静房间，关闭风扇、空调强风、键盘敲击和系统提示音。",
      "- 音量：正常说话，不要贴麦，不要喊。",
      "- 文本：必须和实际录音逐字一致。",
      "- 格式：WAV 优先，后续统一放到下面路径。",
      "",
      "## 推荐朗读文本",
      "",
      neutralReferenceText,
      "",
      "## 保存路径",
      "",
      "`episodes/ep01_attention_is_all_you_need/voice/enrollment/reference_neutral_f5_8s.wav`",
      "",
      "对应参考文本文件：",
      "",
      "`episodes/ep01_attention_is_all_you_need/audio/f5_tts/reference_text_f5_neutral.txt`",
      ""
    ].join("\n")
  );
}

export function checkF5ReferenceSafety(topicPath: string, options: SafetyOptions = {}, rootDir = "."): ReferenceSafetyResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const referenceAudio = options.referenceAudio ?? defaultReferenceAudio;
  const referenceText = options.referenceText ?? defaultReferenceText;
  const audioPath = path.join(episodeDir, referenceAudio);
  const textPath = path.join(episodeDir, referenceText);
  const blockingItems: string[] = [];
  const warnings: string[] = [];

  fs.mkdirSync(path.dirname(textPath), { recursive: true });
  if (!fs.existsSync(textPath)) {
    writeText(textPath, `${neutralReferenceText}\n`);
  }
  writeNeutralRecordingGuide(episodeDir);

  const refText = fs.readFileSync(textPath, "utf8").trim();
  const targetText = readVoiceSegments(episodeDir).map((segment) => segment.text).join("\n");
  const durationSec = isValidWav(audioPath) ? textDurationSec(audioPath) : null;

  if (!isValidWav(audioPath)) {
    blockingItems.push(`Missing neutral F5 reference wav: ${referenceAudio}`);
  }

  if (durationSec !== null && durationSec > 10.5) {
    blockingItems.push(`Neutral F5 reference audio is too long: ${durationSec}s > 10.5s`);
  }

  if (durationSec !== null && durationSec < 7.0) {
    warnings.push(`Neutral F5 reference audio is short: ${durationSec}s; recommended 8-10s`);
  }

  const forbiddenHits = forbiddenTopicTerms.filter((term) => refText.toLowerCase().includes(term.toLowerCase()));
  if (forbiddenHits.length > 0) {
    blockingItems.push(`Reference text contains topic-specific terms: ${forbiddenHits.join(", ")}`);
  }

  const leakProneHits = leakProneReferencePhrases.filter((phrase) => refText.includes(phrase));
  if (leakProneHits.length > 0) {
    blockingItems.push(`Reference text contains leak-prone phrases: ${leakProneHits.join(", ")}`);
  }

  const sharedPhrase = containsLongSharedPhrase(refText, targetText);
  if (sharedPhrase) {
    blockingItems.push(`Reference text overlaps with voiceover text: ${sharedPhrase}`);
  }

  const status: ReferenceSafetyStatus = blockingItems.length === 0
    ? "ready"
    : isValidWav(audioPath)
      ? "unsafe_reference"
      : "recording_needed";
  const result: ReferenceSafetyResult = {
    status,
    reference_audio: referenceAudio,
    reference_text: referenceText,
    duration_sec: durationSec,
    blocking_items: blockingItems,
    warnings
  };

  writeJson(path.join(episodeDir, "audio/f5_tts/reference_safety_report.json"), {
    ...result,
    generated_at: runtimeTimestamp
  });

  return result;
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  return index >= 0 ? args[index + 1] : undefined;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/f5_reference_safety_check.ts <topic.yaml> [--reference-audio voice/enrollment/reference_neutral_f5_8s.wav] [--reference-text audio/f5_tts/reference_text_f5_neutral.txt]");
    return 1;
  }

  const result = checkF5ReferenceSafety(topicPath, {
    referenceAudio: argValue(rest, "--reference-audio"),
    referenceText: argValue(rest, "--reference-text")
  });

  console.log(JSON.stringify(result));
  return result.status === "ready" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/f5_reference_safety_check.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
