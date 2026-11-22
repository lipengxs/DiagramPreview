# DiagramPreview Analytics Events

This document lists the GA events used to understand tool discovery, retention, and workflow depth. Events are intentionally lightweight and should not include raw user input, diagram source, prompt text, or full search queries.

## Discovery

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `tool_entry_click` | A user opens a tool from homepage search, Popular Tools, a blog template, or the template library. | `tool_slug`, `target_tool_slug`, `entry_surface`, `has_query`, `query_length` |
| `tool_related_click` | A user opens a related tool from the SEO content section. | `tool_slug`, `target_tool_slug`, `entry_surface` |
| `tool_next_step_click` | A user opens a related tool from the workspace next-step module. | `tool_slug`, `target_tool_slug`, `entry_surface` |
| `tool_detected_tool_click` | A user follows the detected matching-tool prompt. | `tool_slug`, `target_tool_slug`, `entry_surface` |

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
| `tool_render_success` | A preview renders successfully. | `tool_slug`, `renderer`, `render_origin`, `has_svg`, `has_html`, `has_artifact`, `preview_kind` |
| `tool_render_qualified` | A user-initiated source renders successfully for the first time in the mounted workspace. Default sample rendering is excluded. | `tool_slug`, `renderer`, `render_origin`, `source_length` |
| `tool_render_error` | A preview render fails. | `tool_slug`, `renderer`, `mode`, `output_language` |
| `tool_copy_code` | A user copies source/generated code. | `tool_slug`, `renderer`, `success` |
| `tool_copy_html` | A user copies rendered HTML. | `tool_slug`, `renderer`, `success` |
| `tool_copy_markdown` | A user copies a Markdown snippet. | `tool_slug`, `renderer`, `success` |
| `tool_share_link` | A user copies a share link. | `tool_slug`, `renderer`, `success` |
| `tool_export_svg` | A user exports SVG. | `tool_slug`, `renderer`, `success` |
| `tool_export_png` | A user exports PNG. | `tool_slug`, `renderer`, `success` |
| `tool_export_pdf` | The browser print function returns without throwing; saving a PDF cannot be observed. | `tool_slug`, `renderer`, `success` |
| `tool_download_file` | A user downloads a renderer artifact. | `tool_slug`, `renderer`, `success` |
| `tool_export_success` | The browser download API is invoked after an artifact is prepared. This does not confirm a file was saved to disk. | `tool_slug`, `renderer`, `source_length`, `artifact_type`, `render_origin`, `provider`, `export_stage`, `intent` |
| `tool_conversion_success` | A converted artifact download is initiated; a batch requires at least one successful item and an initiated ZIP download. AI source downloads are exports, not conversions. | `tool_slug`, `renderer`, `source_length`, `artifact_type`, `render_origin`, `item_count`, `success_count`, `failure_count`, `success`, `intent` |
| `tool_clear` | A user clears the workspace input. | `tool_slug` |
| `batch_conversion_complete` | All batch items have been attempted, before ZIP creation. All-failed batches only emit this completion event. | `tool_slug`, `render_origin`, `item_count`, `success_count`, `failure_count`, `success` |
| `batch_conversion_error` | ZIP creation/download invocation fails; the action can be retried. | `tool_slug`, `render_origin`, `success=false` |

## AI Tool Actions

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `ai_generate_start` | A user starts AI generation. | `tool_slug`, `mode`, `output_language`, `diagram_type` |
| `ai_generate_success` | AI generation returns code (which may still fail rendering); `provider=local` is a template fallback, not a remote model success. | `tool_slug`, `mode`, `output_language`, `provider` |
| `ai_generate_error` | AI generation fails. | `tool_slug`, `mode`, `output_language` |
| `ai_review_start` | A user starts the local AI Review beta panel. | `tool_slug`, `renderer`, `source_length` |
| `ai_review_success` | The local AI Review beta returns structured output. | `tool_slug`, `renderer`, `source_length`, `issue_count` |

## Monetization Intent

| Event | Trigger | Key parameters |
| --- | --- | --- |
| `monetization_cta_view` | A paid-workflow validation CTA renders. | `entry_surface`, `tool_slug`, `intent` |
| `monetization_cta_click` | A user opens a paid-workflow validation CTA. | `entry_surface`, `tool_slug`, `intent` |
| `batch_conversion_intent` | A user interacts with the batch conversion beta. | `tool_slug`, `renderer`, `source_length`, `item_count`, `intent` |
| `advanced_export_intent` | A user interacts with advanced export validation. | `entry_surface`, `tool_slug`, `intent` |
| `waitlist_open` | A user opens the waitlist form. | `entry_surface`, `tool_slug`, `intent` |
| `waitlist_submit` | A user submits the waitlist form. | `entry_surface`, `tool_slug`, `team_size`, `intent` |

## Review Notes

- Do not send raw diagram source, prompts, uploaded content, generated code, or full search text to GA.
- Use `tool_slug` as the primary dimension for tool-level reporting.
- Use `entry_surface` to compare homepage search, Popular Tools, SEO related links, and workspace next-step recommendations. Avoid the reserved `source` analytics parameter.
- Use `success=false` action events to identify browser permission or export failures.
- Mark `tool_render_qualified` and `tool_export_success` as GA4 key events. Do not mark automatic `tool_render_success` as a key event.
- Manual `page_view` and all custom events use sanitized `page_location` and `page_referrer`. Referrer queries/fragments are removed; only the campaign allowlist survives in current locations. An event-parameter allowlist rejects source/prompt/filename/URL fields.
- Monetization events may include source length or item count, but never raw source, prompt, generated code, or diagram content.

## Draw.io local viewer

- Local file reads use `render_origin=file_upload`; source content and file names are excluded from analytics.
- Selecting a supported page can produce `tool_render_success`. Unsupported pages produce `tool_render_error` and cannot produce successful image exports.
- SVG, PNG and current-page `.drawio` downloads use `tool_export_success` with `artifact_type=svg|png|drawio`; reading/exporting Draw.io is not counted as a conversion.
- Local history storage is optional. A full browser storage quota does not turn an otherwise completed download into a failed export.

## Tool handoff and long links

- `tool_next_step_click` includes the current and target tool slugs plus `entry_surface=workspace_next_step`. Source/XML lives in the URL fragment and is excluded from analytics and network request URLs.
- Compatible Mermaid/PlantUML tools receive current source; a conversion can send XML to the Draw.io viewer only while its successful result matches the current input. Incompatible tools open without content.
- A fragment above 32 KiB after URL encoding is not generated. Share/Markdown actions are disabled with a visible download fallback. Downloading exact input uses `tool_export_success` with `artifact_type=source`; downloading the current converted XML keeps the existing conversion/export events.
- Navigating to another tool is not a successful conversion or export event.

## Search entry examples

- The three homepage tasks use `tool_entry_click` with `entry_surface=home_primary_task`.
- Loading a verified example uses `tool_entry_click` with `entry_surface=tool_verified_example`. The event carries tool identifiers, not the example source or its fragment URL.
- Same-page example loading updates the editor as `render_origin=shared_source`. A same-page fragment selection is not a new page view.
- Static example input and output downloads use ordinary download links. These files are reference examples, not exports of the user's current input, and do not emit `tool_export_success`.

## Design specification content

- Blog template entries use `entry_surface=blog:design-spec-markdown-template`.
- The library entry uses `entry_surface=template:workspace-design-spec`.
- Both target `markdown-preview`; source text is excluded from the event.
- Static Markdown downloads currently use ordinary download links and are not a custom GA event.


## Measurement revision — 2026-10-26 (local, not deployed)

The client creates the standard gtag/dataLayer queue before loading the remote tag. The initial page view precedes business events, even when a child effect fires first. Repeated effects, tag load, fragment-only changes and source-only query changes do not create another view. Navigation to a different sanitized URL, including Back/Forward, creates a new view. A full reload creates a new document/view. Campaign query changes count as a new view; parameter order does not.

Queue entries retain their page context when created. Script loading/network blocking cannot guarantee delivery to GA4; no code can bypass blocking or recover events from a tab closed before transmission. The local tests validate queue behavior and synthetic delayed consumption, not receipt in the production property.

`render_origin` values: `default_sample`, `sample_click`, `user_edit`, `shared_source`, `draft_restore`, `file_upload`, `ai_generated`. `tool_render_qualified` excludes the automatic default and fires once per workspace mount. Explicit sample clicks and shared examples count as active use; filter to `user_edit|file_upload|draft_restore|ai_generated` for a closer own-work proxy, which still does not prove original authorship. Exports retain their origin, including an explicitly downloaded default sample. Render success and export initiation do not prove semantic correctness.

`tool_export_success` always includes `export_stage=download_initiated` and a short artifact type (`svg`, `png`, `puml`, `drawio`, `source`, `mermaid`, `json`, `yaml`, `md`, `html`, `zip`, etc.). A failed PNG or ZIP does not emit it. A ZIP containing only failure reports is excluded. Printing emits only `tool_export_pdf` with `export_stage=print_invoked`; copies emit only their own action events. AI SVG/PNG exports are tied to the currently rendered code, preventing stale previews from being counted as current output. AI remote-image renders count only after image load.

### Required GA4 rollout configuration

These are release steps, not settings applied by this repository. Keep the current property/measurement ID. In Admin → Data streams → Web → Enhanced measurement, disable automatic Page views (including browser-history page changes), file downloads, outbound clicks and form interactions for this stream. Manual views/download events are the measurement source; automatic URL-bearing events can duplicate counts or capture source-bearing links. Do this before deployment, then check actual collector requests in a clean browser. Review any other tags using the property for duplicate configuration or URL collection. Other enabled automatic events must also be checked in the collector before marking privacy acceptance complete.

Register these **four event-scoped custom dimensions**, using exact event-parameter names:

| Display name | Event parameter | Use |
| --- | --- | --- |
| Tool | `tool_slug` | Tool funnel and export rate |
| Render origin | `render_origin` | Default/sample vs edited/shared/uploaded/generated work |
| Entry surface | `entry_surface` | Internal discovery surfaces; not external acquisition source |
| AI provider | `provider` | Separate `local`, remote provider and `none`/`unknown` |

Mark `tool_render_qualified` and `tool_export_success` as key events with **once per event** counting. Do not mark automatic render success, print, copy, batch completion or AI generation as equivalent conversions. These two key events are different funnel steps; total key-event count is not unique successful users. Use user/session scoped funnels when calculating rates. Keep GA4's normal source/medium/channel reporting from UTMs/referrers; do not repurpose the reserved `source` parameter. Artifact type/export stage remain available in DebugView/raw event payloads unless separately registered later.

| Milestone | Effective date (Asia/Shanghai) | Evidence/status |
| --- | --- | --- |
| Local implementation | 2026-10-26 | Local regression; see implementation report |
| Production deployment | Pending | Record release SHA/time and clean-session collector evidence |
| Enhanced-measurement settings | Pending | Record operator, time, stream setting screenshot |
| Four dimensions registered | Pending | Record creation time for each; not retroactive |
| Two key events configured | Pending | Record creation time/counting method; not retroactive |
| Reporting acceptance | Pending | DebugView/Realtime first; standard reports after processing, often 24–48 hours |

Do not compare pre/post conversion totals across these semantic/configuration cutovers without an annotation. Registration and key-event changes do not repair historical reports. At deployment +7 and +14 days, compare GSC/Bing search clicks and index coverage alongside qualified users and export users; report page/country/device/channel and sample size. Traffic growth remains a separate outcome from successful local implementation.

## Design specification generator

- `spec_generate`: explicit form generation or confirmed replacement; parameters `tool_slug=design-spec-generator`, `output_language`.
- `spec_check`: explicit local specification check; only `tool_slug=design-spec-generator`. Document text, matched lines, unresolved decisions and diagram source are never event parameters.
- `tool_copy_markdown`: copy attempt, with `success`.
- `tool_download_file`: browser download request, with `success`; this is not confirmation that the file was saved by the user.
- `tool_next_step_click`: open current Markdown in a new tab, with `target_tool_slug=markdown-preview`.
- The optional editable save-flow example uses the same handoff event with `target_tool_slug=mermaid-preview`. Its current source is in the URL fragment; SVG/PNG exports use the existing Mermaid tool events.
- `tool_open` follows existing discovery conventions. Never send field values, titles, document contents or source URLs in analytics parameters.
