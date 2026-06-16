import {buildDiagramPrompt, stripMermaidFences, type AiDiagramRequest} from "./prompts";

export type AiProviderResult = {
  provider: "deepseek" | "local";
  code: string;
};

export type AiProviderError = {
  provider: "deepseek";
  status?: number;
  message: string;
};

export async function generateDiagramWithFallback(input: AiDiagramRequest): Promise<{
  result?: AiProviderResult;
  errors: AiProviderError[];
}> {
  const errors: AiProviderError[] = [];

  try {
    const result = await generateWithDeepSeek(input);
    if (result.code) return {result, errors};
  } catch (error) {
    errors.push(normalizeProviderError("deepseek", error));
  }

  const localResult = generateLocalFallback(input);
  if (localResult.code) return {result: localResult, errors};

  return {errors};
}

function generateLocalFallback(input: AiDiagramRequest): AiProviderResult {
  const outputLanguage = input.outputLanguage || "mermaid";
  const title = titleFromPrompt(input.prompt || input.diagramType);

  if (outputLanguage === "plantuml") {
    return {
      provider: "local",
      code: [
        "@startuml",
        `title ${title}`,
        "actor User",
        "participant App",
        "participant Service",
        "database Data",
        "User -> App: Request",
        "App -> Service: Process",
        "Service -> Data: Read / write",
        "Data --> Service: Result",
        "Service --> App: Response",
        "App --> User: Render result",
        "@enduml"
      ].join("\n")
    };
  }

  if (outputLanguage === "drawio") {
    return {
      provider: "local",
      code: `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="${escapeXml(title)}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="2" value="User" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;" vertex="1" parent="1"><mxGeometry x="80" y="120" width="140" height="60" as="geometry"/></mxCell>
        <mxCell id="3" value="Application" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;" vertex="1" parent="1"><mxGeometry x="320" y="120" width="160" height="60" as="geometry"/></mxCell>
        <mxCell id="4" value="Service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;" vertex="1" parent="1"><mxGeometry x="580" y="120" width="160" height="60" as="geometry"/></mxCell>
        <mxCell id="5" value="Data Store" style="shape=cylinder3d;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#fee2e2;strokeColor=#dc2626;" vertex="1" parent="1"><mxGeometry x="840" y="110" width="140" height="80" as="geometry"/></mxCell>
        <mxCell id="6" value="" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="7" value="" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry"/></mxCell>
        <mxCell id="8" value="" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="4" target="5"><mxGeometry relative="1" as="geometry"/></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`
    };
  }

  if (outputLanguage === "json") {
    return {
      provider: "local",
      code: JSON.stringify(
        {
          title,
          timezone: "browser",
          refresh: "30s",
          schemaVersion: 39,
          version: 1,
          time: {from: "now-6h", to: "now"},
          panels: [
            panel("Request rate", "rate(http_requests_total[5m])", 0, 0),
            panel("Error rate", "rate(http_requests_total{status=~\"5..\"}[5m])", 12, 0),
            panel("P95 latency", "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))", 0, 8),
            panel("Saturation", "avg(rate(container_cpu_usage_seconds_total[5m]))", 12, 8)
          ]
        },
        null,
        2
      )
    };
  }

  if (outputLanguage === "yaml") {
    return {
      provider: "local",
      code:
        input.mode === "observability"
          ? observabilityYaml(title)
          : prometheusYaml(title)
    };
  }

  return {
    provider: "local",
    code: mermaidFallback(input.diagramType, title)
  };
}

async function generateWithDeepSeek(input: AiDiagramRequest): Promise<AiProviderResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new ProviderError("DeepSeek API key is not configured.");

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const endpoint = deepSeekEndpoint(process.env.DEEPSEEK_BASE_URL);
  const prompt = buildDiagramPrompt(input);

  console.info("ai.provider.deepseek.request", {
    model,
    endpoint: endpointLogValue(endpoint)
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a diagram generation assistant. Return only valid diagram source code."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new ProviderError(await response.text(), response.status);
  }

  const data = (await response.json()) as {
    choices?: Array<{message?: {content?: string}}>;
  };
  const code = stripMermaidFences(data.choices?.[0]?.message?.content || "");

  if (!code) throw new ProviderError("DeepSeek returned an empty response.");
  return {provider: "deepseek", code};
}

function normalizeProviderError(provider: AiProviderError["provider"], error: unknown): AiProviderError {
  if (error instanceof ProviderError) {
    return {
      provider,
      status: error.status,
      message: error.message
    };
  }

  return {
    provider,
    message: error instanceof Error ? error.message : "Unknown provider error."
  };
}

class ProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function titleFromPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/\s+/g, " ")
    .replace(/[^\w\s:./-]/g, "")
    .trim();
  const title = cleaned || "Generated diagram";
  return title.length > 72 ? `${title.slice(0, 69)}...` : title;
}

function mermaidFallback(diagramType: string, title: string) {
  if (diagramType === "sequenceDiagram") {
    return [
      "sequenceDiagram",
      "  autonumber",
      "  actor User",
      "  participant App",
      "  participant Service",
      "  participant Data",
      "  User->>App: Submit request",
      "  App->>Service: Validate and process",
      "  Service->>Data: Read or write state",
      "  Data-->>Service: Return result",
      "  Service-->>App: Build response",
      "  App-->>User: Show result"
    ].join("\n");
  }

  if (diagramType === "classDiagram") {
    return [
      "classDiagram",
      "  class User",
      "  class Application",
      "  class Service",
      "  class Repository",
      "  User --> Application",
      "  Application --> Service",
      "  Service --> Repository"
    ].join("\n");
  }

  if (diagramType === "stateDiagram-v2") {
    return [
      "stateDiagram-v2",
      "  [*] --> Draft",
      "  Draft --> Validating",
      "  Validating --> Processing",
      "  Processing --> Complete",
      "  Validating --> Failed",
      "  Failed --> Draft",
      "  Complete --> [*]"
    ].join("\n");
  }

  if (diagramType === "erDiagram") {
    return [
      "erDiagram",
      "  USER ||--o{ REQUEST : creates",
      "  REQUEST ||--|| RESULT : produces",
      "  SERVICE ||--o{ RESULT : stores",
      "  USER {",
      "    string id",
      "    string name",
      "  }",
      "  REQUEST {",
      "    string id",
      "    string status",
      "  }"
    ].join("\n");
  }

  if (diagramType === "gantt") {
    return [
      "gantt",
      `  title ${title}`,
      "  dateFormat  YYYY-MM-DD",
      "  section Delivery",
      "  Discovery           :a1, 2026-01-01, 3d",
      "  Implementation      :a2, after a1, 5d",
      "  Review and release  :a3, after a2, 2d"
    ].join("\n");
  }

  return [
    "flowchart TD",
    `  A[\"${escapeMermaidLabel(title)}\"] --> B[Input]`,
    "  B --> C[Application]",
    "  C --> D[Service layer]",
    "  D --> E[(Data store)]",
    "  D --> F[External systems]",
    "  E --> G[Response]",
    "  F --> G",
    "  G --> H[User outcome]"
  ].join("\n");
}

function panel(title: string, expr: string, x: number, y: number) {
  return {
    title,
    type: "timeseries",
    datasource: {type: "prometheus", uid: "prometheus"},
    targets: [{expr, refId: "A"}],
    gridPos: {h: 8, w: 12, x, y}
  };
}

function prometheusYaml(title: string) {
  return [
    "groups:",
    `  - name: ${yamlString(title)}`,
    "    rules:",
    "      - alert: HighErrorRate",
    "        expr: rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05",
    "        for: 10m",
    "        labels:",
    "          severity: warning",
    "        annotations:",
    "          summary: High HTTP 5xx error rate",
    "      - alert: HighLatencyP95",
    "        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1",
    "        for: 10m",
    "        labels:",
    "          severity: critical",
    "        annotations:",
    "          summary: P95 latency is above target"
  ].join("\n");
}

function observabilityYaml(title: string) {
  return [
    `overview: ${yamlString(title)}`,
    "mermaidArchitecture: |",
    "  flowchart TD",
    "    User[User] --> App[Application]",
    "    App --> Api[API service]",
    "    Api --> Db[(Database)]",
    "    Api --> Queue[Queue]",
    "    Api --> Metrics[Metrics and logs]",
    "grafanaDashboard:",
    `  title: ${yamlString(`${title} observability`)}`,
    "  refresh: 30s",
    "  panels:",
    "    - title: Request rate",
    "      type: timeseries",
    "      targets:",
    "        - expr: rate(http_requests_total[5m])",
    "    - title: P95 latency",
    "      type: timeseries",
    "      targets:",
    "        - expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
    "prometheusRuleGroups:",
    "  - name: service-health",
    "    rules:",
    "      - alert: HighErrorRate",
    "        expr: rate(http_requests_total{status=~\"5..\"}[5m]) > 0.05",
    "        for: 10m",
    "        labels:",
    "          severity: warning",
    "runbookChecklist:",
    "  - Check recent deploys and error budget burn.",
    "  - Compare latency, error rate, saturation, and dependency health.",
    "  - Inspect logs and traces for the dominant failing route.",
    "  - Roll back or mitigate the dependency causing the alert."
  ].join("\n");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeMermaidLabel(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function yamlString(value: string) {
  return JSON.stringify(value);
}

function deepSeekEndpoint(baseUrl?: string) {
  const fallback = "https://api.deepseek.com/chat/completions";
  const value = baseUrl?.trim();
  if (!value) return fallback;

  try {
    const url = new URL(value);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (normalizedPath.endsWith("/chat/completions")) return url.toString();

    const prefix = normalizedPath === "/" || normalizedPath === "" ? "" : normalizedPath;
    url.pathname = `${prefix}/chat/completions`;
    return url.toString();
  } catch {
    return value.endsWith("/chat/completions") ? value : `${value.replace(/\/+$/, "")}/chat/completions`;
  }
}

function endpointLogValue(value: string) {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}`;
  } catch {
    return value.replace(/\?.*$/, "");
  }
}
