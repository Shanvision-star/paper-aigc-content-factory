import fs from "node:fs";
import path from "node:path";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

type CueDefinition = {
  cue_id: string;
  file_name: string;
  duration_sec: number;
  description: string;
  relative_loudness_db: number;
  clarity_rule: string;
  synth: (sampleRate: number, durationSec: number) => Float32Array;
};

const sampleRate = 24000;

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function envelope(t: number, duration: number, attack = 0.025, release = 0.12): number {
  const attackGain = Math.min(1, t / attack);
  const releaseGain = Math.min(1, (duration - t) / release);
  return Math.max(0, Math.min(attackGain, releaseGain));
}

function sine(freq: number, t: number): number {
  return Math.sin(2 * Math.PI * freq * t);
}

function tone(durationSec: number, fn: (t: number, duration: number) => number, amp = 0.12): Float32Array {
  const length = Math.max(1, Math.round(durationSec * sampleRate));
  const data = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    data[index] = clamp(fn(t, durationSec) * envelope(t, durationSec) * amp);
  }

  return data;
}

function addPulse(data: Float32Array, startSec: number, durationSec: number, freq: number, amp: number): void {
  const start = Math.round(startSec * sampleRate);
  const length = Math.round(durationSec * sampleRate);

  for (let i = 0; i < length && start + i < data.length; i += 1) {
    const t = i / sampleRate;
    const localEnv = envelope(t, durationSec, 0.008, durationSec * 0.75);
    data[start + i] = clamp(data[start + i] + sine(freq, t) * localEnv * amp);
  }
}

function sweep(startFreq: number, endFreq: number, t: number, duration: number): number {
  const progress = Math.min(1, Math.max(0, t / duration));
  return startFreq + (endFreq - startFreq) * progress;
}

function writeWav(filePath: string, samples: Float32Array): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  samples.forEach((sample, index) => {
    buffer.writeInt16LE(Math.round(clamp(sample) * 32767), 44 + index * bytesPerSample);
  });

  fs.writeFileSync(filePath, buffer);
}

function silence(durationSec: number): Float32Array {
  return new Float32Array(Math.round(durationSec * sampleRate));
}

function concat(parts: Float32Array[]): Float32Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Float32Array(length);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

const cues: CueDefinition[] = [
  {
    cue_id: "cue_001_opening",
    file_name: "cue_001_opening_restrained_sonic_logo.wav",
    duration_sec: 0.52,
    description: "低频柔和三音色，作为系列开场锚点，不像通知音。",
    relative_loudness_db: -18,
    clarity_rule: "只放在画面出现处；如果抢口播第一句就移除。",
    synth: (_, duration) => tone(duration, (t) => sine(196, t) * 0.55 + sine(294, t) * 0.28 + sine(392, t) * 0.17, 0.11)
  },
  {
    cue_id: "cue_002_qk_reveal",
    file_name: "cue_002_qk_reveal_clean_hit.wav",
    duration_sec: 0.28,
    description: "短促 QK reveal hit，强调 QK^T 出现，但不做警报感。",
    relative_loudness_db: -16,
    clarity_rule: "必须避开 Q 和 K 的发音起点；若遮挡英文/字母，后移 0.25 秒。",
    synth: (_, duration) => tone(duration, (t) => sine(sweep(420, 260, t, duration), t) + 0.22 * sine(120, t), 0.13)
  },
  {
    cue_id: "cue_003_qkv_cards",
    file_name: "cue_003_qkv_three_card_taps.wav",
    duration_sec: 0.48,
    description: "Q/K/V 三个柔和 card tap，帮助记忆三种投影空间。",
    relative_loudness_db: -18,
    clarity_rule: "不要做成游戏点击声；如果显得幼稚就删除。",
    synth: () => {
      const data = silence(0.48);
      addPulse(data, 0.02, 0.12, 310, 0.11);
      addPulse(data, 0.18, 0.12, 360, 0.1);
      addPulse(data, 0.34, 0.12, 410, 0.095);
      return data;
    }
  },
  {
    cue_id: "cue_004_scale",
    file_name: "cue_004_scale_soft_compression.wav",
    duration_sec: 0.36,
    description: "压缩感下滑音，用来标记除以根号下 d k 的稳定化。",
    relative_loudness_db: -18,
    clarity_rule: "不能盖住“根号下 d k”；建议放在词组之后。",
    synth: (_, duration) => tone(duration, (t) => sine(sweep(360, 170, t, duration), t) * (1 - 0.25 * (t / duration)), 0.12)
  },
  {
    cue_id: "cue_005_softmax",
    file_name: "cue_005_softmax_normalization_rise.wav",
    duration_sec: 0.56,
    description: "柔和上行归一化提示，表示分数变成概率比例。",
    relative_loudness_db: -18,
    clarity_rule: "必须在 softmax 单词之后进入，不能盖住英文词。",
    synth: (_, duration) => tone(duration, (t) => sine(sweep(240, 420, t, duration), t) * 0.8 + sine(sweep(300, 520, t, duration), t) * 0.2, 0.1)
  },
  {
    cue_id: "cue_006_weighted_v",
    file_name: "cue_006_weighted_v_merge.wav",
    duration_sec: 0.66,
    description: "多路信息合并成一个输出的轻微 merge cue。",
    relative_loudness_db: -18,
    clarity_rule: "保持干净精确，不能做成情绪化转场。",
    synth: (_, duration) => tone(duration, (t) => {
      const p = t / duration;
      return sine(220 + 60 * p, t) * 0.35 + sine(280 - 20 * p, t) * 0.32 + sine(340 - 80 * p, t) * 0.2;
    }, 0.11)
  },
  {
    cue_id: "cue_007_engineering_layers",
    file_name: "cue_007_engineering_three_layer_hits.wav",
    duration_sec: 0.76,
    description: "三层低频 card hit，对应计算层、模型结构层、推理运行时。",
    relative_loudness_db: -18,
    clarity_rule: "不能盖住 FlashAttention / GQA / KV Cache。",
    synth: () => {
      const data = silence(0.76);
      addPulse(data, 0.04, 0.14, 180, 0.12);
      addPulse(data, 0.30, 0.14, 220, 0.11);
      addPulse(data, 0.56, 0.14, 260, 0.1);
      return data;
    }
  },
  {
    cue_id: "cue_008_cta",
    file_name: "cue_008_cta_gentle_upward_tail.wav",
    duration_sec: 0.68,
    description: "轻微上扬尾音，承接下一集 Multi-Head Attention。",
    relative_loudness_db: -20,
    clarity_rule: "保持学术感，不能像营销结尾音效。",
    synth: (_, duration) => tone(duration, (t) => sine(sweep(210, 360, t, duration), t) * 0.7 + sine(sweep(315, 480, t, duration), t) * 0.22, 0.085)
  }
];

export function generateExperimentalSoundCues(topicPath: string, rootDir = "."): { status: "generated"; output_dir: string; preview_file: string; cues: Array<{ cue_id: string; file: string }> } {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const outputDir = path.join(episodeDir, "audio/sfx/experimental");
  const generated = cues.map((cue) => {
    const filePath = path.join(outputDir, cue.file_name);
    writeWav(filePath, cue.synth(sampleRate, cue.duration_sec));

    return {
      cue_id: cue.cue_id,
      file: path.relative(episodeDir, filePath).replace(/\\/g, "/"),
      description: cue.description,
      duration_sec: cue.duration_sec,
      relative_loudness_db: cue.relative_loudness_db,
      clarity_rule: cue.clarity_rule
    };
  });
  const previewParts = cues.flatMap((cue) => [
    cue.synth(sampleRate, cue.duration_sec),
    silence(0.8)
  ]);
  const episodeId = path.basename(episodeDir);
  const previewFile = path.join(outputDir, `${episodeId}_experimental_sfx_preview_sequence.wav`);
  writeWav(previewFile, concat(previewParts));
  writeJson(path.join(outputDir, "experimental_sfx_manifest.json"), {
    status: "experimental_local_cues",
    generated_at: runtimeTimestamp,
    policy: "Generated as local experimental cues. They may be mixed into an episode only after user listening approval and voice-clarity checks.",
    sample_rate: sampleRate,
    preview_file: path.relative(episodeDir, previewFile).replace(/\\/g, "/"),
    cues: generated
  });

  return {
    status: "generated",
    output_dir: path.relative(episodeDir, outputDir).replace(/\\/g, "/"),
    preview_file: path.relative(episodeDir, previewFile).replace(/\\/g, "/"),
    cues: generated.map((cue) => ({ cue_id: cue.cue_id, file: cue.file }))
  };
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/generate_experimental_sound_cues.ts <topic.yaml>");
    return 1;
  }

  console.log(JSON.stringify(generateExperimentalSoundCues(topicPath)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/generate_experimental_sound_cues.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
