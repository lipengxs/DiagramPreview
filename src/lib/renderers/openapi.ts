import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";

type OpenApiDoc = {
  paths?: Record<string, Record<string, unknown>>;
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
    "  participant Handler",
    "  participant Store"
  ];

  for (const [path, operations] of Object.entries(paths).slice(0, 8)) {
    if (!operations || typeof operations !== "object") continue;

    for (const [method, operation] of Object.entries(operations).slice(0, 4)) {
      if (!httpMethods.has(method.toLowerCase())) continue;

      const summary =
        operation && typeof operation === "object" && "summary" in operation
          ? String((operation as {summary?: unknown}).summary || "")
          : "";
      const label = `${method.toUpperCase()} ${path}`;
      const response = summary || "response";

      lines.push(`  Client->>API: ${escapeMermaid(label)}`);
      lines.push("  API->>Handler: validate request");
      lines.push("  Handler->>Store: read or write data");
      lines.push(`  Store-->>Handler: ${escapeMermaid(response)}`);
      lines.push("  Handler-->>API: result");
      lines.push("  API-->>Client: HTTP response");
    }
  }

  if (lines.length === 5) {
    throw new Error("No HTTP operations were found under paths.");
  }

  return renderMermaid(lines.join("\n"));
}

function escapeMermaid(value: string) {
  return value.replace(/:/g, "&#58;").replace(/\n/g, " ");
}
