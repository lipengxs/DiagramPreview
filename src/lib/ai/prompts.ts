export type AiDiagramMode = "generate" | "text-to-mermaid" | "fix-mermaid" | "architecture" | "plantuml";
export type AiOutputLanguage = "mermaid" | "plantuml";

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
    .replace(/^```(?:mermaid|plantuml|puml)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
