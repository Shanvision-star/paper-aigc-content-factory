# GitHub Research Notes For Platform Content Workflow

## Purpose

Record which external skill patterns influenced this project so future agents do not need to repeat the same GitHub search before improving script naturalness, opening hooks, covers, or platform packages.

## Reviewed Sources

- `ai-zixun/humanizer-zh`: suitable as the main humanizer pattern; use locally with stricter technical/script gates.
- `op7418/Humanizer-zh`: useful lightweight contrast; not the main implementation pattern.
- `wpsnote/wpsnote-skills`: `short-video-copywriter` is useful for original-article-to-short-video structure, `0-3s` hook, short oral sentences, storyboard/image-prompt handoff.
- `coreyhaines31/marketingskills`: social-content patterns are useful for hook formulas, content repurposing, and first-second `visual hook + verbal hook + text overlay`.
- `msitarzewski/agency-agents`: `marketing-short-video-editing-coach` is useful for subtitle/audio/export QA and multi-platform export optimization.
- `canva-sdks/canva-claude-skills`: `resize-for-social-media` is useful as one-design-to-many-platforms pattern, especially exact dimensions, parallel operations, and partial-failure reporting.
- `charlie947/social-media-skills`: `youtube-thumbnail` is useful for cover constraints: few large words, high contrast, one focal element, small-screen readability.
- `ZeroLu/awesome-nanobanana-pro`: useful for cover prompt benchmarking, not a direct execution dependency.

## Decision

- `humanizer-zh` ideas are adapted as `script-humanizer-zh`, but technical correctness wins over natural prose.
- `short-video-opening-optimizer exact match not found` on 2026-06-14; create a local project skill instead.
- Canva-style all-platform resize is adapted as `platform-format-adapter`, but packaging remains local and never auto-publishes.
