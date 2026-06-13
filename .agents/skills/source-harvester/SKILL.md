---
name: source-harvester
description: Use when turning an episode topic or local research report into source records and paper notes inputs.
---

# Source Harvester

## Inputs

- Episode topic
- Local deep research report, if provided
- Local paper files or trusted source metadata
- P0 test fixtures for deterministic runs

## Outputs

- `research/sources.jsonl`
- Source coverage notes for primary papers, official docs, and project repositories
- Draft inputs for `research/paper_notes.md`
- Missing-source warnings

## Allowed Actions

- Convert topic context and local report findings into source candidates.
- Record papers, arXiv entries, official docs, GitHub projects, and other verifiable sources.
- Mark whether each source is primary, secondary, local-only, or unresolved.
- Keep default tests deterministic by using local fixtures and recorded metadata.

## Forbidden Actions

- Do not treat a local report as a primary source.
- Do not write voiceover, storyboard, hooks, captions, video assets, or publish drafts.
- Do not perform network calls in default tests.
- Do not invent source URLs, authors, publication dates, or source IDs.
