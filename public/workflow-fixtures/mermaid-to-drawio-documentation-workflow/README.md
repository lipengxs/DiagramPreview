# Mermaid to draw.io documentation fixture

## Before

Render `input.mmd` in [Mermaid Preview](https://diagrampreview.com/en/mermaid-preview). Confirm labels and direction before opening it in [Mermaid to draw.io](https://diagrampreview.com/en/mermaid-to-drawio).

## Expected result

The draw.io file should preserve the five nodes and four directed relationships. Visual spacing may differ from Mermaid, so inspect the XML in [Draw.io Preview](https://diagrampreview.com/en/drawio-preview) before handoff.

## Failure cases

- Converting Mermaid that does not render successfully first.
- Expecting exact layout parity for unsupported Mermaid features.
- Mixing several diagram types in one conversion.
- Discarding the Mermaid source after creating draw.io XML.

## README handoff

Use Mermaid as the source of record while the flow remains code-owned. Include the `.drawio` file when product or design reviewers need visual editing, and export an SVG for static documentation.
