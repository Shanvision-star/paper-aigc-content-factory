import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { buildHyperframesFormalProject, runHyperframesDraft } from "./hyperframes_draft.js";
import { buildHyperframesRenderEnv } from "./hyperframes_render_smoke.js";
import { buildRenderInputFingerprint } from "./lib/renderFreshness.js";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson } from "./lib/runtimeAdapters.js";

type HyperframesFormalRenderResult = {
  status: "missing_inputs" | "rendered" | "render_failed";
  project_dir: string | null;
  output_mp4: string;
  exit_code: number | null;
  mux_exit_code?: number | null;
  missing_inputs: string[];
  input_fingerprint?: string | null;
};

function nodeBin(commandName: string): string {
  return path.join("node_modules", ".bin", process.platform === "win32" ? `${commandName}.cmd` : commandName);
}

function muxAudio(outputPath: string, audioPath: string, env: NodeJS.ProcessEnv): { status: "muxed" | "failed"; exitCode: number | null; stderr: string } {
  const ffmpegPath = env.HYPERFRAMES_FFMPEG_PATH ?? "ffmpeg";
  const muxedPath = outputPath.replace(/\.mp4$/i, ".muxed.mp4");
  const result = spawnSync(ffmpegPath, [
    "-y",
    "-i",
    outputPath,
    "-i",
    audioPath,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    muxedPath
  ], {
    cwd: path.resolve("."),
    env,
    encoding: "utf8",
    shell: false
  });

  if (result.status === 0 && fs.existsSync(muxedPath)) {
    fs.rmSync(outputPath, { force: true });
    fs.renameSync(muxedPath, outputPath);

    return { status: "muxed", exitCode: result.status, stderr: result.stderr ?? "" };
  }

  fs.rmSync(muxedPath, { force: true });

  return { status: "failed", exitCode: result.status, stderr: result.stderr ?? result.error?.message ?? "" };
}

export function runHyperframesFormalRender(topicPath: string, rootDir = "."): HyperframesFormalRenderResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const draft = runHyperframesDraft(topicPath, rootDir);
  const statusPath = path.join(episodeDir, "renders/hyperframes_formal_status.json");

  if (draft.status === "missing_inputs") {
    const missingResult: HyperframesFormalRenderResult = {
      status: "missing_inputs",
      project_dir: null,
      output_mp4: "renders/douyin_zh_1080x1920_draft.mp4",
      exit_code: null,
      missing_inputs: draft.missing_inputs
    };

    writeJson(statusPath, {
      ...missingResult,
      generated_at: runtimeTimestamp
    });

    return missingResult;
  }

  const project = buildHyperframesFormalProject(topicPath, rootDir);
  const inputFingerprint = buildRenderInputFingerprint(episodeDir);
  const outputPath = path.join(episodeDir, project.output_mp4);
  const audioPath = path.join(episodeDir, "audio/voiceover.wav");
  const hyperframes = nodeBin("hyperframes");
  const env = buildHyperframesRenderEnv();
  const renderArgs = ["render", project.project_dir, "-o", outputPath, "--fps", "15", "--quality", "draft", "--resolution", "portrait", "--low-memory-mode"];
  const command = process.platform === "win32" ? "cmd.exe" : hyperframes;
  const commandArgs = process.platform === "win32" ? ["/c", hyperframes, ...renderArgs] : renderArgs;
  const result = spawnSync(command, commandArgs, {
    cwd: path.resolve("."),
    env,
    encoding: "utf8",
    shell: false
  });
  const renderSucceeded = result.status === 0 && fs.existsSync(outputPath);
  const muxResult = renderSucceeded ? muxAudio(outputPath, audioPath, env) : null;
  const status: HyperframesFormalRenderResult["status"] = renderSucceeded && muxResult?.status === "muxed" ? "rendered" : "render_failed";
  const summary: HyperframesFormalRenderResult = {
    status,
    project_dir: project.project_dir,
    output_mp4: project.output_mp4,
    exit_code: result.status,
    mux_exit_code: muxResult?.exitCode ?? null,
    missing_inputs: inputFingerprint.missing_inputs,
    input_fingerprint: inputFingerprint.input_fingerprint
  };

  writeJson(statusPath, {
    ...summary,
    input_fingerprints: inputFingerprint.input_fingerprints,
    generated_at: runtimeTimestamp,
    stdout_tail: result.stdout?.slice(-2000) ?? "",
    stderr_tail: result.stderr?.slice(-2000) ?? "",
    mux_stderr_tail: muxResult?.stderr.slice(-2000) ?? "",
    error: result.error?.message ?? null
  });

  return summary;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;
  const shouldRender = rest.includes("--render");

  if (!topicPath) {
    console.error("Usage: tsx scripts/hyperframes_render_formal.ts <topic.yaml> [--render]");
    return 1;
  }

  if (!shouldRender) {
    const project = buildHyperframesFormalProject(topicPath);
    console.log(JSON.stringify(project));
    return 0;
  }

  const result = runHyperframesFormalRender(topicPath);
  console.log(JSON.stringify(result));

  return result.status === "render_failed" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/hyperframes_render_formal.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
