export type BlogSlug =
  | "mermaid-preview-guide"
  | "plantuml-online-preview-workflow"
  | "markdown-mermaid-documentation"
  | "graphviz-dot-dependency-graphs"
  | "json-yaml-diagram-visualization"
  | "drawio-file-preview-guide"
  | "chatgpt-mermaid-preview-workflow"
  | "mermaid-vs-plantuml-technical-docs"
  | "plantuml-to-drawio-editable-diagram"
  | "ai-drawio-diagram-generator-guide"
  | "kubernetes-manifest-visualization-guide"
  | "docker-compose-architecture-diagram-guide"
  | "ai-grafana-dashboard-json-guide"
  | "prometheus-alert-rules-api-latency-error-rate"
  | "openapi-to-sequence-diagram-guide"
  | "sql-to-er-diagram-online-guide"
  | "json-schema-visualizer-api-payloads"
  | "cron-expression-visualizer-guide";

export type BlogPostConfig = {
  slug: BlogSlug;
  image: string;
  date: string;
  tools: string[];
};

export const blogPosts: BlogPostConfig[] = [
  {
    slug: "mermaid-preview-guide",
    image: "/blog/mermaid-preview-guide.png",
    date: "2026-06-06",
    tools: ["mermaid-preview", "sequence-diagram-preview"]
  },
  {
    slug: "plantuml-online-preview-workflow",
    image: "/blog/plantuml-online-preview-workflow.png",
    date: "2026-06-06",
    tools: ["plantuml-preview"]
  },
  {
    slug: "markdown-mermaid-documentation",
    image: "/blog/markdown-mermaid-documentation.png",
    date: "2026-06-06",
    tools: ["markdown-preview", "mermaid-preview"]
  },
  {
    slug: "graphviz-dot-dependency-graphs",
    image: "/blog/graphviz-dot-dependency-graphs.png",
    date: "2026-06-06",
    tools: ["graphviz-preview"]
  },
  {
    slug: "json-yaml-diagram-visualization",
    image: "/blog/json-yaml-diagram-visualization.png",
    date: "2026-06-06",
    tools: ["json-to-diagram", "yaml-to-diagram"]
  },
  {
    slug: "drawio-file-preview-guide",
    image: "/blog/drawio-file-preview-guide.png",
    date: "2026-06-06",
    tools: ["drawio-preview"]
  },
  {
    slug: "chatgpt-mermaid-preview-workflow",
    image: "/blog/chatgpt-mermaid-preview-workflow.png",
    date: "2026-06-12",
    tools: ["mermaid-preview", "mermaid-ai-fixer", "text-to-mermaid"]
  },
  {
    slug: "mermaid-vs-plantuml-technical-docs",
    image: "/blog/mermaid-vs-plantuml-technical-docs.png",
    date: "2026-06-12",
    tools: ["mermaid-preview", "plantuml-preview", "ai-plantuml-generator"]
  },
  {
    slug: "plantuml-to-drawio-editable-diagram",
    image: "/blog/plantuml-to-drawio-editable-diagram.png",
    date: "2026-06-12",
    tools: ["plantuml-to-drawio", "drawio-preview", "drawio-to-svg"]
  },
  {
    slug: "ai-drawio-diagram-generator-guide",
    image: "/blog/ai-drawio-diagram-generator-guide.png",
    date: "2026-06-12",
    tools: ["ai-drawio-generator", "drawio-preview", "drawio-to-svg"]
  },
  {
    slug: "kubernetes-manifest-visualization-guide",
    image: "/blog/kubernetes-manifest-visualization-guide.png",
    date: "2026-06-12",
    tools: ["kubernetes-manifest-visualizer", "kubernetes-service-topology-diagram"]
  },
  {
    slug: "docker-compose-architecture-diagram-guide",
    image: "/blog/docker-compose-architecture-diagram-guide.png",
    date: "2026-06-12",
    tools: ["docker-compose-diagram", "nginx-config-visualizer"]
  },
  {
    slug: "ai-grafana-dashboard-json-guide",
    image: "/blog/ai-grafana-dashboard-json-guide.png",
    date: "2026-06-12",
    tools: ["grafana-dashboard-generator", "observability-pack-generator"]
  },
  {
    slug: "prometheus-alert-rules-api-latency-error-rate",
    image: "/blog/prometheus-alert-rules-api-latency-error-rate.png",
    date: "2026-06-12",
    tools: ["prometheus-alert-rule-generator", "observability-pack-generator"]
  },
  {
    slug: "openapi-to-sequence-diagram-guide",
    image: "/blog/openapi-to-sequence-diagram-guide.png",
    date: "2026-06-12",
    tools: ["openapi-to-sequence", "api-error-flow-diagram"]
  },
  {
    slug: "sql-to-er-diagram-online-guide",
    image: "/blog/sql-to-er-diagram-online-guide.png",
    date: "2026-06-12",
    tools: ["sql-to-er-diagram", "dbml-to-er-diagram", "prisma-schema-diagram"]
  },
  {
    slug: "json-schema-visualizer-api-payloads",
    image: "/blog/json-schema-visualizer-api-payloads.png",
    date: "2026-06-12",
    tools: ["json-schema-visualizer", "json-to-diagram", "yaml-to-diagram"]
  },
  {
    slug: "cron-expression-visualizer-guide",
    image: "/blog/cron-expression-visualizer-guide.png",
    date: "2026-06-12",
    tools: ["cron-expression-visualizer", "github-actions-workflow-diagram"]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
