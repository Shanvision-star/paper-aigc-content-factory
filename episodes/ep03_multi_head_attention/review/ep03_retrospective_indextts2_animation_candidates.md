# EP03 Retrospective: IndexTTS2 And Animation Candidates

Status: review candidates, not completed mainline changes.

## Boundary Decision

Future episodes should use IndexTTS2 as the preferred audio-generation mainline when the goal is clarity, terminology stability, content consistency, and shorter audio-video timing. F5-TTS remains a fallback or compatibility branch for episodes that must preserve the existing personal timbre exactly.

Do not overwrite current EP03 F5-TTS artifacts unless the user explicitly approves a rerender. IndexTTS2 outputs should stay under `audio/indextts2/` until they pass sample review, transcript diff or manual listening review, timing regeneration, subtitle regeneration, sound-cue retiming, and final render review.

## EP03 Audio Findings

- F5-TTS official EP03 audio is about 461 seconds. It preserves the earlier episode timbre but is slower and has heavier pauses.
- IndexTTS2 EP03 full demo is about 345 seconds. It is more compact and continuous, but it changes the video timing and cannot be dropped into the existing render without retiming.
- IndexTTS2 on the RTX 3050 generated the 5m45s demo in roughly 82 minutes. It used CUDA and nearly full GPU memory, so production runs must be resumable by segment.
- ASR transcript diff could not fully validate the demo because `audio/asr/sample_transcripts.json` was missing. Human listening review remains mandatory.
- Spoken text needed TTS-specific normalization: standalone `K` was converted to `Kay` in `spoken_text` to avoid the Chinese-like `kai` reading, while captions and visuals must still display `K`.

## Audio Rules To Promote

1. IndexTTS2 is the default candidate for new episodes after EP03, but final switching requires sample approval and timing regeneration.
2. F5-TTS stays available as fallback for personal-timbre continuity or when IndexTTS2 generation is unstable.
3. A full IndexTTS2 episode must be generated as independent demo artifacts first:
   - `audio/indextts2/segments/*.wav`
   - `audio/indextts2/demo/*`
   - never directly into `audio/voiceover.wav`
4. Any TTS engine switch invalidates:
   - segment timings
   - captions
   - dynamic subtitle timing
   - sound cue offsets
   - HyperFrames scene durations
   - final MP4 freshness
5. Long TTS runs must use segment-level resume, logs, and GPU/process monitoring. A single monolithic full-generation command is too opaque.
6. `source_text`, `spoken_text`, captions, and visual formulas stay separate:
   - `source_text`: reviewed script
   - `spoken_text`: pronunciation-safe TTS input
   - captions: audience-facing terms and formulas
   - visuals: rendered formula objects and source-backed proof images

## EP03 Animation Findings

- Several keyframes looked like static PPT pages instead of HyperFrames animation.
- Some preview images were style previews, not final frame contracts or rendered components.
- Formula objects were missing, cropped, too plain, or displayed as ordinary text instead of inspectable math.
- `d_k`, `d_v`, `d_model`, `W^O`, `head_i`, and Multi-Head formulas need professional formula rendering, not plain `d k` paragraph text in visual frames.
- Original paper Figure 2 and Harvard Annotated Transformer proof objects must appear as source-backed assets, not only as prompts or source labels.
- Some frames leaked internal design instructions such as "formula complete" or "source-backed visual contract" into audience-facing visuals.
- Layout drift appeared in episode pill labels, headline alignment, lane labels, right-side labels, formula boxes, and source labels.
- Text overflow appeared in cards, captions, and explanatory blocks. Auto-wrap and typography floors were not consistently enforced.
- Head labels such as `head_h` were ambiguous or visually floated. They need bounded label boxes and stable baseline alignment.
- Arrows and connectors sometimes entered cards, crossed text, used inconsistent sizes, or pointed away from intended targets.
- There was too much blank space in some scenes, while other scenes had formulas or labels squeezed against card borders.
- Engineering comparison cards lacked enough data/diagram content and Chinese explanation for general viewers.

## Animation Rules To Promote

1. Use the final EP02 Chinese Soft Lab style as the baseline, not the EP02 English or generic PPT style:
   - warm paper background
   - light grid texture
   - semantic Q/K/V colors
   - centered visual hero
   - formula cards and source labels
   - no dark background for Chinese Xiaohongshu/Douyin style unless explicitly requested
2. Every technical scene must have one visual hero:
   - formula object
   - projection lanes
   - dimension split
   - Figure 2 crop
   - engineering boundary cards
3. Source-backed assets must go through:
   `source_capture -> crop_formula_or_figure -> visual_asset_manifest -> episode FRAME.md -> component implementation -> review keyframes -> render`
4. Final keyframes must be audience-facing. Design reminders stay in FRAME, prompt files, manifests, and QA notes only.
5. Formulas must be complete visual objects:
   - no raw LaTeX
   - no broken superscripts/subscripts
   - no cropped formula
   - no paragraph-only math when the scene requires inspection
   - use SVG, KaTeX/MathJax output, Manim stills, or high-resolution formula screenshots
6. Connector geometry must be computed from bounding boxes:
   - arrow starts and ends on object outer boundaries
   - no arrow through labels, formulas, cards, captions, or source labels
   - consistent stroke width and marker size
   - straight process arrows for process flow
   - single-curvature flow arcs only for fan-out/fan-in
7. Text layout must be container-aware:
   - fixed card dimensions
   - explicit max line widths
   - wrap rules for bilingual terms
   - typography floor for phone playback
   - no large unused blank gaps unless documented as intentional negative space
8. Dynamic video must use animation beats, not only static image slides:
   - staged reveal
   - token or matrix highlight
   - boundary-to-boundary flow
   - formula term highlight
   - source figure spotlight followed by phone-readable redraw
   - short sound cues aligned to visual action anchors

## Proposed File Promotion Targets

- README:
  - add an EP03 Lessons section under Voiceover Hard Gates or Review Before Render.
  - state that IndexTTS2 is the preferred future mainline, with F5-TTS as fallback.
  - warn that engine switching requires retiming captions, sound cues, and render durations.
- `.agents/skills/tts-voiceover-quality-gate/SKILL.md`:
  - add IndexTTS2 full-demo branch rules and segment-resume requirement.
  - include standalone letter normalization such as `K -> Kay` in `spoken_text` while preserving visual `K`.
- `docs/visual_system/FRAME.md`:
  - add EP03-derived keyframe leak rule: design notes must not appear in final frames.
  - strengthen text wrapping, bounded labels, and whitespace checks.
- `.agents/skills/hyperframes-composer/SKILL.md`:
  - require animation beats for each scene, not static images only.
  - block generic PPT-style fallback when episode FRAME defines a source-backed component.
- Tests:
  - add a regression test that README and TTS skill name IndexTTS2 as future mainline while keeping F5 fallback.
  - add a regression test that FRAME rules include no design-note leakage, bounded label boxes, no formula paragraph fallback, and dynamic animation beats.

## Suggested Next-Episode Gate

Before EP04 full render:

1. Generate IndexTTS2 samples for opening, formula-heavy middle, and ending.
2. Run ASR transcript diff if transcripts exist; otherwise mark ASR missing and require human review.
3. Generate full IndexTTS2 audio into `audio/indextts2/demo/`, not `audio/voiceover.wav`.
4. Compare duration to storyboard and regenerate captions/timings.
5. Retune sound cue offsets to the new audio.
6. Regenerate HyperFrames keyframes and inspect them for formula, arrow, layout, and design-note leakage.
7. Only after approval, import approved audio into the canonical voiceover slot and render final MP4.
