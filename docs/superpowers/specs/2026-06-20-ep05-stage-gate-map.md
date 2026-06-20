# EP05-Derived Production Stage Gate Map

## Edit Comparison

- Original: `docs/visual_system/EP05_ROPE_POSTMORTEM.md` summarized EP05 failure modes, but later agents still had to manually infer which production stage should block each issue.
- Revised: This document maps each EP05-derived risk to the exact production stage, artifact, responsible skill, blocking check, and verification evidence.
- Reason / Impact: Future episodes can prevent EP05-like regressions before final render instead of discovering them during MP4 review.

## Authority And Use

Read this map after `docs/visual_system/EP05_ROPE_POSTMORTEM.md` whenever an episode contains any of these surfaces:

- formulas or paper-code proof objects;
- MATLAB, Manim, SVG, or HyperFrames mechanism animation;
- personal or cloned TTS;
- dynamic burned-in subtitles;
- sound effects or final audio mixing;
- model-family examples, long-context claims, or closed-source model caveats.

This map does not replace `AGENTS.md`, the workflow spec, global `FRAME.md`, `MATLAB.md`, or episode `FRAME.md`. It distributes the EP05 postmortem into stage-level gates.

## Stage Gate Matrix

| Stage | Responsible skill / doc | EP05 failure class to block | Required artifact / check | Do not proceed when |
| --- | --- | --- | --- | --- |
| Topic setup | `episode-orchestrator`, `topic.yaml` | Missing retrospective context; wrong MATLAB/default runtime assumptions | Read relevant `docs/visual_system/*POSTMORTEM.md`, episode review files, and current runtime preference before planning | Episode uses formulas, TTS, subtitles, or MATLAB but no retrospective gate is acknowledged |
| Source harvest | `source-harvester`, `research/sources.jsonl` | Weak or drift-prone model evidence | Record primary or official source ids for paper, code, model docs, and product-context examples | A modern model is used as implementation evidence without official/public source |
| Claims | `research-to-claims`, `research/claims.json` | Closed-source model overclaim; product context treated as implementation evidence | Mark each claim as `paper_fact`, `open_model_evidence`, `product_context`, `analogy`, or `inference` | ChatGPT/Claude/proprietary models are described as using a specific positional method without source |
| Script and storyboard | `script-storyboard-writer`, `voice_segments.json`, `storyboard.json` | Mechanism oversimplification; repeated mechanical notation; Feynman analogy not mapped back | Create `source_text`, `spoken_text`, `caption_text`, `visual_text` contracts for risky notation and terms | The script says RoPE "returns relative distance", "only leaves n-m", or uses repeated `n-m` recitation without explanation |
| Technical review | `technical-script-reviewer`, `review/technical_script_review.md` | Incorrect formulas, layer collapse, unsupported accuracy claim | Review thesis, formula meaning, evidence boundary, TTS risks, and engineering connection | Accuracy is implied as guaranteed, or position bias is described as magic rather than inductive bias |
| Creative direction | `ogilvy-creative-director`, `review/creative_direction.md` | Weak hook, source label replacing episode title, no proof object | Each major frame declares Big Idea, Proof Object, Visual Hero, Caption as Micro-headline | A frame has two competing heroes, large empty space, decorative filler, or no inspectable proof object |
| Frame spec | `frame-spec-writer`, `video_script/FRAME.md` | Missing layout contract; title drift; unsafe subtitles | Declare fixed episode title, proof-object bbox, formula bbox, caption band, terminology contract, and review keyframes | Scene uses MATLAB/Formula/Subtitle without safe-area and annotation-target contract |
| Visual orchestration | `visual-orchestrator`, `assets_manifest.json` | MATLAB whole-page insertion; static pseudo-animation; formula as text fragments | Require local proof-object assets, source refs, engine role, output size, keyframes, and handoff status | Asset is a full-page screenshot shrunk into another page, or a formula lacks canonical text/source |
| MATLAB / math assets | `docs/visual_system/MATLAB.md`, asset manifest | Flicker, drifting formula text, oversized arrows, detached vectors, missing motion | Static formula/text layer separated from mechanism motion; arrows anchored; keyframes inspected | Motion is created by scaling text/formula/card instead of moving semantic geometry |
| Voiceover prep | `voiceover-adapter`, `tts-voiceover-quality-gate` | `K` read as "kai"; `长上下文` polyphone; old segment wav reused | High-risk terms normalized in `spoken_text`; text hash recorded; sample-first and freshness gates planned | Naked `Q`, `K`, `Q/K`, `KV cache`, `长上下文`, raw formula notation remain in TTS input |
| Full TTS / merge | TTS scripts, `audio/voiceover_manifest.json` | Segment cache stale; IndexTTS2 batch failure leaves old audio | Critical segment wavs must be newer than manifest; failed batch reruns in small batches | Manifest changed but wav mtime is older, missing, invalid, or unreviewed |
| Captions | `caption-aligner`, `captions/*`, burned subtitle layer | Captions too short, too large, not synchronized, or showing production prompts | Captions follow voice timing, annotate professional terms when needed, and pass banned-term/overlap scans | Captions show `读作`, `Hook`, `视觉焦点`, `教学边界`, `QA`, or differ materially from口播 |
| Sound | `sound-cue-designer`, sound cue plan, mix report | Missing SFX or sound masking professional terms | Cue plan maps cue to spoken/visual action; final mix uses SFX track and human listening review | Final build can fall back to no-SFX audio, or SFX masks English/formula terms |
| HyperFrames composition | `hyperframes-composer`, final composition | HTML preview treated as approval; subtitles/formulas overlap; blank pages | Compose from episode FRAME, inspect final MP4 keyframes, preserve formula bbox and caption band | Only HTML or static screenshot was checked, or final MP4 frames were not sampled |
| Platform formatting | `platform-format-adapter`, publish pack | Title/description claims exceed evidence; platform crop breaks safe area | Metadata uses approved title/description; cover/video safe areas checked per profile | Description implies proprietary model internals or unverified model usage |
| Quality gate | `quality-gate`, `qa/qa_report.json` | False pass while audio, SFX, subtitles, or MP4 final checks are missing | Include final MP4 probe, burned subtitle scan, keyframe review, pronunciation/freshness/SFX gates | Any required final artifact is missing but status is `pass` |
| Human review | `review/human_review.md` | Subtle pronunciation, glyph, or professional-layout issue missed by automation | Human reviews high-risk segments, formula frames, subtitle frames, outro, and platform metadata | Human review is skipped for cloned/personal voice or formula-heavy video |
| Workflow optimization | `workflow-optimizer`, `review/improvement_candidates.json` | Feedback not retained; same issue recurs next episode | Convert human/QA feedback into target, reason, impact, risk, verification, retention guidance | A repeated issue is fixed locally but not mapped to a reusable gate or candidate |

## Four-Channel Contract

Every formula-heavy or terminology-heavy episode must explicitly separate:

- `source_text`: reviewed narration for humans, captions, and script audit.
- `spoken_text`: TTS-safe version with pronunciation disambiguation only.
- `caption_text`: dynamic subtitle text that follows口播 timing and may add short professional-term annotations.
- `visual_text`: formula/code/proof-object text shown on screen.

Rules:

- `spoken_text` may rewrite pronunciation-sensitive symbols but cannot add unreviewed claims.
- `caption_text` must match the meaning and timing of the口播; it cannot be a vague summary when the口播 is detailed.
- `visual_text` can keep canonical notation such as `mθ_i`, `δ_i`, `Q/K`, and `R_{n-m}` when the caption or nearby label explains it.
- If these four channels disagree, the episode is blocked before TTS or render.

## Minimum Final-Render Evidence

A final MP4 review package must include:

- exact MP4 path, duration, resolution, and audio/video stream probe;
- critical pronunciation gate result;
- audio freshness gate result for modified or high-risk segments;
- SFX mix status when the episode requires sound cues;
- dynamic subtitle banned-term and overlap scan;
- sampled keyframes from final MP4, not only HTML preview;
- a human-review note for professional terminology, formula frames, and personal/cloned voice quality;
- a closeout that states verified and not verified items.

## Stage-Specific Failure Routing

When a reviewer finds a problem, route it to the earliest responsible stage:

- wrong claim or evidence boundary -> `research-to-claims` / `technical-script-reviewer`;
- weak hook or missing proof object -> `ogilvy-creative-director`;
- title drift, blank scene, formula/caption overlap -> `frame-spec-writer` / `visual-orchestrator`;
- flicker, detached arrows, static pseudo-animation -> MATLAB/visual asset gate;
- misread professional terms -> `voiceover-adapter` / `tts-voiceover-quality-gate`;
- subtitle mismatch or production-label leakage -> `caption-aligner` / `hyperframes-composer`;
- missing SFX or fallback audio -> `sound-cue-designer` / final build gate;
- issue only visible in final MP4 -> `quality-gate` plus `workflow-optimizer`.

Fixing a problem in a later stage is allowed, but the root-cause gate must also be updated or logged as an improvement candidate.
