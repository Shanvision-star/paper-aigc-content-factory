import fs from "node:fs";
import path from "node:path";
import {
  episodeDirFromTopicPath,
  escapeHtml,
  readStoryboard,
  runtimeTimestamp,
  writeJson,
  writeText
} from "./lib/runtimeAdapters.js";

export type HyperframesDraftResult = {
  status: "missing_inputs" | "composition_ready";
  outputs: string[];
  missing_inputs: string[];
};

type StoryboardSceneWithAssets = ReturnType<typeof readStoryboard>[number] & {
  assets?: string[];
};

type VisualAsset = {
  asset_id: string;
  kind: "diagram" | "formula" | "paper_original_note" | "frames_note";
  path: string;
  concept: string;
  feynman_analogy: string;
  source: string;
  status: "generated" | "reference_note";
};

type VisualManifest = {
  assets: VisualAsset[];
};

function requiredInputs(episodeDir: string): string[] {
  return [
    "storyboard/storyboard.json",
    "audio/voiceover.wav",
    "captions/subtitles.srt"
  ].filter((relativePath) => !fs.existsSync(path.join(episodeDir, relativePath)));
}

function readFormalScenes(episodeDir: string): StoryboardSceneWithAssets[] {
  const formalStoryboardPath = path.join(episodeDir, "video_script/storyboard.json");

  if (fs.existsSync(formalStoryboardPath)) {
    return JSON.parse(fs.readFileSync(formalStoryboardPath, "utf8")) as StoryboardSceneWithAssets[];
  }

  return readStoryboard(episodeDir).map((scene) => ({ ...scene, assets: [] }));
}

function readAssetMap(episodeDir: string): Map<string, VisualAsset> {
  const manifestPath = path.join(episodeDir, "visuals/assets_manifest.json");

  if (!fs.existsSync(manifestPath)) {
    return new Map();
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as VisualManifest;

  return new Map(manifest.assets.map((asset) => [asset.asset_id, asset]));
}

function slashPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function relativeEpisodeAsset(projectDir: string, episodeDir: string, episodeRelativePath: string): string {
  return slashPath(path.relative(projectDir, path.join(episodeDir, episodeRelativePath)));
}

function projectMediaSrc(projectDir: string, sourcePath: string, fileName: string): string {
  const mediaDir = path.join(projectDir, "media");
  const targetPath = path.join(mediaDir, fileName);

  fs.mkdirSync(mediaDir, { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);

  return slashPath(path.join("media", fileName));
}

function visualHtml(scene: StoryboardSceneWithAssets, assetMap: Map<string, VisualAsset>, projectDir: string, episodeDir: string): string {
  const asset = scene.assets
    ?.map((assetId) => assetMap.get(assetId))
    .find((candidate) => candidate && (candidate.kind === "diagram" || candidate.kind === "formula") && fs.existsSync(path.join(episodeDir, candidate.path)));

  if (!asset) {
    return `<div class="asset-fallback">
      <p class="fallback-label">Visual Anchor</p>
      <p>${escapeHtml(scene.visual_type)}</p>
    </div>`;
  }

  const assetPath = path.join(episodeDir, asset.path);
  const mediaFileName = `${scene.scene_id}_${asset.asset_id}${path.extname(assetPath)}`;

  return `<div class="asset-image" role="img" aria-label="${escapeHtml(asset.concept)}" style="background-image: url('${projectMediaSrc(projectDir, assetPath, mediaFileName)}');"></div>`;
}

function sceneHtml(scene: StoryboardSceneWithAssets, index: number, assetMap: Map<string, VisualAsset>, projectDir: string, episodeDir: string): string {
  return `
      <section id="scene-${escapeHtml(scene.scene_id)}" class="scene scene-${index + 1}">
        <div class="scene-content">
          <p class="eyebrow">EP01 · Transformer</p>
          <h1 class="title">${escapeHtml(scene.caption)}</h1>
          <div class="asset-frame">
            ${visualHtml(scene, assetMap, projectDir, episodeDir)}
          </div>
          <p class="voice">${escapeHtml(scene.voiceover)}</p>
          <p class="meta">${escapeHtml(scene.visual_type)} · ${escapeHtml(scene.engine)}</p>
        </div>
      </section>`;
}

function compositionHtml(episodeDir: string, projectDir: string, compositionId: string): string {
  const storyboard = readFormalScenes(episodeDir);
  const assetMap = readAssetMap(episodeDir);
  const totalDuration = Math.max(...storyboard.map((scene) => scene.start + scene.duration));
  const audioSrc = projectMediaSrc(projectDir, path.join(episodeDir, "audio/voiceover.wav"), "voiceover.wav");
  const scenes = storyboard.map((scene, index) => sceneHtml(scene, index, assetMap, projectDir, episodeDir)).join("\n");
  const sceneMeta = JSON.stringify(storyboard.map((scene) => ({
    id: scene.scene_id,
    start: scene.start,
    duration: scene.duration
  })));

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Attention Is All You Need Draft</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #0f172a;
      color: #f8fafc;
      font-family: Georgia, Arial, sans-serif;
    }
    #root {
      position: relative;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #0f172a;
    }
    .scene {
      position: absolute;
      inset: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #0f172a;
    }
    .scene:not(:first-of-type) { opacity: 0; }
    .scene::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(148, 163, 184, 0.08) 1px, rgba(15, 23, 42, 0) 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, rgba(15, 23, 42, 0) 1px);
      background-size: 72px 72px;
      opacity: 0.5;
    }
    .scene::after {
      content: "";
      position: absolute;
      width: 620px;
      height: 620px;
      right: -220px;
      top: 180px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.16);
      filter: blur(32px);
    }
    .scene-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 128px 78px 260px;
      display: flex;
      flex-direction: column;
      gap: 34px;
      justify-content: center;
    }
    .eyebrow {
      margin: 0;
      color: #f59e0b;
      font-family: Consolas, monospace;
      font-size: 34px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .title {
      max-width: 924px;
      margin: 0;
      color: #f8fafc;
      font-size: 78px;
      line-height: 1.12;
      font-weight: 900;
      letter-spacing: 0.01em;
    }
    .asset-frame {
      width: 924px;
      height: 760px;
      border: 2px solid rgba(148, 163, 184, 0.38);
      background: rgba(15, 23, 42, 0.8);
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .asset-image {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .asset-fallback {
      width: 100%;
      height: 100%;
      display: grid;
      align-content: center;
      gap: 20px;
      padding: 60px;
      background: #172033;
      font-family: Consolas, monospace;
      color: #38bdf8;
      font-size: 42px;
      line-height: 1.3;
    }
    .fallback-label {
      margin: 0;
      color: #f59e0b;
      font-size: 32px;
    }
    .voice {
      margin: 0;
      max-width: 924px;
      color: #e2e8f0;
      font-family: Arial, sans-serif;
      font-size: 40px;
      line-height: 1.45;
      font-weight: 350;
    }
    .meta {
      margin: 0;
      color: #38bdf8;
      font-family: Consolas, monospace;
      font-size: 28px;
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>
  <div
    id="root"
    data-composition-id="${compositionId}"
    data-start="0"
    data-duration="${totalDuration}"
    data-width="1080"
    data-height="1920"
  >
    <audio id="voiceover-audio" data-start="0" data-duration="${totalDuration}" data-track-index="2" src="${audioSrc}" data-volume="1"></audio>
${scenes}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    var sceneMeta = ${sceneMeta};
    var tl = gsap.timeline({ paused: true });
    sceneMeta.forEach(function(scene, index) {
      var selector = "#scene-" + scene.id;
      var start = scene.start;
      if (index > 0) {
        var previous = "#scene-" + sceneMeta[index - 1].id;
        var transitionStart = Math.max(0, start - 0.45);
        tl.to(previous, { filter: "blur(10px)", scale: 1.025, opacity: 0, duration: 0.45, ease: "power2.inOut", overwrite: "auto" }, transitionStart);
        tl.fromTo(selector, { filter: "blur(10px)", scale: 0.985, opacity: 0 }, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.5, ease: "power2.inOut", overwrite: "auto" }, transitionStart + 0.1);
      }
      tl.from(selector + " .eyebrow", { y: 34, opacity: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" }, start + 0.18);
      tl.from(selector + " .title", { x: -44, opacity: 0, duration: 0.55, ease: "expo.out", overwrite: "auto" }, start + 0.28);
      tl.from(selector + " .asset-frame", { y: 58, scale: 0.975, opacity: 0, duration: 0.65, ease: "back.out(1.2)", overwrite: "auto" }, start + 0.42);
      tl.from(selector + " .voice", { y: 36, opacity: 0, duration: 0.5, ease: "sine.out", overwrite: "auto" }, start + 0.64);
      tl.from(selector + " .meta", { y: 22, opacity: 0, duration: 0.4, ease: "power1.out", overwrite: "auto" }, start + 0.82);
    });
    tl.to("#root", { opacity: 0, duration: 0.7, ease: "sine.inOut", overwrite: "auto" }, ${Math.max(0, totalDuration - 0.7)});
    window.__timelines["${compositionId}"] = tl;
  </script>
</body>
</html>
`;
}

export type HyperframesFormalProject = {
  status: "project_ready";
  project_dir: string;
  output_mp4: string;
};

export function buildHyperframesFormalProject(topicPath: string, rootDir = "."): HyperframesFormalProject {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const projectDir = path.join(episodeDir, "renders/hyperframes_formal");
  const durationSec = Math.max(...readFormalScenes(episodeDir).map((scene) => scene.start + scene.duration));

  writeText(path.join(projectDir, "DESIGN.md"), [
    "# EP01 Formal Video Design",
    "",
    "## Style Prompt",
    "",
    "Dark technical explainer for a Chinese AI paper series. The design uses a deep slate canvas, paper-like SVG surfaces, amber emphasis, blue relation lines, and restrained motion so formulas remain readable.",
    "",
    "## Colors",
    "",
    "- Background: #0f172a",
    "- Foreground: #f8fafc",
    "- Secondary text: #e2e8f0",
    "- Accent: #f59e0b",
    "- Relation line: #38bdf8",
    "- Risk highlight: #fb7185",
    "",
    "## Typography",
    "",
    "- Display: Georgia with Microsoft YaHei fallback",
    "- Body: Microsoft YaHei with Arial fallback",
    "- Data labels: Consolas with Microsoft YaHei fallback",
    "",
    "## Formula Asset Contract",
    "",
    "- Formulas must appear as complete visual objects, not cropped fragments.",
    "- Acceptable formula sources: paper crop, formula-editor screenshot, KaTeX/MathJax/SVG, Manim still, or Manim scene.",
    "- Raster formula screenshots must be at least 2x the in-frame display size; vector output is preferred.",
    "- Formula scenes must preserve the full formula bounding box inside the safe area.",
    "- Annotation targets must be available for narrated parts such as QK^T, sqrt(d_k), softmax, and weighted V.",
    "- Captions and callouts must not cover the formula bounding box unless the callout is an intentional annotation.",
    "",
    "## What NOT To Do",
    "",
    "- Do not use platform logos or imply endorsement.",
    "- Do not place subtitles over formulas.",
    "- Do not expose raw LaTeX or broken formula fragments.",
    "- Do not use purple-blue gradient backgrounds.",
    "- Do not auto-publish generated video.",
    ""
  ].join("\n"));
  writeText(path.join(projectDir, "index.html"), compositionHtml(episodeDir, projectDir, "ep01-attention-formal-douyin-v4"));
  writeJson(path.join(projectDir, "meta.json"), {
    title: "Attention Is All You Need Formal Douyin V4",
    duration_sec: durationSec,
    resolution: "1080x1920"
  });
  writeJson(path.join(projectDir, "hyperframes.json"), {
    version: "1",
    entry: "index.html"
  });
  writeJson(path.join(projectDir, "package.json"), {
    scripts: {
      check: "hyperframes lint",
      inspect: "hyperframes inspect",
      render: "hyperframes render -o ../douyin_zh_1080x1920_draft.mp4 --fps 15 --quality draft --resolution portrait --low-memory-mode"
    }
  });

  return {
    status: "project_ready",
    project_dir: projectDir,
    output_mp4: "renders/douyin_zh_1080x1920_draft.mp4"
  };
}

export function runHyperframesDraft(topicPath: string, rootDir = "."): HyperframesDraftResult {
  const episodeDir = episodeDirFromTopicPath(topicPath, rootDir);
  const missingInputs = requiredInputs(episodeDir);
  const statusPath = path.join(episodeDir, "renders/render_status.json");

  if (missingInputs.length > 0) {
    const result: HyperframesDraftResult = {
      status: "missing_inputs",
      outputs: [],
      missing_inputs: missingInputs
    };

    writeJson(statusPath, {
      ...result,
      generated_at: runtimeTimestamp,
      mp4_generated: false
    });

    return result;
  }

  const draftDir = path.join(episodeDir, "renders/hyperframes");
  writeText(path.join(draftDir, "ep01_draft.html"), compositionHtml(episodeDir, draftDir, "ep01-attention-draft"));
  const formalProject = buildHyperframesFormalProject(topicPath, rootDir);

  const result: HyperframesDraftResult = {
    status: "composition_ready",
    outputs: ["renders/hyperframes/ep01_draft.html", "renders/hyperframes_formal/index.html"],
    missing_inputs: []
  };

  writeJson(statusPath, {
    ...result,
    generated_at: runtimeTimestamp,
    formal_project_dir: formalProject.project_dir,
    mp4_generated: false,
    mp4_reason: "HyperFrames render is explicit and not part of default deterministic checks."
  });

  return result;
}

function main(argv: string[]): number {
  const [topicPath] = argv;

  if (!topicPath) {
    console.error("Usage: tsx scripts/hyperframes_draft.ts <topic.yaml>");
    return 1;
  }

  console.log(JSON.stringify(runHyperframesDraft(topicPath)));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/hyperframes_draft.ts")) {
  process.exitCode = main(process.argv.slice(2));
}
