import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { runHyperframesDraft } from "../scripts/hyperframes_draft.js";

describe("EP02 QKV workflow", () => {
  it("keeps the HyperFrames preview connector arrows anchored and non-penetrating", () => {
    const html = fs.readFileSync("episodes/ep02_attention_qkv/renders/hyperframes_preview/ep02_qkv_hero_preview.html", "utf8");
    const composer = fs.readFileSync("scripts/hyperframes_draft.ts", "utf8");
    const arrowPaths = Array.from(html.matchAll(/<path class="edge[^"]*" d="([^"]+)"/g)).map((match) => match[1]);

    expect(html).toContain("edge-svg");
    expect(html).toContain("Anchor endpoints stop at the K-card left boundary");
    expect(html).toContain("marker-end=\"url(#arrow");
    expect(html).not.toContain("<span class=\"edge");
    expect(arrowPaths).toHaveLength(4);

    for (const pathData of arrowPaths) {
      expect(pathData).toContain("M 240 337");
      expect(pathData).toMatch(/306 (215|290|365|440)$/);
      expect(pathData).not.toContain("385");
    }

    expect(composer.indexOf("<g class=\"ep02-edges\"")).toBeGreaterThanOrEqual(0);
    expect(composer.indexOf("<g class=\"ep02-edges\"")).toBeLessThan(composer.indexOf("<circle cx=\"450\" cy=\"260\""));
  });

  it("records the approved V4 script and 14-segment storyboard for QKV production", () => {
    const topic = fs.readFileSync("episodes/ep02_attention_qkv/topic.yaml", "utf8");
    const voiceover = fs.readFileSync("episodes/ep02_attention_qkv/video_script/douyin_voiceover_v4.md", "utf8");
    const storyboard = JSON.parse(fs.readFileSync("episodes/ep02_attention_qkv/video_script/storyboard_v4.json", "utf8"));

    expect(topic).toContain("ep02_attention_qkv");
    expect(topic).toContain("QKV 到底在算什么");
    expect(voiceover).toContain("Attention 像一张不断变化的关系图。");
    expect(voiceover).toContain("Q 乘 K 转置。");
    expect(voiceover).toContain("KV Cache 缓存的不是原始 token。");
    expect(voiceover).toContain("Multi-Head Attention");
    expect(storyboard).toHaveLength(14);
    expect(storyboard[0].scene_id).toBe("S01");
    expect(storyboard[0].voiceover).toContain("Attention 像一张不断变化的关系图");
    expect(storyboard[9].voiceover).toContain("ChatGPT 或 Claude");
    expect(storyboard[13].voiceover).toContain("Multi-Head Attention");
  });

  it("locks EP02 frame and visual asset contracts before HyperFrames composition", () => {
    const frame = fs.readFileSync("episodes/ep02_attention_qkv/video_script/FRAME.md", "utf8");
    const manifest = JSON.parse(fs.readFileSync("episodes/ep02_attention_qkv/visuals/assets_manifest.json", "utf8"));
    const storyboard = JSON.parse(fs.readFileSync("episodes/ep02_attention_qkv/video_script/storyboard.json", "utf8"));
    const sourceRequiredScenes = storyboard.filter((scene: { scene_id: string }) => scene.scene_id !== "S14");

    expect(frame).toContain("https://nlp.seas.harvard.edu/annotated-transformer/");
    expect(frame).toContain("Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V");
    expect(frame).toContain("Caption Display Guard");
    expect(frame).toContain("Block render approval if any EP02 source-required scene has empty `assets`");
    expect(manifest.assets.map((asset: { asset_id: string }) => asset.asset_id)).toEqual(expect.arrayContaining([
      "ep02_formula_scaled_dot_product_attention_svg",
      "ep02_harvard_attention_code_svg",
      "ep02_qk_relation_graph_svg",
      "ep02_qkv_projection_pipeline_svg",
      "ep02_kv_cache_engineering_svg"
    ]));
    expect(manifest.source_notes[0].url).toBe("https://nlp.seas.harvard.edu/annotated-transformer/");
    expect(sourceRequiredScenes.every((scene: { assets: string[] }) => scene.assets.length > 0)).toBe(true);
  });

  it("adds an EP02 real-audio Dagu chain that cannot write to EP01 paths", () => {
    const workflow = YAML.parse(fs.readFileSync("dagu/ai-paper-content-factory-ep02-real-audio.yaml", "utf8"));
    const steps = Object.fromEntries(workflow.steps.map((step: { id: string }) => [step.id, step]));
    const expectedChain = [
      "validate_topic",
      "contract_smoke",
      "sync_runtime",
      "copy_voice_reference",
      "voiceover_duplicate_guard",
      "reference_safety",
      "prepare_tts_segments",
      "sample",
      "asr_diff",
      "human_approval",
      "full_tts",
      "merge",
      "apply_audio_timings",
      "audio_postprocess",
      "import_voiceover",
      "captions",
      "render",
      "publish_pack",
      "quality_gate",
      "pipeline_map",
      "test",
      "typecheck",
      "inspect_artifacts"
    ];

    for (const id of expectedChain) {
      expect(steps[id]).toBeTruthy();
    }

    expect(workflow.retry_policy.limit).toBe(0);
    expect(steps.sync_runtime.run).toBe("npm run runtime:sync-ep02-v4");
    expect(steps.copy_voice_reference.depends).toBe("sync_runtime");
    expect(steps.copy_voice_reference.run).toBe("npm run voice:copy-reference:ep02");
    expect(steps.sample.run).toBe("npm run audio:indextts2-generate-samples:ep02");
    expect(steps.full_tts.run).toBe("npm run audio:indextts2-generate-full:ep02");
    expect(steps.prepare_tts_segments.run).toBe("npm run audio:indextts2-prepare-segments:ep02");
    expect(steps.full_tts.depends).toBe("human_approval");
    expect(steps.render.run).toBe("npm run video:hyperframes-render-formal:ep02");
    expect(steps.render.depends).toBe("captions");
    expect(steps.sample.run).not.toContain("ep01_attention_is_all_you_need");
    expect(steps.full_tts.run).not.toContain("ep01_attention_is_all_you_need");
  });

  it("renders EP02 HyperFrames HTML without EP01 labels or Visual Anchor placeholders", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ep02-hyperframes-"));
    const episodeDir = path.join(tempRoot, "episodes/ep02_attention_qkv");

    try {
      fs.mkdirSync(path.join(episodeDir, "video_script"), { recursive: true });
      fs.mkdirSync(path.join(episodeDir, "storyboard"), { recursive: true });
      fs.mkdirSync(path.join(episodeDir, "visuals"), { recursive: true });
      fs.mkdirSync(path.join(episodeDir, "audio"), { recursive: true });
      fs.mkdirSync(path.join(episodeDir, "captions"), { recursive: true });

      fs.writeFileSync(path.join(episodeDir, "topic.yaml"), [
        "episode_id: ep02_attention_qkv",
        "title: \"EP02 QKV 到底在算什么\"",
        ""
      ].join("\n"));
      fs.writeFileSync(path.join(episodeDir, "audio/voiceover.wav"), "stub-audio");
      fs.writeFileSync(path.join(episodeDir, "captions/subtitles.srt"), "1\n00:00:00,000 --> 00:00:02,000\nQKV\n");

      const storyboard = [{
        scene_id: "S01",
        start: 0,
        duration: 2,
        voiceover: "Q 乘 K 转置。",
        visual_type: "complete_scaled_dot_product_attention",
        engine: "hyperframes",
        assets: ["ep02_formula_scaled_dot_product_attention_svg"],
        caption: "Scaled Dot-Product Attention",
        claim_ids: ["c_attention_core"]
      }];

      fs.writeFileSync(path.join(episodeDir, "storyboard/storyboard.json"), JSON.stringify(storyboard, null, 2));
      fs.writeFileSync(path.join(episodeDir, "video_script/storyboard.json"), JSON.stringify(storyboard, null, 2));
      fs.writeFileSync(path.join(episodeDir, "video_script/FRAME.md"), [
        "# EP02 Frame Contract",
        "",
        "Formula: Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V",
        "Source: https://nlp.seas.harvard.edu/annotated-transformer/",
        ""
      ].join("\n"));
      fs.writeFileSync(path.join(episodeDir, "visuals/ep02_formula_scaled_dot_product_attention.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>");
      fs.writeFileSync(path.join(episodeDir, "visuals/assets_manifest.json"), JSON.stringify({
        assets: [{
          asset_id: "ep02_formula_scaled_dot_product_attention_svg",
          kind: "formula",
          path: "visuals/ep02_formula_scaled_dot_product_attention.svg",
          concept: "complete Scaled Dot-Product Attention formula",
          feynman_analogy: "match, scale, normalize, read values",
          source: "https://nlp.seas.harvard.edu/annotated-transformer/",
          status: "generated"
        }]
      }, null, 2));

      runHyperframesDraft(path.join("episodes/ep02_attention_qkv/topic.yaml"), tempRoot);

      const html = fs.readFileSync(path.join(episodeDir, "renders/hyperframes_formal/index.html"), "utf8");
      const design = fs.readFileSync(path.join(episodeDir, "renders/hyperframes_formal/DESIGN.md"), "utf8");

      expect(html).toContain("EP02 · QKV 到底在算什么");
      expect(html).toContain("Attention(Q,K,V)");
      expect(html).toContain("sqrt-radicand");
      expect(html).toContain("Source: Harvard Annotated Transformer");
      expect(html).toContain("ep02-visual");
      expect(html).toContain("ep02-asset-hook_relation_graph_qk_reveal");
      expect(html).toContain("source-code-strip");
      expect(html).toContain("height: 980px");
      expect(html).toContain("height: 880px");
      expect(html).toContain("height: 780px");
      expect(html).toContain("min-height: 520px");
      expect(html).toContain("min-height: 500px");
      expect(html).toContain("height: 460px");
      expect(html).toContain("#F7F7F5");
      expect(html).toContain("#1C1C1C");
      expect(html).not.toContain("EP01 · Transformer");
      expect(html).not.toContain("Visual Anchor");
      expect(html).not.toContain("class=\"fallback-visual");
      expect(html).not.toContain("<span class=\"edge");
      expect(html).not.toContain("height: 1220px");
      expect(html).not.toContain("margin-top: auto");
      expect(html).not.toContain("min-height: 680px");
      expect(html).not.toContain("background: #0f172a");
      expect(design).toContain("Soft Lab / Paper System");
      expect(design).toContain("Query Q: #4C78FF");
      expect(design).toContain("dark hacker");
      expect(html).toContain("data-composition-id=\"ep02-attention-qkv-formal-douyin\"");
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
