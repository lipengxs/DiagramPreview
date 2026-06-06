import {createDrawioXml, gridLayout, renderDrawioShapeSvg, renderDrawioXmlToSvg, safeId, type DrawioDocument} from "./drawio-utils";

export type DrawioConversionResult = {
  svg: string;
  xml: string;
};

export function convertPlantUmlToDrawio(source: string): DrawioConversionResult {
  const cleaned = source.replace(/@startuml|@enduml/gi, "");
  const sequenceEdges = parseArrowLines(cleaned, /([\w .-]+)\s*(?:->|-->|->>|-->>)\s*([\w .-]+)\s*:?\s*(.*)/);
  const classLabels = Array.from(cleaned.matchAll(/\b(?:class|interface|component|actor|participant|database|queue)\s+"?([\w .-]+)"?/gi)).map(
    (match) => match[1]
  );
  const relationEdges = parseArrowLines(cleaned, /"?([\w .-]+)"?\s*(?:--|-->|\.\.>|<\|--|\*--|o--)\s*"?([\w .-]+)"?\s*:?\s*(.*)/);
  const labels = unique([...classLabels, ...sequenceEdges.flatMap((edge) => [edge.source, edge.target]), ...relationEdges.flatMap((edge) => [edge.source, edge.target])]);
  const nodes = gridLayout(labels.length ? labels : ["Start", "Process", "Result"]);
  const idMap = new Map(nodes.map((node) => [node.label, node.id]));
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
  const edges = parseArrowLines(source, /([\w .-]+)(?:\[[^\]]+\])?\s*(?:-->|---|-.->|==>)\s*([\w .-]+)(?:\[[^\]]+\])?:?\s*(.*)/);
  const sequenceEdges = parseArrowLines(source, /([\w .-]+)\s*(?:->>|-->>|->|-->)\s*([\w .-]+)\s*:?\s*(.*)/);
  const nodeLabels = Array.from(source.matchAll(/([A-Za-z][\w-]*)\s*(?:\["([^"]+)"\]|\[([^\]]+)\]|\("([^"]+)"\))/g)).map(
    (match) => match[2] || match[3] || match[4] || match[1]
  );
  const allEdges = [...edges, ...sequenceEdges];
  const labels = unique([...nodeLabels, ...allEdges.flatMap((edge) => [edge.source, edge.target])]);
  const nodes = gridLayout(labels.length ? labels : ["Input", "Process", "Output"]);
  const idMap = new Map(nodes.map((node) => [node.label, node.id]));
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
    .map((line) => line.match(pattern))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      source: cleanLabel(match[1]),
      target: cleanLabel(match[2]),
      label: cleanLabel(match[3] || "")
    }))
    .filter((edge) => edge.source && edge.target);
}

function cleanLabel(value: string) {
  return value.replace(/["'`;{}()[\]]/g, "").trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(cleanLabel).filter(Boolean))).slice(0, 36);
}
