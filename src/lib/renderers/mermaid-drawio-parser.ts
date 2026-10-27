import type {FlowDB} from "mermaid/dist/diagrams/flowchart/flowDb.js";
import type {SequenceDB} from "mermaid/dist/diagrams/sequence/sequenceDb.js";
import type {DrawioEdge, DrawioNode} from "./drawio-utils";
import type {MermaidDrawioModel} from "./mermaid-drawio-model";

// Mermaid databases are mutable singletons. Snapshot each result before another parse starts.
let parseQueue: Promise<unknown> = Promise.resolve();

export function parseMermaidForDrawio(source: string): Promise<MermaidDrawioModel> {
  const result = parseQueue.then(() => parse(source));
  parseQueue = result.catch(() => undefined);
  return result;
}

async function parse(source: string): Promise<MermaidDrawioModel> {
  if (typeof document === "undefined") {
    throw new Error("Mermaid conversion requires a browser DOM for syntax validation.");
  }
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({startOnLoad: false, securityLevel: "strict", flowchart: {htmlLabels: false}});
  mermaid.setParseErrorHandler(() => {});
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(source);
  if (diagram.type === "flowchart" || diagram.type === "flowchart-v2") {
    return snapshotFlowchart(diagram.db as FlowDB, source);
  }
  if (diagram.type === "sequence") return snapshotSequence(diagram.db as SequenceDB);
  throw new Error(`Unsupported Mermaid diagram type: ${diagram.type}. Use a flowchart or sequence diagram.`);
}

function snapshotFlowchart(db: FlowDB, source: string): MermaidDrawioModel {
  const warnings = ["Layout is regenerated; review node positions and edge routing in diagrams.net."];
  const subgraphs = db.getSubGraphs();
  const subgraphIds = new Set(subgraphs.map((group) => group.id));
  const rawEdges = db.getEdges();
  if (rawEdges.some((edge) => subgraphIds.has(edge.start) || subgraphIds.has(edge.end))) {
    throw new Error("Links to subgraph boundaries cannot be converted reliably. Connect explicit nodes instead.");
  }
  if (subgraphs.length) warnings.push("Subgraph boundaries are flattened; review grouping in diagrams.net.");
  const nodes = Array.from(db.getVertices().values()).map((node) => {
    const shape = flowShape(node.type);
    if (!shape) warnings.push("Some Mermaid node shapes are simplified to rectangles in draw.io XML.");
    if (node.link || node.haveCallback) warnings.push("Click actions and links are not preserved in draw.io XML.");
    if (node.styles.length || node.classes.length) warnings.push("Mermaid styling is not preserved in editable draw.io XML.");
    if (node.labelType === "markdown" || /<[^>]+>/.test(node.text || "")) warnings.push("Formatted labels are converted to plain text.");
    return {key: node.id, label: plainLabel(node.text ?? node.id), shape: shape ?? "rectangle"};
  });
  if (/^\s*(?:classDef|class|style|linkStyle)\b/im.test(source)) {
    warnings.push("Mermaid styling is not preserved in editable draw.io XML.");
  }
  const edges = rawEdges.map((edge) => {
    if (edge.stroke === "invisible") {
      throw new Error("Invisible Mermaid links cannot be converted reliably. Remove them before exporting.");
    }
    const arrows = flowArrows(edge.type);
    if (edge.style?.length || edge.classes.length || edge.stroke === "thick") warnings.push("Mermaid styling is not preserved in editable draw.io XML.");
    if (edge.labelType === "markdown" || /<[^>]+>/.test(edge.text)) warnings.push("Formatted labels are converted to plain text.");
    return {source: edge.start, target: edge.end, label: plainLabel(edge.text || ""), ...arrows, dashed: edge.stroke === "dotted"};
  });
  return {diagramType: "flowchart", nodes, edges, warnings: [...new Set(warnings)]};
}

function snapshotSequence(db: SequenceDB): MermaidDrawioModel {
  const warnings = ["Sequence diagrams become a relationship graph; message order and lifelines are not preserved."];
  const nodes = Array.from(db.getActors().entries()).map(([key, actor]) => ({key, label: plainLabel(actor.description || key)}));
  const edges: MermaidDrawioModel["edges"] = [];
  const basicTypes = new Set([0, 1, 3, 4, 5, 6, 24, 25, 33, 34]);
  for (const message of db.getMessages()) {
    if (message.type === 2 || !message.from || !message.to) {
      warnings.push("Sequence groups and notes are flattened; review the exported layout.");
      continue;
    }
    if (!basicTypes.has(message.type ?? -1) || message.centralConnection) {
      throw new Error("This sequence arrow type cannot be converted reliably. Use standard participant-to-participant messages.");
    }
    const type = message.type!;
    if (typeof message.message === "string" && /<[^>]+>/.test(message.message)) warnings.push("Formatted labels are converted to plain text.");
    const endArrow: DrawioEdge["endArrow"] = type === 3 || type === 4 ? "cross" : type === 5 || type === 6 ? "none" : type === 24 || type === 25 ? "open" : "block";
    edges.push({
      source: message.from, target: message.to,
      label: typeof message.message === "string" ? plainLabel(message.message) : "",
      startArrow: type === 33 || type === 34 ? "block" : "none",
      endArrow, dashed: [1, 4, 6, 25, 34].includes(type)
    });
  }
  return {diagramType: "sequence", nodes, edges, warnings: [...new Set(warnings)]};
}

function plainLabel(value: string) {
  const template = document.createElement("template");
  template.innerHTML = value.replace(/<br\s*\/?\s*>/gi, "\n");
  return template.content.textContent?.trim() || "";
}

function flowShape(type: string | undefined): DrawioNode["shape"] {
  if (!type || ["square", "rect", "rectangle"].includes(type)) return "rectangle";
  if (["round", "rounded", "stadium"].includes(type)) return "rounded";
  if (["circle", "ellipse"].includes(type)) return "ellipse";
  if (["diamond", "decision"].includes(type)) return "diamond";
  return undefined;
}

function flowArrows(type = "arrow_open"): Pick<DrawioEdge, "startArrow" | "endArrow"> {
  const marker = type.includes("circle") ? "oval" : type.includes("cross") ? "cross" : type.includes("point") ? "block" : "none";
  if (!["arrow_open", "arrow_point", "arrow_circle", "arrow_cross", "double_arrow_point", "double_arrow_circle", "double_arrow_cross"].includes(type)) {
    throw new Error(`Unsupported Mermaid arrow: ${type}. Export stopped to avoid changing its meaning.`);
  }
  return {startArrow: type.startsWith("double_") ? marker : "none", endArrow: marker};
}
