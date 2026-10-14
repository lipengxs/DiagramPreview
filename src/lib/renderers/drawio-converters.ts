import {createDrawioXml, gridLayout, renderDrawioShapeSvg, renderDrawioXmlToSvg, safeId, type DrawioDocument} from "./drawio-utils";

export type DrawioConversionResult = {
  svg: string;
  xml: string;
  diagramType: "flowchart" | "sequence" | "plantuml" | "drawio";
  stats: {nodes: number; edges: number};
  warnings: string[];
};

export function convertPlantUmlToDrawio(source: string): DrawioConversionResult {
  const cleaned = source.replace(/@startuml|@enduml/gi, "");
  const aliases = parsePlantUmlDeclarations(cleaned);
  const sequenceEdges = parseSequenceArrowLines(cleaned);
  const relationEdges = parseArrowLines(cleaned, /"?([\w .-]+)"?\s*(?:--|-->|\.\.>|<\|--|\*--|o--|<--|<\.\.)\s*"?([\w .-]+)"?\s*:?\s*(.*)/);
  const edgeKeys = [...sequenceEdges, ...relationEdges].flatMap((edge) => [edge.source, edge.target]);
  const allKeys = uniqueKeys([...aliases.keys(), ...edgeKeys]);

  if (!allKeys.length) {
    throw new Error("No supported PlantUML actors, participants, classes, components, or arrows were found.");
  }

  const keys = allKeys.slice(0, 36);
  const keySet = new Set(keys);
  const nodes = gridLayout(keys.map((key) => aliases.get(key) || key));
  const idMap = new Map(keys.map((key, index) => [key, nodes[index].id]));
  const allEdges = [...sequenceEdges, ...relationEdges];
  const includedEdges = allEdges.filter((edge) => keySet.has(edge.source) && keySet.has(edge.target)).slice(0, 40);
  const edges = includedEdges.map((edge, index) => ({
    id: `edge_${index + 1}`,
    source: idMap.get(edge.source) || safeId(edge.source),
    target: idMap.get(edge.target) || safeId(edge.target),
    label: edge.label
  }));
  const document: DrawioDocument = {title: "PlantUML to Draw.io", nodes, edges};
  const xml = createDrawioXml(document);
  return {
    xml,
    svg: renderDrawioShapeSvg(document),
    diagramType: "plantuml",
    stats: {nodes: allKeys.length, edges: allEdges.length},
    warnings: sizeWarnings(allKeys.length, allEdges.length)
  };
}

export async function convertMermaidToDrawio(source: string): Promise<DrawioConversionResult> {
  const diagramType = await validateMermaidForDrawio(source);
  const aliases = diagramType === "flowchart" ? parseMermaidNodeDeclarations(source) : new Map<string, string>();
  const edges = parseArrowLines(source, /([A-Za-z][\w.-]*)(?:\s*(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\}))?\s*(?:-->|---|-.->|==>|--[^-]+-->)\s*([A-Za-z][\w.-]*)(?:\s*(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\}))?\s*:?\s*(.*)/);
  const sequenceParticipants = parseMermaidParticipants(source);
  const sequenceEdges = parseSequenceArrowLines(source);
  const allEdges = diagramType === "flowchart" ? edges : sequenceEdges;
  const allKeys = uniqueKeys([...aliases.keys(), ...sequenceParticipants.keys(), ...allEdges.flatMap((edge) => [edge.source, edge.target])]);

  if (!allKeys.length) {
    throw new Error("No supported Mermaid nodes, participants, or arrows were found.");
  }

  const keys = allKeys.slice(0, 36);
  const keySet = new Set(keys);
  const nodes = gridLayout(keys.map((key) => aliases.get(key) || sequenceParticipants.get(key) || key));
  const idMap = new Map(keys.map((key, index) => [key, nodes[index].id]));
  const includedEdges = allEdges.filter((edge) => keySet.has(edge.source) && keySet.has(edge.target)).slice(0, 40);
  const document: DrawioDocument = {
    title: "Mermaid to Draw.io",
    nodes,
    edges: includedEdges.map((edge, index) => ({
      id: `edge_${index + 1}`,
      source: idMap.get(edge.source) || safeId(edge.source),
      target: idMap.get(edge.target) || safeId(edge.target),
      label: edge.label
    }))
  };
  const xml = createDrawioXml(document);
  return {
    xml,
    svg: renderDrawioShapeSvg(document),
    diagramType,
    stats: {nodes: allKeys.length, edges: allEdges.length},
    warnings: [...mermaidFeatureWarnings(source), ...sizeWarnings(allKeys.length, allEdges.length)]
  };
}

export function previewDrawioAsSvg(source: string): DrawioConversionResult {
  return {xml: source, svg: renderDrawioXmlToSvg(source), diagramType: "drawio", stats: {nodes: 0, edges: 0}, warnings: []};
}

async function validateMermaidForDrawio(source: string): Promise<"flowchart" | "sequence"> {
  const declaredType = source.trimStart().match(/^([A-Za-z][\w-]*)/)?.[1] || "unknown";
  const normalizedType = declaredType.toLowerCase();
  const diagramType = normalizedType === "graph" || normalizedType === "flowchart"
    ? "flowchart"
    : normalizedType === "sequencediagram"
      ? "sequence"
      : undefined;

  if (!diagramType) {
    throw new Error(`Unsupported Mermaid diagram type: ${declaredType}. Use a flowchart or sequence diagram.`);
  }

  if (typeof document !== "undefined") {
    const mermaid = (await import("mermaid")).default;
    mermaid.setParseErrorHandler(() => {});
    await mermaid.parse(source, {suppressErrors: false});
  }

  return diagramType;
}

function mermaidFeatureWarnings(source: string) {
  const warnings: string[] = [];
  if (/^\s*subgraph\b/im.test(source)) warnings.push("Subgraph boundaries are flattened; review grouping in diagrams.net.");
  if (/^\s*(?:classDef|class|style|linkStyle)\b/im.test(source)) warnings.push("Mermaid styling is not preserved in editable draw.io XML.");
  if (/^\s*click\b/im.test(source)) warnings.push("Click actions and links are not preserved in draw.io XML.");
  if (/^\s*(?:note|alt|opt|loop|par|rect|critical|break)\b/im.test(source)) warnings.push("Sequence groups and notes are flattened; review the exported layout.");
  return warnings;
}

function sizeWarnings(nodeCount: number, edgeCount: number) {
  const warnings: string[] = [];
  if (nodeCount > 36) warnings.push(`Only the first 36 of ${nodeCount} nodes are included.`);
  if (edgeCount > 40) warnings.push(`Only the first 40 of ${edgeCount} relationships are included.`);
  return warnings;
}

function parseArrowLines(source: string, pattern: RegExp) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .map((line) => line.match(pattern))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      source: cleanLabel(match[1]),
      target: cleanLabel(match[2]),
      label: cleanLabel(match[3] || "")
    }))
    .filter((edge) => edge.source && edge.target);
}

function parseSequenceArrowLines(source: string) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(/^(?:"([^"]+)"|([\w.-]+?))\s*(?:-->>|->>|-->|->)\s*(?:"([^"]+)"|([\w.-]+))\s*(?::\s*(.*))?$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      source: cleanLabel(match[1] || match[2]),
      target: cleanLabel(match[3] || match[4]),
      label: cleanLabel(match[5] || "")
    }))
    .filter((edge) => edge.source && edge.target);
}

function parseMermaidNodeDeclarations(source: string) {
  const aliases = new Map<string, string>();
  for (const match of source.matchAll(/\b([A-Za-z][\w.-]*)\s*(?:\["([^"]+)"\]|\[([^\]]+)\]|\("([^"]+)"\)|\(([^)]+)\)|\{"([^"]+)"\}|\{([^}]+)\})/g)) {
    aliases.set(cleanLabel(match[1]), cleanLabel(match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || match[1]));
  }
  return aliases;
}

function parseMermaidParticipants(source: string) {
  const aliases = new Map<string, string>();
  for (const match of source.matchAll(/\b(?:participant|actor)\s+([\w.-]+)(?:\s+as\s+(.+))?/gi)) {
    aliases.set(cleanLabel(match[1]), cleanLabel(match[2] || match[1]));
  }
  return aliases;
}

function parsePlantUmlDeclarations(source: string) {
  const aliases = new Map<string, string>();
  for (const match of source.matchAll(/\b(?:class|interface|component|actor|participant|database|queue|boundary|control|entity)\s+(?:"([^"]+)"|([\w .-]+))(?:\s+as\s+([\w.-]+))?/gi)) {
    const label = cleanLabel(match[1] || match[2] || "");
    const key = cleanLabel(match[3] || label);
    if (key && label) aliases.set(key, label);
  }
  return aliases;
}

function cleanLabel(value: string) {
  return value.replace(/["'`;{}()[\]]/g, "").trim();
}

function uniqueKeys(values: string[]) {
  return Array.from(new Set(values.map(cleanLabel).filter(Boolean)));
}
