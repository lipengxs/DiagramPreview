import type {BlogSlug} from "./blog";
import type {Locale} from "./locales";
import type {ToolSlug} from "./tools";
import type {WorkflowSlug} from "./workflows";

export const seoFocusLocales: Locale[] = ["en", "zh-CN", "es", "de", "fr"];

export const growthContentIndexableLocales: Locale[] = ["en"];

export const blogIndexableLocales: Locale[] = ["en", "zh-CN"];

export const seoCoreToolSlugs: ToolSlug[] = [
  "mermaid-preview",
  "plantuml-preview",
  "text-to-mermaid",
  "mermaid-ai-fixer",
  "ai-diagram-generator",
  "ai-drawio-generator",
  "drawio-preview",
  "mermaid-to-drawio",
  "drawio-to-svg",
  "plantuml-to-drawio",
  "d2-preview",
  "openapi-to-sequence",
  "api-error-flow-diagram",
  "har-file-sequence-diagram",
  "postman-collection-sequence-diagram",
  "sql-to-er-diagram",
  "dbml-to-er-diagram",
  "json-schema-visualizer",
  "protobuf-schema-visualizer",
  "graphql-schema-visualizer",
  "docker-compose-diagram",
  "kubernetes-manifest-visualizer"
];

export type SeoSubmissionTargets = Partial<Record<Locale, ToolSlug[]>>;

export const seoSubmissionLocales: Locale[] = ["en", "zh-CN", "es", "fr", "de"];

export const seoSubmissionHomeLocales: Locale[] = ["en", "zh-CN"];

export const seoSubmissionHubLocales: Locale[] = ["en"];

export const seoSubmissionBlogLocales: Locale[] = ["en"];

export const seoSubmissionHubSlugs = ["tools", "converters", "preview-tools", "developer-diagrams", "data-visualizers"] as const;

export const seoSubmissionToolSlugsByLocale: SeoSubmissionTargets = {
  en: [
    "text-to-mermaid",
    "mermaid-preview",
    "mermaid-to-drawio",
    "plantuml-to-drawio",
    "drawio-preview",
    "openapi-to-sequence",
    "api-error-flow-diagram",
    "json-schema-visualizer",
    "json-schema-form-preview",
    "protobuf-schema-visualizer"
  ],
  "zh-CN": [
    "text-to-mermaid",
    "mermaid-preview",
    "mermaid-to-drawio",
    "drawio-preview",
    "openapi-to-sequence",
    "json-schema-visualizer"
  ],
  es: ["protobuf-schema-visualizer"],
  fr: ["openapi-to-sequence"],
  de: ["drawio-preview"]
};

export const seoSubmissionWorkflowSlugs: WorkflowSlug[] = [
  "ai-generated-mermaid-workflow",
  "mermaid-to-drawio-documentation-workflow",
  "api-debugging-sequence-diagram",
  "schema-visualization-workflow",
  "open-drawio-file-online"
];

export const seoPriorityHomeToolSlugs: ToolSlug[] = [
  "text-to-mermaid",
  "mermaid-preview",
  "mermaid-to-drawio",
  "plantuml-to-drawio",
  "drawio-preview",
  "openapi-to-sequence",
  "api-error-flow-diagram",
  "json-schema-visualizer"
];

export const seoCoreBlogSlugs: BlogSlug[] = [
  "chatgpt-mermaid-preview-workflow",
  "api-debugging-preview-har-postman-openapi",
  "schema-preview-workflow-json-schema-zod-typescript"
];

export const seoSubmissionBlogSlugs: BlogSlug[] = seoCoreBlogSlugs;

export const defaultToolUpdatedAt = "2026-07-04";
