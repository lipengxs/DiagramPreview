export type DrawioNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type DrawioEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type DrawioDocument = {
  title: string;
  nodes: DrawioNode[];
  edges: DrawioEdge[];
};

export function createDrawioXml(document: DrawioDocument) {
  const cells = [
    `<mxCell id="0"/>`,
    `<mxCell id="1" parent="0"/>`,
    ...document.nodes.map(
      (node) =>
        `<mxCell id="${escapeAttr(node.id)}" value="${escapeAttr(node.label)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#2563eb;fontColor=#0f172a;" vertex="1" parent="1"><mxGeometry x="${node.x}" y="${node.y}" width="${node.width || 150}" height="${node.height || 56}" as="geometry"/></mxCell>`
    ),
    ...document.edges.map(
      (edge) =>
        `<mxCell id="${escapeAttr(edge.id)}" value="${escapeAttr(edge.label || "")}" style="endArrow=block;html=1;rounded=0;strokeColor=#64748b;fontColor=#475569;" edge="1" parent="1" source="${escapeAttr(edge.source)}" target="${escapeAttr(edge.target)}"><mxGeometry relative="1" as="geometry"/></mxCell>`
    )
  ];

  return `<mxfile host="DiagramPreview" modified="${new Date().toISOString()}" agent="DiagramPreview" version="22.1.0"><diagram id="diagram-preview" name="${escapeAttr(document.title)}"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="800" math="0" shadow="0"><root>${cells.join("")}</root></mxGraphModel></diagram></mxfile>`;
}

export function renderDrawioXmlToSvg(source: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(source, "application/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error(parseError.textContent || "Invalid draw.io XML.");
  }

  const model = xml.querySelector("mxGraphModel") || xml;
  const cells = Array.from(model.querySelectorAll("mxCell"));
  const nodes = cells
    .filter((cell) => cell.getAttribute("vertex") === "1")
    .map((cell) => {
      const geometry = cell.querySelector("mxGeometry");
      return {
        id: cell.getAttribute("id") || "",
        label: cell.getAttribute("value") || "",
        x: Number(geometry?.getAttribute("x") || 0),
        y: Number(geometry?.getAttribute("y") || 0),
        width: Number(geometry?.getAttribute("width") || 150),
        height: Number(geometry?.getAttribute("height") || 56)
      };
    })
    .filter((node) => node.id);

  if (!nodes.length) {
    throw new Error("No drawable mxCell vertices were found. Compressed draw.io diagrams are not supported yet.");
  }

  const edges = cells
    .filter((cell) => cell.getAttribute("edge") === "1")
    .map((cell) => ({
      id: cell.getAttribute("id") || "",
      label: cell.getAttribute("value") || "",
      source: cell.getAttribute("source") || "",
      target: cell.getAttribute("target") || ""
    }));

  return renderDrawioShapeSvg({title: "draw.io", nodes, edges});
}

export function renderDrawioShapeSvg(document: DrawioDocument) {
  const margin = 48;
  const maxX = Math.max(...document.nodes.map((node) => node.x + (node.width || 150)), 360) + margin;
  const maxY = Math.max(...document.nodes.map((node) => node.y + (node.height || 56)), 240) + margin;
  const byId = new Map(document.nodes.map((node) => [node.id, node]));

  const edgeSvg = document.edges
    .map((edge) => {
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      if (!source || !target) return "";
      const x1 = source.x + (source.width || 150) / 2;
      const y1 = source.y + (source.height || 56) / 2;
      const x2 = target.x + (target.width || 150) / 2;
      const y2 = target.y + (target.height || 56) / 2;
      const labelX = (x1 + x2) / 2;
      const labelY = (y1 + y2) / 2 - 8;
      return `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="#64748b" stroke-width="2" fill="none" marker-end="url(#arrow)"/>${
        edge.label
          ? `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="12" font-family="Inter, ui-sans-serif, system-ui" fill="#475569">${escapeXml(edge.label)}</text>`
          : ""
      }`;
    })
    .join("");

  const nodeSvg = document.nodes
    .map((node) => {
      const width = node.width || 150;
      const height = node.height || 56;
      return `<rect x="${node.x}" y="${node.y}" width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/><text x="${node.x + width / 2}" y="${node.y + height / 2 + 4}" text-anchor="middle" font-size="13" font-family="Inter, ui-sans-serif, system-ui" fill="#0f172a">${escapeXml(node.label)}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxX} ${maxY}" role="img" aria-label="${escapeAttr(document.title)} diagram">
    <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#64748b"/></marker></defs>
    <rect width="${maxX}" height="${maxY}" fill="#f8fafc"/>
    ${edgeSvg}
    ${nodeSvg}
  </svg>`;
}

export function gridLayout(labels: string[], columns = 3) {
  return labels.map((label, index) => ({
    id: safeId(label || `node_${index + 1}`),
    label: label || `Node ${index + 1}`,
    x: 60 + (index % columns) * 220,
    y: 60 + Math.floor(index / columns) * 120
  }));
}

export function safeId(value: string) {
  const id = value.replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");
  return id || "node";
}

export function escapeAttr(value: string) {
  return escapeXml(value).replace(/"/g, "&quot;");
}

export function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
