import {escapeAttr, escapeXml} from "./drawio-utils";
import type {DrawioPoint, DrawioViewerGraph, DrawioViewerNode, DrawioViewerEdge} from "./drawio-viewer-model";

export type DrawioPageImage = {svg: string; width: number; height: number};

/** Emit only our SVG vocabulary. XML markup, style strings and resource URLs never reach the preview. */
export function renderDrawioPage(graph: DrawioViewerGraph): DrawioPageImage {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const routes = graph.edges.map((edge) => route(edge, byId.get(edge.source)!, byId.get(edge.target)!));
  const points = graph.nodes.flatMap((node) => [{x: node.x, y: node.y}, {x: node.x + node.width!, y: node.y + node.height!}]).concat(routes.flat());
  graph.edges.forEach((edge, index) => {
    if (!edge.label) return;
    const middle = midpoint(routes[index]);
    points.push({x: middle.x - 140, y: middle.y - 28}, {x: middle.x + 140, y: middle.y + 8});
  });
  const minX = Math.floor((points.length ? Math.min(...points.map((point) => point.x)) : 0) - 36);
  const minY = Math.floor((points.length ? Math.min(...points.map((point) => point.y)) : 0) - 36);
  const width = Math.ceil(Math.max(240, (points.length ? Math.max(...points.map((point) => point.x)) : 0) - minX + 36));
  const height = Math.ceil(Math.max(160, (points.length ? Math.max(...points.map((point) => point.y)) : 0) - minY + 36));
  const definitions = [
    ["block", '<path d="M0 0 L9 4 L0 8 Z" fill="context-stroke"/>'],
    ["open", '<path d="M0 0 L9 4 L0 8" stroke="context-stroke" fill="none"/>'],
    ["oval", '<ellipse cx="4" cy="4" rx="4" ry="3" fill="context-stroke"/>'],
    ["cross", '<path d="M1 0 L7 8 M1 8 L7 0" stroke="context-stroke"/>']
  ].map(([kind, shape]) => `<marker id="drawio-arrow-${kind}" markerWidth="10" markerHeight="10" refX="9" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse">${shape}</marker>`).join("");
  const edgeSvg = graph.edges.map((edge, index) => {
    const points = routes[index];
    const start = edge.startArrow || "none";
    const end = edge.endArrow || "none";
    const middle = midpoint(points);
    return `<g data-cell-id="${escapeAttr(edge.id)}"><path d="${points.map((point, i) => `${i ? "L" : "M"} ${point.x} ${point.y}`).join(" ")}" fill="none" stroke="${edge.stroke}" stroke-width="${edge.strokeWidth}"${edge.dashed ? ' stroke-dasharray="6 4"' : ""}${start !== "none" ? ` marker-start="url(#drawio-arrow-${start})"` : ""}${end !== "none" ? ` marker-end="url(#drawio-arrow-${end})"` : ""}/>${label(edge.label || "", middle.x - 140, middle.y - 28, 280, 36, edge.fontSize, edge.color, true)}</g>`;
  }).join("");
  const nodeSvg = graph.nodes.map((node) => {
    const width = node.width!;
    const height = node.height!;
    const shape = node.shape === "ellipse"
      ? `<ellipse cx="${node.x + width / 2}" cy="${node.y + height / 2}" rx="${width / 2}" ry="${height / 2}"`
      : node.shape === "diamond"
        ? `<polygon points="${node.x + width / 2},${node.y} ${node.x + width},${node.y + height / 2} ${node.x + width / 2},${node.y + height} ${node.x},${node.y + height / 2}"`
        : `<rect x="${node.x}" y="${node.y}" width="${width}" height="${height}" rx="${node.shape === "rounded" ? Math.min(12, height / 4) : 0}"`;
    return `<g data-cell-id="${escapeAttr(node.id)}"><title>${escapeXml(node.label)}</title>${node.textOnly ? "" : `${shape} fill="${node.fill}" stroke="${node.stroke}" stroke-width="${node.strokeWidth}"${node.dashed ? ' stroke-dasharray="6 4"' : ""}/>`}${label(node.label, node.x, node.y, width, height, node.fontSize, node.color)}</g>`;
  }).join("");
  return {width, height, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-label="${escapeAttr(graph.title)}"><defs>${definitions}</defs><rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff"/>${edgeSvg}${nodeSvg}</svg>`};
}

function center(node: DrawioViewerNode): DrawioPoint {return {x: node.x + node.width! / 2, y: node.y + node.height! / 2};}
function boundary(node: DrawioViewerNode, toward: DrawioPoint, attachment?: DrawioPoint): DrawioPoint {
  if (attachment) return {x: node.x + node.width! * attachment.x, y: node.y + node.height! * attachment.y};
  const c = center(node);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const rx = node.width! / 2;
  const ry = node.height! / 2;
  const divisor = node.shape === "ellipse" ? Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
    : node.shape === "diamond" ? Math.abs(dx / rx) + Math.abs(dy / ry)
      : Math.max(Math.abs(dx / rx), Math.abs(dy / ry));
  return {x: c.x + dx / divisor, y: c.y + dy / divisor};
}
function route(edge: DrawioViewerEdge, source: DrawioViewerNode, target: DrawioViewerNode) {
  const a = center(source);
  const b = center(target);
  let points = edge.points;
  if (!points.length && source.id === target.id) {
    points = [{x: source.x + source.width! + 32, y: a.y}, {x: source.x + source.width! + 32, y: source.y - 32}, {x: a.x, y: source.y - 32}];
  } else if (!points.length && edge.orthogonal && a.x !== b.x && a.y !== b.y) {
    const middle = (a.x + b.x) / 2;
    points = [{x: middle, y: a.y}, {x: middle, y: b.y}];
  }
  const start = boundary(source, points.find((point) => point.x !== a.x || point.y !== a.y) || b, edge.exit);
  const end = boundary(target, [...points].reverse().find((point) => point.x !== b.x || point.y !== b.y) || a, edge.entry);
  return [start, ...points, end];
}
function midpoint(points: DrawioPoint[]) {
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = lengths.reduce((a, b) => a + b, 0) / 2;
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index]) {
      const factor = lengths[index] ? remaining / lengths[index] : 0;
      return {x: points[index].x + (points[index + 1].x - points[index].x) * factor, y: points[index].y + (points[index + 1].y - points[index].y) * factor};
    }
    remaining -= lengths[index];
  }
  return points[0];
}
function label(text: string, x: number, y: number, width: number, height: number, fontSize: number, color: string, halo = false) {
  if (!text) return "";
  const lines: string[] = [];
  for (const paragraph of text.split(/\r\n|\r|\n/)) {
    let line = "";
    let length = 0;
    for (const char of paragraph) {
      const charWidth = char.charCodeAt(0) > 255 ? fontSize : fontSize * 0.6;
      if (line && length + charWidth > Math.max(width - 16, fontSize)) {lines.push(line); line = ""; length = 0;}
      line += char;
      length += charWidth;
    }
    lines.push(line);
  }
  const size = Math.min(fontSize, Math.max(0.1, height - 8) / (lines.length * 1.25));
  const firstY = y + height / 2 - (lines.length - 1) * size * 1.25 / 2 + size * 0.35;
  return `<text text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" fill="${color}"${halo ? ' stroke="#ffffff" stroke-width="3" paint-order="stroke"' : ""}>${lines.map((line, index) => `<tspan x="${x + width / 2}" y="${firstY + index * size * 1.25}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}
