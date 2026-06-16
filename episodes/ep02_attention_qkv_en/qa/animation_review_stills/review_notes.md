# EP02 English Animation Review Stills

These stills are not final renders. They are approval frames for rebuilding the English animation branch.

Detected issue in the current English video:

- Relation lines were drawn as visual fragments instead of anchored SVG paths, causing drift and unclear pointing.
- Formula was hand-laid as text pieces without a stable formula bounding box, causing crowding and overflow risk.
- The animation did not show the paper derivation chain: QK^T -> /sqrt(d_k) -> row-wise softmax -> weighted V -> output.
- Some scenes reused the same projection-card skeleton, so KV Cache and formula beats lost their distinct meaning.
- Captions and source notes competed with the formula area instead of reserving a no-caption zone.

New review gates:

- Every relation edge must be an SVG path anchored to the outer edge of source and target nodes/cards, never into the interior.
- Arrowheads and connector stroke widths must stay consistent; emphasis uses color/opacity, not arrow size.
- Relation and aggregation connectors must be single-segment flow arcs with consistent curvature, not arbitrary multi-bend curves.
- The complete formula must fit within one protected bounding box.
- Formula scenes must show the derivation chain and annotation targets.
- KV Cache must show runtime reuse of projected K/V, not generic QKV cards.
- Keyframes must be checked at QK, formula, softmax, weighted V, and KV Cache beats before rendering.