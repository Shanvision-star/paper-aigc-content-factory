import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

type TtsEngine = "f5_tts" | "indextts2";

type SegmentManifest = {
  text_hash: string;
  segments: Array<{
    segment_id: string;
    spoken_text: string;
    output_audio: string;
  }>;
};

const engineManifestPath: Record<TtsEngine, string> = {
  f5_tts: "audio/f5_tts/segments/segment_manifest.json",
  indextts2: "audio/indextts2/segments/segment_manifest.json"
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function parseArgs(argv: string[]) {
  const topicPath = argv[2];
  const engineIndex = argv.indexOf("--engine");
  const engine = (engineIndex >= 0 ? argv[engineIndex + 1] : "indextts2") as TtsEngine;
  const segmentIds = new Set<string>();
  argv.forEach((value, index) => {
    if (value === "--segment-id" || value === "--segment-ids") {
      const rawValue = argv[index + 1] ?? "";
      rawValue.split(",").map((item) => item.trim()).filter(Boolean).forEach((item) => segmentIds.add(item));
    }
  });

  if (!topicPath || (engine !== "f5_tts" && engine !== "indextts2")) {
    console.error("Usage: tsx scripts/tts_audio_freshness_gate.ts <topic.yaml> [--engine indextts2|f5_tts]");
    process.exit(2);
  }

  return { topicPath, engine, segmentIds };
}

function episodeDirFromTopic(topicPath: string): string {
  const topic = YAML.parse(fs.readFileSync(topicPath, "utf8")) as { episode_id?: string };
  if (!topic.episode_id) {
    throw new Error(`Missing episode_id in ${topicPath}`);
  }
  return path.dirname(topicPath);
}

function main() {
  const { topicPath, engine, segmentIds } = parseArgs(process.argv);
  const episodeDir = episodeDirFromTopic(topicPath);
  const manifestPath = path.join(episodeDir, engineManifestPath[engine]);

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing TTS segment manifest: ${manifestPath}`);
  }

  const manifest = readJson<SegmentManifest>(manifestPath);
  const manifestMtime = fs.statSync(manifestPath).mtimeMs;
  const checkedSegments = segmentIds.size > 0
    ? manifest.segments.filter((segment) => segmentIds.has(segment.segment_id))
    : manifest.segments;
  const foundSegmentIds = new Set(checkedSegments.map((segment) => segment.segment_id));
  const missingRequestedSegments = [...segmentIds].filter((segmentId) => !foundSegmentIds.has(segmentId));
  if (missingRequestedSegments.length > 0) {
    throw new Error(`Requested segment ids not found in manifest: ${missingRequestedSegments.join(", ")}`);
  }

  const staleSegments = checkedSegments.flatMap((segment) => {
    const audioPath = path.join(episodeDir, segment.output_audio);
    if (!fs.existsSync(audioPath)) {
      return [{
        segment_id: segment.segment_id,
        output_audio: segment.output_audio,
        reason: "missing_audio"
      }];
    }

    const audioStat = fs.statSync(audioPath);
    if (audioStat.size <= 44) {
      return [{
        segment_id: segment.segment_id,
        output_audio: segment.output_audio,
        reason: "invalid_wav_too_small",
        size: audioStat.size
      }];
    }

    if (audioStat.mtimeMs + 500 < manifestMtime) {
      return [{
        segment_id: segment.segment_id,
        output_audio: segment.output_audio,
        reason: "audio_older_than_manifest",
        audio_mtime: audioStat.mtime.toISOString(),
        manifest_mtime: fs.statSync(manifestPath).mtime.toISOString()
      }];
    }

    return [];
  });

  const report = {
    status: staleSegments.length === 0 ? "passed" : "failed",
    engine,
    manifest: path.relative(episodeDir, manifestPath).replace(/\\/g, "/"),
    text_hash: manifest.text_hash,
    checked_segments: checkedSegments.length,
    checked_segment_ids: checkedSegments.map((segment) => segment.segment_id),
    stale_segments: staleSegments
  };
  const reportPath = path.join(episodeDir, "qa", `audio_freshness_gate.${engine}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (staleSegments.length > 0) {
    console.error(`Audio freshness gate failed. report=${reportPath}`);
    console.error(JSON.stringify(staleSegments, null, 2));
    process.exit(1);
  }

  console.log(`Audio freshness gate passed. report=${reportPath}`);
}

main();
