# SEO operations baseline - 2026-09-05

## Current baseline

- Bing data through 2026-09-02: 3,508 impressions and 176 clicks in the latest 28 days, with 5.02% CTR.
- Google data through 2026-09-02: 243 impressions and 3 clicks in the exported three-month view.
- Google Coverage snapshot through 2026-08-28: 8 indexed, 96 not indexed, including 89 crawled but currently not indexed.
- The Bing Site Explorer URL export contained only its header, so it cannot be used as a zero-backlink or zero-index conclusion.

Generated report: `reports/seo/2026-09-02.md`.

## Deployment checklist

1. Deploy the 35-URL `sitemap-core.xml` allowlist.
2. Run `npm run seo:audit -- https://diagrampreview.com` after deployment.
3. Remove the three legacy sitemap submissions in Google Search Console and submit only `sitemap-core.xml`.
4. Export the detailed URL list for `Crawled - currently not indexed`; the available summary export is insufficient to classify all 89 URLs.
5. Classify the URLs using `docs/gsc-indexing-triage.md`.
6. Request indexing and submit IndexNow in the two documented batches.

## External authority work

Use the five workflow fixture guides as source material for GitHub, the VS Code Marketplace, and technical case studies. Publish only examples that demonstrate a real input, reviewed output, and failure mode. Track referring domains in GSC/Bing and aim for five relevant domains before expanding to directory submissions.

W2Solo, Medium, or similar posts should link to one specific workflow or tool rather than sending every post to the homepage. External publication and Search Console operations require an authenticated account and are intentionally performed after deployment.
