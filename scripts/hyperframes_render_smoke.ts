import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import { episodeDirFromTopicPath, runtimeTimestamp, writeJson, writeText } from "./lib/runtimeAdapters.js";

const require = createRequire(import.meta.url);

type HyperframesSmokeProject = {
  status: "project_ready";
  project_dir: string;
  output_mp4: string;
};

type HyperframesRenderSmokeResult = {
  status: "rendered" | "render_failed";
  project_dir: string;
  output_mp4: string;
  exit_code: number | null;
};

function nodeBin(commandName: string): string {
  return path.join("node_modules", ".bin", process.platform === "win32" ? `${commandName}.cmd` : commandName);
}

function isRunnableBinary(binaryPath: string): boolean {
  if (!fs.existsSync(binaryPath)) {
    return false;
  }

  const result = spawnSync(binaryPath, ["-version"], { encoding: "utf8", timeout: 5000 });

  return result.status === 0 && !result.error;
}

function ffmpegInstallerPath(): string | null {
  try {
    const ffmpeg = require("@ffmpeg-installer/ffmpeg") as { path?: string };
    return ffmpeg.path && isRunnableBinary(ffmpeg.path) ? ffmpeg.path : null;
  } catch {
    return null;
  }
}

function ffmpegStaticPath(): string | null {
  try {
    const ffmpegPath = String(require("ffmpeg-static") as string);
    return isRunnableBinary(ffmpegPath) ? ffmpegPath : null;
  } catch {
    return null;
  }
}

function ffprobeStaticPath(): string | null {
  try {
    const ffprobe = require("ffprobe-static") as { path?: string };
    return ffprobe.path && isRunnableBinary(ffprobe.path) ? ffprobe.path : null;
  } catch {
    return null;
  }
}

function resolveFfmpegPath(baseEnv: NodeJS.ProcessEnv): string | null {
  if (baseEnv.HYPERFRAMES_FFMPEG_PATH) {
    return baseEnv.HYPERFRAMES_FFMPEG_PATH;
  }

  return ffmpegInstallerPath() ?? ffmpegStaticPath();
}

function resolveFfprobePath(baseEnv: NodeJS.ProcessEnv): string | null {
  if (baseEnv.HYPERFRAMES_FFPROBE_PATH) {
    return baseEnv.HYPERFRAMES_FFPROBE_PATH;
  }

  return ffprobeStaticPath();
}

function discoverPlaywrightHeadlessShell(): string | null {
  const baseDir = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  if (!fs.existsSync(baseDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium_headless_shell-"))
    .map((entry) => path.join(baseDir, entry.name, "chrome-headless-shell-win64", "chrome-headless-shell.exe"))
    .filter((candidate) => fs.existsSync(candidate))
    .sort()
    .reverse();

  return candidates[0] ?? null;
}

export function buildHyperframesRenderEnv(baseEnv: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const ffmpegPath = resolveFfmpegPath(baseEnv);
  const ffprobePath = resolveFfprobePath(baseEnv);
  const pathPrefix = [ffmpegPath && path.dirname(ffmpegPath), ffprobePath && path.dirname(ffprobePath), path.resolve("node_modules/.bin")]
    .filter(Boolean)
    .join(path.delimiter);
  const browserPath = baseEnv.HYPERFRAMES_BROWSER_PATH ?? discoverPlaywrightHeadlessShell();

  return {
    ...baseEnv,
    PATH: pathPrefix ? `${pathPrefix}${path.delimiter}${baseEnv.PATH ?? ""}` : baseEnv.PATH,
    ...(ffmpegPath ? { HYPERFRAMES_FFMPEG_PATH: ffmpegPath } : {}),
    ...(ffprobePath ? { HYPERFRAMES_FFPROBE_PATH: ffprobePath } : {}),
    ...(browserPath ? { HYPERFRAMES_BROWSER_PATH: browserPath, PRODUCER_HEADLESS_SHELL_PATH: browserPath } : {})
  };
}

function smokeHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: #101820;
        color: #f7f7f2;
        font-family: Arial, sans-serif;
      }
      #root {
        width: 1080px;
        height: 1920px;
        display: grid;
        place-items: center;
        padding: 88px;
      }
      .panel { display: grid; gap: 36px; }
      .eyebrow { color: #f2c14e; font-size: 44px; margin: 0; }
      h1 { font-size: 86px; line-height: 1.15; margin: 0; }
      p { font-size: 42px; line-height: 1.45; margin: 0; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="ep01-hyperframes-smoke"
      data-start="0"
      data-duration="3"
      data-width="1080"
      data-height="1920"
    >
      <section id="smoke-panel" class="panel clip" data-start="0" data-duration="3" data-track-index="1">
        <p class="eyebrow">HyperFrames Smoke</p>
        <h1>Attention Is All You Need</h1>
        <p>Q、K、V 是 Transformer 讲解视频的第一段视觉锚点。</p>
      </section>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.from(".panel", { opacity: 0, y: 80, duration: 0.8 }, 0);
      window.__timelines["ep01-hyperframes-smoke"] = tl;
    </script>
  </body>
</html>
`;
}

export function buildHyperframesSmokeProject(topicPath: string, rootDir = "."): HyperframesSmokeProject {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const projectDir = path.join(episodeDir, "renders/hyperframes_smoke");

  writeText(path.join(projectDir, "index.html"), smokeHtml());
  writeJson(path.join(projectDir, "meta.json"), {
    title: "Attention Is All You Need HyperFrames Smoke"
  });
  writeJson(path.join(projectDir, "hyperframes.json"), {
    version: "1",
    entry: "index.html"
  });
  writeJson(path.join(projectDir, "package.json"), {
    scripts: {
      check: "hyperframes lint",
      render: "hyperframes render -o ../hyperframes_smoke_1080x1920.mp4 --fps 15 --quality draft"
    }
  });

  return {
    status: "project_ready",
    project_dir: projectDir,
    output_mp4: "renders/hyperframes_smoke_1080x1920.mp4"
  };
}

export function runHyperframesRenderSmoke(topicPath: string, rootDir = "."): HyperframesRenderSmokeResult {
  const project = buildHyperframesSmokeProject(topicPath, rootDir);
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const outputPath = path.join(episodeDir, project.output_mp4);
  const hyperframes = nodeBin("hyperframes");
  const env = buildHyperframesRenderEnv();

  const renderArgs = ["render", project.project_dir, "-o", outputPath, "--fps", "15", "--quality", "draft", "--resolution", "portrait", "--low-memory-mode"];
  const command = process.platform === "win32" ? "cmd.exe" : hyperframes;
  const commandArgs = process.platform === "win32" ? ["/c", hyperframes, ...renderArgs] : renderArgs;
  const result = spawnSync(
    command,
    commandArgs,
    {
      cwd: path.resolve("."),
      env,
      encoding: "utf8",
      shell: false
    }
  );

  const status: HyperframesRenderSmokeResult["status"] = result.status === 0 && fs.existsSync(outputPath) ? "rendered" : "render_failed";
  const summary: HyperframesRenderSmokeResult = {
    status,
    project_dir: project.project_dir,
    output_mp4: project.output_mp4,
    exit_code: result.status
  };

  writeJson(path.join(episodeDir, "renders/hyperframes_smoke_status.json"), {
    ...summary,
    generated_at: runtimeTimestamp,
    stdout_tail: result.stdout?.slice(-2000) ?? "",
    stderr_tail: result.stderr?.slice(-2000) ?? "",
    error: result.error?.message ?? null
  });

  return summary;
}

function main(argv: string[]): number {
  const [topicPath, ...rest] = argv;
  const shouldRender = rest.includes("--render");

  if (!topicPath) {
    console.error("Usage: tsx scripts/hyperframes_render_smoke.ts <topic.yaml> [--render]");
    return 1;
  }

  const result = shouldRender ? runHyperframesRenderSmoke(topicPath) : buildHyperframesSmokeProject(topicPath);
  console.log(JSON.stringify(result));

  return "status" in result && result.status === "render_failed" ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/hyperframes_render_smoke.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
