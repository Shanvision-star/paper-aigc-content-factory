# EP06 Notation Contract

## Purpose

This contract separates four channels for every important technical term:

- `visual_text`: what can appear in formula, diagram, or label.
- `caption_text`: what can appear in audience subtitles.
- `spoken_text`: what TTS or voiceover should read.
- `boundary`: what must not be implied.

## Formula And Symbol Mapping

| Concept | visual_text | caption_text | spoken_text | Boundary |
| --- | --- | --- | --- | --- |
| Attention formula | `Attention(Q,K,V)=softmax(QK^T/√d_k)V` | `Attention(Q,K,V)=softmax(QK^T/√d_k)V；QK^T=Query 乘 Key 转置；√d_k=按 Key 维度缩放` | `Attention 等于 softmax，括号里是 Query 乘 Key 转置，除以根号下 d k，再乘 Value` | Do not crop the formula or show raw LaTeX. |
| Query | `Q`, `Query` | `Query / Q` | `Query 向量` | Do not feed naked `Q` into TTS when avoidable. |
| Key | `K`, `Key` | `Key / K` | `Key 向量` | Do not let TTS read `K` as an unintended syllable. |
| Value | `V`, `Value` | `Value / V` | `Value 向量` | Do not call Value the original token. |
| Score matrix | `QK^T` | `QK^T（Q 乘 K 转置）` | `Query 乘 Key 转置` | Do not say attention understands meaning by magic. |
| Scale term | `√d_k`, `sqrt(d_k)` | `√d_k` | `根号下 d k` | Do not display broken radicals or cropped subscripts. |
| Key dimension | `d_k` | `d_k` | `d k` | Keep subscript visible in formula assets. |
| KV Cache | `KV Cache`, `Key/Value Cache` | `KV Cache（Key-Value 缓存）：存历史 Key/Value 状态，不存原始 token 或 Query` | `Key Value Cache` | It stores Key and Value states, not raw tokens or Query. |
| RoPE | `RoPE`, `Rotary Position Embedding` | `RoPE（旋转位置编码）：位置进入 Query/Key 的旋转关系` | `R O P E，也就是旋转位置编码` | Do not claim every modern model uses it. |
| RoPE Query rotation | `q'_m = R_m q_m` | `q'_m=位置 m 旋转后的 Query` | `位置 m 的 Query 会旋转成 R m 乘 Query` | Do not imply token moves in sentence space. |
| RoPE Key rotation | `k'_n = R_n k_n` | `k'_n=位置 n 旋转后的 Key` | `位置 n 的 Key 会旋转成 R n 乘 Key` | Keep K position tied to original cached position. |
| RoPE caption compression | `q'_m/k'_n` | `q'_m/k'_n：位置旋转后的 Query/Key` | `位置 m 的 Query；位置 n 的 Key` | Caption may compress m/n only when the same scene shows m and n labels visually. |
| Relative displacement | `n - m`, `R_{n-m}` | `n-m 进入点积；不是直接输出距离` | `n 减 m，也就是相对位移` | Do not say RoPE directly outputs distance. |
| Token count | `N`, `tokens` | `token 数` | `token 数` | If using `N`, define it visually. |
| Layer count | `L`, `layers` | `层数` | `层数` | Engineering estimate only. |
| KV heads | `kv_heads` | `KV heads` | `Key Value 头数` | Distinguish from Query heads. |
| Head dimension | `head_dim` | `head dim` | `每个头的维度` | Estimate term; not a measured profiling value. |
| Bytes | `bytes` | `bytes` | `数据字节数` | Keep as storage estimate. |
| Sliding Window Attention | `Sliding Window Attention` | `Sliding Window（滑动窗口注意力）` | `Sliding Window Attention，滑动窗口注意力` | It weakens direct far-range access. |
| Sparse Attention | `Sparse Attention` | `Sparse Attention（稀疏注意力）` | `Sparse Attention，稀疏注意力` | Sparse patterns differ; do not merge all variants. |
| MQA | `MQA` | `MQA（Multi-Query Attention）` | `M Q A，Multi Query Attention` | It is a K/V head sharing design. |
| GQA | `GQA` | `GQA（Grouped-Query Attention）` | `G Q A，Grouped Query Attention` | It is not identical to MQA. |
| PagedAttention | `PagedAttention` | `PagedAttention（分页注意力）` | `Paged Attention` | It is cache memory management, not a new model layer. |
| FlashAttention | `FlashAttention` | `FlashAttention` | `Flash Attention` | It is attention IO optimization, not KV Cache compression. |
| GPU memory bandwidth | `GPU memory bandwidth` | `显存带宽` | `显存带宽` | Explain with movement of Key/Value states. |
| Parameter / KV memory analogy | `Parameters`, `KV Cache` | `参数=模型大脑；KV Cache=当前工作记忆` | `参数像模型的大脑，Key Value Cache 像当前工作记忆` | Analogy only; do not claim KV Cache is model parameters or long-term learned memory. |

## Spoken Text Restrictions

The TTS input must not contain:

- naked `Q/K`, `K/V`, or standalone `K` / `V` as the main pronunciation target;
- `KV cache 与推理速度` or other large-title mixed `English + 与 + Chinese` phrasing;
- production notes such as `读作`, `视觉焦点`, `教学边界`, `Hook`, or `QA`;
- unsupported closed-source implementation claims.

## Caption Restrictions

- Captions may keep `Q/K`, `KV Cache`, `RoPE`, `MQA`, `GQA`, `PagedAttention`, and `FlashAttention`.
- Captions must add Chinese explanation on first appearance when the term is not self-evident.
- Captions must explain `Attention(Q,K,V)=softmax(QK^T/√d_k)V`, `q'_m`, `k'_n`, and `n-m` in viewer-facing language when they first appear.
- Captions must stay semantically aligned with the matching voice segment; micro-headlines are allowed only as auxiliary text, not as replacements for definitions or formula meaning.
- Captions must not cover formula bounding boxes or source labels.

## Approval State

- `notation_contract_status`: `draft_ready_for_human_review`
- `blocking_notation_gaps`: none in current V1 script
- `must_fix_before_tts`: run pronunciation gate after TTS manifest generation
