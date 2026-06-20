# EP06 Render Contract

## Purpose

This contract declares the render boundary before any TTS, MATLAB, HyperFrames, subtitle burn-in, SFX mix, or final MP4 assembly.

Current state: `draft_no_render_started`

## Global Render Boundary

- Default tests remain deterministic: no real LLM, TTS, MATLAB render, HyperFrames render, Manim render, or network fetch in default tests.
- Real provider smoke is not part of EP06 V1.
- No auto-publish.
- No final readiness claim until audio, captions, visual keyframes, SFX, and final MP4 are verified.

## Canvas And Safe Areas

| Target | Canvas | Safe Area | Caption Band |
| --- | --- | --- | --- |
| Douyin / TikTok style vertical | `1080x1920` | keep load-bearing content inside `safe90` unless full-bleed background | bottom reserved band, about 10%-14% height |
| Xiaohongshu note-video | `1080x1440` | preserve formula and caption within central safe content | bottom reserved band, adapt from vertical |
| Bilibili landscape | `1920x1080` | preserve formulas and source labels; no crop of proof objects | bottom caption band, avoid formula overlap |

## Scene Render Declarations

| Scene | Engine | Required Local Assets | Safe-Area Rule | Caption Rule | Review Keyframes | Audio/SFX Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S01_rope_to_vram_hook | `hyperframes` | EP05-style RoPE ring motif, KV shelf component | title and cache shelf inside safe90 | short title only, no dense text | `t=1s`, `t=6s` | no audio until pronunciation manifest is prepared |
| S02_attention_formula_recall | `matlab` or formula SVG + HyperFrames overlays | formula asset for `Attention(Q,K,V)`; highlight overlays | formula bbox protected; source label secondary | caption outside formula bbox | `t=10s`, `t=18s`, `t=32s` | TTS must preserve `sqrt(d_k)` as `根号下 d k` |
| S03_autoregressive_cache_need | `hyperframes` | token stream component, cache block component | Q token and cache blocks centered | caption below dataflow, no overlap with arrows | `t=40s`, `t=58s` | no SFX before storyboard lock |
| S04_vram_growth_formula | `matlab` local proof object + HyperFrames | simplified memory formula, stacked K/V blocks, GPU memory bar, growth curve | formula and bar inside central safe area | split long formula into visual object, not caption-only | `t=72s`, `t=100s` | TTS must not read naked `KV` inconsistently |
| S05_feynman_bookshelf | `hyperframes` | bookshelf/bookmark analogy assets | analogy and K/V mapping both visible | caption states mapping to KV Cache | `t=118s`, `t=126s` | optional soft bookmark SFX only after audio lock |
| S06_rope_cache_boundary | `matlab` local proof object + HyperFrames | RoPE Q/K rotation formula assets, position-ID cache blocks | RoPE disk and formula both protected; no subtitle overlap | caption explains cache boundary, not production note | `t=136s`, `t=152s`, `t=170s` | pronunciation gate must check `R_m`, `R_n`, `n - m` spoken forms |
| S07_long_context_bottleneck | `hyperframes` | growing cache lane, GPU bandwidth lane | no large blank space; center the bottleneck diagram | caption below lane, not over arrows | `t=184s`, `t=204s` | no special SFX until review |
| S08_window_and_sparse_attention | `matlab` mask animation + HyperFrames | sliding window mask, sparse block mask, fixed color legend | masks must be large enough for phone playback | captions label two masks separately | `t=218s`, `t=236s` | optional digital cut SFX after scene timing lock |
| S09_kv_cache_engineering | `matlab` comparison chart + HyperFrames | MHA/MQA/GQA head-sharing diagram, PagedAttention block table | head-sharing lines must not cross text | caption identifies storage strategy | `t=252s`, `t=272s` | optional compression SFX after SFX plan |
| S10_flashattention_boundary | `hyperframes` | HBM/SRAM tiles, Q/K/V IO arrows | memory hierarchy clear and centered | caption says not KV Cache compression | `t=286s`, `t=293s` | optional low IO swoosh after SFX plan |
| S11_summary_next | `hyperframes` | four recap cards, next-episode teaser card | recap cards inside safe90 | short recap caption only | `t=300s`, `t=315s` | final SFX outro only after audio freshness gate |

## Required Asset Manifest Fields

Before render, create `assets/assets_manifest.json` with at least:

- `asset_id`
- `scene_id`
- `engine`
- `visual_type`
- `source_refs`
- `claim_ids`
- `canonical_formula` when formula is shown
- `visual_text`
- `caption_text`
- `spoken_cue`
- `canvas_px`
- `safe_area`
- `caption_band`
- `review_keyframes`
- `status`

MATLAB assets additionally require:

- `script_path`
- `matlab_executable`
- `fps` or `static_format`
- `expected_frame_count` for MP4 previews
- `render_environment`
- `rendererinfo_required`
- `windows_text_size_percent_expected`
- `overlap_check_required`
- `hyperframes_handoff_status`

## Recommended MATLAB Asset Plan

These assets are planned only; no MATLAB render has been run.

| Asset id | Scene | Purpose | Output plan | Review focus |
| --- | --- | --- | --- | --- |
| `ep06_kv_cache_memory_growth` | S04 | Show why KV Cache grows with token count, layers, KV heads, head dimension, and bytes. | PNG keyframes + MP4 preview + manifest. | Growth is illustrative; no fake benchmark values. |
| `ep06_rope_rotation_geometry` | S06 | Show `q'_m` and `k'_n` as rotations in two-dimensional representation blocks. | PNG keyframes + SVG formula layer + MP4 preview. | Disk does not imply token movement in sentence space. |
| `ep06_window_sparse_masks` | S08 | Compare full attention, sliding-window band, and sparse/block mask. | PNG keyframes + MP4 preview. | Mask cells large enough for phone playback; legend not under captions. |
| `ep06_mha_mqa_gqa_kv_compare` | S09 | Compare K/V storage pressure for MHA, MQA, and GQA. | PNG keyframes + chart SVG + MP4 preview. | Labels state storage shape, not measured latency. |
| `ep06_paged_kv_blocks` | S09 | Show KV Cache split into paged blocks for memory management. | PNG keyframes + block diagram SVG. | PagedAttention is cache management, not a new attention formula. |

## Audio And SFX Gates

TTS may start only after:

- `claim_contract.md` has no blocking issues.
- `notation_contract.md` has approved `spoken_text` mappings.
- `script/voice_segments.json` contains current `spoken_text`.
- pronunciation prepare step generates a fresh segment manifest.

Final audio may be used only after:

- representative sample listening approval;
- ASR transcript diff or equivalent pronunciation review for high-risk terms;
- audio freshness check proves segment WAVs are newer than the manifest;
- no silent fallback to a non-SFX track when final SFX is required.

SFX may start only after:

- storyboard timing is locked;
- sound cues are mapped to scene boundaries;
- SFX mix report exists;
- final MP4 uses the mixed audio track, not a plain voiceover fallback.

## Pre-Render Verification

Run or record equivalent checks before final render:

- JSON parse for `voice_segments.json`, `storyboard.json`, `claims.json`, and future `assets_manifest.json`.
- Time continuity check: no voice segment gaps or overlaps unless intentional.
- Caption draft count and duration sanity check.
- Audience-visible hygiene scan: no production labels, local paths, hidden prompts, or review notes in visible captions.
- Formula completeness review for attention and RoPE formulas.
- Connector geometry review for cache, MQA/GQA, sparse masks, and IO diagrams.
- Keyframe review before full MP4.

## Approval State

- `render_contract_status`: `draft_ready_for_human_review`
- `blocking_render_gaps`: no `assets/assets_manifest.json` yet; no visual assets generated yet; no audio generated yet
- `render_allowed`: `false`
- `next_unblock`: create assets manifest, then generate review keyframes only
