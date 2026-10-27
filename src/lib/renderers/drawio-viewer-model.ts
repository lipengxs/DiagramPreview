import type {DrawioDocument, DrawioEdge, DrawioNode} from "./drawio-utils";

export const DRAWIO_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const DRAWIO_MAX_PAGE_BYTES = 2 * 1024 * 1024;
export const DRAWIO_MAX_TOTAL_BYTES = 8 * 1024 * 1024;
export const DRAWIO_MAX_PAGES = 20;
export const DRAWIO_MAX_PAGE_CELLS = 500;
export const DRAWIO_MAX_TOTAL_CELLS = 5000;

export class DrawioViewerError extends Error {
  constructor(public code: "INVALID_XML" | "INVALID_FILE" | "LIMIT" | "COMPRESSION" | "UNSUPPORTED" | "GEOMETRY", message: string) {
    super(message);
    this.name = "DrawioViewerError";
  }
}

export type DrawioPoint = {x: number; y: number};
export type DrawioPaint = {stroke: string; color: string; strokeWidth: number; fontSize: number; dashed: boolean};
export type DrawioViewerNode = DrawioNode & DrawioPaint & {fill: string; textOnly: boolean};
export type DrawioViewerEdge = DrawioEdge & DrawioPaint & {
  points: DrawioPoint[];
  orthogonal: boolean;
  entry?: DrawioPoint;
  exit?: DrawioPoint;
};
export type DrawioViewerGraph = Omit<DrawioDocument, "nodes" | "edges"> & {nodes: DrawioViewerNode[]; edges: DrawioViewerEdge[]};
export type DrawioViewerPage = {
  id: string;
  name: string;
  compressed: boolean;
  modelXml?: string;
  graph?: DrawioViewerGraph;
  cellCount: number;
  warnings: string[];
  error?: DrawioViewerError;
};
export type DrawioViewerDocument = {pages: DrawioViewerPage[]; cellCount: number};

export function drawioPageXml(page: DrawioViewerPage) {
  if (!page.modelXml) return undefined;
  return `<mxfile host="DiagramPreview"><diagram id="${attribute(page.id)}" name="${attribute(page.name)}">${page.modelXml}</diagram></mxfile>`;
}

function attribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\r/g, "&#13;").replace(/\n/g, "&#10;");
}
