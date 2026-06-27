import type {ToolSlug} from "@/config/tools";

export type InputDetection = {
  slug: ToolSlug;
  label: string;
  confidence: "high" | "medium";
};

export function detectInputTool(source: string): InputDetection | null {
  const value = source.trim();
  if (value.length < 12) return null;

  if (/^@startuml\b/i.test(value)) {
    return {slug: "plantuml-preview", label: "PlantUML", confidence: "high"};
  }

  if (/^<mxfile[\s>]/i.test(value) || /<mxGraphModel[\s>]/i.test(value)) {
    return {slug: "drawio-preview", label: "draw.io XML", confidence: "high"};
  }

  if (/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|journey|pie)\b/i.test(value)) {
    return {slug: "mermaid-preview", label: "Mermaid", confidence: "high"};
  }

  if (/^(digraph|graph)\s+[\w"]*\s*\{/i.test(value)) {
    return {slug: "graphviz-preview", label: "Graphviz DOT", confidence: "high"};
  }

  if (/\bCREATE\s+TABLE\b/i.test(value)) {
    return {slug: "sql-to-er-diagram", label: "SQL DDL", confidence: "high"};
  }

  if (/\bsyntax\s*=\s*["']proto3["']/.test(value) || /\b(message|service|enum)\s+\w+\s*\{/.test(value)) {
    return {slug: "protobuf-schema-visualizer", label: "Protobuf schema", confidence: "high"};
  }

  if (/\btype\s+\w+\s*\{/.test(value) || /\bscalar\s+\w+/.test(value)) {
    return {slug: "graphql-schema-visualizer", label: "GraphQL schema", confidence: "medium"};
  }

  const parsedJson = parseJson(value);
  if (parsedJson) {
    if (hasOpenApiShape(parsedJson)) {
      return {slug: "openapi-to-sequence", label: "OpenAPI document", confidence: "high"};
    }
    if (hasJsonSchemaShape(parsedJson)) {
      return {slug: "json-schema-visualizer", label: "JSON Schema", confidence: "high"};
    }
    return {slug: "json-to-diagram", label: "JSON", confidence: "medium"};
  }

  if (/^openapi:\s*["']?\d/i.test(value) || /\npaths:\s*\n/i.test(value)) {
    return {slug: "openapi-to-sequence", label: "OpenAPI YAML", confidence: "medium"};
  }

  if (/^apiVersion:\s*.+\nkind:\s*\w+/i.test(value) || /\nkind:\s*(Deployment|Service|Ingress|ConfigMap|Pod)\b/i.test(value)) {
    return {slug: "kubernetes-manifest-visualizer", label: "Kubernetes YAML", confidence: "high"};
  }

  if (/^services:\s*\n/i.test(value) || /\n\s+image:\s*[\w./:-]+/i.test(value)) {
    return {slug: "docker-compose-diagram", label: "Docker Compose", confidence: "medium"};
  }

  if (/^[\w.-]+:\s*\n\s+[\w.-]+:/m.test(value)) {
    return {slug: "yaml-to-diagram", label: "YAML", confidence: "medium"};
  }

  return null;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function hasOpenApiShape(value: unknown) {
  return isRecord(value) && ("openapi" in value || "swagger" in value) && "paths" in value;
}

function hasJsonSchemaShape(value: unknown) {
  return isRecord(value) && ("properties" in value || "required" in value || "$schema" in value) && ("type" in value || "$schema" in value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
