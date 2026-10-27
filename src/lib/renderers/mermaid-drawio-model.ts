import type {DrawioEdge, DrawioNode} from "./drawio-utils";

/** A snapshot of Mermaid's database; keep its version-specific API in the parser adapter. */
export type MermaidDrawioModel = {
  diagramType: "flowchart" | "sequence";
  nodes: Array<{key: string; label: string; shape?: DrawioNode["shape"]}>;
  edges: Array<{
    source: string;
    target: string;
    label: string;
    startArrow?: DrawioEdge["startArrow"];
    endArrow?: DrawioEdge["endArrow"];
    dashed?: boolean;
  }>;
  warnings: string[];
};
