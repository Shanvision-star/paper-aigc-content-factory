---
name: episode-orchestrator
description: Use when validating an episode topic and coordinating deterministic local content-factory workflow setup.
---

# Episode Orchestrator

## Inputs

- `topic.yaml`
- Pipeline DAG configuration
- Platform profile selection
- Existing episode directory state, if any

## Outputs

- Validated episode topic decision
- Episode folder structure
- Ordered Skill invocation plan
- Collection points for `dist/` and `publish/` artifacts

## Allowed Actions

- Validate that the topic is present, scoped, and compatible with P0 deterministic execution.
- Create or verify episode folders and expected artifact locations.
- Call downstream Skills in the configured DAG order.
- Summarize which required artifacts exist, are missing, or need human attention.
- For formula-heavy, MATLAB, dynamic-subtitle, personal-voice, SFX, or long-context episodes, require the planning packet to reference `docs/visual_system/EP05_ROPE_POSTMORTEM.md` and `docs/superpowers/specs/2026-06-20-ep05-stage-gate-map.md` before frame lock.
- Route repeated review feedback to the earliest responsible stage instead of allowing it to appear only as final MP4 QA.

## Forbidden Actions

- Do not call real LLM providers, TTS services, HyperFrames renderers, Manim, or model training jobs in P0 default execution.
- Do not publish or auto-publish to any platform.
- Do not write long-form script, storyboard, claims, voiceover, or source content directly.
- Do not hide missing downstream artifacts behind a success status.
