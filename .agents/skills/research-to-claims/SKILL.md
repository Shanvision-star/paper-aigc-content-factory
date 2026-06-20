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
- Classify modern-model examples as `paper_fact`, `open_model_evidence`, `product_context`, `proprietary_unspecified`, `analogy`, or `inference` when the episode uses them to motivate an engineering point.
- Preserve the boundary between public implementation evidence and product context. For example, a public model doc can support a RoPE/Partial RoPE claim; a proprietary product context cannot prove its internal positional encoding.

## Forbidden Actions

- Do not allow key facts into final scripts without source support.
- Do not invent source IDs or reuse IDs for unrelated evidence.
- Do not write final voiceover, storyboard, captions, or video renders.
- Do not upgrade uncertain interpretation into verified fact.
- Do not let a closed-source model implementation claim pass as sourced evidence unless the source explicitly states that implementation detail.
