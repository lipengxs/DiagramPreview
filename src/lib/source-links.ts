import type {ToolConfig} from "@/config/tools";

export function sourceUrl(path: string, source: string) {
  const url = new URL(path, "https://diagrampreview.com");
  if (source.trim()) {
    url.searchParams.set("source", source);
  }
  return `${url.pathname}${url.search}`;
}

export function absoluteSourceUrl(origin: string, pathname: string, source: string) {
  const url = new URL(pathname, origin);
  if (source.trim()) {
    url.searchParams.set("source", source);
  }
  return url.toString();
}

export function markdownSnippet(source: string, url: string, renderer: ToolConfig["renderer"]) {
  const language = markdownLanguage(renderer);
  return `\`\`\`${language}\n${source.trim()}\n\`\`\`\n\nPreview and export this diagram: ${url}`;
}

function markdownLanguage(renderer: ToolConfig["renderer"]) {
  if (renderer === "mermaid" || renderer === "openapi" || renderer === "sql") return "mermaid";
  if (renderer === "plantuml") return "plantuml";
  if (renderer === "json" || renderer === "json-schema") return "json";
  if (renderer === "yaml" || renderer === "kubernetes" || renderer === "docker-compose") return "yaml";
  if (renderer === "xml" || renderer === "drawio") return "xml";
  if (renderer === "protobuf") return "proto";
  if (renderer === "graphql") return "graphql";
  return "text";
}
