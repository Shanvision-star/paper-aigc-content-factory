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
- Padding treatment: `black padding`
- Reference output file: `episodes/ep01_attention_is_all_you_need/video_script/cover_transformer_ai_v1_1080x1920_safe90.png`

Do not upscale content to fill the whole canvas for Douyin covers unless the user explicitly asks. The 90% content scale exists because Douyin cover upload/crop UI can visually overflow at the edges.

## Thumbnail Design Defaults

When generating or reviewing covers:

- Prefer a short hook title, not a full sentence.
- Keep mobile readability as the first quality gate.
- Use high contrast between headline, background, and focal visual.
- Keep one primary focal element. For paper explainers, the focal element may be the paper figure, formula, model structure, or QKV/Attention visual.
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
3. Confirm content was scaled to `90%` with `black padding`.
4. Confirm top title and key focal element are not touching crop edges.
5. Confirm the path and export constraints are documented in README or the episode review notes when the rule changes.
