---
name: research-to-claims
description: Use when converting verified sources and paper notes into grounded claims and a timeline.
---

# Research To Claims

## Inputs

- `research/sources.jsonl`
- `research/paper_notes.md`
- Local paper excerpts or structured notes
- Topic scope and platform intent

## Outputs

- `research/claims.json`
- `research/timeline.json`
- Claim coverage warnings
- Source-to-claim traceability notes

## Allowed Actions

- Extract concise claims from sources and paper notes.
- Attach valid `source_ids` to each claim and timeline event.
- Separate primary-source facts from interpretation or commentary.
- Flag unsupported, ambiguous, duplicated, or out-of-scope claims.

## Forbidden Actions

- Do not allow key facts into final scripts without source support.
- Do not invent source IDs or reuse IDs for unrelated evidence.
- Do not write final voiceover, storyboard, captions, or video renders.
- Do not upgrade uncertain interpretation into verified fact.
