import {createDrawioXml, gridLayout, renderDrawioShapeSvg, renderDrawioXmlToSvg, safeId, type DrawioDocument} from "./drawio-utils";

export type DrawioConversionResult = {
  svg: string;
  xml: string;
};

export function convertPlantUmlToDrawio(source: string): DrawioConversionResult {
  const cleaned = source.replace(/@startuml|@enduml/gi, "");
  const aliases = parsePlantUmlDeclarations(cleaned);
  const sequenceEdges = parseArrowLines(cleaned, /"?([\w .-]+)"?\s*(?:->|-->|->>|-->>)\s*"?([\w .-]+)"?\s*:?\s*(.*)/);
  const relationEdges = parseArrowLines(cleaned, /"?([\w .-]+)"?\s*(?:--|-->|\.\.>|<\|--|\*--|o--|<--|<\.\.)\s*"?([\w .-]+)"?\s*:?\s*(.*)/);
  const edgeKeys = [...sequenceEdges, ...relationEdges].flatMap((edge) => [edge.source, edge.target]);
  const keys = uniqueKeys([...aliases.keys(), ...edgeKeys]);

  if (!keys.length) {
    throw new Error("No supported PlantUML actors, participants, classes, components, or arrows were found.");
  }

  const nodes = gridLayout(keys.map((key) => aliases.get(key) || key));
  const idMap = new Map(keys.map((key, index) => [key, nodes[index].id]));
  const edges = [...sequenceEdges, ...relationEdges].slice(0, 40).map((edge, index) => ({
    id: `edge_${index + 1}`,
    source: idMap.get(edge.source) || safeId(edge.source),
    target: idMap.get(edge.target) || safeId(edge.target),
    label: edge.label
  }));
  const document: DrawioDocument = {title: "PlantUML to Draw.io", nodes, edges};
  const xml = createDrawioXml(document);
  return {xml, svg: renderDrawioShapeSvg(document)};
}

export function convertMermaidToDrawio(source: string): DrawioConversionResult {
  const aliases = parseMermaidNodeDeclarations(source);
  const edges = parseArrowLines(source, /([A-Za-z][\w.-]*)(?:\s*(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\}))?\s*(?:-->|---|-.->|==>|--[^-]+-->)\s*([A-Za-z][\w.-]*)(?:\s*(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\}))?\s*:?\s*(.*)/);
  const sequenceParticipants = parseMermaidParticipants(source);
  const sequenceEdges = parseArrowLines(source, /"?([\w .-]+)"?\s*(?:->>|-->>|->|-->)\s*"?([\w .-]+)"?\s*:?\s*(.*)/);
  const allEdges = [...edges, ...sequenceEdges];
  const keys = uniqueKeys([...aliases.keys(), ...sequenceParticipants.keys(), ...allEdges.flatMap((edge) => [edge.source, edge.target])]);

  if (!keys.length) {
    throw new Error("No supported Mermaid nodes, participants, or arrows were found.");
  }

  const nodes = gridLayout(keys.map((key) => aliases.get(key) || sequenceParticipants.get(key) || key));
  const idMap = new Map(keys.map((key, index) => [key, nodes[index].id]));
  const document: DrawioDocument = {
    title: "Mermaid to Draw.io",
    nodes,
    edges: allEdges.slice(0, 40).map((edge, index) => ({
      id: `edge_${index + 1}`,
      source: idMap.get(edge.source) || safeId(edge.source),
      target: idMap.get(edge.target) || safeId(edge.target),
      label: edge.label
    }))
  };
  const xml = createDrawioXml(document);
  return {xml, svg: renderDrawioShapeSvg(document)};
}

export function previewDrawioAsSvg(source: string): DrawioConversionResult {
  return {xml: source, svg: renderDrawioXmlToSvg(source)};
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
  return Array.from(new Set(values.map(cleanLabel).filter(Boolean))).slice(0, 36);
}
