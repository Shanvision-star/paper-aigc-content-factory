# EP06 Claim Contract

## Purpose

This contract classifies every EP06 narration beat before TTS or render. It prevents three failures:

- treating engineering context as original paper fact;
- turning a Feynman analogy into a factual claim;
- letting unsupported model-implementation claims enter audience-facing script.

## Claim Categories

- `paper_fact`: directly supported by the Transformer, RoFormer, Longformer, BigBird, MQA, GQA, PagedAttention, FlashAttention, or official documentation sources listed in `research/sources.jsonl`.
- `engineering_context`: supported system-level explanation or implementation practice, not a claim from the 2017 Transformer paper.
- `feynman_analogy`: everyday analogy used for intuition; it must map back to the exact mechanism in the same scene.
- `cta_or_transition`: next-episode bridge or framing line, not a technical claim.

## Source Boundary

- Do not claim GPT, Claude, or other closed-source systems use a specific position encoding or KV Cache layout.
- Do not say RoPE invalidates KV Cache.
- Do not say KV Cache stores raw tokens.
- Do not say FlashAttention is KV Cache compression.
- Do not treat the `parameters as brain / KV Cache as working memory` analogy as a literal storage claim.

## Segment Classification

| Segment | Time | Narration Claim | Category | Source / Support | Boundary |
| --- | --- | --- | --- | --- | --- |
| seg_001 | 00:00-00:08 | RoPE writes position into Query/Key rotation; the episode asks why this relates to GPU memory. | `paper_fact` + `engineering_context` | `ep06_claim_rope_cache_boundary` | The memory question is engineering context, not RoFormer's original result. |
| seg_002 | 00:08-00:22 | Attention formula uses `softmax(QK^T / sqrt(d_k))V`. | `paper_fact` | `ep06_claim_attention_formula` | Visual formula must be complete and source-backed. |
| seg_003 | 00:22-00:35 | Q matches K, softmax assigns weights, V is aggregated. | `paper_fact` | `ep06_claim_attention_formula` | Attention is weighted aggregation, not semantic understanding. |
| seg_004 | 00:35-00:49 | Autoregressive generation emits tokens step by step and each step depends on history. | `paper_fact` + `engineering_context` | `ep06_claim_autoregressive_generation` | Product examples are not needed; keep it architecture-level. |
| seg_005 | 00:49-01:05 | Without KV Cache, historical Key/Value states would be recomputed; cache stores computed Key/Value. | `engineering_context` | `ep06_claim_kv_cache_definition` | Do not say raw tokens are cached. |
| seg_006 | 01:05-01:20 | KV Cache stores per-layer historical Key and Value states, not tokens or Query. | `engineering_context` | `ep06_claim_kv_cache_definition` | This is a hard audience-facing correction. |
| seg_007 | 01:20-01:36 | More tokens create more Key/Value states and require more GPU memory. | `engineering_context` | `ep06_claim_kv_memory_growth` | Keep as linear intuition, not exact profiler output. |
| seg_008 | 01:36-01:52 | Simplified KV memory scales with tokens, layers, KV heads, head dimension, and bytes. | `engineering_context` | `ep06_claim_kv_memory_growth` | Label the formula as simplified. |
| seg_009 | 01:52-02:08 | Bookmarks on a bookshelf explain cache reuse. | `feynman_analogy` | maps to `ep06_claim_kv_cache_definition` | Must map bookmarks to Key/Value states, not original words. |
| seg_010 | 02:08-02:24 | RoPE does not break cache; it changes how position enters Q/K before comparison. | `paper_fact` + `engineering_context` | `ep06_claim_rope_cache_boundary` | This is the core correction from EP05. |
| seg_011 | 02:24-02:40 | Rotated Query and Key dot product implicitly depends on relative displacement `n - m`, but RoPE does not directly output a distance label. | `paper_fact` | `ep06_claim_rope_cache_boundary` | Do not say distance is directly written as a scalar label. |
| seg_012 | 02:40-02:57 | Cache remains reusable but the position coordinate convention must remain consistent. | `engineering_context` | `ep06_claim_rope_cache_boundary` | Do not over-specify one framework's cache layout. |
| seg_013 | 02:57-03:14 | Longer input means more historical K/V to store and more historical Key states to read. | `engineering_context` | `ep06_claim_long_context_difficulty`, `ep06_claim_kv_memory_growth` | Avoid saying compute is the only bottleneck. |
| seg_014 | 03:14-03:31 | Inference can bottleneck on GPU memory and bandwidth because Key/Value states are moved. | `engineering_context` | `ep06_claim_kv_memory_growth` | Keep as general bottleneck statement. |
| seg_015 | 03:31-03:47 | Sliding Window Attention limits each token to recent `W` tokens. | `paper_fact` + `engineering_context` | `ep06_claim_sliding_window` | State the tradeoff: weaker direct far-range access. |
| seg_016 | 03:47-04:04 | Sparse Attention keeps selected local/global/sparse links instead of full all-to-all attention. | `paper_fact` + `engineering_context` | `ep06_claim_sparse_attention` | Do not imply all sparse methods are identical. |
| seg_017 | 04:04-04:21 | MQA and GQA share Key/Value heads to reduce KV Cache. | `paper_fact` + `engineering_context` | `ep06_claim_mqa_gqa` | Keep MQA and GQA distinct. |
| seg_018 | 04:21-04:39 | PagedAttention manages KV Cache as memory blocks to reduce fragmentation and improve reuse. | `paper_fact` + `engineering_context` | `ep06_claim_paged_attention` | Do not show it as a model architecture change. |
| seg_019 | 04:39-04:55 | FlashAttention optimizes Attention IO, not KV Cache compression. | `paper_fact` + `engineering_context` | `ep06_claim_flashattention_boundary` | Must remain separate from PagedAttention and MQA/GQA. |
| seg_020 | 04:55-05:07 | Summary analogy: parameters are the model's long-term capability, KV Cache is current working memory; PE/RoPE and long-input optimization recap the mechanism. | `feynman_analogy` + `engineering_context` | `ep06_claim_kv_cache_definition`, `ep06_claim_rope_cache_boundary` | Analogy only; do not claim KV Cache is model parameters or learned memory. |
| seg_021 | 05:07-05:18 | Next episode asks why Transformer moves toward sparsity and experts. | `cta_or_transition` | none | Preview only; do not explain MoE here. |

## Approval State

- `claim_contract_status`: `draft_ready_for_human_review`
- `blocking_issues`: none found in current EP06 V1 script
- `must_fix_before_tts`: if script changes, re-run this classification and technical review
