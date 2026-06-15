# EP02 English Voiceover: What Does QKV Compute?

## Production Boundary

- This file is the reviewed English source text.
- TTS must use the matching `spoken_text` in `script/voice_segments.json`.
- Captions may show formulas and abbreviations; spoken text must read naturally.

## Voiceover

### seg_001 (00:00:00,000-00:00:12,237)

Attention is like a relationship map that changes at every layer. Today we open that map and focus on one line: Q times K transpose.

### seg_002 (00:00:12,327-00:00:19,270)

The question is simple: for the current token, which tokens in the context should it read from?

### seg_003 (00:00:19,360-00:00:29,913)

This is not a fixed graph, and not a Graph Neural Network. It is a soft attention matrix, rebuilt at each layer.

### seg_004 (00:00:30,003-00:00:41,300)

So what are Q, K, and V? They are not three different data sources. In self-attention, they usually come from the same token representation.

### seg_005 (00:00:41,390-00:00:55,902)

The same input X is projected three ways: X times W Q becomes Query, X times W K becomes Key, and X times W V becomes Value.

### seg_006 (00:00:55,992-00:01:06,754)

Use a meeting room analogy. Query is your question. Key is each person's label. Value is the actual information they can give you.

### seg_007 (00:01:06,844-00:01:16,260)

For a pronoun like it, the model does not magically understand the reference. The current token's Query is matched against every Key.

### seg_008 (00:01:16,350-00:01:25,684)

That matching step is Q times K transpose. It produces a matrix of compatibility scores.

### seg_009 (00:01:25,774-00:01:37,465)

Next, the scores are divided by the square root of d k. In the paper, d k is the Query and Key vector dimension. Scaling keeps softmax stable.

### seg_010 (00:01:37,555-00:01:45,961)

Then softmax normalizes each row. For each current token, the row becomes attention weights that add up to one.

### seg_011 (00:01:46,051-00:01:57,406)

Finally, the model uses those weights to read Value vectors and combine them into a new representation. Match, normalize, then read.

### seg_012 (00:01:57,496-00:02:09,118)

That is Scaled Dot-Product Attention: softmax of Q K transpose divided by the square root of d k, then multiplied by V.

### seg_013 (00:02:09,208-00:02:23,779)

ChatGPT and Claude still use this path. A new Query is produced for the next token, while old Key and Value projections can be reused through KV Cache, or Key-Value Cache.

### seg_014 (00:02:23,869-00:02:35,363)

Modern systems optimize the same path: FlashAttention at the kernel level, GQA and MQA at the model level, and KV Cache at runtime.

### seg_015 (00:02:35,453-00:02:47,551)

Feynman summary: Query is the question. Key is the index. Value is the content. Attention is a differentiable routing system for information.

### seg_016 (00:02:47,641-00:02:57,196)

Next episode: if one attention view works, why does Transformer use many heads at once? That is Multi-Head Attention.
