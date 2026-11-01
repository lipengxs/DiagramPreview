# Stage 3: specification checks and diagram handoff

The user asked to continue the approved staged rollout. Extend the existing generator; no separate tool, backend, AI service or dependency. Prior stage changes remain intact.

## Design

Use explicit, deterministic English/Chinese text rules rather than an AI judgment or a quality score. A button checks the current editable Markdown, not the form. Results show each rule, its detection criteria, the first matching original line and line number, or a concrete suggestion. Labels are “Text found — verify manually” and “No matching text — review”; they never imply the product works correctly. Ignore headings, fenced code and HTML comments. Matching is heuristic: different wording can be missed, negated or contradictory text can still match, and text cannot prove implementation behavior. Surface these limits next to the results.

Check loading plus feedback, failure plus recovery, empty data plus response, named token references, keyboard plus focus/order, numeric viewport constraints plus layout behavior, and a checklist item with an observable outcome. Separately flag common unresolved markers (TODO/TBD/to confirm/待确认/待补充), excluding headings. Every rule must describe its actual lexical criteria, and matches keep source line numbers. Repeated examples or keywords alone should not be presented as conformance. All results are informational, including unresolved-marker absence.

Results are a snapshot. Editing or regenerating the document invalidates the displayed results immediately and asks for another check. Form edits do not invalidate them until generation changes the output. Empty Markdown cannot be checked. Checks and evidence remain local; analytics only receives the tool slug when a check runs.

Provide one bilingual, editable Mermaid save-flow example in a collapsed optional section. It is explicitly independent sample content, never inferred from the user's spec. Link its current source to the existing Mermaid preview/export page in a new tab using the existing source-fragment helper. Do not inject it into the specification or overwrite edits. Empty diagrams hide the handoff; the UI explains the URL contains source and that SVG/PNG export does not imply native editable Figma support.

## Implementation plan

1. Add a pure checker with bilingual rules, source line evidence and one focused test covering positive/negative matches, ignored Markdown regions, unresolved content and both templates.
2. Add a small review component below the existing two-column generator, with localized result copy and diagram sample. Preserve all existing generation/edit/export behavior. Add the check event to the existing analytics allowlist.
3. Update generator SEO/FAQ and the template article's existing call to action to describe the checks honestly. Keep en/zh-CN indexing and English fallback unchanged.
4. Run core tests, typecheck, build, browser checks for current-source/stale-result semantics, keyboard controls, both languages, a narrow viewport and the Mermaid source handoff/render/export. Update the rollout log with actual results. No deployment or push.

## Acceptance

- Rules expose evidence and limitations, no scores or behavioral guarantees.
- Manual Markdown edits are the checked source; stale evidence is never shown as current.
- Both languages work; empty input and nonmatching syntax remain understandable.
- Diagram source stays independent and its current edits reach the existing exporter.
- No document text or matching evidence enters analytics.
- Existing stage 2 checks continue to pass.
