---
name: short-video-cover-constraints
description: Use when creating, editing, resizing, reviewing, or exporting short-video cover images for Douyin, Xiaohongshu, Bilibili, YouTube Shorts, or other vertical social platforms.
---

# Short Video Cover Constraints

## Core Rule

Use the Douyin-safe cover export as the default vertical cover contract for this project:

- Final asset format: `PNG`
- Canvas size: `1080x1920`
- Aspect ratio: `9:16`
- Content scale: `90%`
- Safe padding: `54px` left and right, `96px` top and bottom
- Safe-area treatment: invisible layout guard; do not render it as a black border, black background, safety-frame outline, or shrunken poster.
- Series style reference: EP04 final cover `episodes/ep04_positional_encoding/video_script/cover_ep04_positional_encoding_final_1080x1920_safe90.png` when available; use its light paper canvas, grid texture, strong title, source-backed proof cards, and warm-orange/blue emphasis. Do not fall back to the non-final EP02 dark cover as the series reference.

Do not place load-bearing title, formula, source label, or focal visual outside the safe padding. The background, texture, and series visual system should still extend to the full `1080x1920` canvas, so the cover does not look like a small image floating inside a safety frame. The 90% content scale exists because Douyin cover upload/crop UI can visually overflow at the edges; it is not permission to create black padding, a black background, or a visible safe-area frame.

## Thumbnail Design Defaults

When generating or reviewing covers:

- Prefer a short hook title, not a full sentence.
- Keep mobile readability as the first quality gate.
- Use high contrast between headline, background, and focal visual.
- Keep one primary focal element. For paper explainers, the focal element may be the paper figure, formula, model structure, or QKV/Attention visual.
- Arrows on covers are secondary relationship cues, not focal objects. They must not be larger than the objects they connect, must not dominate the thumbnail, and must not point into empty decorative space. For RoPE/QK geometry, prefer thin vectors, endpoint dots, short arcs, or small connectors over large arrowheads.
- Avoid dense labels near platform UI edges.
- Preserve the `1080x1920` canvas even when shrinking content.

## Source References

Keep these GitHub references available so future cover work does not need a fresh search:

- `youtube-thumbnail`: https://github.com/charlie947/social-media-skills/blob/main/skills/youtube-thumbnail/SKILL.md
- `marketing-short-video-editing-coach`: https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-short-video-editing-coach.md
- `awesome-nanobanana-pro`: https://github.com/ZeroLu/awesome-nanobanana-pro

Use them as design references only. Do not install them as production dependencies unless a separate task explicitly approves that.

## Verification

Before calling a cover final:

1. Confirm the file is `PNG`.
2. Confirm dimensions are exactly `1080x1920`.
3. Confirm load-bearing content stays inside the safe padding while the visual background fills the full canvas.
4. Confirm there is no visible safe-area artifact: no black safety border, no black background, no safety-frame outline, and no obvious shrunken-poster look.
5. Confirm top title and key focal element are not touching crop edges.
6. Confirm arrows/connectors do not overpower the formula, figure, model structure, or hook message.
7. Confirm the path and export constraints are documented in README or the episode review notes when the rule changes.
