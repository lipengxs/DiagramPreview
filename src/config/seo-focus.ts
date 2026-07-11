import type {BlogSlug} from "./blog";
import type {Locale} from "./locales";
import type {ToolSlug} from "./tools";

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

export const seoCoreBlogSlugs: BlogSlug[] = [
  "api-debugging-preview-har-postman-openapi",
  "schema-preview-workflow-json-schema-zod-typescript",
  "social-card-svg-preview-publishing-workflow",
  "config-preview-env-yaml-toml-before-deploy",
  "technical-seo-preview-robots-sitemap-open-graph",
  "script-preview-debugging-html-css-json-base64"
];

export const defaultToolUpdatedAt = "2026-07-04";
