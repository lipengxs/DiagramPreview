# Workspace settings — design specification

> Independent DiagramPreview example. Adapt the rules to your product; this is not an official Figma template or import format.

## Purpose and scope
Let a workspace owner update the workspace name and notification preference.
Non-goals: billing, team invitations, and permission management.
Use synthetic preview data; do not connect a production backend for this example.

## Design tokens
- Primary action: #1D4ED8 with white text.
- Body text: #0F172A on #FFFFFF.
- Muted text: #475569; error text: #B91C1C.
- Typeface: system-ui; body 16px / 24px; heading 24px / 32px.
- Spacing scale: 4, 8, 12, 16, 24, 32px. Card radius: 8px.
- Use named tokens instead of adding arbitrary colors or spacing.

## Components and states
### Save button
- Default: label “Save changes”; primary background.
- Hover: use #1E40AF; retain readable white text.
- Focus: visible 2px outline with 2px offset.
- Disabled: when unchanged or invalid; explain field errors beside inputs.
- Loading: label “Saving…”; prevent duplicate submissions.
- Success: announce “Changes saved” in a live region.
- Error: show an inline message and allow retry; preserve edited values.

### Workspace name
- Required, 2–60 characters after trimming surrounding whitespace.
- Persistent visible label and helper text; placeholder is not a label.
- Validate on blur and before saving; associate errors with the input.
- No changes are persisted when validation fails.

## Interaction and data
1. Load the current name and notification preference.
2. Allow editing; enable Save only for valid changed values.
3. On submit, show the loading state while a simulated request runs.
4. On success, keep the confirmed values and announce completion.
5. On failure, retain the draft and offer retry.
- Initial loading: show a labeled loading placeholder.
- Initial request failure: show a retry action; do not fabricate saved data.
- Empty name from the server: show the required-field message before saving.

## Responsive layout
- Below 768px: one column, 16px page padding, full-width save button.
- At 768px and above: centered form, maximum width 640px, 24px padding.
- At 320px viewport width: no horizontal page scrolling.

## Accessibility
- Every input has a programmatic label; tab order follows visual order.
- All interactive elements work by keyboard and have visible focus.
- Error and success states use text, not color alone.
- Verify normal text contrast at least 4.5:1 against its actual background.

## Acceptance checklist
- [ ] Blank or whitespace-only names cannot be submitted.
- [ ] Names outside 2–60 characters show a specific error.
- [ ] Repeated clicks during saving produce only one request.
- [ ] A failed save preserves edits and supports retry.
- [ ] A successful save announces completion without moving focus.
- [ ] Keyboard and 320px mobile checks pass.
- [ ] Every implemented state matches this specification.

## Decisions before production
- Confirm the real endpoint, authorization rules, and error responses with engineering.
- Confirm notification behavior and final copy with the product owner.
- Replace simulated requests only after the data contract is approved.
