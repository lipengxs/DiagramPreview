# DiagramPreview VS Code MVP

Preview, convert, and review selected diagram source from VS Code.

## Commands

- `diagramPreview.previewSelection`: preview selected Mermaid, PlantUML, OpenAPI, JSON Schema, or related source in a VS Code Webview.
- `diagramPreview.openSelectionInWeb`: open the selected source in the DiagramPreview web Mermaid preview tool.
- `diagramPreview.convertMermaidToDrawio`: open the selected Mermaid source in the Mermaid to draw.io converter.
- `diagramPreview.convertPlantumlToDrawio`: open the selected PlantUML source in the PlantUML to draw.io converter.
- `diagramPreview.reviewDiagram`: ask for confirmation, then open the AI review workflow in the browser.
- `diagramPreview.openPluginProBeta`: open the enhanced plugin workflow beta page without sending selected source.

## Enhanced Workflow Beta

The current MVP stays free and local-first. The enhanced workflow being validated includes repo diagram scan, right-click AI Review, batch Mermaid / PlantUML conversion, draw.io / SVG export, and recent diagram history. Joining the beta does not upload source from VS Code.

## Privacy Boundary

- `Preview Selection` runs in VS Code and does not send selected source to DiagramPreview.
- Mermaid rendering in the MVP Webview loads Mermaid from a CDN. The selected source is rendered locally in the Webview.
- `Open Selection in Web` and conversion commands explicitly open `https://diagrampreview.com` with the selected source encoded in the URL.
- `Review Diagram with AI` shows a confirmation warning before opening the remote AI workflow.
- `Join Enhanced Plugin Workflow Beta` opens DiagramPreview without selected source and is only used to register product interest.
- The MVP has no account, sync, telemetry, or team features.

## Manual Test Checklist

- Select Mermaid in `.md` or `.mmd`, then run `DiagramPreview: Preview Selection`.
- Select PlantUML in `.puml`, then run `DiagramPreview: Preview Selection`.
- Select OpenAPI YAML in `.yaml`, then run `DiagramPreview: Open Selection in Web`.
- Select JSON Schema in `.json`, then run `DiagramPreview: Preview Selection`.
- Run both draw.io conversion commands and confirm the browser opens the matching DiagramPreview tool.
- Run `DiagramPreview: Review Diagram with AI` and confirm the privacy warning appears before opening the browser.
