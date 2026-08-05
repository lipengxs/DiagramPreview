# GSC Indexing Triage

Use this checklist when Google Search Console reports `Crawled - currently not indexed` or `Discovered - currently not indexed`.

## Current submission policy

- Primary submission sitemap: `https://diagrampreview.com/sitemap-core.xml`
- Supporting sitemaps remain available, but are not listed in `robots.txt`.
- Core submission locales: `en`, `zh-CN`, `es`, `de`, `fr`.
- Non-submission locales: `pt`, `ru`, `ja`, `ko`, `zh-TW`; keep them `noindex, follow`.

## URL triage rules

Classify every URL in the coverage drilldown into one bucket:

| Bucket | Criteria | Action |
| --- | --- | --- |
| Core page | Matches a core tool, core workflow, homepage, hub, or core blog target. | Improve body content, strengthen internal links, keep or add to `sitemap-core.xml`, then request indexing. |
| Thin duplicate | Utility page with weak search demand, repeated boilerplate, or no unique examples. | Keep accessible, remove from active submission sitemap, and revisit only after core pages gain impressions. |
| Non-core locale | `pt`, `ru`, `ja`, `ko`, or `zh-TW` URL. | Keep `noindex, follow`; do not submit unless the locale is promoted later. |
| Canonical duplicate | URL canonicalizes to another locale or canonical target. | Do not submit. Confirm canonical and robots output are consistent. |
| Redirect | URL redirects to another path. | Do not submit. Submit only the final canonical URL if it is a core page. |

## Core pages to prioritize

Core tools:

- `/en/text-to-mermaid`
- `/en/mermaid-preview`
- `/en/mermaid-to-drawio`
- `/en/plantuml-to-drawio`
- `/en/drawio-preview`
- `/en/openapi-to-sequence`
- `/en/api-error-flow-diagram`
- `/en/json-schema-visualizer`
- `/en/json-schema-form-preview`
- `/en/protobuf-schema-visualizer`

Core workflows:

- `/en/workflows/ai-generated-mermaid-workflow`
- `/en/workflows/mermaid-to-drawio-documentation-workflow`
- `/en/workflows/api-debugging-sequence-diagram`
- `/en/workflows/schema-visualization-workflow`
- `/en/workflows/open-drawio-file-online`

## Weekly review loop

1. Export Performance and Coverage from GSC.
2. Compare `Indexed` against `sitemap-core.xml` URL count.
3. Review top pages with impressions but no clicks.
4. Review `Crawled - currently not indexed` drilldown.
5. Submit only 5-10 improved core URLs per batch.
6. Do not add more locale or tool pages until core indexed ratio improves.

## Acceptance criteria for adding a page to core submission

- The page is indexable and canonical to itself.
- It has at least 3 realistic examples or task scenarios.
- It explains common failure modes or limitations.
- It links to a relevant workflow or at least 3 related tools.
- It is not a shallow translation of another page without local search intent.
