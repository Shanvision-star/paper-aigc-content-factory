import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

type SegmentManifest = {
  segments: Array<{
    segment_id: string;
    spoken_text: string;
  }>;
};

type PronunciationIssue = {
  segment_id: string;
  term: string;
  reason: string;
  spoken_text: string;
};

const engineManifestPath: Record<string, string> = {
  f5_tts: "audio/f5_tts/segments/segment_manifest.json",
  indextts2: "audio/indextts2/segments/segment_manifest.json"
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function parseArgs(argv: string[]) {
  const topicPath = argv[2];
  const engineIndex = argv.indexOf("--engine");
  const engine = engineIndex >= 0 ? argv[engineIndex + 1] : "indextts2";

  if (!topicPath || !engineManifestPath[engine]) {
    console.error("Usage: tsx scripts/tts_pronunciation_manifest_gate.ts <topic.yaml> [--engine indextts2|f5_tts]");
    process.exit(2);
  }

  return { topicPath, engine };
}

function episodeDirFromTopic(topicPath: string): string {
  const topic = YAML.parse(fs.readFileSync(topicPath, "utf8")) as { episode_id?: string };
  if (!topic.episode_id) {
    throw new Error(`Missing episode_id in ${topicPath}`);
  }
  return path.dirname(topicPath);
}

function findPronunciationIssues(manifest: SegmentManifest): PronunciationIssue[] {
  const checks: Array<[RegExp, string, string]> = [
    [/\bQ\/K\b/i, "Q/K", "spoken_text must say Query and Key, not a compact slash form"],
    [/\bQ\s+Kay\b/i, "Q Kay", "legacy Kay workaround can still sound like kai"],
    [/\bKay\b/i, "Kay", "Kay is too easy to hear as kai in Chinese voiceover"],
    [/DeepSeek-Value\s*向量4/i, "DeepSeek-Value 向量4", "product names must be protected before formula-letter normalization"],
    [/DeepSeek\s+Value\s+向量\s+Four/i, "DeepSeek Value 向量 Four", "product names must be protected before formula-letter normalization"],
    [/\bKV\s+cache\b/i, "KV cache", "spoken_text must say Key Value cache"],
    [/长上下文/g, "长上下文", "spoken_text must rewrite this polyphonic phrase to 上下文长度 or 更大输入范围"],
    [/(?<![A-Za-z])K(?![A-Za-z])/g, "K", "standalone K can be read as kai"],
    [/(?<![A-Za-z])Q(?![A-Za-z])/g, "Q", "standalone Q should be Query for stable reading"],
    [/(?<![A-Za-z])V(?![A-Za-z])/g, "V", "standalone V should be Value for stable reading"]
  ];

  return manifest.segments.flatMap((segment) =>
    checks
      .filter(([pattern]) => pattern.test(segment.spoken_text))
      .map(([, term, reason]) => ({
        segment_id: segment.segment_id,
        term,
        reason,
        spoken_text: segment.spoken_text
      }))
  );
}

function main() {
  const { topicPath, engine } = parseArgs(process.argv);
  const episodeDir = episodeDirFromTopic(topicPath);
  const manifestPath = path.join(episodeDir, engineManifestPath[engine]);

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing TTS segment manifest: ${manifestPath}`);
  }

  const manifest = readJson<SegmentManifest>(manifestPath);
  const issues = findPronunciationIssues(manifest);
  const report = {
    status: issues.length === 0 ? "passed" : "failed",
    engine,
    manifest: path.relative(episodeDir, manifestPath).replace(/\\/g, "/"),
    checked_terms: ["Q/K", "Q Kay", "Kay", "KV cache", "长上下文", "standalone Q", "standalone K", "standalone V"],
    issues
  };
  const reportPath = path.join(episodeDir, "qa", `pronunciation_manifest_gate.${engine}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (issues.length > 0) {
    console.error(`Pronunciation gate failed. report=${reportPath}`);
    console.error(JSON.stringify(issues, null, 2));
    process.exit(1);
  }

  console.log(`Pronunciation gate passed. report=${reportPath}`);
}

main();
