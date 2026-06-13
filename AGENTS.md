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
