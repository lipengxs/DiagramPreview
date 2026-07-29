import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";

type OpenApiDoc = {
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

const httpMethods = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);

export async function renderOpenApiSequence(source: string) {
  const doc = yaml.load(source) as OpenApiDoc;
  const paths = doc?.paths;

  if (!paths || typeof paths !== "object") {
    throw new Error("OpenAPI document must include a paths object.");
  }

  const lines = [
    "sequenceDiagram",
    "  autonumber",
    "  participant Client",
    "  participant API",
    "  participant Auth",
    "  participant Service",
    "  participant Store"
  ];
  const schemaNames = new Set(Object.keys(doc.components?.schemas || {}));
  let operationCount = 0;

  for (const [path, operations] of Object.entries(paths).slice(0, 8)) {
    if (!operations || typeof operations !== "object") continue;

    for (const [method, operation] of Object.entries(operations).slice(0, 4)) {
      if (!httpMethods.has(method.toLowerCase())) continue;
      operationCount += 1;

      const operationRecord = objectOf(operation);
      const summary = String(operationRecord.summary || "");
      const operationId = String(operationRecord.operationId || "");
      const tags = Array.isArray(operationRecord.tags) ? operationRecord.tags.map(String).slice(0, 2) : [];
      const label = `${method.toUpperCase()} ${path}`;
      const serviceLabel = [operationId || summary || "handle request", tags.length ? `tag: ${tags.join(", ")}` : ""].filter(Boolean).join(" / ");
      const requestSchema = schemaNameFromRequestBody(operationRecord.requestBody, schemaNames);
      const responses = responseRows(operationRecord.responses, schemaNames);
      const successResponses = responses.filter((response) => response.kind === "success").slice(0, 2);
      const errorResponses = responses.filter((response) => response.kind === "error").slice(0, 4);

      lines.push(`  Client->>API: ${escapeMermaid(label)}`);
      if (hasSecurity(operationRecord)) {
        lines.push("  API->>Auth: check token, scopes, or API key");
        lines.push("  Auth-->>API: auth decision");
      }
      lines.push(`  API->>Service: ${escapeMermaid(serviceLabel)}`);
      if (requestSchema) {
        lines.push(`  Service->>Store: validate ${escapeMermaid(requestSchema)} payload`);
      } else if (["post", "put", "patch"].includes(method.toLowerCase())) {
        lines.push("  Service->>Store: validate request body");
      } else {
        lines.push("  Service->>Store: read or write data");
      }
      lines.push("  Store-->>Service: data or domain result");
      if (successResponses.length || errorResponses.length) {
        lines.push(`  alt ${escapeMermaid(successResponses[0]?.label || "success response")}`);
        lines.push(`    Service-->>API: ${escapeMermaid(successResponses[0]?.label || "domain result")}`);
        lines.push(`    API-->>Client: ${escapeMermaid(successResponses[0]?.clientLabel || "2xx response")}`);
        for (const errorResponse of errorResponses) {
          lines.push(`  else ${escapeMermaid(errorResponse.label)}`);
          lines.push(`    Service-->>API: ${escapeMermaid(errorResponse.label)}`);
          lines.push(`    API-->>Client: ${escapeMermaid(errorResponse.clientLabel)}`);
        }
        lines.push("  end");
      } else {
        lines.push("  Service-->>API: result");
        lines.push("  API-->>Client: HTTP response");
      }
    }
  }

  if (!operationCount) {
    throw new Error("No HTTP operations were found under paths.");
  }

  return renderMermaid(lines.join("\n"));
}

function responseRows(value: unknown, schemaNames: Set<string>) {
  const responses = objectOf(value);
  return Object.entries(responses).map(([status, response]) => {
    const record = objectOf(response);
    const description = String(record.description || "");
    const schemaName = schemaNameFromContent(record.content, schemaNames);
    const label = `${status} ${schemaName || description || responseKind(status)}`;
    return {
      kind: status.startsWith("2") || status.toLowerCase() === "default" ? "success" : "error",
      label,
      clientLabel: `${status} ${description || schemaName || "response"}`
    };
  });
}

function schemaNameFromRequestBody(value: unknown, schemaNames: Set<string>) {
  return schemaNameFromContent(objectOf(value).content, schemaNames);
}

function schemaNameFromContent(value: unknown, schemaNames: Set<string>) {
  const content = objectOf(value);
  for (const media of Object.values(content)) {
    const schema = objectOf(objectOf(media).schema);
    const name = schemaName(schema, schemaNames);
    if (name) return name;
  }
  return "";
}

function schemaName(schema: Record<string, unknown>, schemaNames: Set<string>) {
  const ref = typeof schema.$ref === "string" ? schema.$ref : "";
  if (ref) return ref.split("/").pop() || ref;
  const title = typeof schema.title === "string" ? schema.title : "";
  if (title) return title;
  const type = typeof schema.type === "string" ? schema.type : "";
  if (type && schemaNames.has(type)) return type;
  if (type) return `${type} schema`;
  return "";
}

function hasSecurity(operation: Record<string, unknown>) {
  return Array.isArray(operation.security) || Boolean(operation["x-security"]) || Boolean(operation["x-auth"]);
}

function responseKind(status: string) {
  if (status.startsWith("2")) return "success";
  if (status.startsWith("4")) return "client error";
  if (status.startsWith("5")) return "server error";
  return "response";
}

function objectOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function escapeMermaid(value: string) {
  return value.replace(/:/g, "&#58;").replace(/\n/g, " ").replace(/\|/g, "/");
}
