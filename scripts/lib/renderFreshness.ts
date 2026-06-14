import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const formalRenderOutputPath = "renders/douyin_zh_1080x1920_draft.mp4";
export const formalRenderStatusPath = "renders/hyperframes_formal_status.json";

const formalRenderBaseFingerprintInputs = [
  "audio/voiceover.wav",
  "captions/subtitles.srt",
  "renders/hyperframes_formal/index.html"
];

export function formalRenderFingerprintInputsFor(episodeDir: string): string[] {
  const formalStoryboard = "video_script/storyboard.json";
  const contractStoryboard = "storyboard/storyboard.json";
  const storyboardSource = fs.existsSync(path.join(episodeDir, formalStoryboard)) ? formalStoryboard : contractStoryboard;

  return [
    "audio/voiceover.wav",
    "captions/subtitles.srt",
    storyboardSource,
    ...formalRenderBaseFingerprintInputs.filter((relativePath) => !["audio/voiceover.wav", "captions/subtitles.srt"].includes(relativePath))
  ];
}

export type RenderInputDigest = {
  path: string;
  sha256: string;
  bytes: number;
};

export type RenderInputFingerprint = {
  input_fingerprint: string | null;
  input_fingerprints: RenderInputDigest[];
  missing_inputs: string[];
};

type FormalRenderStatus = {
  status?: string;
  input_fingerprint?: string | null;
};

function hashFile(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function buildRenderInputFingerprint(episodeDir: string): RenderInputFingerprint {
  const fingerprintInputs = formalRenderFingerprintInputsFor(episodeDir);
  const missingInputs = fingerprintInputs.filter((relativePath) => !fs.existsSync(path.join(episodeDir, relativePath)));

  if (missingInputs.length > 0) {
    return {
      input_fingerprint: null,
      input_fingerprints: [],
      missing_inputs: missingInputs
    };
  }

  const inputFingerprints = fingerprintInputs.map((relativePath) => {
    const absolutePath = path.join(episodeDir, relativePath);

    return {
      path: relativePath,
      sha256: hashFile(absolutePath),
      bytes: fs.statSync(absolutePath).size
    };
  });
  const inputFingerprint = crypto.createHash("sha256").update(JSON.stringify(inputFingerprints)).digest("hex");

  return {
    input_fingerprint: inputFingerprint,
    input_fingerprints: inputFingerprints,
    missing_inputs: []
  };
}

export function formalRenderReadinessIssue(episodeDir: string, reportMissingStatus = true): string | null {
  const statusFilePath = path.join(episodeDir, formalRenderStatusPath);

  if (!fs.existsSync(statusFilePath)) {
    return reportMissingStatus ? `${formalRenderStatusPath}#status=missing` : null;
  }

  let status: FormalRenderStatus;
  try {
    status = JSON.parse(fs.readFileSync(statusFilePath, "utf8")) as FormalRenderStatus;
  } catch {
    return `${formalRenderStatusPath}#status=unreadable`;
  }

  if (status.status !== "rendered") {
    return `${formalRenderStatusPath}#status=${status.status ?? "missing"}`;
  }

  const currentFingerprint = buildRenderInputFingerprint(episodeDir);

  if (currentFingerprint.missing_inputs.length > 0) {
    return `${formalRenderStatusPath}#input_missing=${currentFingerprint.missing_inputs.join(",")}`;
  }

  if (!status.input_fingerprint) {
    return `${formalRenderStatusPath}#input_fingerprint=missing`;
  }

  if (status.input_fingerprint !== currentFingerprint.input_fingerprint) {
    return `${formalRenderStatusPath}#input_fingerprint=mismatch`;
  }

  return null;
}
