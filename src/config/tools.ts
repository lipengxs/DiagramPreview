import {
  Braces,
  Boxes,
  Code2,
  Database,
  FileCode2,
  FileJson,
  FileText,
  GitBranch,
  GitFork,
  KeyRound,
  Network,
  Sparkles,
  Route,
  Timer,
  Workflow
} from "lucide-react";

export type ToolSlug =
  | "mermaid-preview"
  | "plantuml-preview"
  | "markdown-preview"
  | "graphviz-preview"
  | "d2-preview"
  | "drawio-preview"
  | "mind-map-preview"
  | "sequence-diagram-preview"
  | "json-to-diagram"
  | "yaml-to-diagram"
  | "ai-diagram-generator"
  | "text-to-mermaid"
  | "mermaid-ai-fixer"
  | "openapi-to-sequence"
  | "sql-to-er-diagram"
  | "json-schema-visualizer"
  | "ai-plantuml-generator"
  | "architecture-diagram-generator"
  | "ai-drawio-generator"
  | "grafana-dashboard-generator"
  | "prometheus-alert-rule-generator"
  | "xml-to-diagram"
  | "csv-to-diagram"
  | "docker-compose-diagram"
  | "kubernetes-manifest-visualizer"
  | "package-json-dependency-diagram"
  | "regex-railroad-diagram"
  | "plantuml-to-drawio"
  | "mermaid-to-drawio"
  | "drawio-to-svg"
  | "terraform-architecture-diagram"
  | "github-actions-workflow-diagram"
  | "dockerfile-visualizer"
  | "helm-values-visualizer"
  | "nginx-config-visualizer"
  | "opentelemetry-trace-sequence"
  | "log-to-sequence-diagram"
  | "graphql-schema-visualizer"
  | "protobuf-schema-visualizer"
  | "asyncapi-event-flow-diagram"
  | "dbml-to-er-diagram"
  | "prisma-schema-diagram"
  | "cron-expression-visualizer"
  | "jwt-decoder-diagram"
  | "api-error-flow-diagram"
  | "kubernetes-service-topology-diagram"
  | "ci-cd-pipeline-generator"
  | "observability-pack-generator";

export type ToolCategory = "preview" | "converter" | "developer" | "data";

export type ToolNavGroup = "preview-tools" | "converters" | "developer-diagrams" | "data-visualizers" | "ai-diagram";

export type ToolConfig = {
  slug: ToolSlug;
  category: ToolCategory;
  navGroup: ToolNavGroup;
  icon: typeof Code2;
  popular?: boolean;
  recentlyAdded?: boolean;
  priority: number;
  implemented: boolean;
  renderer:
    | "mermaid"
    | "plantuml"
    | "markdown"
    | "graphviz"
    | "d2"
    | "drawio"
    | "mindmap"
    | "json"
    | "yaml"
    | "openapi"
    | "sql"
    | "json-schema"
    | "xml"
    | "csv"
    | "docker-compose"
    | "kubernetes"
    | "package-json"
    | "regex"
    | "plantuml-to-drawio"
    | "mermaid-to-drawio"
    | "drawio-svg"
    | "terraform"
    | "github-actions"
    | "dockerfile"
    | "helm-values"
    | "nginx"
    | "otel-trace"
    | "log-sequence"
    | "graphql"
    | "protobuf"
    | "asyncapi"
    | "dbml"
    | "prisma"
    | "cron"
    | "jwt"
    | "api-error-flow"
    | "kubernetes-topology"
    | "cicd-pipeline"
    | "ai";
  sampleKeys: string[];
};

export const tools: ToolConfig[] = [
  {
    slug: "ai-diagram-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 98,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["system", "api", "product"]
  },
  {
    slug: "text-to-mermaid",
    category: "converter",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 96,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["requirements", "incident", "architecture"]
  },
  {
    slug: "mermaid-ai-fixer",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    recentlyAdded: true,
    priority: 94,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["brokenFlow", "brokenSequence", "brokenState"]
  },
  {
    slug: "architecture-diagram-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Boxes,
    popular: true,
    recentlyAdded: true,
    priority: 92,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["saas", "eventDriven", "edge"]
  },
  {
    slug: "ai-plantuml-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Route,
    recentlyAdded: true,
    priority: 88,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["sequence", "component", "activity"]
  },
  {
    slug: "ai-drawio-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 86,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["microservices", "cicd", "dataFlow"]
  },
  {
    slug: "grafana-dashboard-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 84,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["api", "nodeExporter", "loki"]
  },
  {
    slug: "prometheus-alert-rule-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 83,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["api", "infrastructure", "kubernetes"]
  },
  {
    slug: "observability-pack-generator",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Sparkles,
    popular: true,
    recentlyAdded: true,
    priority: 82,
    implemented: true,
    renderer: "ai",
    sampleKeys: ["api", "kubernetes", "worker"]
  },
  {
    slug: "openapi-to-sequence",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Workflow,
    popular: true,
    recentlyAdded: true,
    priority: 78,
    implemented: true,
    renderer: "openapi",
    sampleKeys: ["petstore", "auth", "orders"]
  },
  {
    slug: "api-error-flow-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Workflow,
    popular: true,
    recentlyAdded: true,
    priority: 79,
    implemented: true,
    renderer: "api-error-flow",
    sampleKeys: ["checkout", "auth", "rateLimit"]
  },
  {
    slug: "plantuml-to-drawio",
    category: "developer",
    navGroup: "converters",
    icon: Route,
    popular: true,
    recentlyAdded: true,
    priority: 77,
    implemented: true,
    renderer: "plantuml-to-drawio",
    sampleKeys: ["sequence", "component", "class"]
  },
  {
    slug: "sql-to-er-diagram",
    category: "data",
    navGroup: "data-visualizers",
    icon: Database,
    popular: true,
    recentlyAdded: true,
    priority: 76,
    implemented: true,
    renderer: "sql",
    sampleKeys: ["commerce", "blog", "billing"]
  },
  {
    slug: "json-schema-visualizer",
    category: "data",
    navGroup: "data-visualizers",
    icon: FileJson,
    recentlyAdded: true,
    priority: 64,
    implemented: true,
    renderer: "json-schema",
    sampleKeys: ["user", "product", "event"]
  },
  {
    slug: "package-json-dependency-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitFork,
    popular: true,
    recentlyAdded: true,
    priority: 74,
    implemented: true,
    renderer: "package-json",
    sampleKeys: ["nextApp", "library", "monorepo"]
  },
  {
    slug: "mermaid-to-drawio",
    category: "developer",
    navGroup: "converters",
    icon: Workflow,
    popular: true,
    recentlyAdded: true,
    priority: 71,
    implemented: true,
    renderer: "mermaid-to-drawio",
    sampleKeys: ["flowchart", "sequence", "architecture"]
  },
  {
    slug: "docker-compose-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Boxes,
    popular: true,
    recentlyAdded: true,
    priority: 73,
    implemented: true,
    renderer: "docker-compose",
    sampleKeys: ["webStack", "queue", "observability"]
  },
  {
    slug: "terraform-architecture-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Boxes,
    popular: true,
    recentlyAdded: true,
    priority: 68,
    implemented: true,
    renderer: "terraform",
    sampleKeys: ["awsWeb", "gcpQueue", "modules"]
  },
  {
    slug: "kubernetes-manifest-visualizer",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Network,
    recentlyAdded: true,
    priority: 69,
    implemented: true,
    renderer: "kubernetes",
    sampleKeys: ["deployment", "service", "ingress"]
  },
  {
    slug: "kubernetes-service-topology-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Network,
    popular: true,
    recentlyAdded: true,
    priority: 68,
    implemented: true,
    renderer: "kubernetes-topology",
    sampleKeys: ["webApp", "ingress", "workers"]
  },
  {
    slug: "github-actions-workflow-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitBranch,
    recentlyAdded: true,
    priority: 66,
    implemented: true,
    renderer: "github-actions",
    sampleKeys: ["nodeCi", "dockerDeploy", "matrix"]
  },
  {
    slug: "ci-cd-pipeline-generator",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitBranch,
    popular: true,
    recentlyAdded: true,
    priority: 65,
    implemented: true,
    renderer: "cicd-pipeline",
    sampleKeys: ["github", "gitlab", "release"]
  },
  {
    slug: "regex-railroad-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Route,
    recentlyAdded: true,
    priority: 67,
    implemented: true,
    renderer: "regex",
    sampleKeys: ["email", "slug", "semver"]
  },
  {
    slug: "cron-expression-visualizer",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Timer,
    popular: true,
    recentlyAdded: true,
    priority: 64,
    implemented: true,
    renderer: "cron",
    sampleKeys: ["daily", "weekday", "quarterHourly"]
  },
  {
    slug: "jwt-decoder-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: KeyRound,
    popular: true,
    recentlyAdded: true,
    priority: 62,
    implemented: true,
    renderer: "jwt",
    sampleKeys: ["accessToken", "idToken", "serviceToken"]
  },
  {
    slug: "dockerfile-visualizer",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Boxes,
    recentlyAdded: true,
    priority: 59,
    implemented: true,
    renderer: "dockerfile",
    sampleKeys: ["node", "python", "multiStage"]
  },
  {
    slug: "helm-values-visualizer",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Braces,
    recentlyAdded: true,
    priority: 57,
    implemented: true,
    renderer: "helm-values",
    sampleKeys: ["webApp", "ingress", "resources"]
  },
  {
    slug: "nginx-config-visualizer",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Network,
    recentlyAdded: true,
    priority: 56,
    implemented: true,
    renderer: "nginx",
    sampleKeys: ["reverseProxy", "loadBalance", "staticSite"]
  },
  {
    slug: "opentelemetry-trace-sequence",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Workflow,
    recentlyAdded: true,
    priority: 55,
    implemented: true,
    renderer: "otel-trace",
    sampleKeys: ["checkout", "login", "queue"]
  },
  {
    slug: "log-to-sequence-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: FileText,
    recentlyAdded: true,
    priority: 54,
    implemented: true,
    renderer: "log-sequence",
    sampleKeys: ["api", "payment", "incident"]
  },
  {
    slug: "graphql-schema-visualizer",
    category: "data",
    navGroup: "data-visualizers",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 53,
    implemented: true,
    renderer: "graphql",
    sampleKeys: ["commerce", "blog", "auth"]
  },
  {
    slug: "protobuf-schema-visualizer",
    category: "data",
    navGroup: "data-visualizers",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 52,
    implemented: true,
    renderer: "protobuf",
    sampleKeys: ["orders", "events", "service"]
  },
  {
    slug: "asyncapi-event-flow-diagram",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Workflow,
    recentlyAdded: true,
    priority: 51,
    implemented: true,
    renderer: "asyncapi",
    sampleKeys: ["orders", "iot", "payments"]
  },
  {
    slug: "dbml-to-er-diagram",
    category: "data",
    navGroup: "data-visualizers",
    icon: Database,
    recentlyAdded: true,
    priority: 50,
    implemented: true,
    renderer: "dbml",
    sampleKeys: ["commerce", "blog", "saas"]
  },
  {
    slug: "prisma-schema-diagram",
    category: "data",
    navGroup: "data-visualizers",
    icon: Database,
    recentlyAdded: true,
    priority: 49,
    implemented: true,
    renderer: "prisma",
    sampleKeys: ["blog", "shop", "auth"]
  },
  {
    slug: "drawio-to-svg",
    category: "developer",
    navGroup: "converters",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 48,
    implemented: true,
    renderer: "drawio-svg",
    sampleKeys: ["basic", "service", "flow"]
  },
  {
    slug: "xml-to-diagram",
    category: "data",
    navGroup: "data-visualizers",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 63,
    implemented: true,
    renderer: "xml",
    sampleKeys: ["rss", "svg", "config"]
  },
  {
    slug: "csv-to-diagram",
    category: "data",
    navGroup: "data-visualizers",
    icon: FileText,
    recentlyAdded: true,
    priority: 61,
    implemented: true,
    renderer: "csv",
    sampleKeys: ["users", "metrics", "inventory"]
  },
  {
    slug: "mermaid-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: Workflow,
    popular: true,
    priority: 100,
    implemented: true,
    renderer: "mermaid",
    sampleKeys: ["flowchart", "sequence", "class", "state", "gantt", "er"]
  },
  {
    slug: "plantuml-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: Route,
    popular: true,
    priority: 90,
    implemented: true,
    renderer: "plantuml",
    sampleKeys: ["sequence", "class", "usecase", "activity"]
  },
  {
    slug: "markdown-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: FileText,
    popular: true,
    priority: 85,
    implemented: true,
    renderer: "markdown",
    sampleKeys: ["docs", "mermaid", "release"]
  },
  {
    slug: "graphviz-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitFork,
    popular: true,
    priority: 72,
    implemented: true,
    renderer: "graphviz",
    sampleKeys: ["digraph", "dependency", "state"]
  },
  {
    slug: "d2-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Boxes,
    popular: true,
    recentlyAdded: true,
    priority: 70,
    implemented: true,
    renderer: "d2",
    sampleKeys: ["architecture", "service", "sequence"]
  },
  {
    slug: "drawio-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 58,
    implemented: true,
    renderer: "drawio",
    sampleKeys: ["xml"]
  },
  {
    slug: "mind-map-preview",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Network,
    popular: true,
    recentlyAdded: true,
    priority: 65,
    implemented: true,
    renderer: "mindmap",
    sampleKeys: ["outline", "product", "research"]
  },
  {
    slug: "sequence-diagram-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitBranch,
    popular: true,
    priority: 80,
    implemented: true,
    renderer: "mermaid",
    sampleKeys: ["api", "login", "payment"]
  },
  {
    slug: "json-to-diagram",
    category: "data",
    navGroup: "converters",
    icon: FileJson,
    popular: true,
    recentlyAdded: true,
    priority: 62,
    implemented: true,
    renderer: "json",
    sampleKeys: ["api", "package", "config"]
  },
  {
    slug: "yaml-to-diagram",
    category: "data",
    navGroup: "converters",
    icon: Braces,
    recentlyAdded: true,
    priority: 60,
    implemented: true,
    renderer: "yaml",
    sampleKeys: ["workflow", "kubernetes", "config"]
  }
];

export const toolSlugs = tools.map((tool) => tool.slug);

export const sortedTools = [...tools].sort((a, b) => b.priority - a.priority);

export function getToolsByGroup(group: ToolNavGroup) {
  return sortedTools.filter((tool) => tool.navGroup === group);
}

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slug: ToolSlug) {
  const tool = getTool(slug);
  if (!tool) {
    return tools.slice(0, 3);
  }

  return tools
    .filter((candidate) => candidate.slug !== slug && candidate.category === tool.category)
    .concat(tools.filter((candidate) => candidate.slug !== slug && candidate.category !== tool.category))
    .slice(0, 3);
}
