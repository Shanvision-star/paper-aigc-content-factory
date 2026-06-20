import fs from "node:fs";
import path from "node:path";
import { preProductionContractMissingInputs } from "./lib/preProductionContracts.js";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

type CueTimeline = {
  cues: Array<{
    cue_id: string;
    absolute_time_sec: number;
    relative_loudness_db: number;
    clarity_rule: string;
  }>;
};

type SfxManifest = {
  cues: Array<{
    cue_id: string;
    file: string;
  }>;
};

type WavData = {
  sampleRate: number;
  channels: number;
  samples: Float32Array;
};

type MixResult = {
  status: "missing_inputs" | "mixed";
  output_audio: string;
  cues_mixed: number;
  missing_inputs: string[];
};

function readPcm16Wav(filePath: string): WavData {
  const buffer = fs.readFileSync(filePath);

  if (buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WAVE") {
    throw new Error(`Not a WAV file: ${filePath}`);
  }

  let offset = 12;
  let sampleRate = 0;
  let channels = 0;
  let bitsPerSample = 0;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;

    if (chunkId === "fmt ") {
      const audioFormat = buffer.readUInt16LE(chunkDataOffset);
      channels = buffer.readUInt16LE(chunkDataOffset + 2);
      sampleRate = buffer.readUInt32LE(chunkDataOffset + 4);
      bitsPerSample = buffer.readUInt16LE(chunkDataOffset + 14);

      if (audioFormat !== 1 || bitsPerSample !== 16) {
        throw new Error(`Only PCM16 WAV is supported: ${filePath}`);
      }
    }

    if (chunkId === "data") {
      dataOffset = chunkDataOffset;
      dataSize = chunkSize;
      break;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || sampleRate <= 0 || channels <= 0) {
    throw new Error(`Invalid WAV chunks: ${filePath}`);
  }

  const frameCount = dataSize / 2 / channels;
  const samples = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame += 1) {
    let mono = 0;

    for (let channel = 0; channel < channels; channel += 1) {
      mono += buffer.readInt16LE(dataOffset + (frame * channels + channel) * 2) / 32768;
    }

    samples[frame] = mono / channels;
  }

  return { sampleRate, channels: 1, samples };
}

function writePcm16Wav(filePath: string, sampleRate: number, samples: Float32Array): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
  });

  fs.writeFileSync(filePath, buffer);
}

function peakNormalizeIfNeeded(samples: Float32Array, peakLimit = 0.92): void {
  let peak = 0;

  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }

  if (peak <= peakLimit || peak === 0) {
    return;
  }

  const factor = peakLimit / peak;

  for (let index = 0; index < samples.length; index += 1) {
    samples[index] *= factor;
  }
}

export function runSoundCueMixer(topicPath: string, rootDir = "."): MixResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const voicePath = path.join(episodeDir, "audio/voiceover.wav");
  const timelinePath = path.join(episodeDir, "video_script/sound_cue_timeline.json");
  const manifestPath = path.join(episodeDir, "audio/sfx/experimental/experimental_sfx_manifest.json");
  const outputAudio = "audio/voiceover.with_sfx.wav";
  const missingInputs = [
    ...preProductionContractMissingInputs(episodeDir),
    ...[voicePath, timelinePath, manifestPath]
      .filter((filePath) => !fs.existsSync(filePath))
      .map((filePath) => path.relative(episodeDir, filePath).replace(/\\/g, "/"))
  ];

  if (missingInputs.length > 0) {
    const result: MixResult = {
      status: "missing_inputs",
      output_audio: outputAudio,
      cues_mixed: 0,
      missing_inputs: missingInputs
    };

    writeJson(path.join(episodeDir, "audio/sfx/mix_status.json"), { ...result, generated_at: runtimeTimestamp });
    return result;
  }

  const voice = readPcm16Wav(voicePath);
  const output = new Float32Array(voice.samples);
  const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf8")) as CueTimeline;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as SfxManifest;
  const fileByCue = new Map(manifest.cues.map((cue) => [cue.cue_id, cue.file]));
  let cuesMixed = 0;

  for (const cue of timeline.cues) {
    const relativeFile = fileByCue.get(cue.cue_id);

    if (!relativeFile) {
      continue;
    }

    const cuePath = path.join(episodeDir, relativeFile);

    if (!fs.existsSync(cuePath)) {
      continue;
    }

    const sfx = readPcm16Wav(cuePath);

    if (sfx.sampleRate !== voice.sampleRate) {
      throw new Error(`Sample-rate mismatch: ${relativeFile}`);
    }

    const startSample = Math.round(cue.absolute_time_sec * voice.sampleRate);
    const gain = cue.relative_loudness_db <= -20 ? 0.8 : cue.relative_loudness_db >= -16 ? 1.05 : 0.9;

    for (let index = 0; index < sfx.samples.length && startSample + index < output.length; index += 1) {
      output[startSample + index] += sfx.samples[index] * gain;
    }

    cuesMixed += 1;
  }

  peakNormalizeIfNeeded(output);
  writePcm16Wav(path.join(episodeDir, outputAudio), voice.sampleRate, output);

  const result: MixResult = {
    status: "mixed",
    output_audio: outputAudio,
    cues_mixed: cuesMixed,
    missing_inputs: []
  };

  writeJson(path.join(episodeDir, "audio/sfx/mix_status.json"), {
    ...result,
    generated_at: runtimeTimestamp,
    policy: "Voice remains primary. Experimental cues are mixed as low-level auditory bookmarks only."
  });

  return result;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/mix_sound_cues.ts <topic.yaml>");
    return 1;
  }

  const result = runSoundCueMixer(topicPath);
  console.log(JSON.stringify(result));
  return result.status === "mixed" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/mix_sound_cues.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
