import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  readVoiceSegments,
  runtimeTimestamp,
  writeJson
} from "./lib/runtimeAdapters.js";

type VoiceSentence = {
  segment_id: string;
  text: string;
  normalized: string;
};

type DuplicateIssue = {
  kind: "exact" | "near";
  first_segment_id: string;
  second_segment_id: string;
  first_text: string;
  second_text: string;
  similarity: number;
};

export type VoiceoverDuplicateGuardResult = {
  status: "pass" | "failed";
  issues: DuplicateIssue[];
  checked_sentences: number;
};

function normalizeSentence(value: string): string {
  return value
    .replace(/\s+/g, "")
    .replace(/[，。！？：；、“”《》（）,.!?;:'"()[\]-]/g, "")
    .toLowerCase();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？!?])|[\n\r]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function bigrams(value: string): Set<string> {
  const grams = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    grams.add(value.slice(index, index + 2));
  }

  return grams;
}

function diceSimilarity(a: string, b: string): number {
  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);
  if (aBigrams.size === 0 || bBigrams.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const gram of aBigrams) {
    if (bBigrams.has(gram)) {
      intersection += 1;
    }
  }

  return (2 * intersection) / (aBigrams.size + bBigrams.size);
}

function collectSentences(episodeDir: string): VoiceSentence[] {
  return readVoiceSegments(episodeDir)
    .flatMap((segment) => splitSentences(segment.text).map((sentence) => ({
      segment_id: segment.segment_id,
      text: sentence,
      normalized: normalizeSentence(sentence)
    })))
    .filter((sentence) => sentence.normalized.length >= 8);
}

function findDuplicateIssues(sentences: VoiceSentence[]): DuplicateIssue[] {
  const issues: DuplicateIssue[] = [];

  for (let left = 0; left < sentences.length; left += 1) {
    for (let right = left + 1; right < sentences.length; right += 1) {
      const first = sentences[left];
      const second = sentences[right];

      if (first.normalized === second.normalized) {
        issues.push({
          kind: "exact",
          first_segment_id: first.segment_id,
          second_segment_id: second.segment_id,
          first_text: first.text,
          second_text: second.text,
          similarity: 1
        });
        continue;
      }

      const similarity = diceSimilarity(first.normalized, second.normalized);
      if (similarity >= 0.9) {
        issues.push({
          kind: "near",
          first_segment_id: first.segment_id,
          second_segment_id: second.segment_id,
          first_text: first.text,
          second_text: second.text,
          similarity: Number(similarity.toFixed(3))
        });
      }
    }
  }

  return issues;
}

export function runVoiceoverDuplicateGuard(topicPath: string, rootDir = "."): VoiceoverDuplicateGuardResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const sentences = collectSentences(episodeDir);
  const issues = findDuplicateIssues(sentences);
  const result: VoiceoverDuplicateGuardResult = {
    status: issues.length === 0 ? "pass" : "failed",
    issues,
    checked_sentences: sentences.length
  };

  writeJson(path.join(episodeDir, "script/voiceover_duplicate_report.json"), {
    ...result,
    generated_at: runtimeTimestamp
  });

  return result;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/voiceover_duplicate_guard.ts <topic.yaml>");
    return 1;
  }

  const result = runVoiceoverDuplicateGuard(topicPath);
  console.log(JSON.stringify(result));
  return result.status === "pass" ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/voiceover_duplicate_guard.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
