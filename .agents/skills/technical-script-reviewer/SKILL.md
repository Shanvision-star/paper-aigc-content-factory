---
name: technical-script-reviewer
description: Use when reviewing AI paper explainer scripts, voiceover drafts, storyboard narration, or blog-to-video scripts before audio or animation generation.
---

# Technical Script Reviewer

## Core Rule

Review the script before TTS or video render. The script must be technically correct, Feynman-clear, and connected to modern LLM engineering without collapsing different system layers.

## Blocking Checks

- Attention is weighted aggregation over values, not magical full-sentence understanding.
- Q, K, and V are learned projection spaces, not fixed semantic characters.
- Multi-Head Attention can learn different relation subspaces, but its heads are not manually assigned experts.
- Transformer is the model architecture layer; Sora-style video systems, Agent orchestration, and MCP tool/context protocols are different layers.
- Claims about ChatGPT, Claude, Llama, Qwen, DeepSeek, Agent, Sora, or MCP must be phrased as engineering connections, not direct one-line evolution unless sourced.
- Cost claims must mention the relevant bottleneck, such as Attention sequence scaling, KV Cache, FlashAttention, vLLM, GQA, MLA, or long-context inference.

## Feynman Checks

- State one core thesis for the episode.
- Use one concrete everyday analogy, then immediately map it back to the real mechanism.
- Keep formulas as three-step actions: match, weight, aggregate.
- Make the viewer understand why the idea matters in the modern LLM era.
- Keep the next-episode CTA tied to the current mechanism.

## Output Format

Return a concise review with:

- `blocking_issues`: technical or sourcing problems to fix before audio.
- `clarity_fixes`: wording changes that improve Feynman explanation.
- `engineering_notes`: modern LLM context to add or qualify.
- `tts_risks`: terms likely to be misread by TTS.
- `approval`: `approved`, `approved_with_minor_fixes`, or `blocked`.

Do not rewrite the whole script unless asked. Keep good hook energy while removing misleading simplifications.
