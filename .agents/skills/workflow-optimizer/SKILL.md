---
name: workflow-optimizer
description: Use when converting QA, hook, and human-review feedback into auditable improvement candidates.
---

# Workflow Optimizer

## Inputs

- `qa/qa_report.json`
- `qa/hook_report.json`
- `review/human_review.md`
- Screenshots, keyframes, audio checks, caption checks, or review notes

## Outputs

- `review/improvement_candidates.json`
- Candidate changes with reason, expected impact, risk, verification, and retention guidance
- Human-approval requirements
- Regression-check suggestions

## Allowed Actions

- Suggest Skill, template, prompt, platform profile, script, or quality-gate changes.
- Explain each suggestion with source feedback, expected impact, risk, verification, and retention criteria.
- Keep candidates reviewable and reversible.
- Mark changes that require human approval before editing mainline files.
- Route repeated issues to the earliest responsible stage using `docs/superpowers/specs/2026-06-20-ep05-stage-gate-map.md`.
- When human screenshots or listening feedback expose a new failure mode, propose whether it belongs in research, script, technical review, Ogilvy, frame spec, visual asset, TTS, captions, sound, HyperFrames, platform packaging, or quality gate.
- Include a retention note that says how future episodes will prove the same problem did not recur.

## Forbidden Actions

- Do not auto-edit `SKILL.md` or other mainline files.
- Do not lower quality gates to reduce failures.
- Do not bypass human review or approval.
- Do not turn improvement candidates into completed facts before they are implemented and verified.
