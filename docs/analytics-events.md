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
| `tool_export_success` | A user completes an export and becomes eligible for advanced export CTA. | `tool_slug`, `renderer`, `source_length`, `intent` |
| `tool_conversion_success` | A user completes a conversion or batch beta run. | `tool_slug`, `renderer`, `source_length`, `item_count`, `success`, `intent` |
| `tool_clear` | A user clears the workspace input. | `tool_slug` |

## AI Tool Actions

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `ai_generate_start` | A user starts AI generation. | `tool_slug`, `mode`, `output_language`, `diagram_type` |
| `ai_generate_success` | AI generation returns usable code. | `tool_slug`, `mode`, `output_language`, `provider` |
| `ai_generate_error` | AI generation fails. | `tool_slug`, `mode`, `output_language` |
| `ai_review_start` | A user starts the local AI Review beta panel. | `tool_slug`, `renderer`, `source_length` |
| `ai_review_success` | The local AI Review beta returns structured output. | `tool_slug`, `renderer`, `source_length`, `issue_count` |

## Monetization Intent

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `monetization_cta_view` | A paid-workflow validation CTA renders. | `source`, `tool_slug`, `intent` |
| `monetization_cta_click` | A user opens a paid-workflow validation CTA. | `source`, `tool_slug`, `intent` |
| `batch_conversion_intent` | A user interacts with the batch conversion beta. | `tool_slug`, `renderer`, `source_length`, `item_count`, `intent` |
| `advanced_export_intent` | A user interacts with advanced export validation. | `source`, `tool_slug`, `intent` |
| `waitlist_open` | A user opens the waitlist form. | `source`, `tool_slug`, `intent` |
| `waitlist_submit` | A user submits the waitlist form. | `source`, `tool_slug`, `team_size`, `intent` |

## Review Notes

- Do not send raw diagram source, prompts, uploaded content, generated code, or full search text to GA.
- Use `tool_slug` as the primary dimension for tool-level reporting.
- Use `source` to compare homepage search, Popular Tools, SEO related links, and workspace next-step recommendations.
- Use `success=false` action events to identify browser permission or export failures.
- Monetization events may include source length or item count, but never raw source, prompt, generated code, or diagram content.
