import {escapeXml} from "./svg";

type MindNode = {
  label: string;
  children: MindNode[];
};

type PositionedNode = MindNode & {
  id: number;
  depth: number;
  x: number;
  y: number;
  parentId?: number;
};

export function renderMindMap(source: string) {
  const root = parseMindMap(source);
  const positioned = positionMindMap(root);
  const width = Math.max(760, Math.max(...positioned.map((node) => node.x)) + 220);
  const height = Math.max(420, Math.max(...positioned.map((node) => node.y)) + 90);
  const nodeMap = new Map(positioned.map((node) => [node.id, node]));

  const links = positioned
    .filter((node) => node.parentId !== undefined)
    .map((node) => {
      const parent = nodeMap.get(node.parentId!);
      if (!parent) return "";
      const startX = parent.x + nodeWidth(parent);
      const startY = parent.y + 24;
      const endX = node.x;
      const endY = node.y + 24;
      const midX = (startX + endX) / 2;
      return `<path d="M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}" fill="none" stroke="#94a3b8" stroke-width="2" />`;
    })
    .join("");

  const nodes = positioned
    .map((node) => {
      const width = nodeWidth(node);
      const fill = node.depth === 0 ? "#2563eb" : node.depth === 1 ? "#ecfeff" : "#ffffff";
      const stroke = node.depth === 0 ? "#2563eb" : "#cbd5e1";
      const text = node.depth === 0 ? "#ffffff" : "#0f172a";
      return `<g>
        <rect x="${node.x}" y="${node.y}" width="${width}" height="48" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4" />
        <text x="${node.x + width / 2}" y="${node.y + 30}" text-anchor="middle" fill="${text}" font-size="13" font-weight="700">${escapeXml(shorten(node.label))}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mind map preview">
    <rect width="100%" height="100%" rx="10" fill="#f8fafc" />
    ${links}
    ${nodes}
  </svg>`;
}

function parseMindMap(source: string): MindNode {
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) {
    throw new Error("Add Markdown headings or an indented outline.");
  }

  const hasHeadings = lines.some((line) => /^#{1,6}\s+/.test(line.trim()));
  const root: MindNode = {label: "Mind map", children: []};
  const stack: Array<{level: number; node: MindNode}> = [{level: 0, node: root}];

  for (const rawLine of lines) {
    const heading = rawLine.trim().match(/^(#{1,6})\s+(.+)$/);
    const level = hasHeadings
      ? heading
        ? heading[1].length
        : 2
      : Math.floor((rawLine.match(/^\s*/)?.[0].length ?? 0) / 2) + 1;
    const label = hasHeadings ? heading?.[2]?.trim() ?? rawLine.trim() : rawLine.trim().replace(/^[-*]\s+/, "");
    const node: MindNode = {label, children: []};

    while (stack.length && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]?.node ?? root;
    parent.children.push(node);
    stack.push({level, node});
  }

  if (root.children.length === 1) {
    return root.children[0];
  }

  return root;
}

function positionMindMap(root: MindNode) {
  const positioned: PositionedNode[] = [];
  let id = 0;
  let row = 0;

  function walk(node: MindNode, depth: number, parentId?: number) {
    const currentId = id++;
    const current: PositionedNode = {
      ...node,
      id: currentId,
      depth,
      parentId,
      x: 42 + depth * 210,
      y: 36 + row * 74
    };
    positioned.push(current);

    if (!node.children.length) {
      row += 1;
      return;
    }

    const startRow = row;
    for (const child of node.children) {
      walk(child, depth + 1, currentId);
    }
    const endRow = row - 1;
    current.y = 36 + ((startRow + endRow) / 2) * 74;
  }

  walk(root, 0);
  return positioned;
}

function nodeWidth(node: {label: string; depth: number}) {
  return Math.min(180, Math.max(node.depth === 0 ? 132 : 116, node.label.length * 8 + 32));
}

function shorten(value: string) {
  return value.length > 24 ? `${value.slice(0, 21)}...` : value;
}
