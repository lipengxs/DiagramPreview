# Open draw.io file workflow fixture

## Before

Open `input.drawio` with [Draw.io Preview](https://diagrampreview.com/en/drawio-preview). The file intentionally contains a second draft page so the review includes page names and hidden handoff risk.

## Expected result

The preview should report two pages and expose the `Draft Notes` page before the file is shared. The publishable result should either remove that page or rename it and add reviewed content.

## Failure cases

- Incomplete `mxfile` or `mxGraphModel` XML.
- Default or misleading page names.
- Draft pages, off-canvas objects, or sensitive labels left in the file.
- External image URLs that fail outside the author's workspace.

## README handoff

Keep `architecture.drawio` as the editable source and export `architecture.svg` for the README. Update the draw.io source first, then regenerate the published asset.

Next tools: [Draw.io to SVG](https://diagrampreview.com/en/drawio-to-svg), [Mermaid to draw.io](https://diagrampreview.com/en/mermaid-to-drawio), and [PlantUML to draw.io](https://diagrampreview.com/en/plantuml-to-drawio).
