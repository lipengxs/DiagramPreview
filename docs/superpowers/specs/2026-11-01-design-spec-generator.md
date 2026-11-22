# Stage 2: design specification generator

The user requested continuing the approved staged rollout. Implement the generator described in `docs/marketing/design-specs-rollout.md`; stage 3 checks remain deferred.

## Design and implementation plan

1. Reuse the existing English/Chinese workspace settings Markdown template to initialize fields: document title, purpose, tokens, components/states, interaction/data, responsive layout, accessibility, acceptance checklist, unresolved decisions. Section fields accept Markdown. A small pure helper splits only the known template structure and assembles the output; it is not a general Markdown parser.
2. Add `/[locale]/design-spec-generator` with a native form, explicit Generate action, editable Markdown, sanitized live preview, copy, download, and handoff to the existing Markdown preview in a new tab. Preserve manual output edits until explicit regeneration confirmation; copy/download/handoff always use the current edited output. Empty sections say “To confirm” in the content language. No model service, credentials, new dependency, or backend.
3. Provide complete English and Simplified Chinese copy; other locales use English fallback and noindex/canonical English. Register the tool in discovery/navigation and restrict sitemap inclusion to its translated locales using optional per-tool locale eligibility. Reuse existing SEO metadata helpers. Add links from the prior three articles and the template library.
4. Sanitize edited Markdown with the already-installed DOMPurify before displaying HTML. Disable embedded media in this preview to avoid background network requests from pasted markup. Use platform clipboard and existing text-download helper; show copy errors and disable empty exports. Do not send field or document contents to analytics. Track generation, copy, downloads and preview handoff using slugs/status only.
5. Add one focused runnable generator test for template roundtrip, edited inputs, and empty-section behavior. Validate types, production build, metadata/sitemaps, English/Chinese browser interactions, manual-edit preservation, edited export parity, malicious HTML sanitization, and a narrow viewport. Preserve user changes; no deployment.

## Acceptance

- Existing sample roundtrips without changing its rules or wording.
- Form edits take effect on Generate; output edits remain the source of copy/download/preview.
- Regenerating changed output requires an explicit in-page confirmation and supports cancel.
- English and Chinese UI and generated section headings are complete; English fallback pages are not indexed.
- Tool appears in tool discovery, relevant articles and template library, with only en/zh-CN sitemap entries.
- Empty inputs remain unresolved rather than fabricating product behavior; preview does not execute raw HTML or load embedded images.
- Typecheck/build and focused tests pass; browser checks cover the full handoff.
