import {createDrawioXml, gridLayout, renderDrawioShapeSvg, renderDrawioXmlToSvg, safeId, type DrawioDocument} from "./drawio-utils";
import type {MermaidDrawioModel} from "./mermaid-drawio-model";

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
  const {parseMermaidForDrawio} = await import("./mermaid-drawio-parser");
  return convertMermaidModelToDrawio(await parseMermaidForDrawio(source));
}

export function convertMermaidModelToDrawio(model: MermaidDrawioModel): DrawioConversionResult {
  if (!model.nodes.length) throw new Error("No supported Mermaid nodes or participants were found.");
  if (model.nodes.length > 36 || model.edges.length > 40) {
    throw new Error(`Conversion stopped: ${model.nodes.length} nodes and ${model.edges.length} relationships exceed the supported limit of 36 nodes / 40 relationships. Split the diagram; no partial file was generated.`);
  }
  const keys = model.nodes.map((node) => node.key);
  if (new Set(keys).size !== keys.length) throw new Error("Duplicate Mermaid node IDs; export stopped.");
  const nodes = gridLayout(model.nodes.map((node) => node.label)).map((node, index) => ({...node, label: model.nodes[index].label, shape: model.nodes[index].shape}));
  const idMap = new Map(keys.map((key, index) => [key, nodes[index].id]));
  const document: DrawioDocument = {
    title: "Mermaid to Draw.io",
    nodes,
    edges: model.edges.map((edge, index) => {
      const source = idMap.get(edge.source);
      const target = idMap.get(edge.target);
      if (!source || !target) throw new Error("A Mermaid relationship has an unresolved endpoint; export stopped.");
      return {...edge, id: `edge_${index + 1}`, source, target};
    })
  };
  return {
    xml: createDrawioXml(document),
    svg: renderDrawioShapeSvg(document),
    diagramType: model.diagramType,
    stats: {nodes: nodes.length, edges: document.edges.length},
    warnings: model.warnings
  };
}

export function previewDrawioAsSvg(source: string): DrawioConversionResult {
  return {xml: source, svg: renderDrawioXmlToSvg(source), diagramType: "drawio", stats: {nodes: 0, edges: 0}, warnings: []};
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
