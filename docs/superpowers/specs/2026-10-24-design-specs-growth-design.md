# Design specification content rollout

## Approved direction

The user approved adding the proposed Figma Specs / design specification content and tools in stages. This iteration delivers stage 1 on DiagramPreview, using the existing blog, templates, Markdown preview, and source-link infrastructure. It does not publish or deploy the site.

## Stages

1. Content and reusable template (this iteration): English and Simplified Chinese Specs guide, Code Layers access/cost guide, and a practical Markdown design specification tutorial. Include official references, article cross-links, a downloadable localized Markdown template, and a link that loads the same template into the existing Markdown preview. Register in the blog and template library, and inherit the existing blog sitemap. Preserve the curated core sitemap.
2. Specification generator (future iteration): structured inputs for brand tokens, component states, responsive rules, and acceptance criteria; editable Markdown output using the stage 1 example as the initial contract.
3. Specification checks and diagram handoff (future iteration): transparent missing-section/rule checks and optional diagram examples. Prioritize based on search queries and template usage after stage 1 is deployed. No claim of Figma-native Mermaid support or automatic Figma import.

## Content design

- Target specific intents: Specs purpose/access/credits; Code Layers rollout/access/cost; downloadable design specification example.
- Keep factual claims tied to dated official references. Do not describe a paid-plan promotion as universally free. Avoid claiming current availability for every account.
- The template is an independent DiagramPreview example, not an official Figma format. Include purpose, non-goals, design tokens, button states, form feedback, responsive rules, accessibility, acceptance criteria, and unresolved decisions. Use ordinary Markdown in stage 1 to avoid unverified Mermaid compatibility assumptions.
- Full content exists in en and zh-CN. Other locale routes use English content under the existing noindex + English canonical policy. Do not generate placeholder translations or extend indexability.
- Add optional typed section links (internal article/tool, official external reference, static download) to the existing blog renderer. Keep article body, headings, and links server-rendered. Article-specific metadata must use its own image and only the two indexable blog language alternates.
- Use existing tracked tool links where applicable. Never send the Markdown template body in analytics; measure tool entry with slugs.
- A code-native SVG article illustration is sufficient; no raster generation needed.

## Implementation sequence

1. Add localized reusable template data and downloadable files; connect the template library.
2. Add the three article configurations and English/Chinese content with explicit references and example links.
3. Extend article section links, related-article navigation, and article metadata using existing components.
4. Validate types, production build, sitemap entries, canonical/hreflang, downloads, source-loading behavior, and desktop/mobile display. Check existing article/tool routes for regressions.

## Acceptance

- All six en/zh-CN articles appear in blog discovery and the blog sitemap, with working images and no missing translation keys.
- Each relevant article links to official sources and a next step; the template tutorial exposes the full sample, download, and preview link.
- Downloaded Markdown exactly matches the preview input for each supported content language.
- Unsupported blog locales remain noindex and canonicalize to English.
- The preview link loads the template into the existing editor and renders it without errors.
- npm run typecheck and npm run build pass. Browser verification covers a new guide, template handoff, and representative existing routes.
- No changes to user-owned traffic reports, no deployment or search-engine submission in this iteration.
