# Design specification content rollout

## Stage 1 — implemented locally, 2026-10-24

Three complete English / Simplified Chinese articles:

- `/en/blog/figma-specs-guide` and `/zh-CN/blog/figma-specs-guide`: access, Markdown support, credits, and specification workflow.
- `/en/blog/figma-code-layers-guide` and `/zh-CN/blog/figma-code-layers-guide`: beta access, missing entry, dated promotional terms, and prototype review.
- `/en/blog/design-spec-markdown-template` and `/zh-CN/blog/design-spec-markdown-template`: full example, download, preview handoff, and review instructions.

The `workspace-design-spec` template is also discoverable in `/en/templates#documentation` and its localized routes. Blog content is indexed only for en and zh-CN, following the existing policy. The curated core sitemap and external submission targets are unchanged. The site has not been deployed or submitted to search engines in this iteration.

### Source and maintenance

- Official facts were checked on 2026-10-24 against https://help.figma.com/hc/en-us/articles/43663368947863-What-s-new-from-Config-India-2026 .
- Recheck Code Layers pricing after the documented paid-plan promotion ends on November 4, 2026. This is an editorial follow-up, not a scheduled automation.
- Article copy: `src/messages/blog-design-specs/{en,zh-CN}.json`.
- Template source: `src/config/design-spec-template.ts`. Keep `public/templates/design-specs/workspace-settings.{en,zh-CN}.md` byte-for-byte identical to the corresponding source strings when editing.
- Other blog locales use English fallback content and remain noindex with an English canonical.

### Validation completed

- `npm run typecheck`, `npm run build`, and the existing core-content audit passed.
- Exact template/download equality, source URL round trips, article assets, and internal link targets checked.
- HTTP verification of six en/zh-CN articles and three German fallback articles, plus blog and template discovery, download endpoints, existing routes, and both main/blog sitemaps passed.
- Browser checks confirmed Chinese and English template loading/rendering, enabled Copy HTML after rendering, and a 390px article layout without horizontal overflow.
- Representative existing AI Draw.io, Mermaid, Grafana, and Prometheus routes were checked in the browser.

## Stage 2 — specification generator, not implemented

Use the stage 1 template as the initial output contract. Start with workspace settings / SaaS UI, collect product purpose, brand tokens, component states, responsive rules, and acceptance criteria. Generate editable Markdown, with preview, copy, and download. Keep generation deterministic initially; do not require an AI provider for filling a structured template.

Acceptance: input changes appear in the output; incomplete decisions remain explicitly unresolved; download and preview contain the same source; English and Chinese instructions are complete; generated output uses existing source-link and analytics conventions.

## Stage 3 — specification checks and diagram handoff, not implemented

Check for missing behavior and review requirements using explicit rules: loading/error/empty states, named token usage, keyboard operation, responsive constraints, and observable acceptance criteria. Show missing sections and the reason for each check rather than an unsupported quality score. Add optional Mermaid examples and SVG/PNG handoff using existing preview tools only where a diagram helps explain the flow.

Acceptance: report rule evidence and limitations, never claim validation of production behavior from text alone, and do not describe exported images as native editable Figma diagrams.

## Measurement after deployment

- In Search Console, compare query impressions/clicks for the three article paths; examine actual access, pricing, and template queries before adding more articles.
- Track `tool_entry_click` with `entry_surface=blog:design-spec-markdown-template` or `template:workspace-design-spec`, then inspect Markdown preview usage. See `docs/analytics-events.md`.
- Static download clicks are not currently a custom analytics event. Do not report completed downloads or conversion rates without instrumentation.
- Use repeated template usage and concrete search queries to choose the next generator inputs and checker rules; no traffic-growth forecast is implied.
