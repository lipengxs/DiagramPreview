# English Launch Posts

## Hacker News Show HN

### Title Options

- Show HN: DiagramPreview - preview and export AI-generated diagrams
- Show HN: A no-signup diagram preview toolbox for AI-generated docs
- Show HN: Paste Mermaid, PlantUML, OpenAPI, SQL, Docker Compose, Kubernetes, and export diagrams

### Post

I built DiagramPreview:

https://diagrampreview.com

The problem I kept running into: LLMs are good at generating Mermaid, PlantUML, architecture notes, OpenAPI flows, SQL schemas, Docker Compose snippets, and Kubernetes manifests, but they usually do not provide a reliable preview/export workflow.

DiagramPreview is meant to be the missing step between “AI generated some diagram text” and “this is ready for a README, design doc, PRD, or engineering proposal.”

Current tools include:

- Mermaid Preview
- PlantUML Preview
- Graphviz Preview
- D2 Preview
- Markdown Preview with Mermaid blocks
- AI Diagram Generator
- Text to Mermaid
- Mermaid AI Fixer
- OpenAPI to Sequence Diagram
- SQL to ER Diagram
- JSON / YAML / XML / CSV visualizers
- JSON Schema Visualizer
- Docker Compose Diagram
- Kubernetes Manifest Visualizer
- package.json Dependency Diagram
- Regex Railroad Diagram

It is browser-first and does not require an account. The core workflow is:

1. Paste generated or handwritten diagram/source text.
2. Preview it visually.
3. Fix syntax or structure issues.
4. Export SVG, PNG, or PDF when the renderer supports it.

I would love feedback from developers who write documentation, architecture notes, API specs, or AI-assisted technical docs.

## Dev.to / Hashnode

### Title

Previewing AI-generated Mermaid and PlantUML diagrams before adding them to docs

### Post

LLMs are now very good at generating Mermaid, PlantUML, OpenAPI flows, SQL schemas, Docker Compose snippets, and Kubernetes manifests.

But there is still a practical gap in the workflow:

- The model gives you diagram text.
- You still need to preview it.
- You often need to fix small syntax errors.
- You need SVG/PNG/PDF export before adding it to a README, design doc, or proposal.

I built DiagramPreview to cover that missing step:

https://diagrampreview.com

The workflow is simple:

1. Ask an LLM to generate a Mermaid, PlantUML, or architecture diagram.
2. Paste the result into DiagramPreview.
3. Preview the rendered output.
4. Fix syntax issues if needed.
5. Export it for documentation.

It currently supports Mermaid, PlantUML, Graphviz, D2, Markdown with Mermaid, OpenAPI to sequence diagrams, SQL to ER diagrams, JSON/YAML/XML/CSV visualizers, JSON Schema, Docker Compose, Kubernetes manifests, package.json dependencies, and regex railroad diagrams.

The goal is not to replace AI. It is to make AI-generated diagram output easier to validate, edit, and ship into real documentation.

## Indie Hackers

### Title

I built a small diagram preview toolbox for AI-generated technical docs

### Post

I have been building DiagramPreview:

https://diagrampreview.com

The idea came from a repeated workflow: I ask an LLM to generate a Mermaid or PlantUML diagram, then I need another tool to preview it, fix syntax issues, and export it before using it in docs.

So I turned that middle step into a browser-first toolbox for developers. It supports Mermaid, PlantUML, Graphviz, D2, OpenAPI, SQL ER, JSON/YAML/XML/CSV visualizers, Docker Compose, Kubernetes, package.json dependency diagrams, and a few AI-assisted tools.

The positioning is: preview, fix, and export AI-generated diagrams.

I am still early and looking for feedback on which formats to support next. I am considering draw.io generation, PlantUML to draw.io, Grafana dashboard generation, Prometheus alert rules, DBML, Terraform, Protobuf, AsyncAPI, and GitHub Actions workflow diagrams.

## Medium

### Title

The missing preview step in AI-generated diagrams

### Post

AI has made it much easier to generate technical diagrams. A model can draft Mermaid flowcharts, PlantUML sequence diagrams, architecture notes, OpenAPI flows, SQL schema relationships, Docker Compose service maps, and Kubernetes summaries.

But AI-generated diagram text still needs a practical handoff step before it becomes usable documentation.

You need to preview it. You need to catch syntax errors. You need to export it as SVG, PNG, or PDF. Sometimes you need to turn it into an editable artifact that fits an existing documentation workflow.

That is the gap DiagramPreview is designed for:

https://diagrampreview.com

It is a browser-first toolbox for developers and technical writers who use AI-assisted documentation workflows. Paste the generated text, preview it visually, fix issues, and export a clean asset.

## Product Hunt

### Tagline

Preview, fix, and export AI-generated diagrams.

### First Comment

Hi Product Hunt,

I built DiagramPreview for a workflow I kept repeating: ask an AI tool to generate a Mermaid, PlantUML, architecture, OpenAPI, SQL, Docker Compose, or Kubernetes diagram, then find another tool to preview and export it.

DiagramPreview focuses on the missing middle step between AI-generated text and production-ready documentation:

- Paste diagram/source text
- Preview visually
- Fix syntax or structure issues
- Export SVG, PNG, or PDF

It is browser-first and does not require an account. I would love feedback from developers, technical writers, and teams using AI to write documentation.
