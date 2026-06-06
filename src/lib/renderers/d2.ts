import {escapeXml, normalizeNodeId} from "./svg";

type D2Edge = {
  from: string;
  to: string;
  label?: string;
};

export function renderD2Preview(source: string) {
  const labels = new Map<string, string>();
  const edges: D2Edge[] = [];
  const nodeOrder: string[] = [];

  const addNode = (raw: string) => {
    const id = normalizeNodeId(raw);
    if (!id) return id;
    if (!nodeOrder.includes(id)) nodeOrder.push(id);
    return id;
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    if (line.includes("->")) {
      const [chainPart, edgeLabel] = splitEdgeLabel(line);
      const parts = chainPart.split("->").map(normalizeNodeId).filter(Boolean);
      for (let index = 0; index < parts.length - 1; index += 1) {
        const from = addNode(parts[index]);
        const to = addNode(parts[index + 1]);
        if (from && to) edges.push({from, to, label: edgeLabel});
      }
      continue;
    }

    const definition = line.match(/^([^:]+):\s*(.+)$/);
    if (definition) {
      const id = addNode(definition[1]);
      if (id) labels.set(id, definition[2].trim());
      continue;
    }

    addNode(line);
  }

  if (!nodeOrder.length) {
    throw new Error("Add at least one D2 node or edge.");
  }

  const positions = layoutNodes(nodeOrder, edges);
  const width = Math.max(720, Math.max(...positions.map((node) => node.x)) + 180);
  const height = Math.max(420, Math.max(...positions.map((node) => node.y)) + 120);
  const positionMap = new Map(positions.map((node) => [node.id, node]));

  const edgeMarkup = edges
    .map((edge) => {
      const from = positionMap.get(edge.from);
      const to = positionMap.get(edge.to);
      if (!from || !to) return "";
      const startX = from.x + 132;
      const startY = from.y + 28;
      const endX = to.x;
      const endY = to.y + 28;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      return `<g>
        <path d="M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}" fill="none" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrow)" />
        ${edge.label ? `<text x="${midX}" y="${midY - 8}" text-anchor="middle" fill="#475569" font-size="12">${escapeXml(edge.label)}</text>` : ""}
      </g>`;
    })
    .join("");

  const nodeMarkup = positions
    .map((node) => {
      const label = labels.get(node.id) ?? node.id;
      return `<g>
        <rect x="${node.x}" y="${node.y}" width="132" height="56" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <rect x="${node.x}" y="${node.y}" width="132" height="5" rx="2.5" fill="#06b6d4" />
        <text x="${node.x + 66}" y="${node.y + 34}" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="700">${escapeXml(shorten(label))}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="D2 preview">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
      </marker>
    </defs>
    <rect width="100%" height="100%" rx="10" fill="#f8fafc" />
    ${edgeMarkup}
    ${nodeMarkup}
  </svg>`;
}

function splitEdgeLabel(line: string) {
  const labelIndex = line.lastIndexOf(":");
  if (labelIndex === -1 || labelIndex < line.indexOf("->")) {
    return [line, undefined] as const;
  }

  return [line.slice(0, labelIndex).trim(), line.slice(labelIndex + 1).trim()] as const;
}

function layoutNodes(nodes: string[], edges: D2Edge[]) {
  const incoming = new Map(nodes.map((node) => [node, 0]));
  const outgoing = new Map<string, string[]>();

  for (const edge of edges) {
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }

  const levels = new Map<string, number>();
  const roots = nodes.filter((node) => (incoming.get(node) ?? 0) === 0);
  const queue = roots.length ? roots : [nodes[0]];

  for (const root of queue) levels.set(root, 0);

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    const level = levels.get(node) ?? 0;
    for (const child of outgoing.get(node) ?? []) {
      const nextLevel = Math.max(levels.get(child) ?? 0, level + 1);
      levels.set(child, nextLevel);
      if (!queue.includes(child)) queue.push(child);
    }
  }

  for (const node of nodes) {
    if (!levels.has(node)) levels.set(node, levels.size);
  }

  const levelCounts = new Map<number, number>();
  return nodes.map((id) => {
    const level = levels.get(id) ?? 0;
    const row = levelCounts.get(level) ?? 0;
    levelCounts.set(level, row + 1);
    return {
      id,
      x: 48 + level * 190,
      y: 48 + row * 92
    };
  });
}

function shorten(value: string) {
  return value.length > 22 ? `${value.slice(0, 19)}...` : value;
}
