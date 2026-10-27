import {
  DRAWIO_MAX_FILE_BYTES, DRAWIO_MAX_PAGE_BYTES, DRAWIO_MAX_TOTAL_BYTES, DRAWIO_MAX_PAGES,
  DRAWIO_MAX_PAGE_CELLS, DRAWIO_MAX_TOTAL_CELLS, DrawioViewerError,
  type DrawioViewerDocument, type DrawioViewerPage, type DrawioViewerGraph,
  type DrawioViewerNode, type DrawioViewerEdge, type DrawioPoint
} from "./drawio-viewer-model";

const bytes = (value: string) => new TextEncoder().encode(value).byteLength;
function fail(code: DrawioViewerError["code"], message: string): never {throw new DrawioViewerError(code, message);}

function xml(source: string) {
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) fail("INVALID_XML", "DOCTYPE and entity declarations are not supported.");
  const document = new DOMParser().parseFromString(source, "application/xml");
  if (document.querySelector("parsererror")) fail("INVALID_XML", "Invalid draw.io XML. Check the file and try again.");
  return document.documentElement;
}

export async function parseDrawioDocument(source: string, signal?: AbortSignal): Promise<DrawioViewerDocument> {
  if (bytes(source) > DRAWIO_MAX_FILE_BYTES) fail("LIMIT", "The draw.io file exceeds the 2 MiB limit.");
  signal?.throwIfAborted();
  const root = xml(source);
  let diagrams: Element[];
  if (root.tagName === "mxfile") {
    diagrams = Array.from(root.children);
    if (diagrams.some((element) => element.tagName !== "diagram")) fail("INVALID_FILE", "Expected diagram pages inside mxfile.");
  } else if (root.tagName === "diagram" || root.tagName === "mxGraphModel") diagrams = [root];
  else return fail("INVALID_FILE", "Open a .drawio file containing mxfile, diagram, or mxGraphModel XML.");
  if (!diagrams.length) fail("INVALID_FILE", "This file has no diagram pages.");
  if (diagrams.length > DRAWIO_MAX_PAGES) fail("LIMIT", "The draw.io file exceeds the 20-page limit.");
  let totalBytes = 0;
  let totalCells = 0;
  const pages: DrawioViewerPage[] = [];
  for (const [index, diagram] of diagrams.entries()) {
    signal?.throwIfAborted();
    const page: DrawioViewerPage = {
      id: diagram.getAttribute("id") || `page-${index + 1}`,
      name: diagram.getAttribute("name") || `Page ${index + 1}`,
      compressed: diagram.tagName === "diagram" && !diagram.children.length,
      cellCount: 0, warnings: []
    };
    try {
      let model: Element;
      if (diagram.tagName === "mxGraphModel") model = diagram;
      else if (diagram.children.length) {
        if (diagram.children.length !== 1 || diagram.firstElementChild?.tagName !== "mxGraphModel") fail("INVALID_FILE", "A page must contain one mxGraphModel.");
        model = diagram.firstElementChild!;
      } else model = xml(await decompressPage(diagram.textContent || "", signal));
      if (model.tagName !== "mxGraphModel") fail("INVALID_FILE", "A page must contain one mxGraphModel.");
      page.modelXml = new XMLSerializer().serializeToString(model);
      const size = bytes(page.modelXml);
      totalBytes += size;
      if (size > DRAWIO_MAX_PAGE_BYTES || totalBytes > DRAWIO_MAX_TOTAL_BYTES) fail("LIMIT", "Decoded draw.io XML exceeds the 2 MiB page or 8 MiB total limit.");
      page.cellCount = model.querySelectorAll("mxCell").length;
      totalCells += page.cellCount;
      if (totalCells > DRAWIO_MAX_TOTAL_CELLS) fail("LIMIT", "The draw.io file exceeds the 5000-cell total limit.");
      if (page.cellCount > DRAWIO_MAX_PAGE_CELLS) fail("LIMIT", "This page exceeds the 500-cell preview limit.");
      page.graph = parseGraph(model, page.name, page.warnings);
    } catch (error) {
      signal?.throwIfAborted();
      if (error instanceof DrawioViewerError && error.code === "LIMIT") throw error;
      page.error = error instanceof DrawioViewerError ? error : new DrawioViewerError("COMPRESSION", "Unable to decode this draw.io page. Check the compressed data.");
    }
    pages.push(page);
  }
  return {pages, cellCount: totalCells};
}

async function decompressPage(payload: string, signal?: AbortSignal) {
  const base64 = payload.replace(/\s/g, "");
  if (!base64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) fail("COMPRESSION", "Invalid compressed draw.io page.");
  let data: Uint8Array;
  try {data = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));}
  catch {return fail("COMPRESSION", "Invalid compressed draw.io page.");}
  const stream = new Blob([new Uint8Array(data)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const abort = () => {void reader.cancel().catch(() => undefined);};
  signal?.addEventListener("abort", abort, {once: true});
  let decoded = "";
  let size = 0;
  const decoder = new TextDecoder("utf-8", {fatal: true});
  try {
    while (true) {
      signal?.throwIfAborted();
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > DRAWIO_MAX_PAGE_BYTES) fail("LIMIT", "Decoded draw.io page exceeds the 2 MiB limit.");
      decoded += decoder.decode(part.value, {stream: true});
    }
    decoded += decoder.decode();
    signal?.throwIfAborted();
    const result = decodeURIComponent(decoded);
    if (bytes(result) > DRAWIO_MAX_PAGE_BYTES) fail("LIMIT", "Decoded draw.io page exceeds the 2 MiB limit.");
    return result;
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}

function parseGraph(model: Element, title: string, warnings: string[]): DrawioViewerGraph {
  const roots = Array.from(model.children);
  if (roots.length !== 1 || roots[0].tagName !== "root") fail("INVALID_FILE", "Expected one root inside mxGraphModel.");
  const root = roots[0];
  const cells: Array<{element: Element; wrapper?: Element}> = [];
  for (const child of Array.from(root.children)) {
    if (child.tagName === "mxCell") cells.push({element: child});
    else if (["object", "UserObject"].includes(child.tagName) && child.children.length === 1 && child.firstElementChild?.tagName === "mxCell") {
      cells.push({element: child.firstElementChild, wrapper: child});
    } else fail("UNSUPPORTED", "This page contains unsupported objects. Open it in diagrams.net.");
  }
  const byId = new Map<string, Element>();
  for (const {element, wrapper} of cells) {
    const id = wrapper?.getAttribute("id") || element.getAttribute("id");
    if (!id || byId.has(id)) fail("INVALID_FILE", "Every draw.io cell needs a unique ID.");
    byId.set(id, element);
    if (element.getAttribute("visible") === "0" || element.getAttribute("collapsed") === "1") fail("UNSUPPORTED", "Hidden or collapsed cells are not supported in this basic viewer.");
    if (wrapper?.hasAttribute("link") || element.hasAttribute("link")) warnings.push("links");
  }
  const nodes: DrawioViewerNode[] = [];
  const edges: DrawioViewerEdge[] = [];
  for (const {element: cell, wrapper} of cells) {
    const vertex = cell.getAttribute("vertex") === "1";
    const edge = cell.getAttribute("edge") === "1";
    if (vertex && edge) fail("INVALID_FILE", "A cell cannot be both a node and an edge.");
    if (!vertex && !edge) {
      if (cell.querySelector("mxGeometry") || (cell.getAttribute("parent") && byId.get(cell.getAttribute("parent")!)?.getAttribute("parent"))) fail("UNSUPPORTED", "Groups and nested layers are not supported in this basic viewer.");
      continue;
    }
    const id = wrapper?.getAttribute("id") || cell.getAttribute("id")!;
    const parent = byId.get(cell.getAttribute("parent") || "");
    if (!parent || parent.getAttribute("vertex") === "1" || parent.getAttribute("edge") === "1") fail("UNSUPPORTED", "Grouped or nested objects are not supported in this basic viewer.");
    const style = parseStyle(cell.getAttribute("style") || "");
    const label = plainLabel(wrapper?.getAttribute("label") ?? cell.getAttribute("value") ?? "", style.html === "1", warnings);
    const geometries = Array.from(cell.children);
    if (geometries.length !== 1 || geometries[0].tagName !== "mxGeometry") fail("GEOMETRY", "A drawable cell must contain one mxGeometry.");
    const geometry = geometries[0];
    const paint = {
      stroke: color(style.strokeColor, "#64748b"), color: color(style.fontColor, "#0f172a"),
      strokeWidth: numeric(style.strokeWidth, 1.5, 0, 20), fontSize: numeric(style.fontSize, 13, 1, 144), dashed: style.dashed === "1"
    };
    if (vertex) {
      if (geometry.getAttribute("relative") === "1" || geometry.children.length) fail("UNSUPPORTED", "Relative node geometry and nested geometry are not supported.");
      const shape = style.shape || (style.ellipse === "1" ? "ellipse" : style.rhombus === "1" ? "rhombus" : style.text === "1" ? "text" : "rectangle");
      if (!["rectangle", "ellipse", "rhombus", "text"].includes(shape)) fail("UNSUPPORTED", "This page uses unsupported shapes, images, or stencils. Open it in diagrams.net.");
      nodes.push({id, label, ...paint, x: coordinate(geometry, "x"), y: coordinate(geometry, "y"),
        width: numeric(geometry.getAttribute("width"), 0, 1, 16000), height: numeric(geometry.getAttribute("height"), 0, 1, 16000),
        shape: shape === "ellipse" ? "ellipse" : shape === "rhombus" ? "diamond" : style.rounded === "1" ? "rounded" : "rectangle",
        textOnly: shape === "text", fill: color(style.fillColor, "#ffffff")});
    } else {
      const source = cell.getAttribute("source") || "";
      const target = cell.getAttribute("target") || "";
      if (!source || !target) fail("UNSUPPORTED", "Floating connectors without both node endpoints are not supported.");
      const points: DrawioPoint[] = [];
      for (const child of Array.from(geometry.children)) {
        if (child.tagName === "Array" && child.getAttribute("as") === "points") {
          for (const point of Array.from(child.children)) {
            if (point.tagName !== "mxPoint") fail("UNSUPPORTED", "Unsupported connector geometry.");
            points.push({x: coordinate(point, "x"), y: coordinate(point, "y")});
          }
        } else if (child.tagName === "mxPoint" && child.getAttribute("as") === "offset") warnings.push("labels");
        else fail("UNSUPPORTED", "Unsupported connector geometry. Open this page in diagrams.net.");
      }
      if (points.length > 128) fail("LIMIT", "A connector exceeds the 128-point limit.");
      if (Number(geometry.getAttribute("x") || 0) || Number(geometry.getAttribute("y") || 0)) warnings.push("labels");
      edges.push({id, label, source, target, ...paint, points,
        startArrow: arrow(style.startArrow, "none"), endArrow: arrow(style.endArrow, "block"),
        orthogonal: style.edgeStyle === "orthogonalEdgeStyle" || style.elbow === "vertical" || style.elbow === "horizontal",
        entry: attachment(style.entryX, style.entryY), exit: attachment(style.exitX, style.exitY)});
    }
  }
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) fail("GEOMETRY", "A connector refers to a missing or unsupported node.");
  const coordinates = nodes.flatMap((node) => [{x: node.x, y: node.y}, {x: node.x + node.width!, y: node.y + node.height!}]).concat(edges.flatMap((edge) => edge.points));
  if (coordinates.length && (Math.max(...coordinates.map((point) => point.x)) - Math.min(...coordinates.map((point) => point.x)) > 16000 || Math.max(...coordinates.map((point) => point.y)) - Math.min(...coordinates.map((point) => point.y)) > 16000)) fail("LIMIT", "The diagram spans more than 16000 pixels. Split it into smaller pages.");
  return {title, nodes, edges};
}

function parseStyle(value: string): Record<string, string> {
  const style: Record<string, string> = Object.create(null);
  for (const item of value.split(";").filter(Boolean)) {
    const at = item.indexOf("=");
    if (at < 0) {
      if (!["ellipse", "rhombus", "text"].includes(item)) fail("UNSUPPORTED", "Named styles, groups, and custom shapes are not supported.");
      style[item] = "1";
    } else style[item.slice(0, at)] = item.slice(at + 1);
  }
  const forbidden = ["image", "stencil", "swimlane", "group", "rotation", "flipH", "flipV", "curved", "sketch", "shapeAspect", "sourcePerimeterSpacing", "targetPerimeterSpacing"];
  if (["opacity", "fillOpacity", "strokeOpacity", "textOpacity"].some((key) => style[key] !== undefined && style[key] !== "100")) fail("UNSUPPORTED", "Transparent or hidden objects are not supported in this basic viewer.");
  if (forbidden.some((key) => style[key] && style[key] !== "0") || (style.edgeStyle && !["orthogonalEdgeStyle", "none"].includes(style.edgeStyle))) fail("UNSUPPORTED", "This page uses unsupported shapes, groups, images, rotations, or connector routing.");
  return style;
}

function plainLabel(value: string, html: boolean, warnings: string[]) {
  if (value.length > 4096) fail("LIMIT", "A label exceeds the 4096-character limit.");
  if (!html) return value;
  if (/<[^>]*>|&(?:\w+|#\w+);/.test(value)) warnings.push("labels");
  const entities: Record<string, string> = {amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " "};
  return value.replace(/<br\s*\/?\s*>|<\/(?:div|p|li)>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&([a-z]+|#\d+|#x[\da-f]+);/gi, (literal, entity: string) => {
    if (entity[0] !== "#") return entities[entity.toLowerCase()] ?? literal;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : literal;
  }).trim();
}

function numeric(value: string | null | undefined, fallback: number, min = -1_000_000, max = 1_000_000) {
  const result = value == null || value === "" ? fallback : Number(value);
  if (!Number.isFinite(result) || result < min || result > max) fail("GEOMETRY", "Invalid or oversized numeric geometry in this page.");
  return result;
}
function coordinate(element: Element, key: string) {return numeric(element.getAttribute(key), 0);}
function attachment(x?: string, y?: string) {
  if (x === undefined && y === undefined) return undefined;
  if (x === undefined || y === undefined) return fail("GEOMETRY", "A connector attachment needs both x and y.");
  return {x: numeric(x, 0, 0, 1), y: numeric(y, 0, 0, 1)};
}
function color(value: string | undefined, fallback: string) {
  if (!value || value === "default") return fallback;
  if (!/^(?:#[\da-f]{3}|#[\da-f]{6}|#[\da-f]{8}|none|transparent|black|white|red|green|blue|yellow|gray|grey|orange|purple)$/i.test(value)) fail("UNSUPPORTED", "Unsupported paint color or external resource in this page.");
  return value;
}
function arrow(value: string | undefined, fallback: DrawioViewerEdge["endArrow"]): DrawioViewerEdge["endArrow"] {
  if (!value) return fallback;
  if (value === "classic") return "block";
  if (["none", "block", "open", "oval", "cross"].includes(value)) return value as DrawioViewerEdge["endArrow"];
  return fail("UNSUPPORTED", "This page uses an unsupported arrowhead.");
}
