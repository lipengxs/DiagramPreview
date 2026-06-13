export type AiDiagramMode =
  | "generate"
  | "text-to-mermaid"
  | "fix-mermaid"
  | "architecture"
  | "plantuml"
  | "drawio"
  | "grafana"
  | "prometheus"
  | "observability";
export type AiOutputLanguage = "mermaid" | "plantuml" | "drawio" | "json" | "yaml";

export type AiDiagramRequest = {
  mode: AiDiagramMode;
  diagramType: string;
  prompt: string;
  existingCode?: string;
  outputLanguage?: AiOutputLanguage;
};

export function buildDiagramPrompt(input: AiDiagramRequest) {
  const outputLanguage = input.outputLanguage || "mermaid";
  const baseRules =
    outputLanguage === "plantuml"
      ? [
          "Return only valid PlantUML source.",
          "Include @startuml and @enduml.",
          "Do not wrap the answer in Markdown fences.",
          "Do not include explanations before or after the code.",
          "Prefer clear labels, short participant names, and readable layout."
        ]
      : outputLanguage === "drawio"
        ? [
            "Return only valid uncompressed diagrams.net / draw.io XML.",
            "Use an mxfile root with one diagram containing an mxGraphModel root.",
            "Use mxCell vertices with mxGeometry x, y, width, and height.",
            "Use mxCell edges with source and target references.",
            "Do not use compressed diagram data.",
            "Do not wrap the answer in Markdown fences.",
            "Do not include explanations before or after the XML."
          ]
        : outputLanguage === "json"
          ? [
              "Return only valid JSON.",
              "Do not wrap the answer in Markdown fences.",
              "Do not include explanations before or after the JSON.",
              "Use stable, importable JSON that a developer can copy directly."
            ]
          : outputLanguage === "yaml"
            ? [
                "Return only valid YAML.",
                "Do not wrap the answer in Markdown fences.",
                "Do not include explanations before or after the YAML.",
                "Use stable, importable YAML that a developer can copy directly."
              ]
            : [
          "Return only valid Mermaid code.",
          "Do not wrap the answer in Markdown fences.",
          "Do not include explanations before or after the code.",
          "Prefer clear labels, short node names, and readable diagram direction.",
          "Use Mermaid syntax that works in a browser Mermaid renderer."
        ];

  if (input.mode === "fix-mermaid") {
    return [
      "Fix this Mermaid diagram so it renders correctly.",
      `Target diagram type: ${input.diagramType}.`,
      "Preserve the user's intent and labels where possible.",
      ...baseRules,
      "User request:",
      input.prompt,
      "Existing Mermaid code:",
      input.existingCode || ""
    ].join("\n");
  }

  if (input.mode === "text-to-mermaid") {
    return [
      "Convert the user's text into a Mermaid diagram.",
      `Target diagram type: ${input.diagramType}.`,
      ...baseRules,
      "User text:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "architecture") {
    return [
      "Generate a readable software architecture diagram from the user's request.",
      `Target diagram type: ${input.diagramType}.`,
      "Show major clients, services, data stores, queues, third-party systems, and important flows when relevant.",
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "plantuml") {
    return [
      "Generate a PlantUML diagram from the user's request.",
      `Target PlantUML diagram type: ${input.diagramType}.`,
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "drawio") {
    return [
      "Generate an editable diagrams.net / draw.io architecture diagram from the user's request.",
      `Target diagram style: ${input.diagramType}.`,
      "Create readable nodes, connectors, labels, and layout coordinates.",
      "Prefer software architecture, CI/CD, data flow, cloud, and developer documentation diagrams.",
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "grafana") {
    return [
      "Generate a Grafana dashboard JSON document from the user's request.",
      `Dashboard scenario: ${input.diagramType}.`,
      "Use Grafana dashboard schema fields such as title, panels, targets, datasource, gridPos, templating, refresh, and time.",
      "Prefer Prometheus, Loki, Node Exporter, API latency, error rate, saturation, and service health panels when relevant.",
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "prometheus") {
    return [
      "Generate Prometheus alerting rules YAML from the user's request.",
      `Alert scenario: ${input.diagramType}.`,
      "Use groups, rules, alert, expr, for, labels, and annotations.",
      "Include practical alerts for latency, error rate, saturation, instance health, CPU, memory, disk, Kubernetes, or queue lag when relevant.",
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  if (input.mode === "observability") {
    return [
      "Generate a complete observability starter pack from the user's request.",
      `Observability scenario: ${input.diagramType}.`,
      "Return one YAML document with top-level keys: overview, mermaidArchitecture, grafanaDashboard, prometheusRuleGroups, runbookChecklist.",
      "grafanaDashboard must be importable Grafana dashboard JSON expressed as YAML.",
      "prometheusRuleGroups must follow Prometheus alerting rule structure with groups and rules.",
      "mermaidArchitecture must be valid Mermaid flowchart source as a block scalar.",
      "Include practical API latency, error rate, saturation, uptime, Kubernetes, queue, and log-based signals when relevant.",
      ...baseRules,
      "User request:",
      input.prompt
    ].join("\n");
  }

  return [
    "Generate a Mermaid diagram from the user's request.",
    `Target diagram type: ${input.diagramType}.`,
    ...baseRules,
    "User request:",
    input.prompt
  ].join("\n");
}

export function stripMermaidFences(value: string) {
  return value
    .trim()
    .replace(/^```(?:mermaid|plantuml|puml|xml|drawio|json|yaml|yml)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
