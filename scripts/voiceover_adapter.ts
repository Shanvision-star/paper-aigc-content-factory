import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  hashText,
  isValidWav,
  readJsonFile,
  readVoiceSegments,
  runtimeTimestamp,
  toEpisodeSlashPath,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

type VoiceProfileManifest = {
  voice_profile_id: string;
  owner: string;
  consent_audio: string;
  reference_audio: string[];
  allowed_use: string[];
  default_engine: string;
  fallback_engine: string;
  status: string;
  generated_at: string;
  provider_calls: boolean;
  tts_calls: boolean;
};

export type VoiceoverAdapterMode = "check" | "import-audio";

export type VoiceoverAdapterOptions = {
  topicPath: string;
  rootDir?: string;
  mode: VoiceoverAdapterMode;
  inputAudioPath?: string;
};

export type VoiceoverAdapterResult = {
  status: "recording_needed" | "ready_for_tts" | "audio_ready";
  output_audio: string | null;
  missing_inputs: string[];
  manifest_path: string;
};

function readVoiceProfileManifest(episodeDir: string): VoiceProfileManifest {
  return readJsonFile<VoiceProfileManifest>(path.join(episodeDir, "voice/voice_profile_manifest.json"));
}

function referencePatternForEngine(manifest: VoiceProfileManifest): RegExp {
  if (manifest.default_engine === "f5_tts_local") {
    return /^reference_neutral_f5_.*\.wav$/i;
  }

  return /^reference_.*\.wav$/i;
}

function referenceAudioFiles(episodeDir: string, manifest: VoiceProfileManifest): string[] {
  const enrollmentDir = path.join(episodeDir, "voice/enrollment");
  const referencePattern = referencePatternForEngine(manifest);

  if (!fs.existsSync(enrollmentDir)) {
    return [];
  }

  return fs
    .readdirSync(enrollmentDir)
    .filter((fileName) => {
      const filePath = path.join(enrollmentDir, fileName);

      return referencePattern.test(fileName) && fs.statSync(filePath).isFile() && isValidWav(filePath);
    })
    .sort()
    .map((fileName) => toEpisodeSlashPath(path.join("voice/enrollment", fileName)));
}

function enrollmentMissingInputs(episodeDir: string, references: string[], manifest: VoiceProfileManifest): string[] {
  const missing = [];

  if (!isValidWav(path.join(episodeDir, "voice/enrollment/consent.wav"))) {
    missing.push("voice/enrollment/consent.wav");
  }

  if (references.length === 0) {
    missing.push(manifest.default_engine === "f5_tts_local" ? "voice/enrollment/reference_neutral_f5_*.wav" : "voice/enrollment/reference_*.wav");
  }

  return missing;
}

function writeRecordingNeeded(episodeDir: string, missingInputs: string[]): void {
  writeText(
    path.join(episodeDir, "voice/enrollment/recording_needed.md"),
    [
      "# Recording Needed",
      "",
      "Personal voice enrollment is not ready.",
      "",
      ...missingInputs.map((input) => `- Missing: ${input}`),
      "- No GPT-SoVITS, OpenAI TTS, or other TTS provider was called.",
      ""
    ].join("\n")
  );
}

function voiceTextHash(episodeDir: string): string {
  return hashText(readVoiceSegments(episodeDir).map((segment) => segment.text).join("\n"));
}

export function runVoiceoverAdapter(options: VoiceoverAdapterOptions): VoiceoverAdapterResult {
  const episodeDir = episodeDirFromTopicPath(options.topicPath, options.rootDir);
  const manifestPath = path.join(episodeDir, "voice/voice_profile_manifest.json");
  const manifest = readVoiceProfileManifest(episodeDir);
  const references = referenceAudioFiles(episodeDir, manifest);
  const missingInputs = enrollmentMissingInputs(episodeDir, references, manifest);

  if (options.mode === "import-audio") {
    if (!options.inputAudioPath || !isValidWav(options.inputAudioPath)) {
      throw new Error("import-audio mode requires a valid .wav file");
    }

    const outputAudioPath = path.join(episodeDir, "audio/voiceover.wav");
    fs.mkdirSync(path.dirname(outputAudioPath), { recursive: true });
    fs.copyFileSync(options.inputAudioPath, outputAudioPath);

    const updatedManifest: VoiceProfileManifest = {
      ...manifest,
      reference_audio: references,
      status: "audio_ready",
      generated_at: runtimeTimestamp,
      provider_calls: false,
      tts_calls: false
    };

    writeJson(manifestPath, updatedManifest);
    writeJson(path.join(episodeDir, "audio/voiceover_manifest.json"), {
      engine: "manual_import",
      voice_profile_id: manifest.voice_profile_id,
      source_audio: path.resolve(options.inputAudioPath),
      output_audio: "audio/voiceover.wav",
      input_text_hash: voiceTextHash(episodeDir),
      generated_at: runtimeTimestamp,
      provider_calls: false,
      tts_calls: false
    });

    return {
      status: "audio_ready",
      output_audio: "audio/voiceover.wav",
      missing_inputs: [],
      manifest_path: "audio/voiceover_manifest.json"
    };
  }

  const status = missingInputs.length > 0 ? "recording_needed" : "ready_for_tts";
  const updatedManifest: VoiceProfileManifest = {
    ...manifest,
    reference_audio: references,
    status,
    generated_at: runtimeTimestamp,
    provider_calls: false,
    tts_calls: false
  };

  writeJson(manifestPath, updatedManifest);

  if (missingInputs.length > 0) {
    writeRecordingNeeded(episodeDir, missingInputs);
  } else {
    const recordingNeededPath = path.join(episodeDir, "voice/enrollment/recording_needed.md");

    if (fs.existsSync(recordingNeededPath)) {
      fs.unlinkSync(recordingNeededPath);
    }
  }

  return {
    status,
    output_audio: null,
    missing_inputs: missingInputs,
    manifest_path: "voice/voice_profile_manifest.json"
  };
}

function printUsage(): void {
  console.error("Usage: tsx scripts/voiceover_adapter.ts <topic.yaml> --mode check|import-audio [--input path/to/voiceover.wav]");
}

function argValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;
  const mode = argValue(rest, "--mode") as VoiceoverAdapterMode | undefined;
  const inputAudioPath = argValue(rest, "--input");

  if (!topicPath || (mode !== "check" && mode !== "import-audio")) {
    printUsage();
    return 1;
  }

  const result = runVoiceoverAdapter({ topicPath, mode, inputAudioPath });
  console.log(JSON.stringify(result));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/voiceover_adapter.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
