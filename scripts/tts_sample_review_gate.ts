import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  hashText,
  isValidWav,
  readJsonFile,
  runtimeTimestamp,
  writeJson
} from "./lib/runtimeAdapters.js";

type PreparedTtsSegment = {
  segment_id: string;
  source_text: string;
  spoken_text: string;
  output_audio: string;
};

type SegmentManifest = {
  segments: PreparedTtsSegment[];
};

type SampleReviewStatus = "approved" | "pending_review" | "missing_samples" | "stale_review";

type SampleReviewFile = {
  status?: string;
  approved_segment_ids?: string[];
  segment_text_hash?: string;
  reviewed_at?: string;
  reviewer?: string;
  notes?: string;
};

export type TtsSampleReviewResult = {
  status: SampleReviewStatus;
  sample_segment_ids: string[];
  segment_text_hash: string;
  review_file: string;
  sample_audio: Array<{
    segment_id: string;
    output_audio: string;
    exists: boolean;
  }>;
  blocking_items: string[];
};

type ReviewGateOptions = {
  sampleSegmentIds?: string[];
  reviewFile?: string;
};

const defaultSampleSegmentIds = ["seg_001", "seg_010", "seg_014"];
const defaultReviewFile = "review/sample_audio_review.json";
const manifestPath = "audio/f5_tts/segments/segment_manifest.json";

function selectedSegments(episodeDir: string, sampleSegmentIds: string[]): PreparedTtsSegment[] {
  const manifest = readJsonFile<SegmentManifest>(path.join(episodeDir, manifestPath));
  const byId = new Map(manifest.segments.map((segment) => [segment.segment_id, segment]));

  return sampleSegmentIds.map((segmentId) => {
    const segment = byId.get(segmentId);
    if (!segment) {
      throw new Error(`Missing sample segment in ${manifestPath}: ${segmentId}`);
    }

    return segment;
  });
}

function sampleTextHash(segments: PreparedTtsSegment[]): string {
  return hashText(segments.map((segment) => `${segment.segment_id}\n${segment.spoken_text}`).join("\n\n"));
}

function readReviewFile(filePath: string): SampleReviewFile | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readJsonFile<SampleReviewFile>(filePath);
}

export function runTtsSampleReviewGate(
  topicPath: string,
  rootDir = ".",
  options: ReviewGateOptions = {}
): TtsSampleReviewResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const sampleSegmentIds = options.sampleSegmentIds ?? defaultSampleSegmentIds;
  const reviewFile = options.reviewFile ?? defaultReviewFile;
  const reviewPath = path.join(episodeDir, reviewFile);
  const segments = selectedSegments(episodeDir, sampleSegmentIds);
  const segmentTextHash = sampleTextHash(segments);
  const sampleAudio = segments.map((segment) => {
    const outputPath = path.join(episodeDir, segment.output_audio);

    return {
      segment_id: segment.segment_id,
      output_audio: segment.output_audio,
      exists: isValidWav(outputPath)
    };
  });
  const blockingItems: string[] = [];

  const missingAudio = sampleAudio.filter((item) => !item.exists);
  if (missingAudio.length > 0) {
    blockingItems.push(`Missing sample audio: ${missingAudio.map((item) => item.segment_id).join(", ")}`);
  }

  const review = readReviewFile(reviewPath);
  if (!review) {
    writeJson(reviewPath, {
      status: "pending_review",
      generated_at: runtimeTimestamp,
      required_action: "Listen to the representative F5-TTS sample wav files and set status to approved only if pronunciation, leakage, duplication, and pacing are acceptable.",
      approved_segment_ids: sampleSegmentIds,
      segment_text_hash: segmentTextHash,
      sample_audio: sampleAudio,
      notes: ""
    });
  }

  let status: SampleReviewStatus = "approved";
  const effectiveReview = review ?? readReviewFile(reviewPath);

  if (missingAudio.length > 0) {
    status = "missing_samples";
  } else if (!effectiveReview || effectiveReview.status !== "approved") {
    status = "pending_review";
    blockingItems.push("Sample audio review is not approved.");
  } else if (effectiveReview.segment_text_hash !== segmentTextHash) {
    status = "stale_review";
    blockingItems.push("Sample audio review is stale because segment_text_hash changed.");
  } else {
    const approvedIds = new Set(effectiveReview.approved_segment_ids ?? []);
    const missingApprovals = sampleSegmentIds.filter((segmentId) => !approvedIds.has(segmentId));
    if (missingApprovals.length > 0) {
      status = "stale_review";
      blockingItems.push(`Sample audio review does not approve required segment ids: ${missingApprovals.join(", ")}`);
    }
  }

  const result: TtsSampleReviewResult = {
    status,
    sample_segment_ids: sampleSegmentIds,
    segment_text_hash: segmentTextHash,
    review_file: reviewFile,
    sample_audio: sampleAudio,
    blocking_items: blockingItems
  };

  writeJson(path.join(episodeDir, "review/sample_audio_review_gate_report.json"), {
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
    console.error("Usage: tsx scripts/tts_sample_review_gate.ts <topic.yaml> [--sample-ids seg_001,seg_010,seg_014] [--review-file review/sample_audio_review.json]");
    return 1;
  }

  const sampleIds = argValue(rest, "--sample-ids")?.split(",").map((value) => value.trim()).filter(Boolean);
  const result = runTtsSampleReviewGate(topicPath, ".", {
    sampleSegmentIds: sampleIds,
    reviewFile: argValue(rest, "--review-file")
  });

  console.log(JSON.stringify(result));
  return result.status === "approved" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/tts_sample_review_gate.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
