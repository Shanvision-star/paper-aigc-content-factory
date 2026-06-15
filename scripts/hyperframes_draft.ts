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

type TopicRenderMeta = {
  episodeId: string;
  episodeLabel: string;
  subjectLabel: string;
  title: string;
  compositionId: string;
  draftFileName: string;
};

function ep02AssetContractMissingInputs(episodeDir: string): string[] {
  if (path.basename(episodeDir) !== "ep02_attention_qkv") {
    return [];
  }

  const storyboardPath = path.join(episodeDir, "video_script/storyboard.json");
  const manifestPath = path.join(episodeDir, "visuals/assets_manifest.json");

  if (!fs.existsSync(storyboardPath) || !fs.existsSync(manifestPath)) {
    return [];
  }

  const scenes = JSON.parse(fs.readFileSync(storyboardPath, "utf8")) as StoryboardSceneWithAssets[];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as VisualManifest;
  const assetMap = new Map(manifest.assets.map((asset) => [asset.asset_id, asset]));
  const missing: string[] = [];

  for (const scene of scenes) {
    const sourceRequired = scene.scene_id !== "S14";

    if (sourceRequired && (!scene.assets || scene.assets.length === 0)) {
      missing.push(`video_script/storyboard.json:${scene.scene_id}.assets`);
      continue;
    }

    for (const assetId of scene.assets ?? []) {
      const asset = assetMap.get(assetId);

      if (!asset) {
        missing.push(`visuals/assets_manifest.json:${assetId}`);
      } else if (asset.path && !fs.existsSync(path.join(episodeDir, asset.path))) {
        missing.push(asset.path);
      }
    }
  }

  return missing;
}

function requiredInputs(episodeDir: string): string[] {
  const inputs = [
    "storyboard/storyboard.json",
    "audio/voiceover.wav",
    "captions/subtitles.srt"
  ];

  if (path.basename(episodeDir) === "ep02_attention_qkv") {
    inputs.push("video_script/FRAME.md", "visuals/assets_manifest.json");
  }

  return [
    ...inputs.filter((relativePath) => !fs.existsSync(path.join(episodeDir, relativePath))),
    ...ep02AssetContractMissingInputs(episodeDir)
  ];
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

function readTopicMeta(episodeDir: string): TopicRenderMeta {
  const topicPath = path.join(episodeDir, "topic.yaml");
  const topicText = fs.existsSync(topicPath) ? fs.readFileSync(topicPath, "utf8") : "";
  const episodeId = topicText.match(/^episode_id:\s*(.+)$/m)?.[1].trim() ?? path.basename(episodeDir);
  const title = topicText.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1].trim() ?? episodeId;
  const episodeNumber = episodeId.match(/^ep(\d+)/i)?.[1] ?? "00";
  const titleWithoutEpisode = title.replace(/^EP\d+\s*/i, "").trim();
  const subjectLabel = titleWithoutEpisode.split(/[：:]/)[0]?.trim() || "Transformer";

  return {
    episodeId,
    episodeLabel: `EP${episodeNumber}`,
    subjectLabel,
    title,
    compositionId: `${episodeId.replace(/_/g, "-")}-formal-douyin`,
    draftFileName: `${episodeId}_draft.html`
  };
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

function metaLabelFor(scene: StoryboardSceneWithAssets): string {
  const labels: Record<string, string> = {
    hook_relation_graph_qk_reveal: "QK score path",
    soft_adjacency_matrix_explainer: "Soft matrix",
    qkv_projection_spaces: "Projection spaces",
    meeting_room_feynman_qkv: "Feynman analogy",
    pronoun_reference_qk_score: "QK matching",
    scale_by_sqrt_dk: "Scale by sqrt(d_k)",
    row_wise_softmax_weights: "Row-wise softmax",
    weighted_v_aggregation_formula: "Weighted V",
    complete_scaled_dot_product_attention: "Full formula",
    autoregressive_generation_kv_cache_intro: "Generation path",
    kv_cache_cached_projection: "KV Cache",
    modern_attention_optimization_layers: "LLM optimization",
    feynman_summary_information_routing: "Information routing",
    next_episode_multi_head_cta: "Next episode"
  };

  return labels[scene.visual_type] ?? "Attention pipeline";
}

function formulaBlock(): string {
  return `<div class="formula-block">
    <span class="formula-name">Attention(Q,K,V)</span>
    <span class="formula-eq">=</span>
    <span class="formula-softmax">softmax</span>
    <span class="formula-paren">(</span>
    <span class="frac"><span class="top"><span class="q">Q</span><span class="k">K<sup>T</sup></span></span><span class="bottom">sqrt(d<sub>k</sub>)</span></span>
    <span class="formula-paren">)</span>
    <span class="v">V</span>
  </div>`;
}

function matrixHtml(rows = 4, cols = 5): string {
  const cells = Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const values = ["0.64", "0.18", "0.09", "0.06", "0.03", "0.12", "0.51", "0.21", "0.10", "0.06", "0.08", "0.13", "0.57", "0.15", "0.07", "0.04", "0.09", "0.18", "0.61", "0.08"];
    return `<span class="${row === 0 ? "hot" : ""} ${col === 0 ? "first" : ""}">${values[index % values.length]}</span>`;
  }).join("");

  return `<div class="matrix" style="--cols:${cols}">${cells}</div>`;
}

function tokenRow(words: string[]): string {
  return `<div class="token-row">${words.map((word, index) => `<span class="${index === 2 ? "active" : ""}">${escapeHtml(word)}</span>`).join("")}</div>`;
}

function protectedDisplayText(text: string): string {
  return text
    .replace(/Q 乘 K 转置/g, "QK^T（Q 乘 K 转置）")
    .replace(/根号下 d k/g, "√(d_k)")
    .replace(/根号 d k/g, "√(d_k)")
    .replace(/d k/g, "d_k")
    .replace(/Scaled Dot-Product Attention/g, "Scaled\u00A0Dot\u2011Product\u00A0Attention")
    .replace(/Self-Attention/g, "Self\u2011Attention")
    .replace(/Multi-Head Attention/g, "Multi\u2011Head\u00A0Attention")
    .replace(/KV Cache/g, "KV\u00A0Cache")
    .replace(/Q Cache/g, "Q\u00A0Cache");
}

function ep02SourceBadge(scene: StoryboardSceneWithAssets, assetMap: Map<string, VisualAsset>): string {
  const sources = (scene.assets ?? [])
    .map((assetId) => assetMap.get(assetId)?.source)
    .filter((source): source is string => Boolean(source));
  const hasHarvard = sources.some((source) => source.includes("nlp.seas.harvard.edu/annotated-transformer"));

  return `<div class="source-badge">${hasHarvard ? "Source: Harvard Annotated Transformer" : "Source-backed visual contract"}</div>`;
}

function ep02SqrtDkHtml(extraClass = ""): string {
  return `<span class="sqrt-dk ${extraClass}"><span class="sqrt-symbol">√</span><span class="sqrt-radicand">d<sub>k</sub></span></span>`;
}

function cssClassToken(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "-");
}

function ep02FormulaObject(): string {
  return `<div class="ep02-formula-object" aria-label="Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V">
    <span>Attention(</span><span class="q">Q</span><span>, </span><span class="k">K</span><span>, </span><span class="v">V</span><span>) = </span>
    <span class="soft">softmax</span><span>(</span>
    <span class="math-frac"><span class="math-top"><span class="q">Q</span><span class="k">K<sup>T</sup></span></span><span class="math-bottom">${ep02SqrtDkHtml("formula-sqrt")}</span></span>
    <span>)</span><span class="v">V</span>
  </div>`;
}

function ep02StepRail(active: "score" | "scale" | "softmax" | "value" | "cache" | "summary" = "score"): string {
  const steps = [
    ["score", "1", "QK^T", "匹配打分"],
    ["scale", "2", ep02SqrtDkHtml("step-sqrt"), "缩放稳定"],
    ["softmax", "3", "softmax", "按行分权"],
    ["value", "4", "V", "加权汇聚"]
  ];

  return `<div class="ep02-step-rail">${steps.map(([key, number, label, note]) => `<div class="ep02-step ${active === key ? "active" : ""}"><b>${number}</b><strong>${label}</strong><small>${note}</small></div>`).join("")}</div>`;
}

function ep02RelationGraph(kind: "hook" | "matrix" | "pronoun" = "hook"): string {
  const centerToken = kind === "pronoun" ? "它" : "Q_i";
  const note = kind === "matrix" ? "动态软关系矩阵：每一层都会重新生成" : "Q 与每个 K 计算相关性，得到一组分数";

  return `<div class="ep02-graph-layout">
    <svg class="ep02-graph-svg" viewBox="0 0 900 540" role="img" aria-label="anchored relation graph">
      <defs>
        <marker id="ep02-arrow" markerUnits="userSpaceOnUse" markerWidth="20" markerHeight="20" refX="16" refY="10" orient="auto">
          <path d="M 2 3 L 16 10 L 2 17 z" fill="#4C78FF"></path>
        </marker>
      </defs>
      <g class="ep02-edges" fill="none" stroke="#4C78FF" stroke-linecap="round" marker-end="url(#ep02-arrow)">
        <path class="edge-path strong" d="M 390 226 C 286 148, 210 112, 142 104"></path>
        <path class="edge-path" d="M 510 226 C 620 150, 692 112, 762 104"></path>
        <path class="edge-path medium" d="M 390 294 C 284 366, 214 426, 142 442"></path>
        <path class="edge-path weak" d="M 510 294 C 618 370, 690 426, 762 442"></path>
      </g>
      <g class="svg-nodes">
        <circle cx="90" cy="100" r="52" fill="#F58518"></circle><text x="90" y="113" text-anchor="middle">K1</text>
        <circle cx="814" cy="100" r="52" fill="#B279A2"></circle><text x="814" y="113" text-anchor="middle">K2</text>
        <circle cx="90" cy="450" r="52" fill="#54A24B"></circle><text x="90" y="463" text-anchor="middle">K3</text>
        <circle cx="814" cy="450" r="52" fill="#F58518"></circle><text x="814" y="463" text-anchor="middle">Kn</text>
      </g>
      <circle cx="450" cy="260" r="70" fill="#1B2A41"></circle>
      <text x="450" y="236" text-anchor="middle" class="svg-token-label">当前 token</text>
      <text x="450" y="272" text-anchor="middle" class="svg-token-sub">${centerToken}</text>
      <text x="450" y="304" text-anchor="middle" class="svg-token-note">soft row</text>
    </svg>
    <div class="ep02-matrix-panel">
      <h3>soft adjacency matrix</h3>
      <p>${note}</p>
      ${matrixHtml(4, 4)}
    </div>
  </div>`;
}

function ep02ProjectionLayout(): string {
  return `<div class="ep02-projection-layout">
    <div class="input-token-card"><strong>X</strong><span>同一个 token 表示</span></div>
    <div class="projection-arrow-stack"><span></span><span></span><span></span></div>
    <div class="projection-card q"><b>Q = XW<sub>Q</sub></b><strong>检索空间</strong><span>我现在要找什么</span></div>
    <div class="projection-card k"><b>K = XW<sub>K</sub></b><strong>索引空间</strong><span>我可以怎么被匹配</span></div>
    <div class="projection-card v"><b>V = XW<sub>V</sub></b><strong>内容空间</strong><span>真正被读取的信息</span></div>
  </div>`;
}

function ep02SoftmaxLayout(): string {
  return `<div class="ep02-softmax-layout">
    <div class="matrix-teach-card">
      <h3>score matrix / QK^T</h3>
      ${matrixHtml(4, 5)}
      <p>每一行对应一个当前 token。</p>
    </div>
    <div class="softmax-arrow">→<span>row-wise softmax</span></div>
    <div class="matrix-teach-card attention">
      <h3>attention weights</h3>
      ${matrixHtml(4, 5)}
      <p>每一组权重加起来等于 1。</p>
    </div>
    <div class="source-code-strip"><code>p_attn = F.softmax(scores, dim=-1)</code></div>
  </div>`;
}

function ep02WeightedValueLayout(): string {
  return `<div class="ep02-weighted-layout">
    <div class="weight-table">${matrixHtml(4, 4)}<strong>Attention weights</strong></div>
    <div class="multiply-symbol">×</div>
    <div class="value-stack"><span>V1</span><span>V2</span><span>V3</span><span>Vn</span></div>
    <div class="multiply-symbol">=</div>
    <div class="output-card">O<small>新的表示</small></div>
    ${ep02FormulaObject()}
  </div>`;
}

function ep02DerivationPosterLayout(): string {
  return `<div class="ep02-derivation-poster">
    <div class="derivation-main">
      <div class="derivation-query">
        <h3>当前 Token（查询者）</h3>
        <div class="mini-token-row"><span>我</span><span>今天</span><span>去</span><span class="active">学习</span><span>Attention</span><span>很</span><span>有趣</span></div>
        <div class="query-node">Q<small>我在找什么？</small></div>
        <div class="legend-box"><b class="q">Q</b> Query（查询空间）<br><b class="k">K</b> Key（索引空间）<br><b class="v">V</b> Value（内容空间）<br><b class="soft">softmax</b> 注意力权重</div>
      </div>
      <div class="derivation-keys">
        <h3>上下文 Tokens（被匹配者）</h3>
        <div class="key-fanout">
          <span>K1 我</span><span>K2 今天</span><span>K3 去</span><span>K4 学习</span><span>K5 Attention</span><span>K6 很</span><span>K7 有趣</span><span>K8 &lt;EOS&gt;</span>
        </div>
      </div>
      <div class="derivation-matrices">
        <div class="matrix-mini">
          <h3>软关系矩阵（分数）</h3>
          ${matrixHtml(4, 5)}
          <p>QK^T 得到匹配分数</p>
        </div>
        <div class="matrix-mini">
          <h3>注意力权重</h3>
          ${matrixHtml(4, 5)}
          <p>缩放后按行 softmax</p>
        </div>
      </div>
      <div class="derivation-values">
        <h3>值（内容）</h3>
        <div class="value-stack compact"><span>V1</span><span>V2</span><span>V3</span><span>V4</span><span>V8</span></div>
        <div class="output-card compact">O<small>新表示</small></div>
      </div>
    </div>
    <div class="derivation-formula-band">
      <span class="label-tape">核心公式</span>
      ${ep02FormulaObject()}
      <div class="dk-note">这里的 <strong>d<sub>k</sub></strong> 是 Q 和 K 的向量维度；论文里是除以 <strong>根号下 d<sub>k</sub></strong>。</div>
    </div>
    <div class="derivation-step-cards">
      <div><b>1 匹配分数</b><span>Q 与所有 K 计算相似度，得到 QK^T。</span></div>
      <div><b>2 缩放</b><span>除以 ${ep02SqrtDkHtml("inline-sqrt")}，防止维度大时分数过大。</span></div>
      <div><b>3 按行归一化</b><span>softmax 把每一组分数变成比例。</span></div>
      <div><b>4 加权读取 V</b><span>按照权重从 V 里取信息，汇聚成 O。</span></div>
    </div>
    <div class="source-code-strip compact"><code>scores = torch.matmul(query, key.transpose(-2,-1)) / math.sqrt(d_k)</code><code>p_attn = F.softmax(scores, dim=-1)</code><code>return torch.matmul(p_attn, value), p_attn</code></div>
  </div>`;
}

function ep02KvCacheLayout(mode: "generation" | "cache" | "optimization" = "cache"): string {
  if (mode === "optimization") {
    return `<div class="ep02-optimization-layout">
      <div class="engineering-card compute"><b>FlashAttention</b><span>计算层 / kernel</span><p>改变注意力计算方式，减少显存读写。</p></div>
      <div class="engineering-card structure"><b>GQA / MQA</b><span>模型结构层</span><p>共享部分 Key/Value，降低推理成本。</p></div>
      <div class="engineering-card runtime"><b>KV Cache</b><span>推理运行时</span><p>复用历史 token 的 Key/Value 投影结果。</p></div>
    </div>`;
  }

  return `<div class="ep02-cache-layout">
    <div class="generation-row"><span>t-3</span><span>t-2</span><span>t-1</span><span class="active">new token</span></div>
    <div class="cache-flow">
      <div class="query-block">new Q<small>当前查询</small></div>
      <div class="cache-arrow">→</div>
      <div class="cache-bank k">cached K<small>历史索引投影</small></div>
      <div class="cache-bank v">cached V<small>历史内容投影</small></div>
    </div>
    <p class="cache-note">${mode === "generation" ? "ChatGPT / Claude 逐个 token 生成时，每一步都会产生新的 Q。" : "cache 的不是原始 token，而是历史 token 的 Key/Value 投影结果。"}</p>
  </div>`;
}

function ep02SummaryLayout(): string {
  return `<div class="ep02-summary-layout">
    <div class="lookup-card q"><b>Q</b><span>问题</span><small>我在找什么</small></div>
    <div class="lookup-card k"><b>K</b><span>索引</span><small>我怎么被匹配</small></div>
    <div class="lookup-card v"><b>V</b><span>内容</span><small>真正读取什么</small></div>
    ${ep02FormulaObject()}
    <div class="routing-note">Attention = 可微分的信息路由机制</div>
  </div>`;
}

function ep02CtaLayout(): string {
  return `<div class="ep02-cta-layout">
    <div class="heads-preview"><span>head 1</span><span>head 2</span><span>head 3</span><span>head 4</span></div>
    <h3>为什么一个视角还不够？</h3>
    <p>下一集：Multi\u2011Head\u00A0Attention</p>
  </div>`;
}

function ep02VisualHtml(scene: StoryboardSceneWithAssets, assetMap: Map<string, VisualAsset>): string {
  const type = scene.visual_type;
  let content = "";
  let active: "score" | "scale" | "softmax" | "value" | "cache" | "summary" = "score";

  if (type.includes("relation") || type.includes("adjacency")) {
    content = ep02RelationGraph(type.includes("adjacency") ? "matrix" : "hook");
    active = "score";
  } else if (type.includes("projection") || type.includes("meeting")) {
    content = ep02ProjectionLayout();
    active = "score";
  } else if (type.includes("pronoun")) {
    content = `<div class="ep02-token-strip"><span>小明</span><span>把</span><span class="active">它</span><span>放进</span><span>书包</span></div>${ep02RelationGraph("pronoun")}`;
    active = "score";
  } else if (type.includes("complete_scaled")) {
    content = ep02DerivationPosterLayout();
    active = "value";
  } else if (type.includes("scale")) {
    content = `<div class="ep02-formula-focus">${ep02FormulaObject()}<div class="formula-callout">除以 <strong>${ep02SqrtDkHtml("callout-sqrt")}</strong>：这里的 d<sub>k</sub> 是 Q 和 K 的向量维度；缩放可以防止分数过大，让 softmax 更稳定。</div></div>`;
    active = "scale";
  } else if (type.includes("softmax")) {
    content = ep02SoftmaxLayout();
    active = "softmax";
  } else if (type.includes("aggregation")) {
    content = ep02WeightedValueLayout();
    active = "value";
  } else if (type.includes("autoregressive")) {
    content = ep02KvCacheLayout("generation");
    active = "cache";
  } else if (type.includes("kv_cache")) {
    content = ep02KvCacheLayout("cache");
    active = "cache";
  } else if (type.includes("optimization")) {
    content = ep02KvCacheLayout("optimization");
    active = "cache";
  } else if (type.includes("summary")) {
    content = ep02SummaryLayout();
    active = "summary";
  } else if (type.includes("multi_head") || type.includes("cta")) {
    content = ep02CtaLayout();
    active = "summary";
  } else {
    content = ep02FormulaObject();
  }

  return `<div class="ep02-visual ep02-${escapeHtml(type)}">
    ${content}
    ${type.includes("multi_head") || type.includes("cta") ? "" : ep02StepRail(active)}
    ${ep02SourceBadge(scene, assetMap)}
  </div>`;
}

function fallbackVisualHtml(scene: StoryboardSceneWithAssets): string {
  const type = scene.visual_type;
  const formula = formulaBlock();

  if (type.includes("relation") || type.includes("adjacency")) {
    return `<div class="fallback-visual relation-visual">
      <div class="graph">
        <span class="node center">token i</span>
        <span class="node n1">K1</span><span class="node n2">K2</span><span class="node n3">K3</span><span class="node n4">Kn</span>
        <span class="edge e1"></span><span class="edge e2"></span><span class="edge e3"></span><span class="edge e4"></span>
      </div>
      <div class="visual-note"><strong>soft adjacency matrix</strong><br>每一层动态生成的加权关系</div>
      ${matrixHtml(3, 4)}
    </div>`;
  }

  if (type.includes("projection")) {
    return `<div class="fallback-visual projection-visual">
      <div class="x-card">X<br><small>token representation</small></div>
      <div class="projection-row">
        <div class="card q">Q = XW<sub>Q</sub><small>检索空间</small></div>
        <div class="card k">K = XW<sub>K</sub><small>索引空间</small></div>
        <div class="card v">V = XW<sub>V</sub><small>内容空间</small></div>
      </div>
      <p>同一输入，三次 learned projection。</p>
    </div>`;
  }

  if (type.includes("meeting")) {
    return `<div class="fallback-visual meeting-visual">
      <div class="meeting-card q">Q<br><small>我在找什么</small></div>
      <div class="meeting-card k">K<br><small>你如何被匹配</small></div>
      <div class="meeting-card v">V<br><small>真正拿走的信息</small></div>
      <div class="visual-note">会议室类比：问题匹配标签，再读取内容。</div>
    </div>`;
  }

  if (type.includes("pronoun")) {
    return `<div class="fallback-visual pronoun-visual">
      ${tokenRow(["小明", "把", "它", "放进", "书包"])}
      <div class="score-line"><span class="q">Q(它)</span><span>·</span><span class="k">K(小明/书包/...)</span><strong>= scores</strong></div>
      ${matrixHtml(2, 5)}
    </div>`;
  }

  if (type.includes("aggregation") || type.includes("complete_scaled")) {
    return `<div class="fallback-visual formula-visual">
      ${formula}
      <div class="step-row">
        <span class="k">1 match</span><span>2 scale</span><span class="soft">3 softmax</span><span class="v">4 read V</span>
      </div>
      <div class="value-flow"><span class="q">QK score</span><span>→</span><span class="soft">weights</span><span>→</span><span class="v">weighted V</span></div>
    </div>`;
  }

  if (type.includes("scale")) {
    return `<div class="fallback-visual scale-visual">
      <div class="score-card">raw QK<sup>T</sup><strong>12.8</strong><strong>9.4</strong><strong>7.1</strong></div>
      <div class="divide">÷ sqrt(d<sub>k</sub>)</div>
      <div class="score-card stable">stable scores<strong>1.6</strong><strong>1.2</strong><strong>0.9</strong></div>
      <p>缩放让 softmax 不会过早变得极端。</p>
    </div>`;
  }

  if (type.includes("softmax")) {
    return `<div class="fallback-visual softmax-visual">
      <div class="bar-row"><span>token 1</span><b style="width:64%"></b><em>0.64</em></div>
      <div class="bar-row"><span>token 2</span><b style="width:18%"></b><em>0.18</em></div>
      <div class="bar-row"><span>token 3</span><b style="width:12%"></b><em>0.12</em></div>
      <div class="bar-row"><span>token n</span><b style="width:6%"></b><em>0.06</em></div>
      <div class="visual-note">row-wise softmax：每一行权重加起来等于 1</div>
    </div>`;
  }

  if (type.includes("kv_cache") || type.includes("autoregressive")) {
    return `<div class="fallback-visual cache-visual">
      <div class="cache-row"><span class="token new">new Q</span><span>matches</span><span class="cache">cached K</span><span class="cache">cached V</span></div>
      <div class="timeline-tokens"><b>t-3</b><b>t-2</b><b>t-1</b><b class="active">t</b></div>
      <div class="visual-note">缓存的是历史 token 的 Key/Value 投影结果，不是原始 token。</div>
    </div>`;
  }

  if (type.includes("optimization")) {
    return `<div class="fallback-visual optimization-visual">
      <div class="layer-card"><strong>FlashAttention</strong><small>compute / kernel</small></div>
      <div class="layer-card"><strong>GQA / MQA</strong><small>model architecture</small></div>
      <div class="layer-card"><strong>KV Cache</strong><small>runtime state</small></div>
      <p>三者优化同一条 Attention 路径，但处在不同系统层。</p>
    </div>`;
  }

  if (type.includes("summary")) {
    return `<div class="fallback-visual summary-visual">
      <div class="lookup-card q">Q<br><small>问题</small></div>
      <div class="lookup-card k">K<br><small>索引</small></div>
      <div class="lookup-card v">V<br><small>内容</small></div>
      <div class="visual-note">Attention = 可微分的信息路由机制</div>
    </div>`;
  }

  if (type.includes("multi_head") || type.includes("cta")) {
    return `<div class="fallback-visual multihead-visual">
      <div class="heads"><span>head 1</span><span>head 2</span><span>head 3</span><span>head 4</span></div>
      <div class="visual-note">下一集：一个视角不够时，为什么要并行多个 head？</div>
    </div>`;
  }

  return `<div class="fallback-visual formula-visual">${formula}</div>`;
}

function visualHtml(scene: StoryboardSceneWithAssets, assetMap: Map<string, VisualAsset>, projectDir: string, episodeDir: string, topicMeta: TopicRenderMeta): string {
  if (topicMeta.episodeId === "ep02_attention_qkv" && fs.existsSync(path.join(episodeDir, "video_script/FRAME.md"))) {
    return ep02VisualHtml(scene, assetMap);
  }

  const asset = scene.assets
    ?.map((assetId) => assetMap.get(assetId))
    .find((candidate) => candidate && (candidate.kind === "diagram" || candidate.kind === "formula") && fs.existsSync(path.join(episodeDir, candidate.path)));

  if (!asset) {
    return fallbackVisualHtml(scene);
  }

  const assetPath = path.join(episodeDir, asset.path);
  const mediaFileName = `${scene.scene_id}_${asset.asset_id}${path.extname(assetPath)}`;

  return `<div class="asset-image" role="img" aria-label="${escapeHtml(asset.concept)}" style="background-image: url('${projectMediaSrc(projectDir, assetPath, mediaFileName)}');"></div>`;
}

function sceneHtml(scene: StoryboardSceneWithAssets, index: number, assetMap: Map<string, VisualAsset>, projectDir: string, episodeDir: string, topicMeta: TopicRenderMeta): string {
  const isEp02 = topicMeta.episodeId === "ep02_attention_qkv";
  const assetFrameClass = isEp02 ? ` ep02-asset-${cssClassToken(scene.visual_type)}` : "";
  return `
      <section id="scene-${escapeHtml(scene.scene_id)}" class="scene scene-${index + 1}${isEp02 ? " ep02-scene" : ""}">
        <div class="scene-content">
          <p class="eyebrow">${escapeHtml(topicMeta.episodeLabel)} · ${escapeHtml(topicMeta.subjectLabel)}</p>
          <h1 class="title">${escapeHtml(scene.caption)}</h1>
          <div class="asset-frame${escapeHtml(assetFrameClass)}">
            ${visualHtml(scene, assetMap, projectDir, episodeDir, topicMeta)}
          </div>
          <p class="voice">${escapeHtml(isEp02 ? protectedDisplayText(scene.caption) : scene.voiceover)}</p>
          <p class="meta">${escapeHtml(metaLabelFor(scene))} · ${escapeHtml(scene.engine)}</p>
        </div>
      </section>`;
}

function compositionHtml(episodeDir: string, projectDir: string, topicMeta: TopicRenderMeta): string {
  const storyboard = readFormalScenes(episodeDir);
  const assetMap = readAssetMap(episodeDir);
  const totalDuration = Math.max(...storyboard.map((scene) => scene.start + scene.duration));
  const audioSrc = projectMediaSrc(projectDir, path.join(episodeDir, "audio/voiceover.wav"), "voiceover.wav");
  const scenes = storyboard.map((scene, index) => sceneHtml(scene, index, assetMap, projectDir, episodeDir, topicMeta)).join("\n");
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
  <title>${escapeHtml(topicMeta.title)} HyperFrames</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #F7F7F5;
      color: #1C1C1C;
      font-family: Arial, sans-serif;
    }
    #root {
      position: relative;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #F7F7F5;
    }
    .scene {
      position: absolute;
      inset: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background:
        linear-gradient(rgba(160, 160, 160, 0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(160, 160, 160, 0.12) 1px, transparent 1px),
        #F7F7F5;
      background-size: 48px 48px;
    }
    .scene:not(:first-of-type) { opacity: 0; }
    .scene::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 1px 1px, rgba(160, 160, 160, 0.14) 1px, transparent 0);
      background-size: 24px 24px;
      opacity: 0.45;
    }
    .scene::after {
      content: "";
      position: absolute;
      inset: 42px;
      border: 1px solid rgba(160, 160, 160, 0.18);
      pointer-events: none;
    }
    .scene-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 66px 68px 96px;
      display: flex;
      flex-direction: column;
      gap: 26px;
      justify-content: flex-start;
    }
    .eyebrow {
      align-self: flex-start;
      margin: 0;
      padding: 13px 24px;
      border: 2px solid rgba(178, 121, 162, 0.42);
      border-radius: 8px;
      background: #F0EAF6;
      color: #1C1C1C;
      font-family: Arial, sans-serif;
      font-size: 30px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .title {
      max-width: 924px;
      margin: 0;
      color: #1C1C1C;
      font-size: 70px;
      line-height: 1.14;
      font-weight: 900;
      letter-spacing: 0;
    }
    .asset-frame {
      width: 924px;
      height: 980px;
      border: 1px solid rgba(160, 160, 160, 0.42);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 20px 50px rgba(28, 28, 28, 0.12);
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
    .fallback-visual {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 40px;
      background: #FFFDF8;
      color: #1c1c1c;
      font-family: Arial, sans-serif;
      font-size: 28px;
      line-height: 1.3;
    }
    .q { color: #4C78FF; }
    .k { color: #F58518; }
    .v { color: #54A24B; }
    .soft { color: #B279A2; }
    .visual-note {
      padding: 18px 22px;
      border-left: 8px solid #E45756;
      background: rgba(255,255,255,0.86);
      font-size: 30px;
      line-height: 1.45;
    }
    .graph {
      position: relative;
      height: 320px;
      margin-bottom: 28px;
    }
    .node {
      position: absolute;
      width: 104px;
      height: 104px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: #fff;
      background: #4C78FF;
      box-shadow: 0 16px 34px rgba(76,120,255,0.28);
      font: 700 28px Consolas, monospace;
    }
    .node.center { left: 380px; top: 104px; width: 132px; height: 132px; background: #1B2A41; }
    .node.n1 { left: 120px; top: 18px; background: #F58518; }
    .node.n2 { right: 110px; top: 40px; background: #B279A2; }
    .node.n3 { left: 80px; bottom: 12px; background: #54A24B; }
    .node.n4 { right: 92px; bottom: 18px; background: #F58518; }
    .edge {
      position: absolute;
      left: 435px;
      top: 160px;
      height: 6px;
      width: 270px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(76,120,255,0.25), #E45756);
      transform-origin: left center;
    }
    .edge.e1 { transform: rotate(-156deg); width: 310px; }
    .edge.e2 { transform: rotate(-24deg); width: 300px; }
    .edge.e3 { transform: rotate(148deg); width: 330px; }
    .edge.e4 { transform: rotate(28deg); width: 300px; }
    .matrix {
      display: grid;
      grid-template-columns: repeat(var(--cols), 1fr);
      gap: 8px;
      margin-top: 22px;
      font: 700 26px Consolas, monospace;
    }
    .matrix span {
      min-height: 54px;
      display: grid;
      place-items: center;
      background: rgba(28,28,28,0.06);
      border: 1px solid rgba(28,28,28,0.12);
      border-radius: 8px;
    }
    .matrix span.hot { background: rgba(178,121,162,0.25); }
    .matrix span.first { border-color: rgba(76,120,255,0.42); }
    .x-card, .card, .meeting-card, .lookup-card, .layer-card, .score-card {
      border: 2px solid rgba(28,28,28,0.1);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 14px 36px rgba(15,23,42,0.12);
    }
    .x-card {
      width: 260px;
      margin: 24px auto 34px;
      padding: 26px;
      text-align: center;
      font: 900 54px Georgia, serif;
    }
    .x-card small, .card small, .meeting-card small, .lookup-card small, .layer-card small {
      display: block;
      margin-top: 10px;
      color: #64748b;
      font: 400 22px Arial, sans-serif;
    }
    .projection-row, .meeting-visual, .summary-visual, .optimization-visual {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      align-items: stretch;
    }
    .card, .meeting-card, .lookup-card, .layer-card {
      padding: 28px 20px;
      min-height: 148px;
      text-align: center;
      font: 900 42px Georgia, serif;
    }
    .projection-visual p, .optimization-visual p {
      grid-column: 1 / -1;
      margin: 18px 0 0;
      text-align: center;
      font-size: 30px;
    }
    .token-row, .timeline-tokens, .heads {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
      margin: 42px 0;
    }
    .token-row span, .timeline-tokens b, .heads span, .cache, .token {
      padding: 18px 22px;
      border-radius: 8px;
      background: #fff;
      border: 2px solid rgba(28,28,28,0.12);
      font: 800 30px Arial, sans-serif;
    }
    .token-row .active, .timeline-tokens .active, .token.new {
      color: #fff;
      background: #4C78FF;
      border-color: #4C78FF;
    }
    .score-line, .cache-row, .value-flow, .step-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
      margin: 30px 0;
      font: 800 34px Arial, sans-serif;
    }
    .score-card {
      display: grid;
      gap: 12px;
      padding: 22px;
      min-width: 220px;
      text-align: center;
      font: 800 26px Arial, sans-serif;
    }
    .score-card strong {
      display: block;
      padding: 12px;
      background: rgba(228,87,86,0.12);
      border-radius: 10px;
      font: 900 36px Consolas, monospace;
    }
    .score-card.stable strong { background: rgba(84,162,75,0.14); }
    .scale-visual {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 26px;
      flex-wrap: wrap;
    }
    .divide {
      font: 900 42px Georgia, serif;
      color: #E45756;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 160px 1fr 80px;
      align-items: center;
      gap: 16px;
      margin: 26px 0;
      font: 700 28px Arial, sans-serif;
    }
    .bar-row b {
      display: block;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(90deg, #B279A2, #4C78FF);
    }
    .bar-row em {
      font: 800 26px Consolas, monospace;
      color: #1c1c1c;
    }
    .formula-block {
      margin: 70px auto 44px;
      padding: 30px 18px;
      width: 100%;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 14px 40px rgba(15,23,42,0.14);
      text-align: center;
      font: 900 34px Georgia, serif;
      white-space: nowrap;
    }
    .formula-eq, .formula-paren { margin: 0 5px; }
    .formula-softmax { color: #B279A2; }
    .frac {
      display: inline-grid;
      grid-template-rows: auto 2px auto;
      align-items: center;
      vertical-align: middle;
      min-width: 108px;
      margin: 0 4px;
      font-size: 0.8em;
    }
    .frac::before {
      content: "";
      grid-row: 2;
      height: 2px;
      background: #1c1c1c;
    }
    .frac .top { grid-row: 1; }
    .frac .bottom { grid-row: 3; font-size: 0.72em; }
    .voice {
      margin: 0;
      max-width: 924px;
      color: #2E3440;
      font-family: Arial, sans-serif;
      font-size: 34px;
      line-height: 1.42;
      font-weight: 500;
      max-height: 292px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
    }
    .meta {
      margin: 0;
      color: #64748B;
      font-family: Consolas, monospace;
      font-size: 28px;
      font-variant-numeric: tabular-nums;
    }
    .ep02-scene .scene-content {
      padding: 52px 58px 72px;
      justify-content: center;
      align-items: center;
      gap: 18px;
    }
    .ep02-scene .eyebrow {
      align-self: center;
      font-size: 28px;
      padding: 12px 24px;
    }
    .ep02-scene .title {
      max-width: 964px;
      text-align: center;
      font-size: 62px;
      line-height: 1.12;
    }
    .ep02-scene .asset-frame {
      width: 964px;
      height: 980px;
      border-color: rgba(178, 121, 162, 0.22);
      background: rgba(255, 253, 248, 0.96);
      box-shadow: 0 22px 54px rgba(28, 28, 28, 0.13);
    }
    .ep02-scene .asset-frame.ep02-asset-hook_relation_graph_qk_reveal,
    .ep02-scene .asset-frame.ep02-asset-soft_adjacency_matrix_explainer,
    .ep02-scene .asset-frame.ep02-asset-pronoun_reference_qk_score {
      height: 880px;
    }
    .ep02-scene .asset-frame.ep02-asset-scale_by_sqrt_dk,
    .ep02-scene .asset-frame.ep02-asset-row_wise_softmax_weights,
    .ep02-scene .asset-frame.ep02-asset-weighted_v_aggregation_formula {
      height: 1050px;
    }
    .ep02-scene .asset-frame.ep02-asset-complete_scaled_dot_product_attention {
      height: 1240px;
    }
    .ep02-scene .asset-frame.ep02-asset-modern_attention_optimization_layers {
      height: 780px;
    }
    .ep02-scene .asset-frame.ep02-asset-next_episode_multi_head_cta {
      height: 840px;
    }
    .ep02-scene .voice {
      max-width: 930px;
      min-height: 58px;
      max-height: 112px;
      text-align: center;
      font-size: 34px;
      line-height: 1.28;
      font-weight: 800;
      color: #1C1C1C;
      -webkit-line-clamp: 2;
    }
    .ep02-scene .meta {
      font-size: 22px;
      opacity: 0.72;
      text-align: center;
    }
    .ep02-visual {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 30px 34px 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
      background:
        radial-gradient(circle at 8% 8%, rgba(76,120,255,0.08), rgba(76,120,255,0) 28%),
        radial-gradient(circle at 94% 12%, rgba(245,133,24,0.08), rgba(245,133,24,0) 24%),
        #FFFDF8;
      color: #1C1C1C;
      overflow: hidden;
    }
    .source-badge {
      position: static;
      align-self: flex-end;
      margin-top: 0;
      padding: 8px 14px;
      border: 1px solid rgba(100,116,139,0.28);
      border-radius: 8px;
      background: rgba(255,255,255,0.86);
      color: #64748B;
      font: 700 18px Arial, sans-serif;
    }
    .ep02-graph-layout {
      display: grid;
      grid-template-columns: 1.25fr 0.88fr;
      gap: 20px;
      align-items: center;
      min-height: 520px;
    }
    .ep02-graph-svg {
      width: 100%;
      height: 460px;
      min-height: 460px;
      border-radius: 8px;
      background: #F8FAFC;
      box-shadow: inset 0 0 0 1px rgba(100,116,139,0.16);
    }
    .svg-token-label {
      font: 900 30px Arial, sans-serif;
      fill: #FFFFFF;
    }
    .svg-token-sub {
      font: 700 22px Consolas, monospace;
      fill: #DBEAFE;
    }
    .svg-token-note {
      font: 700 18px Consolas, monospace;
      fill: #BFDBFE;
    }
    .svg-nodes text {
      font: 900 30px Arial, sans-serif;
      fill: #FFFFFF;
    }
    .edge-path { stroke-width: 7; opacity: 0.7; }
    .edge-path.strong { stroke-width: 12; opacity: 1; }
    .edge-path.medium { stroke-width: 9; opacity: 0.82; }
    .edge-path.weak { stroke-width: 5; opacity: 0.52; }
    .ep02-matrix-panel, .matrix-teach-card, .formula-callout, .source-code-strip, .routing-note, .cache-note {
      border: 1px solid rgba(100,116,139,0.18);
      border-radius: 8px;
      background: rgba(255,255,255,0.88);
      box-shadow: 0 16px 38px rgba(15,23,42,0.09);
    }
    .ep02-matrix-panel {
      padding: 24px;
    }
    .ep02-matrix-panel h3, .matrix-teach-card h3 {
      margin: 0 0 12px;
      font: 900 30px Arial, sans-serif;
      color: #1C1C1C;
    }
    .ep02-matrix-panel p, .matrix-teach-card p {
      margin: 0;
      color: #475569;
      font: 700 22px Arial, sans-serif;
      line-height: 1.35;
    }
    .ep02-token-strip, .generation-row, .heads-preview {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ep02-token-strip span, .generation-row span, .heads-preview span {
      padding: 12px 16px;
      border: 2px solid rgba(100,116,139,0.22);
      border-radius: 8px;
      background: #FFFFFF;
      font: 900 28px Arial, sans-serif;
    }
    .ep02-token-strip .active, .generation-row .active {
      color: #FFFFFF;
      background: #4C78FF;
      border-color: #4C78FF;
    }
    .ep02-projection-layout {
      display: grid;
      grid-template-columns: 210px 90px 1fr;
      grid-template-rows: repeat(3, 1fr);
      gap: 20px;
      align-items: center;
      min-height: 640px;
    }
    .input-token-card {
      grid-row: 1 / -1;
      display: grid;
      place-items: center;
      gap: 12px;
      min-height: 250px;
      border: 2px solid rgba(100,116,139,0.2);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 18px 42px rgba(15,23,42,0.1);
      text-align: center;
    }
    .input-token-card strong {
      font: 900 86px Georgia, serif;
    }
    .input-token-card span {
      font: 800 24px Arial, sans-serif;
      color: #64748B;
    }
    .projection-arrow-stack {
      grid-row: 1 / -1;
      display: grid;
      gap: 74px;
    }
    .projection-arrow-stack span {
      height: 5px;
      border-radius: 999px;
      background: #94A3B8;
      position: relative;
    }
    .projection-arrow-stack span::after {
      content: "→";
      position: absolute;
      right: -18px;
      top: -25px;
      font: 900 34px Arial, sans-serif;
      color: #94A3B8;
    }
    .projection-card, .engineering-card, .lookup-card, .query-block, .cache-bank, .output-card {
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 18px 42px rgba(15,23,42,0.1);
    }
    .projection-card {
      min-height: 150px;
      padding: 24px 28px;
      border: 3px solid rgba(100,116,139,0.15);
    }
    .projection-card b {
      display: block;
      font: 900 42px Consolas, monospace;
      margin-bottom: 8px;
    }
    .projection-card strong {
      display: block;
      font: 900 30px Arial, sans-serif;
    }
    .projection-card span {
      display: block;
      margin-top: 8px;
      font: 700 24px Arial, sans-serif;
      color: #475569;
    }
    .projection-card.q { border-color: rgba(76,120,255,0.48); background: #EAF0FF; }
    .projection-card.k { border-color: rgba(245,133,24,0.48); background: #FFF1E1; }
    .projection-card.v { border-color: rgba(84,162,75,0.48); background: #EAF7EA; }
    .ep02-formula-object {
      width: 100%;
      padding: 28px 22px;
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 16px 42px rgba(15,23,42,0.12);
      text-align: center;
      white-space: nowrap;
      font: 900 43px Georgia, serif;
      color: #1C1C1C;
    }
    .math-frac {
      display: inline-grid;
      grid-template-rows: auto 3px auto;
      vertical-align: middle;
      min-width: 112px;
      margin: 0 6px;
      font-size: 0.86em;
    }
    .math-frac::before {
      content: "";
      grid-row: 2;
      height: 3px;
      background: #1C1C1C;
    }
    .math-top { grid-row: 1; }
    .math-bottom { grid-row: 3; font-size: 0.75em; }
    .sqrt-dk {
      display: inline-flex;
      align-items: flex-start;
      line-height: 1;
      white-space: nowrap;
      vertical-align: middle;
    }
    .sqrt-symbol {
      display: inline-block;
      transform: translateY(0.04em);
      font-family: Georgia, serif;
      font-weight: 900;
    }
    .sqrt-radicand {
      display: inline-block;
      margin-left: -0.02em;
      padding: 0.04em 0.08em 0;
      border-top: 0.08em solid currentColor;
      font-family: Georgia, serif;
      font-weight: 900;
    }
    .step-sqrt {
      font-size: 0.92em;
    }
    .formula-sqrt {
      font-size: 0.96em;
    }
    .callout-sqrt {
      color: #E45756;
    }
    .ep02-formula-focus, .ep02-complete-formula-layout {
      display: grid;
      gap: 28px;
      align-content: center;
      min-height: 640px;
    }
    .formula-callout {
      padding: 28px;
      border-left: 10px solid #E45756;
      font: 900 34px Arial, sans-serif;
      line-height: 1.35;
    }
    .formula-callout strong {
      color: #E45756;
      font: 900 48px Georgia, serif;
    }
    .ep02-step-rail {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 8px;
      padding-bottom: 4px;
    }
    .ep02-step {
      display: grid;
      grid-template-columns: 36px 1fr;
      grid-template-rows: auto auto;
      gap: 4px 10px;
      padding: 12px;
      border: 2px solid rgba(100,116,139,0.16);
      border-radius: 8px;
      background: rgba(255,255,255,0.78);
    }
    .ep02-step b {
      grid-row: 1 / -1;
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #E2E8F0;
      font: 900 22px Arial, sans-serif;
    }
    .ep02-step strong {
      font: 900 22px Consolas, monospace;
      color: #1C1C1C;
    }
    .ep02-step small {
      font: 700 18px Arial, sans-serif;
      color: #64748B;
    }
    .ep02-step.active {
      border-color: #E45756;
      background: rgba(228,87,86,0.08);
    }
    .ep02-step.active b { background: #E45756; color: #FFFFFF; }
    .ep02-softmax-layout {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      grid-template-rows: 1fr auto;
      align-items: center;
      gap: 18px;
      min-height: 650px;
    }
    .matrix-teach-card {
      padding: 24px;
    }
    .matrix-teach-card.attention .matrix span.hot {
      background: rgba(76,120,255,0.26);
    }
    .softmax-arrow {
      display: grid;
      place-items: center;
      gap: 8px;
      font: 900 48px Arial, sans-serif;
      color: #B279A2;
    }
    .softmax-arrow span {
      writing-mode: vertical-rl;
      font: 900 22px Arial, sans-serif;
      color: #1C1C1C;
    }
    .source-code-strip {
      grid-column: 1 / -1;
      padding: 20px 24px;
      display: grid;
      gap: 10px;
      background: #0F172A;
      color: #E2E8F0;
      font: 700 24px Consolas, monospace;
    }
    .source-code-strip code {
      display: block;
      color: #E2E8F0;
      white-space: normal;
    }
    .ep02-weighted-layout {
      display: grid;
      grid-template-columns: 1fr auto 170px auto 170px;
      gap: 20px;
      align-items: center;
      min-height: 650px;
    }
    .weight-table strong {
      display: block;
      margin-top: 16px;
      text-align: center;
      font: 900 28px Arial, sans-serif;
    }
    .multiply-symbol {
      font: 900 60px Georgia, serif;
      color: #64748B;
    }
    .value-stack {
      display: grid;
      gap: 12px;
    }
    .value-stack span {
      padding: 18px;
      border-radius: 8px;
      background: #EAF7EA;
      border: 2px solid rgba(84,162,75,0.4);
      color: #54A24B;
      text-align: center;
      font: 900 28px Consolas, monospace;
    }
    .output-card {
      display: grid;
      place-items: center;
      min-height: 154px;
      color: #4C78FF;
      border: 3px solid rgba(76,120,255,0.35);
      font: 900 58px Georgia, serif;
    }
    .output-card small {
      font: 800 22px Arial, sans-serif;
      color: #475569;
    }
    .ep02-weighted-layout .ep02-formula-object {
      grid-column: 1 / -1;
      font-size: 38px;
    }
    .ep02-cache-layout {
      display: grid;
      gap: 34px;
      align-content: center;
      min-height: 640px;
    }
    .cache-flow {
      display: grid;
      grid-template-columns: 190px auto 1fr 1fr;
      gap: 18px;
      align-items: center;
    }
    .query-block, .cache-bank {
      min-height: 180px;
      padding: 24px;
      display: grid;
      place-items: center;
      text-align: center;
      font: 900 36px Arial, sans-serif;
    }
    .query-block { color: #4C78FF; border: 3px solid rgba(76,120,255,0.35); background: #EAF0FF; }
    .cache-bank.k { color: #F58518; border: 3px solid rgba(245,133,24,0.35); background: #FFF1E1; }
    .cache-bank.v { color: #54A24B; border: 3px solid rgba(84,162,75,0.35); background: #EAF7EA; }
    .query-block small, .cache-bank small {
      font: 800 22px Arial, sans-serif;
      color: #475569;
    }
    .cache-arrow {
      font: 900 54px Arial, sans-serif;
      color: #64748B;
    }
    .cache-note {
      padding: 24px;
      font: 900 30px Arial, sans-serif;
      line-height: 1.36;
    }
    .ep02-optimization-layout {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      align-items: center;
      min-height: 500px;
    }
    .engineering-card {
      min-height: 360px;
      padding: 30px;
      border: 3px solid rgba(100,116,139,0.18);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
    }
    .engineering-card b {
      font: 900 36px Arial, sans-serif;
    }
    .engineering-card span {
      font: 900 24px Arial, sans-serif;
      color: #64748B;
    }
    .engineering-card p {
      margin: 0;
      font: 800 25px Arial, sans-serif;
      line-height: 1.42;
    }
    .engineering-card.compute { border-color: rgba(76,120,255,0.42); background: #EFF6FF; }
    .engineering-card.structure { border-color: rgba(245,133,24,0.42); background: #FFF7ED; }
    .engineering-card.runtime { border-color: rgba(84,162,75,0.42); background: #F0FDF4; }
    .ep02-derivation-poster {
      display: grid;
      grid-template-rows: 1fr auto auto auto;
      gap: 14px;
      height: 100%;
      min-height: 1050px;
      padding-bottom: 18px;
    }
    .derivation-main {
      display: grid;
      grid-template-columns: 1.1fr 0.92fr 1.05fr 0.55fr;
      gap: 14px;
      align-items: stretch;
      min-height: 420px;
    }
    .derivation-query,
    .derivation-keys,
    .derivation-matrices,
    .derivation-values {
      border: 1px solid rgba(100,116,139,0.18);
      border-radius: 8px;
      background: rgba(255,255,255,0.86);
      padding: 16px;
      box-shadow: 0 12px 26px rgba(15,23,42,0.08);
    }
    .derivation-main h3 {
      margin: 0 0 12px;
      text-align: center;
      font: 900 22px Arial, sans-serif;
    }
    .mini-token-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 18px;
    }
    .mini-token-row span {
      padding: 8px 10px;
      border: 1px solid rgba(100,116,139,0.25);
      border-radius: 8px;
      background: #FFFFFF;
      font: 800 16px Arial, sans-serif;
    }
    .mini-token-row .active {
      color: #4C78FF;
      border-color: #4C78FF;
      background: #EAF0FF;
    }
    .query-node {
      width: 112px;
      height: 112px;
      margin: 12px auto;
      border: 4px solid #4C78FF;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: #4C78FF;
      background: #EAF0FF;
      font: 900 50px Georgia, serif;
      text-align: center;
    }
    .query-node small {
      display: block;
      font: 800 14px Arial, sans-serif;
      color: #4C78FF;
    }
    .legend-box {
      margin-top: 22px;
      padding: 12px;
      border: 1px dashed rgba(100,116,139,0.35);
      border-radius: 8px;
      font: 800 17px Arial, sans-serif;
      line-height: 1.6;
    }
    .key-fanout {
      display: grid;
      gap: 8px;
      align-content: center;
      height: calc(100% - 40px);
    }
    .key-fanout span {
      padding: 9px 12px;
      border: 2px solid rgba(245,133,24,0.38);
      border-radius: 8px;
      background: #FFF7ED;
      color: #9A3412;
      font: 900 17px Arial, sans-serif;
    }
    .derivation-matrices {
      display: grid;
      gap: 10px;
    }
    .matrix-mini {
      display: grid;
      gap: 8px;
    }
    .matrix-mini .matrix {
      gap: 3px;
      margin: 0;
      font-size: 15px;
    }
    .matrix-mini .matrix span {
      min-height: 30px;
      border-radius: 5px;
    }
    .matrix-mini p {
      margin: 0;
      text-align: center;
      color: #64748B;
      font: 800 16px Arial, sans-serif;
    }
    .derivation-values {
      display: grid;
      gap: 12px;
      align-content: center;
    }
    .value-stack.compact {
      gap: 8px;
    }
    .value-stack.compact span {
      padding: 10px;
      font-size: 18px;
    }
    .output-card.compact {
      min-height: 90px;
      font-size: 38px;
    }
    .derivation-formula-band {
      position: relative;
      padding: 18px;
      border: 1px solid rgba(100,116,139,0.18);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 14px 34px rgba(15,23,42,0.1);
    }
    .derivation-formula-band .ep02-formula-object {
      padding: 18px 16px;
      box-shadow: none;
      font-size: 36px;
    }
    .label-tape {
      position: absolute;
      left: 18px;
      top: -18px;
      padding: 8px 14px;
      transform: rotate(-5deg);
      border-radius: 8px;
      background: #FDE68A;
      color: #1C1C1C;
      font: 900 20px Arial, sans-serif;
      box-shadow: 0 8px 18px rgba(15,23,42,0.12);
    }
    .dk-note {
      margin: 10px auto 0;
      max-width: 760px;
      padding: 10px 14px;
      border: 2px dashed rgba(228,87,86,0.38);
      border-radius: 8px;
      text-align: center;
      color: #1C1C1C;
      background: #FFF7F7;
      font: 800 18px Arial, sans-serif;
    }
    .derivation-step-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .derivation-step-cards div {
      min-height: 110px;
      padding: 14px;
      border: 1px solid rgba(100,116,139,0.18);
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 10px 24px rgba(15,23,42,0.07);
    }
    .derivation-step-cards b {
      display: block;
      margin-bottom: 8px;
      color: #1C1C1C;
      font: 900 20px Arial, sans-serif;
    }
    .derivation-step-cards span {
      color: #475569;
      font: 800 17px Arial, sans-serif;
      line-height: 1.35;
    }
    .source-code-strip.compact {
      padding: 14px 18px;
      gap: 5px;
      font-size: 17px;
    }
    .ep02-summary-layout {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      align-content: center;
      min-height: 650px;
    }
    .ep02-summary-layout .lookup-card {
      min-height: 210px;
      padding: 28px;
      display: grid;
      place-items: center;
      border: 3px solid rgba(100,116,139,0.14);
      text-align: center;
    }
    .lookup-card b {
      font: 900 58px Georgia, serif;
    }
    .lookup-card span {
      font: 900 30px Arial, sans-serif;
    }
    .ep02-summary-layout .ep02-formula-object, .routing-note {
      grid-column: 1 / -1;
    }
    .routing-note {
      padding: 24px;
      border-left: 10px solid #E45756;
      text-align: center;
      font: 900 34px Arial, sans-serif;
    }
    .ep02-cta-layout {
      min-height: 620px;
      display: grid;
      align-content: center;
      gap: 42px;
      text-align: center;
    }
    .heads-preview span {
      min-width: 150px;
      min-height: 110px;
      display: grid;
      place-items: center;
      background: #EEF2FF;
      border-color: rgba(76,120,255,0.26);
      color: #4C78FF;
      font-size: 28px;
    }
    .ep02-cta-layout h3 {
      margin: 0;
      font: 900 54px Arial, sans-serif;
    }
    .ep02-cta-layout p {
      margin: 0;
      font: 900 40px Arial, sans-serif;
      color: #B279A2;
    }
  </style>
</head>
<body>
  <div
    id="root"
    data-composition-id="${topicMeta.compositionId}"
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
    var isEp02 = ${topicMeta.episodeId === "ep02_attention_qkv" ? "true" : "false"};
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
      if (isEp02) {
        tl.from(selector + " .ep02-graph-svg, " + selector + " .ep02-formula-object, " + selector + " .ep02-projection-layout, " + selector + " .ep02-softmax-layout, " + selector + " .ep02-cache-layout, " + selector + " .ep02-optimization-layout, " + selector + " .ep02-summary-layout, " + selector + " .ep02-cta-layout", { y: 28, opacity: 0, duration: 0.55, ease: "power2.out", overwrite: "auto" }, start + 0.54);
        tl.from(selector + " .edge-path", { opacity: 0, scale: 0.92, transformOrigin: "center center", duration: 0.5, stagger: 0.08, ease: "sine.out", overwrite: "auto" }, start + 0.75);
        tl.from(selector + " .projection-card, " + selector + " .engineering-card, " + selector + " .lookup-card, " + selector + " .matrix span, " + selector + " .value-stack span, " + selector + " .generation-row span, " + selector + " .heads-preview span", { y: 20, opacity: 0, duration: 0.42, stagger: 0.035, ease: "power3.out", overwrite: "auto" }, start + 0.9);
        tl.from(selector + " .ep02-step", { y: 16, opacity: 0, duration: 0.35, stagger: 0.045, ease: "back.out(1.1)", overwrite: "auto" }, start + 1.12);
      }
    });
    tl.to("#root", { opacity: 0, duration: 0.7, ease: "sine.inOut", overwrite: "auto" }, ${Math.max(0, totalDuration - 0.7)});
    window.__timelines["${topicMeta.compositionId}"] = tl;
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
  const topicMeta = readTopicMeta(episodeDir);
  const durationSec = Math.max(...readFormalScenes(episodeDir).map((scene) => scene.start + scene.duration));

  writeText(path.join(projectDir, "DESIGN.md"), [
    `# ${topicMeta.episodeLabel} Formal Video Design`,
    "",
    "## Style Prompt",
    "",
    "Soft Lab / Paper System for a Chinese AI paper series. The design uses a warm paper background, notebook-like grid, semantic Q/K/V colors, complete formula objects, and restrained motion so formulas remain readable on phone-sized playback.",
    "",
    "## Colors",
    "",
    "- Paper background: #F7F7F5",
    "- Ink text: #1C1C1C",
    "- Soft gray: #A0A0A0",
    "- Query Q: #4C78FF",
    "- Key K: #F58518",
    "- Value V: #54A24B",
    "- Attention weight / softmax: #B279A2",
    "- Formula highlight: #E45756",
    "",
    "## Typography",
    "",
    "- Display: Microsoft YaHei / Arial, heavy weight for short Chinese titles",
    "- Formula: Georgia-style math typography with semantic color spans",
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
    "- Do not use dark hacker, terminal, cyberpunk, or matrix-green visual systems for this episode.",
    "- Do not place subtitles over formulas.",
    "- Do not expose raw LaTeX or broken formula fragments.",
    "- Do not use purple-blue gradient backgrounds.",
    "- Do not auto-publish generated video.",
    ""
  ].join("\n"));
  writeText(path.join(projectDir, "index.html"), compositionHtml(episodeDir, projectDir, topicMeta));
  writeJson(path.join(projectDir, "meta.json"), {
    title: `${topicMeta.title} Formal Douyin`,
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
  const topicMeta = readTopicMeta(episodeDir);
  writeText(path.join(draftDir, topicMeta.draftFileName), compositionHtml(episodeDir, draftDir, {
    ...topicMeta,
    compositionId: `${topicMeta.episodeId.replace(/_/g, "-")}-draft`
  }));
  const formalProject = buildHyperframesFormalProject(topicPath, rootDir);

  const result: HyperframesDraftResult = {
    status: "composition_ready",
    outputs: [`renders/hyperframes/${topicMeta.draftFileName}`, "renders/hyperframes_formal/index.html"],
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

