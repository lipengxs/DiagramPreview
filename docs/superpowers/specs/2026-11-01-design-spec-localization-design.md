# Design specification localization

User requests multilingual support and correct indexing without disrupting access. They have authorized this extension of the existing staged implementation.

## Scope and decisions

Support the existing ten routes: en, zh-CN, zh-TW, pt, es, de, fr, ru, ja, ko. Localize generator controls, errors, FAQ/SEO, sample Markdown and downloads, reviewer explanations/suggestions, Mermaid labels and all three design-spec blog articles. Keep existing English/Chinese facts and dated Figma availability/cost caveats. New localized articles may be concise but must cover access, rollout, paid promotion dates, usage limits and independent-template boundaries. Do not translate unrelated site content.

Extend the local checker with explicit keyword groups for each language. Select the document language from the page locale while also recognizing existing English/Simplified-Chinese rules; show actual lexical criteria and current-source line evidence. Preserve warnings about false matches, missing wording, negation and implementation validation. Use a shared unresolved marker in generated blank sections (TODO plus localized explanation) and recognize each language's usual unresolved terms. Test every localized sample and suggestion against its intended rule.

Use typed JSON bundles and server-provided locale data so a visitor receives the selected generator language, not every translated template. Reuse the existing eight-section draft/Markdown roundtrip, manual-edit protection and Mermaid handoff. Language navigation loads the destination language’s example. If form, Markdown or diagram content has changed, ask before switching so edits are never silently discarded. Cancelling preserves the current page. Reuse the existing locale switcher with a cancelable before-locale-change event and an in-page confirmation (native confirm dialogs vary across embedded browsers); no persistence or automatic translation of user input.

Explicit pageLocales becomes authoritative in metadata instead of intersecting the global default locale allowlist. Apply all ten locales only to the generator and these three complete articles; retain default indexing of every other page, merged article policies and all existing URLs. Keep robots follow=true, self canonicals, reciprocal hreflang and x-default for all ten translated pages. Include those pages in main/tool/blog sitemaps without widening unrelated pages' eligibility. noindex is an indexing directive, never an HTTP access control.

## Implementation and acceptance

1. Extract locale data and pure generator helpers; add eight locale bundles, localized static downloads and article JSON. Adapt the checker to localized patterns and copy.
2. Wire selected-locale data from the server into the existing UI, localize template/article buttons, metadata and discovery.
3. Update per-page sitemap/metadata eligibility with regression tests proving unrelated locales remain unchanged.
4. Validate all ten bundle shapes, template/download byte parity, generated roundtrips, localized checker positive/negative examples and empty decisions. Run typecheck, build, core tests and content audit.
5. HTTP-check 40 pages for 200 responses, lang, canonical, robots and hreflang; inspect sitemaps for duplicates and expected entries. Browser-check representative Western/CJK languages, manual edits and language navigation, existing handoff, and narrow layout. No deployment or push.
