import type {BlogSlug} from "./blog";
import type {Locale} from "./locales";
import type {ToolSlug} from "./tools";

export const seoFocusLocales: Locale[] = ["en", "zh-CN", "pt", "es", "ru"];

export const growthContentIndexableLocales: Locale[] = ["en"];

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

export const seoCoreBlogSlugs: BlogSlug[] = [
  "chatgpt-mermaid-preview-workflow",
  "drawio-file-preview-guide",
  "api-debugging-preview-har-postman-openapi",
  "schema-preview-workflow-json-schema-zod-typescript",
  "technical-seo-preview-robots-sitemap-open-graph"
];

export const defaultToolUpdatedAt = "2026-07-04";
