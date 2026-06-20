# MATLAB Visual Adapter Contract

This document governs MATLAB-generated visual assets for AI paper explainer episodes. MATLAB is a deterministic visual adapter for source-backed formulas, curves, matrices, heatmaps, RoPE or positional-encoding geometry, attention score illustrations, keyframes, and MP4 previews. HyperFrames remains the final composition layer for captions, platform safe areas, transitions, and assembled video output.

## Edit Comparison

- Original: MATLAB constraints were summarized in `README.md` and `docs/visual_system/FRAME.md`, but there was no dedicated document for layout, animation, fonts, terminology, overlap checks, or HyperFrames import.
- Revised: MATLAB rendering now has a standalone adapter contract that episode `FRAME.md` files, asset manifests, and HyperFrames handoff tasks must reference.
- Reason / Impact: Formula and mechanism visuals can be reviewed before render, and a future agent cannot treat a MATLAB command success, HTML preview, or MP4 export as visual approval.

## Edit Comparison - Audience-Visible Animation Hygiene

- Original: The global MATLAB contract prohibited generic hidden-prompt leakage, but it did not name common production labels or require single-page animations to show visible motion beyond a static poster.
- Revised: MATLAB assets now have explicit audience-visible hygiene, timed dynamic subtitle, single-page mechanism motion, formula-pronunciation, jitter-reduction, and PR-review requirements.
- Reason / Impact: Future episodes can reuse MATLAB templates without accidentally burning internal prompts such as `Hook`, `视觉焦点`, `视觉爆点`, `教学边界`, or `给普通观众的一句话` into audience frames, and reviewers can reject static-looking MP4 previews before final composition.

## Authority And Scope

Authority order for MATLAB visual assets:

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
3. `docs/visual_system/DESIGN.md`
4. `docs/visual_system/FRAME.md`
5. `docs/visual_system/MATLAB.md`
6. `episodes/{episode_id}/video_script/FRAME.md`
7. `episodes/{episode_id}/assets/assets_manifest.json`
8. MATLAB scripts and generated outputs

MATLAB may generate:

- static PNG/SVG/PDF formula or figure assets;
- deterministic charts, curves, heatmaps, matrix views, and geometry diagrams;
- review keyframes for staged explanation;
- MP4 previews for human inspection;
- HTML Web Canvas previews for interactive inspection.

MATLAB must not:

- replace HyperFrames final composition;
- invent unsourced formulas, model claims, benchmark values, or architecture details;
- fetch live sources inside default tests;
- change approved voiceover, captions, or terminology;
- mark a visual asset as final without keyframe or final-frame review.

## Required Inputs Before Rendering

Every MATLAB visual task must be declared in an episode `FRAME.md` or `assets_manifest.json` before the script runs.

Required fields:

- `asset_id`: stable id used by MATLAB outputs and HyperFrames imports.
- `episode_id`: owning episode.
- `visual_type`: for example `formula_derivation`, `rope_rotation_geometry`, `attention_heatmap`, `positional_encoding_curve`.
- `source_refs`: paper URL, local source capture, code reference, or reviewed research note.
- `canonical_formula`: approved formula text or LaTeX when a formula is shown.
- `claim_id`: approved claim that this visual supports.
- `spoken_cue`: voiceover line or beat that the visual explains.
- `caption_text`: caption wording or caption exclusion requirement.
- `terminology_contract`: approved terms and pronunciation-sensitive tokens.
- `canvas_px`: one of the approved platform canvas sizes unless the episode explains why.
- `safe_area`: title, formula, figure, source label, and caption exclusion zones.
- `font_map`: MATLAB font roles mapped to the HyperFrames type system.
- `render_environment`: MATLAB release or executable, OS display text size, display scaling, graphics renderer, renderer device, and GPU name captured from the render machine.
- `fps`, `duration_s`, `expected_frame_count`: required for animation or MP4 preview.
- `output_formats`: for example `png_keyframes`, `svg`, `mp4_preview`, `html_preview`.
- `script_path`: MATLAB entrypoint.
- `matlab_release` or `matlab_executable`: expected MATLAB runtime.
- `review_keyframes`: frame numbers or timestamps that must be inspected.

## Layout Contract

- Use canvas-first layout. Choose the target canvas before drawing: `1080x1920`, `1080x1440`, `1920x1080`, or `1080x1080`.
- Keep load-bearing formulas, labels, axes, and source attribution inside the safe area.
- Reserve the caption band before placing formulas. Captions must not cover formula bounding boxes, matrix cells, axes, callout arrows, or source labels.
- Prefer one primary visual object per frame. A frame should answer one viewer question, such as "where is position added?" or "why does RoPE expose m minus n?".
- Do not use large empty space as decoration. If negative space is intentional, document the focal object and reason in the episode `FRAME.md`.
- Put explanatory text beside or below the proof object. Do not print headlines or long explanations over formulas, paper figures, heatmaps, or source captures.
- For multi-panel scenes, each panel needs a semantic role: source formula, step reveal, analogy, or result. Decorative panels are not allowed.
- Source labels must be readable but secondary. They cannot obscure the formula, axis label, token label, or highlighted term.

## Animation Contract

- Motion must explain mechanism, not decorate the scene.
- Use staged reveal for formula-heavy content: source object first, operation step second, full formula last.
- Single-page MATLAB animations must still contain visible motion evidence. Acceptable motion includes staged emphasis, active panel outlines, rotating vectors, moving arrows, fixed-position formula highlights that appear by timing, timed subtitle replacement, or filled bars that encode a mathematical quantity.
- A one-page MP4 that only holds a static poster frame is not an animation deliverable unless the episode contract explicitly marks the asset as static.
- Do not animate subtitles, formula glyphs, body copy, or title positions just to create motion. Text and formulas should stay locked after they appear unless the notation itself is the mathematical object being explained.
- Use deterministic timing. Do not use unseeded randomness, wall-clock-dependent timing, live provider calls, or network-dependent source fetching.
- Animation duration must map to voiceover beats. A visual step cannot finish before the spoken explanation that gives it meaning.
- Fixed properties are required for MP4 previews: `fps`, `duration_s`, `expected_frame_count`, `VideoWriter` profile, `FrameRate`, `Quality`, and even pixel dimensions.
- Review keyframes must be generated before full MP4 review. For example: start, first formula reveal, highlighted term, mechanism result, and final hold frame.
- HTML Web Canvas output is inspection-only. It can help debug interactivity, but it does not replace PNG/SVG keyframes or final MP4 frame extraction.
- Looping previews must return to a semantically valid state. Do not loop from a final formula into an earlier state in a way that changes the explanation.
- Dynamic subtitles mean a fixed subtitle slot follows the approved voiceover subtitle timeline with `start_s` and `end_s` segments. The words may appear, replace, or highlight by timing, but the subtitle block itself should not drift, bounce, or resize between frames.
- Do not use a progress bar as a substitute for dynamic subtitles, and do not allocate a large subtitle panel that competes with the formula or mechanism visual.
- To reduce MP4 jitter, keep canvas size, axes limits, text positions, formula positions, line widths, and subtitle slot coordinates fixed across frames. Avoid pulsing borders around text, moving text badges, and frame-to-frame layout recalculation for static formulas.
- If MATLAB text or LaTeX re-rasterization still causes visible shimmer, pre-render the static text/formula layer as a fixed image or move final subtitles to HyperFrames while keeping MATLAB responsible for the mechanism visual.

## Audience-Visible Hygiene Contract

- Audience frames must not show production-side labels, prompt fragments, reviewer notes, style-preview labels, internal asset names, file paths, TODO markers, or QA instructions.
- Forbidden visible strings include `Hook`, `视觉焦点`, `视觉爆点`, `教学边界`, `给普通观众的一句话`, `style preview`, `placeholder`, `QA`, and script or file names.
- If a boundary explanation is necessary, rewrite it as a viewer-facing statement without the production label. Example: use `二维旋转是 RoPE 维度块示意，不表示 token 在句子平面移动。` instead of `教学边界：...`.
- If a recap sentence is necessary, use direct explanatory copy or `一句话总结`; do not display `给普通观众的一句话`.
- Source labels are allowed only when they identify evidence, such as a paper, code page, equation number, or reviewed documentation. They must stay secondary and cannot read like production notes.
- Formula highlights must be geometrically aligned to the exact symbol or term being discussed. A shifted or oversized highlight box is a review failure even if the formula itself is correct.
- When formulas contain pronunciation-sensitive notation such as `mθ_i`, `nθ_i`, `δ_i`, `θ_i`, `d_model`, or `n - m`, the episode assets must define separate `visual_text` and `spoken_text` so TTS/audio cannot misread the formula.

## Formula Clarity Contract

- Formula assets must be complete, sharp, and inspectable. No cropped superscripts, missing subscripts, broken radicals, or raw LaTeX syntax may appear in final frames.
- Use a protected visual object for formulas. Do not bury formula fragments inside paragraph text when the viewer needs to inspect the math.
- Record the canonical formula exactly once in the manifest, then use that source for MATLAB labels, exported assets, captions, and HyperFrames references.
- Highlight the exact term currently discussed by the voiceover. If the voiceover says `m - n`, the visual highlight must target the relative-position term, not the entire formula.
- Derivation scenes must preserve operation order. For attention, the minimum chain is `Q -> K matching -> score matrix QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V -> output O`.
- Synthetic numbers, toy matrices, or demo curves must be labeled as illustrative. Do not let example values imply empirical results.
- Axes and colorbars must not distort the claim. Use clear axis labels, stable scales, and legends that match the spoken meaning.

## Font Consistency Contract

MATLAB outputs must match the global type system in `docs/visual_system/DESIGN.md` and the HyperFrames composition style.

Required font roles:

- `display`: large hook or scene title.
- `body`: short explanation labels and panel captions.
- `caption`: source labels and image captions.
- `mono`: tensor shapes, code-like labels, token ids, `Q`, `K`, `V`, `d_model`, and formula-adjacent labels.
- `math`: formula rendering source or visual formula object.

Rules:

- Use one type system per frame. Avoid mixing unrelated font families, weights, and styles to create hierarchy.
- Chinese explanatory labels should use the approved Chinese body font or explicit fallback. English technical tokens should keep their canonical spelling.
- MATLAB-generated text and HyperFrames overlaid text must not fight each other. If HyperFrames adds captions later, MATLAB must leave the caption band empty.
- Formula glyphs must remain crisp after HyperFrames import and video encoding. Prefer SVG/PDF or high-resolution PNG for formulas.
- If MATLAB cannot render a formula with acceptable glyph quality, export the formula through a reviewed formula renderer and let MATLAB compose it as an image object.
- Manifest must record font family, fallback, font size, and any formula renderer used.

## Render Environment Contract

The workstation default for paper-video MATLAB assets is R2021b first, with R2026a as the fallback when R2021b is missing, times out, crashes under `-batch`, or fails during graphics/startup. MATLAB command success is not enough for visual approval; the render environment must be recorded because OS text scaling and renderer-device selection can change figure layout, font metrics, and exported frame geometry.

Rules:

- Before final MATLAB exports, Windows accessibility `Text size` should be `100%`. Use Windows display scaling for screen comfort instead of accessibility text enlargement.
- If `Text size` is greater than `100%`, the asset may only be marked `needs_human_review` until full-resolution keyframes and phone-size previews prove that labels, formulas, axes, legends, and source captions did not shift or become scrollable.
- Run a tiny R2021b figure/export smoke after MATLAB install, update, preference reset, graphics-driver change, or ServiceHost/mwhome reset. If the runner falls back to R2026a, run and record the same smoke for R2026a.
- Record `rendererinfo` in the manifest. For this Windows workstation, any renderer/device change between R2021b and R2026a is allowed only with a PR note and visual keyframe evidence.
- Do not diagnose a MATLAB visual failure as a formula/script issue until compute smoke and minimum figure/export smoke have been separated.
- If a minimum `figure` or `exportgraphics` smoke crashes while pure compute succeeds, first back up and reset user-level MATLAB Home/recent-artifacts state such as `%APPDATA%\MathWorks\mwhome`; do not remove hardware devices, uninstall MATLAB, or change project scripts as the first fix.
- PR review must include the render environment summary when MATLAB assets are added or regenerated.

## Professional Terminology Contract

- Use the approved terminology from technical review and episode `FRAME.md`.
- Keep `RoPE`, `ALiBi`, `YaRN`, `LongRoPE`, `Q`, `K`, `V`, `d_model`, `m - n`, `Positional Encoding`, and `Attention` visually stable across voiceover, captions, and labels.
- Do not replace `Q` or `K` with Chinese phonetic text. Use `Q` and `K` as English letters.
- When a Chinese explanation is needed, pair it with the canonical term on first appearance, for example `RoPE: 旋转位置编码`.
- Closed-source model internals must not be visualized as facts unless source-backed. Use neutral wording such as "not publicly specified" when needed.
- Claims about model families, long-context methods, or implementation details must reference reviewed source evidence before appearing on screen.

## Overlap And Geometry Checks

Every MATLAB visual asset must pass an overlap check before HyperFrames import.

Check these regions:

- formula bounding box;
- caption band;
- title and subtitle;
- source label;
- axis labels and colorbar labels;
- matrix cells and token labels;
- callout arrows, leader lines, and highlighted terms;
- safe-area edges for each target platform.

Failure conditions:

- formula, subtitle, or source label is covered by another element;
- arrow or connector crosses load-bearing text, formula symbols, matrix values, or source attribution;
- highlighted term touches the edge of the formula crop;
- legend, colorbar, or axis label is unreadable on phone playback;
- large blank space makes the viewer miss the primary visual object;
- screenshot/keyframe differs materially from the expected manifest description.

Recommended review order:

1. Inspect static keyframes at full resolution.
2. Inspect the same keyframes at phone-size preview.
3. Extract frames from MP4 preview and compare them to review keyframes.
4. After HyperFrames import, inspect final composition frames again for caption, crop, scaling, and font changes.

## MATLAB To HyperFrames Handoff

Recommended output package:

```text
episodes/{episode_id}/visuals/matlab/{asset_id}/
  manifest.json
  source_refs.json
  frames/keyframe_0001.png
  frames/keyframe_0002.png
  frames/frame_0001.png
  svg/{asset_id}.svg
  pdf/{asset_id}.pdf
  html/{asset_id}.html
  preview/{asset_id}.mp4
  review/overlap_check.md
```

HyperFrames may consume only assets whose manifest status is `approved` or `needs_human_review`. Draft MATLAB assets can appear in internal previews but must not be treated as final render inputs.

Handoff rules:

- Preserve aspect ratio. HyperFrames must not crop formulas, source labels, axes, or highlighted terms.
- Do not restyle formula assets in HyperFrames unless the manifest explicitly permits it.
- If HyperFrames overlays captions, keep them outside MATLAB formula and figure bounding boxes.
- If HyperFrames scales a MATLAB asset, verify formula readability after scaling and video encoding.
- Keep MATLAB source labels visible unless an episode-level source label is replacing them.
- Do not display internal paths, script names, QA notes, style prompts, or reviewer instructions to the audience.

## Manifest Template

```json
{
  "asset_id": "ep05_rope_relative_distance_001",
  "engine": "matlab",
  "episode_id": "ep05_rope_position_encoding",
  "visual_type": "rope_rotation_geometry",
  "claim_id": "claim_rope_relative_position",
  "source_refs": [
    {
      "type": "paper",
      "label": "RoFormer",
      "url": "TODO: reviewed source URL or local capture"
    }
  ],
  "canonical_formula": "TODO: reviewed formula text or LaTeX",
  "spoken_cue": "m 减 n，也就是相对距离",
  "caption_text": "Q 和 K 旋转后，内积里出现相对距离",
  "terminology_contract": ["RoPE", "Q", "K", "m - n"],
  "canvas_px": [1080, 1920],
  "safe_area": {
    "caption_band": "reserved",
    "formula_bbox": "required",
    "source_label": "required"
  },
  "font_map": {
    "display": "approved display font or fallback",
    "body": "approved Chinese body font or fallback",
    "mono": "approved mono font or fallback",
    "math": "reviewed formula renderer"
  },
  "render_environment": {
    "os": "Windows 11",
    "windows_text_size_percent": 100,
    "display_scaling_percent": "TODO: capture from render machine",
    "graphics_renderer": "WebGL",
    "renderer_device": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 ... D3D11)",
    "renderer_smoke_status": "TODO: passed/failed/not_run",
    "renderer_smoke_notes": "TODO: command, output, or PR evidence"
  },
  "fps": 30,
  "duration_s": 6,
  "expected_frame_count": 180,
  "matlab_executable": "D:/Program Files/MATLAB/R2021b/bin/matlab.exe",
  "script_path": "scripts/matlab/render_ep05_rope_relative_distance.m",
  "output_formats": ["png_keyframes", "svg", "mp4_preview"],
  "outputs": {
    "keyframes": [],
    "svg": null,
    "mp4_preview": null
  },
  "review_keyframes": [1, 45, 90, 135, 180],
  "review_status": "needs_human_review",
  "generated_at": "TODO: ISO-8601 timestamp"
}
```

## MATLAB Invocation Contract

Default MATLAB executable for this project:

```powershell
& 'D:\Program Files\MATLAB\R2021b\bin\matlab.exe' -batch "run('scripts/matlab/render_asset.m')"
```

Rules:

- Use the explicit R2021b executable path instead of relying on `PATH`.
- Run a tiny version or script-entry smoke before a long render when the MATLAB runtime was recently installed or updated.
- If a long render shows no valid output after 180 seconds, appears stuck, crashes under `-batch`, or fails during graphics/startup, stop that R2021b attempt, record the command and symptom, then retry the same asset with R2026a.
- Run and record a tiny hidden-figure/export smoke before final MATLAB assets are approved:

```powershell
& 'D:\Program Files\MATLAB\R2021b\bin\matlab.exe' -batch "f=figure('Visible','off'); ax=axes(f); plot(ax,1:10); drawnow; disp(rendererinfo(ax)); out=[tempname '.png']; exportgraphics(f,out); close(f)"
```

- If MATLAB warns that Windows accessibility text size is greater than `100%`, reset it to `100%` before final export or record the exception in the manifest and PR review.
- If `-batch` crashes, record the exact command, exit code, and crash symptom. Do not mark the render as failed or approved until a fallback attempt or human review decides the boundary.
- R2026a can remain a fallback only when the episode contract records why R2021b was not used, and the manifest should mark `fallback_from_r2021b` with the timeout, crash, or graphics symptom.
- MATLAB invocation is never part of default `npm test`. It is an explicit render or smoke task.

## Anti-Flicker Rule

Original / Revised / Reason:

- Original: A visually acceptable MATLAB preview could still flicker or shimmer after MP4 export when formulas, subtitles, or text boxes were animated or re-rendered frame by frame.
- Revised: Formula, code, source labels, and explanatory text should be exported as stable PNG assets or rendered as fixed HyperFrames HTML layers. Motion belongs to geometry and emphasis layers: Q/K vectors, arrows, local highlights, relative-position bars, and calculation fills.
- Reason / Impact: Future episodes can keep MATLAB's precise proof-object look while avoiding font re-rasterization, figure resizing, and caption drift in encoded vertical videos.

Required practice:

- Do not animate MATLAB text size, formula size, figure canvas size, axes limits, or whole-card position after the hero frame is laid out.
- If MATLAB exports an MP4 mechanism clip, lock figure size, axes limits, text box positions, renderer, and output resolution; extract keyframes before HyperFrames import.
- Prefer stable formula PNGs plus HyperFrames vector overlays when the same scene needs both mathematical typesetting and motion.
- If a clip flickers, split it into a static formula/text layer and a separate geometry-only animation layer before rerendering.

## EP05 RoPE Failure-Mode Reference

- Original: EP05 MATLAB issues were discovered through repeated user screenshots: whole-page MATLAB images were too small, formula highlights shifted, circle arrows detached from their semantic target, text/formula layers jittered, and some MP4 previews looked static rather than animated.
- Revised: Any MATLAB asset for formula-heavy paper explainers must be checked against `docs/visual_system/EP05_ROPE_POSTMORTEM.md` and routed through `docs/superpowers/specs/2026-06-20-ep05-stage-gate-map.md` before final HyperFrames import.
- Reason / Impact: The EP05 postmortem converts screenshot feedback into reusable design rules, so future MATLAB assets are reviewed as local proof objects with stable formulas and semantic motion, not as accidental full-page posters.

Required EP05-derived checks:

- MATLAB assets are local proof objects, not full-page screenshots inserted into another page.
- Static text, formulas, source labels, and subtitle slots stay locked after reveal.
- Motion belongs to vectors, arrows, bars, highlights, or geometry objects that explain the mechanism.
- Formula highlights align to exact symbols and do not drift between keyframes.
- Arrows start and end on the intended semantic object; arrowheads are not oversized and do not float away from circles, axes, or vectors.
- Keyframes show enough mechanism content; no blank waiting page or empty proof area is accepted.
- If TTS will read notation shown in MATLAB, the episode contract must define separate visual and spoken forms before audio generation.

## Review Gates

Before MATLAB rendering:

- source refs reviewed;
- claim and formula approved;
- canvas, fps, duration, and output formats declared;
- font roles mapped to HyperFrames;
- Windows text size, display scaling, MATLAB release, and expected renderer/device declared when a real MATLAB export will run;
- caption and formula exclusion zones declared.

After MATLAB rendering:

- actual `rendererinfo` and render machine notes recorded in the manifest or PR;
- keyframes exist and match `expected_frame_count` plan;
- formulas are sharp, complete, and readable;
- terminology matches voiceover and captions;
- sampled keyframes contain no forbidden audience-visible production labels;
- single-page MP4 previews include visible mechanism motion, not only a static poster hold;
- dynamic subtitle behavior is driven by reviewed `start_s/end_s` voiceover segments, and no progress bar is used as a subtitle substitute;
- MP4 playback does not show whole-frame shimmer, drifting formula text, bouncing subtitles, or pulsing borders around load-bearing copy;
- pronunciation-sensitive formula tokens have a reviewed visual/spoken notation mapping;
- no overlap, crop, or unsafe-area violation;
- MP4 preview has even pixel dimensions and expected duration;
- manifest lists every output path and review status.

After HyperFrames import:

- no crop or scaling damage to formula assets;
- captions do not cover MATLAB visuals;
- font hierarchy still matches the global visual system;
- final extracted frames match approved meaning;
- no internal QA text, file path, or prompt text appears on screen.

## Brainstorming-Derived Extra Risks

The following risks are easy to miss when a MATLAB asset looks technically correct:

- Color semantics drift: `Q`, `K`, `V`, RoPE, ALiBi, and attention weights should keep stable colors across scenes.
- Analogy drift: a classroom or seat-number analogy must map back to the exact mechanism; it cannot imply a stronger claim than the paper formula supports.
- Formula/caption/voice mismatch: visual `sqrt(d_k)`, caption wording, and spoken text must preserve the same mathematical meaning.
- Preview mismatch: a clean HTML or MATLAB figure preview can still fail after MP4 export or HyperFrames import.
- OS text-scaling drift: Windows accessibility text size can change MATLAB layout and make previously clean formulas scroll, crop, or collide with captions.
- Aspect-ratio drift: a 16:9 figure can become unreadable in 9:16 unless the episode defines a separate vertical layout.
- Licensing drift: third-party MATLAB code, helper functions, icon packs, or fonts need license review before vendoring.
- Freshness drift: stale generated assets must be regenerated when source refs, script, formula, font map, or canvas changes.
- Accessibility drift: low contrast, tiny axes, thin strokes, and dense labels can pass desktop review but fail phone playback.
- Hidden-prompt leakage: internal instructions, TODO labels, prompt fragments, or reviewer comments must never be visible in audience frames.
- Misleading synthetic data: demo matrices or curves must be labeled illustrative unless they are real source-backed measurements.

## Done Definition

A MATLAB visual asset is ready for downstream composition only when:

- its manifest is complete;
- its source evidence and claim are approved;
- its render environment, renderer device, and Windows text-size status are recorded when generated by MATLAB;
- its formula and terminology match the script;
- its keyframes pass layout, font, safe-area, overlap, and readability checks;
- its MP4 preview or static export is inspected when used;
- HyperFrames import preserves the same meaning without crop, caption collision, or font inconsistency.
