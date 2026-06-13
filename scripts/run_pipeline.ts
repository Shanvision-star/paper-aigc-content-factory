import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PlatformHookResult } from "./lib/hooks.js";
import { episodeDirForTopic } from "./lib/episodePaths.js";
import { readHookPatterns, readPlatformProfile, readTopic, type Topic } from "./lib/contracts.js";
import { buildHooksForTopic, writeHookArtifacts } from "./lib/hooks.js";

const deterministicTimestamp = new Date(0).toISOString();
const worktreeNewline = process.platform === "win32" ? "\r\n" : "\n";

type Claim = {
  claim_id: string;
  claim: string;
  source_ids: string[];
  confidence: "high" | "medium";
  used_in: string[];
};

type VoiceSegment = {
  segment_id: string;
  start: number;
  duration: number;
  text: string;
  claim_ids: string[];
};

type StoryboardScene = {
  scene_id: string;
  start: number;
  duration: number;
  voiceover: string;
  visual_type: string;
  engine: "hyperframes";
  caption: string;
  claim_ids: string[];
  hook_id?: string;
};

function writeText(filePath: string, value: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalizeNewlines(value), "utf8");
}

function writeJson(filePath: string, value: unknown): void {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r?\n/g, worktreeNewline);
}

function normalizeGeneratedTextFiles(filePaths: string[]): void {
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      writeText(filePath, fs.readFileSync(filePath, "utf8"));
    }
  }
}

function copyTopicFile(topicPath: string, episodeDir: string): void {
  const sourcePath = path.resolve(topicPath);
  const targetPath = path.join(episodeDir, "topic.yaml");

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (sourcePath !== path.resolve(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function buildClaims(): Claim[] {
  return [
    {
      claim_id: "c_paper_problem",
      claim: "The Transformer paper targeted sequence transduction without relying on recurrent neural networks.",
      source_ids: ["src_001"],
      confidence: "high",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_attention_core",
      claim: "Scaled dot-product attention compares queries and keys, then uses the resulting weights to combine values.",
      source_ids: ["src_001"],
      confidence: "high",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_attention_qkv",
      claim: "Q, K, and V are projected representations used by attention to decide what information each token should read.",
      source_ids: ["src_001"],
      confidence: "high",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_transformer_parallelism",
      claim: "Self-attention allows the model to process token relationships without the sequential recurrence bottleneck.",
      source_ids: ["src_001"],
      confidence: "high",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_attention_reading_shift",
      claim: "The important shift was not only model size, but the way the architecture reads relationships across a sequence.",
      source_ids: ["src_001", "src_002"],
      confidence: "medium",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_transformer_impact",
      claim: "Transformer-style architectures became foundational for many later large language models.",
      source_ids: ["src_001", "src_002"],
      confidence: "medium",
      used_in: ["blog", "script", "storyboard"]
    },
    {
      claim_id: "c_paper_summary",
      claim: "A practical explanation of the paper can be organized around the problem, attention mechanism, and later impact.",
      source_ids: ["src_001", "src_002"],
      confidence: "medium",
      used_in: ["blog", "script", "storyboard"]
    }
  ];
}

function writeResearchArtifacts(topic: Topic, episodeDir: string, claims: Claim[]): void {
  const sources = [
    {
      source_id: "src_001",
      type: "primary_paper",
      title: topic.paper.title,
      arxiv_id: topic.paper.arxiv_id,
      url: `https://arxiv.org/abs/${topic.paper.arxiv_id}`,
      access_mode: "recorded_reference_no_network_call"
    },
    {
      source_id: "src_002",
      type: "local_research_input",
      title: "Local deep research report",
      path: topic.paper.local_research_report,
      access_mode: "declared_input_not_read_by_contract_smoke"
    }
  ];

  writeText(
    path.join(episodeDir, "research", "sources.jsonl"),
    `${sources.map((source) => JSON.stringify(source)).join("\n")}\n`
  );
  writeText(
    path.join(episodeDir, "research", "paper_notes.md"),
    [
      `# ${topic.paper.title} Notes`,
      "",
      "Contract-smoke notes are deterministic P0 placeholders.",
      "",
      "- Primary source anchor: arXiv 1706.03762.",
      "- Core explanation path: problem -> attention/QKV -> parallel reading -> later LLM impact.",
      "- Local deep research input is recorded for traceability, but this smoke run does not read external files or call networks.",
      ""
    ].join("\n")
  );
  writeJson(path.join(episodeDir, "research", "claims.json"), claims);
  writeJson(path.join(episodeDir, "research", "timeline.json"), [
    {
      event_id: "t001",
      date: "2017-06",
      title: "Attention Is All You Need appears on arXiv",
      source_ids: ["src_001"]
    },
    {
      event_id: "t002",
      date: "contract-smoke",
      title: "P0 deterministic content package skeleton generated",
      source_ids: ["src_002"]
    }
  ]);
}

function selectedHookForPlatform(results: PlatformHookResult[], platform: string): string {
  const hook = results.find((result) => result.platform === platform)?.variants[0];
  if (!hook) {
    throw new Error(`Missing selected hook for platform ${platform}`);
  }

  return hook.spoken_line;
}

function buildVoiceSegments(hookResults: PlatformHookResult[]): VoiceSegment[] {
  return [
    {
      segment_id: "seg_001",
      start: 0,
      duration: 8,
      text: selectedHookForPlatform(hookResults, "douyin.zh-CN"),
      claim_ids: ["c_attention_qkv"]
    },
    {
      segment_id: "seg_002",
      start: 8,
      duration: 10,
      text: "这篇论文的关键，不是把模型堆得更大，而是改变模型阅读序列的方式。",
      claim_ids: ["c_attention_reading_shift", "c_transformer_parallelism"]
    },
    {
      segment_id: "seg_003",
      start: 18,
      duration: 12,
      text: "Q 像是在提问，K 像是在被匹配，V 则承载真正要被汇总的信息。",
      claim_ids: ["c_attention_qkv", "c_attention_core"]
    },
    {
      segment_id: "seg_004",
      start: 30,
      duration: 10,
      text: "当所有 token 可以同时看见彼此，长距离关系就不再只能排队传递。",
      claim_ids: ["c_transformer_parallelism"]
    },
    {
      segment_id: "seg_005",
      start: 40,
      duration: 10,
      text: "这也是后来许多大语言模型都绕不开 Transformer 的原因之一。",
      claim_ids: ["c_transformer_impact"]
    }
  ];
}

function buildStoryboard(segments: VoiceSegment[], hookResults: PlatformHookResult[]): StoryboardScene[] {
  const firstHookId = hookResults.find((result) => result.platform === "douyin.zh-CN")?.selected_hook_id;

  return segments.map((segment, index) => ({
    scene_id: `S${String(index + 1).padStart(2, "0")}`,
    start: segment.start,
    duration: segment.duration,
    voiceover: segment.text,
    visual_type: index === 0 ? "title_hook" : index === 2 ? "qkv_cards" : "explanation_card",
    engine: "hyperframes",
    caption: index === 0 ? "QKV 到底是什么？" : segment.text,
    claim_ids: segment.claim_ids,
    ...(index === 0 && firstHookId ? { hook_id: firstHookId } : {})
  }));
}

function writeScriptAndStoryArtifacts(
  topic: Topic,
  episodeDir: string,
  hookResults: PlatformHookResult[]
): void {
  const segments = buildVoiceSegments(hookResults);
  const storyboard = buildStoryboard(segments, hookResults);

  writeText(
    path.join(episodeDir, "script", "voiceover.md"),
    [
      `# ${topic.title} Voiceover`,
      "",
      "> Contract-smoke draft. No TTS, no voice cloning, no real audio generated.",
      "",
      ...segments.map((segment) => `## ${segment.segment_id}\n\n${segment.text}\n`)
    ].join("\n")
  );
  writeJson(path.join(episodeDir, "script", "voice_segments.json"), segments);
  writeJson(path.join(episodeDir, "storyboard", "storyboard.json"), storyboard);
  writeText(
    path.join(episodeDir, "blog", "blog.md"),
    [
      `# ${topic.title}`,
      "",
      "Contract-smoke blog draft for P0 verification.",
      "",
      "## Thesis",
      "",
      "Transformer 的核心价值，是用 attention 改变序列信息的读取方式，并让解释可以从 Q/K/V、并行关系和后续影响三层展开。",
      "",
      "## Claim Trace",
      "",
      "- c_paper_problem",
      "- c_attention_core",
      "- c_attention_qkv",
      "- c_transformer_parallelism",
      "- c_transformer_impact",
      ""
    ].join("\n")
  );
}

function writeVoiceArtifacts(episodeDir: string): void {
  writeText(
    path.join(episodeDir, "voice", "enrollment", "recording_needed.md"),
    [
      "# Recording Needed",
      "",
      "Personal voice enrollment is not ready for P0 contract-smoke.",
      "",
      "- Missing: voice/enrollment/consent.wav",
      "- Missing: voice/enrollment/reference_*.wav",
      "- No GPT-SoVITS, OpenAI TTS, or other TTS provider was called.",
      ""
    ].join("\n")
  );
  writeJson(path.join(episodeDir, "voice", "voice_profile_manifest.json"), {
    voice_profile_id: "rome_personal_zh_v1",
    owner: "user_self",
    consent_audio: "voice/enrollment/consent.wav",
    reference_audio: [],
    allowed_use: ["personal_ai_paper_voiceover"],
    default_engine: "gpt_sovits_local",
    fallback_engine: "openai_tts",
    status: "recording_needed",
    generated_at: deterministicTimestamp,
    provider_calls: false,
    tts_calls: false
  });
}

function writeHumanReview(episodeDir: string): void {
  writeText(
    path.join(episodeDir, "review", "human_review.md"),
    [
      "# Human Review",
      "",
      "Status: partial",
      "",
      "## Verified by contract-smoke",
      "",
      "- Topic copied into the episode workspace.",
      "- Research, claims, timeline, hook, script, storyboard, blog, voice enrollment, and review contracts exist.",
      "- Hook artifacts are deterministic and generated without provider calls.",
      "",
      "## Not verified",
      "",
      "- Real personal voice consent and reference recordings.",
      "- TTS audio generation.",
      "- Caption alignment.",
      "- HyperFrames or Manim rendering.",
      "- Platform publish package.",
      "- Auto-publish, which remains forbidden for P0.",
      ""
    ].join("\n")
  );
}

export function runContractSmoke(topicPath: string, rootDir = "."): void {
  const topic = readTopic(topicPath);
  const outputRoot = path.resolve(rootDir);
  const episodeDir = path.join(outputRoot, episodeDirForTopic(topic));
  const profiles = topic.targets.map((profileId) => readPlatformProfile(profileId));
  const patterns = readHookPatterns();
  const hookResults = buildHooksForTopic(topic, profiles, patterns);
  const claims = buildClaims();

  copyTopicFile(topicPath, episodeDir);
  writeResearchArtifacts(topic, episodeDir, claims);
  writeHookArtifacts(episodeDir, hookResults);
  normalizeGeneratedTextFiles([
    path.join(episodeDir, "script", "hooks.json"),
    path.join(episodeDir, "storyboard", "hook_variants.json"),
    path.join(episodeDir, "qa", "hook_report.json")
  ]);
  writeScriptAndStoryArtifacts(topic, episodeDir, hookResults);
  writeVoiceArtifacts(episodeDir);
  writeHumanReview(episodeDir);
}

function printUsage(): void {
  console.error("Usage: tsx scripts/run_pipeline.ts <topic.yaml> --mode contract-smoke");
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;
  const modeIndex = rest.indexOf("--mode");
  const mode = modeIndex >= 0 ? rest[modeIndex + 1] : undefined;

  if (!topicPath || mode !== "contract-smoke") {
    printUsage();
    return 1;
  }

  runContractSmoke(topicPath);
  console.log("OK contract-smoke");
  return 0;
}

const isCli = process.argv[1] ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;

if (isCli) {
  process.exitCode = main(process.argv.slice(2));
}
