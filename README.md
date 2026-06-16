# DiagramPreview

DiagramPreview is a global developer toolbox for previewing, fixing, converting, and exporting diagram source text. It is built for AI-assisted documentation workflows where large language models can generate Mermaid, PlantUML, draw.io XML, Grafana dashboards, Prometheus rules, OpenAPI flows, SQL schemas, Kubernetes manifests, and other structured text, but usually do not provide a reliable visual preview or export workflow.

## What It Does

- Preview Mermaid, PlantUML, Graphviz, D2, Markdown with Mermaid, and draw.io XML.
- Generate AI diagrams with DeepSeek, plus a local template fallback when the provider is unavailable.
- Convert PlantUML and Mermaid into editable draw.io / diagrams.net XML.
- Generate Grafana dashboard JSON and Prometheus alert rule YAML.
- Visualize OpenAPI, SQL, Docker Compose, Kubernetes, Terraform, GitHub Actions, Dockerfile, Helm values, Nginx, OpenTelemetry traces, logs, JSON, YAML, XML, CSV, JSON Schema, GraphQL, Protobuf, AsyncAPI, DBML, Prisma, package.json, regex, mind maps, and sequence diagrams.
- Export supported previews as SVG, PNG, PDF, or downloadable source files such as `.drawio`, `.json`, and `.yaml`.

## Tool Categories

Header navigation is organized into short, direct menu groups:

- `AI`: AI Diagram, AI Draw.io, Text to Mermaid, Mermaid Fixer, Architecture Diagram, AI PlantUML.
- `Preview`: Mermaid, PlantUML, Markdown, Graphviz, D2, Sequence, Mind Map.
- `Draw.io`: PlantUML to Draw.io, Mermaid to Draw.io, Draw.io to SVG, Draw.io Preview.
- `DevOps`: Grafana, Prometheus, Docker Compose, Kubernetes, Terraform, GitHub Actions, Dockerfile, Helm, Nginx, OpenTelemetry, Log to Sequence.
- `Data`: SQL ER, JSON Schema, JSON, YAML, XML, CSV, GraphQL, Protobuf, AsyncAPI, DBML, Prisma.
- `Code`: OpenAPI Sequence, package.json Dependencies, Regex Railroad.

## Tech Stack

- Next.js 15 App Router
- React 19
- next-intl with locale-prefixed routes
- Tailwind CSS
- Mermaid, PlantUML encoder, Viz.js, js-yaml, marked
- DeepSeek server-side AI provider

## Local Development

```bash
npm install
npm run dev -- -p 3002
```

Open:

```text
http://localhost:3002/zh-CN
http://localhost:3002/en
```

Ports `3000` and `3001` are intentionally kept free during local development in this workspace.

## Environment Variables

Copy `.env.example` to `.env.local` and configure provider keys as needed:

```bash
cp .env.example .env.local
```

AI generation uses DeepSeek:

```env
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/chat/completions
```

SEO and IndexNow:

```env
SITE_URL=https://diagrampreview.com
INDEXNOW_KEY=ff1111e644870356fea144c36ac4ee7d
INDEXNOW_ENDPOINT=https://www.bing.com/indexnow
```

## Scripts

```bash
npm run dev -- -p 3002
npm run typecheck
npm run build
npm run start
npm run indexnow -- --dry-run https://diagrampreview.com/en/mermaid-preview
```

## Internationalization

Supported locales:

```text
en, zh-CN, zh-TW, pt, es, de, fr, ru, ja, ko
```

All tool pages are locale-prefixed for SEO, for example:

```text
/en/mermaid-preview
/zh-CN/ai-drawio-generator
/ja/grafana-dashboard-generator
```

## SEO

The project includes:

- `src/app/sitemap.ts`
- `src/app/robots.ts`
- Bing verification meta
- Yandex verification meta
- Google Analytics tag
- IndexNow key file and submission script

## Marketing Materials

Launch and posting materials are in:

```text
docs/marketing/
```

Recommended ready-to-publish posts with screenshots:

```text
docs/marketing/recommended-posts.md
```

Screenshot assets:

```text
docs/marketing/images/
```

## Validation

Before shipping changes:

```bash
npm run typecheck
npm run build
```

For frontend changes, also verify representative routes in the browser:

```text
/zh-CN/ai-drawio-generator
/zh-CN/mermaid-preview
/zh-CN/grafana-dashboard-generator
/zh-CN/prometheus-alert-rule-generator
/sitemap.xml
```
