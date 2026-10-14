# DiagramPreview execution baseline - 2026-10-13

This record captures the pre-deployment state for the evidence-first indexing and conversion-quality update. Search metrics come from the 2026-10-06 optimization report and have not been re-collected here.

## Search and product baseline

| Metric | Baseline |
| --- | ---: |
| Google clicks, 2026-09-06 to 2026-10-03 | 1 |
| Google impressions | 12 |
| Bing clicks | 205 |
| Bing impressions | 4,097 |
| GA4 sessions | 497 |
| `tool_render_success` events | 1,589 across 266 sessions |
| `tool_export_success` events | 72 across 22 sessions |

`/en/mermaid-to-drawio` had 17 Bing clicks and 442 impressions. `/en/plantuml-preview` had 17 clicks and 161 impressions. The 2026-10-06 Google URL Inspection sample reported `/en/mermaid-to-drawio` as unknown to Google, while `/en` was submitted and indexed.

## Pre-deployment technical evidence

| URL | HTTP | Canonical | Robots | Frozen title | Frozen H1 |
| --- | --- | --- | --- | --- | --- |
| `/en` | 200 | `/en` | `index, follow` | Diagram Preview Tools - Mermaid, PlantUML, Markdown, Graphviz Online | Diagram Preview Tools for Developers |
| `/en/mermaid-to-drawio` | 200 | self | `index, follow` | Mermaid to Draw.io Converter - Export Editable diagrams.net XML | Mermaid to Draw.io |
| `/en/plantuml-preview` | 200 | self | `index, follow` | PlantUML Preview Online - PlantUML Editor and Viewer | PlantUML Preview |

- `robots.txt` declared only `sitemap-core.xml`.
- The production core sitemap contained 35 unique, indexable, self-canonical URLs.
- The previous core sitemap contained `/en/protobuf-schema-visualizer`, not `/en/plantuml-preview`.
- The raw `tool_render_success` event included automatic default-sample renders and was not suitable as a key event.
- Source-sharing URLs used `?source=`, allowing diagram source to appear in automatic analytics page locations.

## Deployment evidence to attach

- Production deployment URL and timestamp.
- `npm run seo:audit -- https://diagrampreview.com` output after deployment.
- GA4 DebugView screenshots for `page_view`, `tool_render_qualified`, and `tool_export_success`.
- GSC URL Inspection results for `/en`, `/en/mermaid-to-drawio`, and `/en/plantuml-preview`.
- Bing IndexNow response for the two changed tool URLs.

## Platform actions

1. In GA4, register `render_origin`, `entry_surface`, `tool_slug`, and `artifact_type` as event-scoped custom dimensions where needed.
2. Mark `tool_render_qualified` and `tool_export_success` as key events. Do not mark `tool_render_success`.
3. Investigate `tool / (not set)` by hostname, landing page, session source, and medium. Do not rewrite historical data.
4. Keep only `sitemap-core.xml` submitted in GSC.
5. Inspect and request indexing for `/en/mermaid-to-drawio` and `/en/plantuml-preview` after the production audit passes.
6. Submit the same two URLs through IndexNow.

## Review dates

- Day 7: 2026-10-20, verify discovery/crawl and analytics event quality.
- Day 14: 2026-10-27, compare query-to-page distribution and Bing clicks.
- Day 28: 2026-11-10, compare indexing, non-home impressions, qualified renders, and export sessions.

Do not change title, description, H1, or canonical during this observation window.
