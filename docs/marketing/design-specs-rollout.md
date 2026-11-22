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
- Template sources now live in `src/messages/design-specs/{locale}.json` and are exposed by `src/config/design-spec-template.ts`. Keep all `public/templates/design-specs/workspace-settings.{locale}.md` files byte-for-byte identical to their corresponding source strings.
- Other blog locales use English fallback content and remain noindex with an English canonical.

### Validation completed

- `npm run typecheck`, `npm run build`, and the existing core-content audit passed.
- Exact template/download equality, source URL round trips, article assets, and internal link targets checked.
- HTTP verification of six en/zh-CN articles and three German fallback articles, plus blog and template discovery, download endpoints, existing routes, and both main/blog sitemaps passed.
- Browser checks confirmed Chinese and English template loading/rendering, enabled Copy HTML after rendering, and a 390px article layout without horizontal overflow.
- Representative existing AI Draw.io, Mermaid, Grafana, and Prometheus routes were checked in the browser.

## Stage 2 — implemented locally, 2026-11-01

Available at `/en/design-spec-generator` and `/zh-CN/design-spec-generator`. The stage 1 workspace settings template initializes a title and eight editable sections. Users generate Markdown explicitly, then edit, preview, copy, download, or open the current source in the existing Markdown tool in a new tab. No AI provider or new dependency is required.

Manual Markdown edits are preserved until explicit regeneration confirmation; cancel keeps them intact. Empty sections remain unresolved. The generator preview sanitizes HTML and removes embedded media. The shared Markdown renderer also sanitizes raw HTML before adding rendered Mermaid SVG, so the handoff does not reintroduce raw HTML event handlers.

The tool is registered in navigation/search/tool discovery, the three related articles, and the template library. Only en/zh-CN appear in the main and tool sitemaps; other locale routes fall back to English and remain noindex. No deployment or search-engine submission was performed.

Validation: typecheck and production build passed; all 41 core tests passed, including the new template roundtrip/edit/empty-input check. Browser checks covered both languages, explicit generation, manual-edit cancel/confirm, exact clipboard and downloaded content, empty-output controls, source-link parity and new-tab handoff, unsafe HTML removal, Mermaid regression, and 390px/1280px layouts. HTTP checks covered four locale routes, canonical/hreflang, both sitemaps, and article/template/tool discovery.

Acceptance: input changes appear in the output; incomplete decisions remain explicitly unresolved; download and preview contain the same source; English and Chinese instructions are complete; generated output uses existing source-link and analytics conventions.

## Stage 3 — implemented locally, 2026-11-01

The existing generator now checks its current editable Markdown for loading/error/empty states, named token references, keyboard/focus text, numeric responsive constraints and observable checkbox items. Each rule exposes its lexical criteria and first matching original line/line number, or a concrete suggestion. A separate item flags common unresolved markers. Headings, conventional code blocks and HTML comments are excluded. Matching is a review aid: negation, contradictions, alternate wording and complex Markdown require manual review; no quality score or implementation guarantee is offered.

Editing or regenerating output hides stale results until another explicit check. Form-only edits and cancelled regeneration preserve the current report. The optional independent bilingual Mermaid save-flow example is editable and passes its current source to the existing Mermaid preview for SVG/PNG export. It does not alter or claim to derive from the specification. English/Chinese SEO, FAQ and the template article explain the feature. Analytics receives tool slugs only.

Validation: all 42 core tests, typecheck, production build, core-content audit and diff whitespace checks passed. Browser checks covered both languages, exact source line evidence, missing-token suggestions, unresolved markers, current manual output, stale results, form isolation, cancelled/confirmed regeneration, keyboard activation, empty inputs and exact clipboard content. Edited diagram source reached the Mermaid tool intact, rendered successfully and produced SVG/PNG downloads. Narrow-screen layout and canonical/noindex/sitemap policies were checked. No deployment or search-engine submission was performed.

Acceptance: report rule evidence and limitations, never claim validation of production behavior from text alone, and do not describe exported images as native editable Figma diagrams.

## Multilingual extension — 2026-11-01

The generator, its sample specification/download, checker explanations and suggestions, independent Mermaid example, SEO/FAQ, and three related blog articles are localized for all existing site languages: en, zh-CN, zh-TW, pt, es, de, fr, ru, ja and ko. The new article editions are concise localized guides retaining the dated Figma access, rollout and credit boundaries. English and Simplified Chinese articles retain their original coverage.

- Locale bundles: `src/messages/design-specs/{locale}.json`; article text: `src/messages/blog-design-specs/{locale}.json`. Bundle shape is checked by TypeScript. Only the current generator bundle is passed to the client; templates for other languages are not included in its JavaScript chunks.
- The checker supports the page language plus the existing English/Simplified-Chinese patterns. Local keyword groups are visible in results. It still performs textual hints rather than semantic or product validation. Generated blank sections have localized unresolved wording; new languages include TODO so the omission remains detectable.
- The global `indexableLocales` policy is unchanged. Explicit `pageLocales` is authoritative only where provided. The generator and these three articles now have ten-language self canonicals, reciprocal hreflang and `index, follow`, and are included in the main/tool/blog sitemaps. Other pages retain their existing eligibility. No route is blocked by noindex; it is an indexing hint, not access control. No robots.txt restrictions were added.
- Changing languages loads the destination example. A cancelable event from the existing locale switcher lets the generator show an in-page confirmation if form, Markdown or diagram edits would be lost. Cancel preserves all work; confirming loads the selected language. Reload/close also uses the browser’s unsaved-work guard. User text is never translated automatically or sent to analytics.

Validation: 42 core tests, typecheck, production build and content audit passed. All ten samples roundtrip with eight sections and exact download parity; every localized rule suggestion and all six applicable sample rule matches pass, while the intentionally unnamed tokens remain a visible gap. HTTP checks passed for all 40 pages: 200 responses, locale, single H1, index/follow, self canonical and eleven alternates including x-default. All three sitemaps have the expected localized entries without duplicates; ten download routes match the source bytes. Unrelated Japanese/German tool and French blog access/indexing regressions passed. Browser verification passed for German, Japanese and Traditional Chinese UI and localized rule evidence; current-source invalidation, exact Traditional Chinese clipboard/download, form and diagram edit protection with cancel/confirm, localized article/template discovery and Japanese Mermaid rendering/source parity were exercised. Mobile 390px and desktop 1280px layouts had no horizontal page overflow. The original SEO submission audit also passed for all 39 core pages and 199 hreflang targets. Screenshot: `docs/marketing/images/design-spec-multilingual.jpg`. No deployment or external submission.

## Measurement after deployment

- In Search Console, compare query impressions/clicks for the three article paths; examine actual access, pricing, and template queries before adding more articles.
- Track `tool_entry_click` with `entry_surface=blog:design-spec-markdown-template` or `template:workspace-design-spec`, then inspect Markdown preview usage. See `docs/analytics-events.md`.
- Static download clicks are not currently a custom analytics event. Do not report completed downloads or conversion rates without instrumentation.
- Use repeated template usage and concrete search queries to choose the next generator inputs and checker rules; no traffic-growth forecast is implied.
