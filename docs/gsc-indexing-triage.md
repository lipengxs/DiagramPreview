# GSC Indexing Triage

Use this checklist when Google Search Console reports `Crawled - currently not indexed` or `Discovered - currently not indexed`.

## Current submission policy

- Primary submission sitemap: `https://diagrampreview.com/sitemap-core.xml`
- Supporting sitemaps remain available, but are not listed in `robots.txt`.
- Core submission is an evidence-based allowlist of 35 URLs, not a locale-by-tool cross product.
- Full English coverage is limited to 10 tools, 5 hubs, 5 workflows, the blog hub, and 3 supporting articles.
- Localized submission is limited to 6 `zh-CN` tools plus `/es/protobuf-schema-visualizer`, `/fr/openapi-to-sequence`, and `/de/drawio-preview`.
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

Generate the weekly report with:

```bash
npm run seo:report -- <gsc-performance.zip> <bing-performance.csv> [gsc-coverage.zip]
```

Validate the deployed submission surface with:

```bash
npm run seo:audit -- https://diagrampreview.com
```

## Search Console deployment runbook

After deploying a changed core sitemap:

1. Remove old `sitemap.xml`, `sitemap-tools.xml`, and `sitemap-blog.xml` submissions from Google Search Console. Keep the routes available on the website.
2. Submit only `https://diagrampreview.com/sitemap-core.xml`.
3. Export the URL list behind `Crawled - currently not indexed`; the summary Coverage ZIP does not contain the affected URLs.
4. Classify every exported URL with the table above before requesting indexing.
5. Request indexing for no more than 5-10 improved URLs in one batch.

First batch:

- `/en/text-to-mermaid`
- `/en/mermaid-preview`
- `/en/mermaid-to-drawio`
- `/es/protobuf-schema-visualizer`
- `/fr/openapi-to-sequence`

Second batch, at least seven days later:

- `/en/openapi-to-sequence`
- `/en/json-schema-visualizer`
- `/zh-CN/drawio-preview`
- `/zh-CN/mermaid-preview`
- `/de/drawio-preview`

Submit the same batches to Bing through IndexNow after the deployment audit passes.

## Locale promotion rule

Add one localized URL to the core sitemap only when all conditions are met:

- At least 20 impressions in the latest 28 days.
- Average position of 30 or better.
- Native-language content review is complete.
- The URL returns 200, is indexable, and is canonical to itself.
- At least two relevant internal links point to the page.
- The tool has three realistic samples and tool-specific troubleshooting guidance.

Promote individual pages, never a full locale directory based on one search signal.

## Metadata experiment boundary

Keep `title`, `description`, `H1`, and canonical frozen during the current indexing cycle. A page becomes a title-test candidate only after it receives at least 100 impressions in 28 days, ranks between positions 4 and 20, and has CTR below 2%. Changes still require a separate review.

## Acceptance criteria for adding a page to core submission

- The page is indexable and canonical to itself.
- It has at least 3 realistic examples or task scenarios.
- It explains common failure modes or limitations.
- It links to a relevant workflow or at least 3 related tools.
- It is not a shallow translation of another page without local search intent.
