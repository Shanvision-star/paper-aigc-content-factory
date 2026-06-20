# EP06 Visual Contract

## Purpose

This contract gives each EP06 scene one advertising idea and one technical proof object before render. It follows the global frame rule that every frame must declare:

- Big Idea
- Proof Object
- Visual Hero
- Caption as Micro-headline

No scene may fall back to a generic explanatory card when a formula, cache diagram, mask grid, or system diagram is required.

## Scene-Level Contract

| Scene | Time | Big Idea | Proof Object | Visual Hero | Caption as Micro-headline |
| --- | --- | --- | --- | --- | --- |
| S01_rope_to_vram_hook | 00:00-00:08 | Position moved into Q/K comparison; now we ask why memory matters. | EP05 RoPE rotation motif + KV Cache shelf teaser. | RoPE rotation ring folding into a growing K/V shelf. | `RoPE 之后，为什么更吃显存？` |
| S02_attention_formula_recall | 00:08-00:35 | Attention is still the same three-step machine: match, weight, read. | Full formula `Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V` with staged highlights. | Large centered formula with three numbered operation highlights. | `Attention = 匹配、分权、读取` |
| S03_autoregressive_cache_need | 00:35-01:05 | Generation repeats history unless K/V states are reused. | Token-by-token timeline and cache insert animation. | New Query token on the right reading historical K/V blocks from cache. | `KV Cache：避免重复计算历史 K/V` |
| S04_vram_growth_formula | 01:05-01:52 | KV Cache is not token storage; it is a per-layer Key/Value memory that grows with input length. | Simplified memory formula and deterministic MATLAB growth curve / bar. | GPU memory bar and K/V shelf filling as token count increases. | `显存 ≈ token × layers × KV heads × head dim × bytes` |
| S05_feynman_bookshelf | 01:52-02:08 | Cache is a bookmark system for historical Key/Value states. | Bookshelf analogy mapped to K/V state cards. | Bookmarks placed on Key and Value pages, not on raw token text. | `KV Cache = 给历史信息留书签` |
| S06_rope_cache_boundary | 02:08-02:57 | RoPE does not break cache; it requires a consistent position coordinate convention. | `q'_m=R_m q_m`, `k'_n=R_n k_n`, and dot-product dependency on `n - m`. | Two-dimensional Q/K rotation disk beside cache blocks with position IDs. | `n-m 进入点积，不是距离标签` |
| S07_long_context_bottleneck | 02:57-03:31 | Long input is both a storage problem and a memory-bandwidth problem. | Cache length growth + GPU memory bandwidth lane diagram. | GPU memory channel carrying K/V blocks from cache to attention compute. | `长输入：存储和读取都变贵` |
| S08_window_and_sparse_attention | 03:31-04:04 | Window and sparse attention reduce how much the model directly sees. | MATLAB attention-mask animation: full matrix -> sliding diagonal band -> sparse local/global blocks. | Two adjacent attention masks: local window and block-sparse pattern. | `Window / Sparse：控制模型看哪里` |
| S09_kv_cache_engineering | 04:04-04:39 | MQA/GQA reduce K/V heads; PagedAttention manages cache blocks. | MATLAB comparison chart for MHA/MQA/GQA K/V storage + paged block cache diagram. | Query heads flowing into fewer K/V shelves, then into page blocks. | `MQA / GQA / PagedAttention：控制缓存怎么存` |
| S10_flashattention_boundary | 04:39-04:55 | FlashAttention optimizes data movement inside attention, not KV Cache size. | HBM/SRAM IO diagram and Attention compute tile. | Fewer arrows between HBM and SRAM around Q/K/V tiles. | `FlashAttention：优化显存读写，不是 cache 压缩` |
| S11_summary_next | 04:55-05:18 | The whole episode reduces to: store less, see less, move less. | Four recap cards: PE, RoPE, KV Cache, Window/Sparse/GQA. | Central mantra card: `少存、少看、少搬运`. | `少存、少看、少搬运` |

## Visual Consistency Rules

- `Q` uses blue, `K` uses amber, `V` uses green only when it denotes Value; RoPE phase uses signal amber and trace blue.
- MATLAB local proof objects are accepted for S04, S06, S08, and S09 because they are curves, geometry, masks, and head-count comparisons; HyperFrames remains the final composition and caption layer.
- Cache blocks must be visually different from raw token cards.
- The RoPE disk means two-dimensional representation blocks, not token movement in sentence space.
- MHA/MQA/GQA comparisons are illustrative storage diagrams, not benchmark measurements.
- All formula scenes must preserve a protected formula bounding box.
- Caption slots must not overlap formula, cache, mask, GPU memory lane, or source label.
- No audience frame may show production-side labels, file paths, TODOs, or review notes.

## Approval State

- `visual_contract_status`: `draft_ready_for_human_review`
- `blocking_visual_gaps`: assets are not generated yet; all required proof objects are declared
- `must_fix_before_render`: create assets manifest and keyframe review package
