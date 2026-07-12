# DiagramPreview Analytics Events

This document lists the GA events used to understand tool discovery, retention, and workflow depth. Events are intentionally lightweight and should not include raw user input, diagram source, prompt text, or full search queries.

## Discovery

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `tool_entry_click` | A user opens a tool from homepage search or Popular Tools. | `tool_slug`, `target_tool_slug`, `source`, `has_query`, `query_length` |
| `tool_related_click` | A user opens a related tool from the SEO content section. | `tool_slug`, `target_tool_slug`, `source` |
| `tool_next_step_click` | A user opens a related tool from the workspace next-step module. | `tool_slug`, `target_tool_slug` |
| `tool_detected_tool_click` | A user follows the detected matching-tool prompt. | `tool_slug`, `target_tool_slug` |

## Retention

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `tool_open` | A regular or AI tool workspace loads. | `tool_slug`, `renderer`, `mode`, `output_language`, `implemented` |
| `tool_favorite_add` | A user favorites a tool. | `tool_slug` |
| `tool_favorite_remove` | A user removes a favorite tool. | `tool_slug` |
| `tool_sample_load` | A user loads a sample into a workspace. | `tool_slug`, `sample_key` |

## Tool Actions

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `tool_render_success` | A preview renders successfully. | `tool_slug`, `renderer`, `has_svg`, `has_html`, `has_artifact`, `preview_kind` |
| `tool_render_error` | A preview render fails. | `tool_slug`, `renderer`, `mode`, `output_language` |
| `tool_copy_code` | A user copies source/generated code. | `tool_slug`, `renderer`, `success` |
| `tool_copy_html` | A user copies rendered HTML. | `tool_slug`, `renderer`, `success` |
| `tool_copy_markdown` | A user copies a Markdown snippet. | `tool_slug`, `renderer`, `success` |
| `tool_share_link` | A user copies a share link. | `tool_slug`, `renderer`, `success` |
| `tool_export_svg` | A user exports SVG. | `tool_slug`, `renderer`, `success` |
| `tool_export_png` | A user exports PNG. | `tool_slug`, `renderer`, `success` |
| `tool_export_pdf` | A user prints/exports PDF. | `tool_slug`, `renderer`, `success` |
| `tool_download_file` | A user downloads a renderer artifact. | `tool_slug`, `renderer`, `success` |
| `tool_clear` | A user clears the workspace input. | `tool_slug` |

## AI Tool Actions

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `ai_generate_start` | A user starts AI generation. | `tool_slug`, `mode`, `output_language`, `diagram_type` |
| `ai_generate_success` | AI generation returns usable code. | `tool_slug`, `mode`, `output_language`, `provider` |
| `ai_generate_error` | AI generation fails. | `tool_slug`, `mode`, `output_language` |

## Review Notes

- Do not send raw diagram source, prompts, uploaded content, generated code, or full search text to GA.
- Use `tool_slug` as the primary dimension for tool-level reporting.
- Use `source` to compare homepage search, Popular Tools, SEO related links, and workspace next-step recommendations.
- Use `success=false` action events to identify browser permission or export failures.
