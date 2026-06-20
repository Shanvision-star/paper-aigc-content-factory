# AI Paper Content Factory Agent Rules

## Authority Order

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-12-ai-paper-content-factory-design.md`
3. `pipelines/*.yml`
4. `platform_profiles/*.yaml`
5. `.agents/skills/*/SKILL.md`
6. `episodes/*/` generated artifacts and review records

## Execution Rules

- Work in Chinese for reasoning and docs unless a target artifact is English.
- Decide whether each task is a code gap, documentation gap, verification gap, or product-boundary decision before editing.
- Keep P0 deterministic: no real LLM, TTS, HyperFrames, Manim, or network calls in default tests.
- Do not auto-publish to any platform.
- Do not use unlicensed voice samples.
- Do not claim full production readiness while `qa_report.json.status` is `partial` or `failed`.
- If personal voice files are missing, write `voice/enrollment/recording_needed.md` and keep `voice_profile_manifest.json.status` as `recording_needed`.
- Real provider smoke must be explicit and separate from `npm test`.
- Before any episode enters TTS, MATLAB, HyperFrames, subtitle burn-in, SFX mix, or final render, it must have four reviewed pre-production contracts:
  - `claim_contract`: classify which script lines are paper facts, engineering context, Feynman analogies, or transitions.
  - `visual_contract`: define each scene's Big Idea, Proof Object, Visual Hero, and Caption as Micro-headline.
  - `notation_contract`: separate every formula or technical term into `visual_text`, `caption_text`, `spoken_text`, and pronunciation/boundary notes.
  - `render_contract`: declare visual engines, local assets, safe areas, caption band, review keyframes, and audio/SFX gates.
