import {
  Braces,
  Boxes,
  Code2,
  FileCode2,
  FileJson,
  FileText,
  GitBranch,
  GitFork,
  Network,
  Route,
  Workflow
} from "lucide-react";

export type ToolSlug =
  | "mermaid-preview"
  | "plantuml-preview"
  | "markdown-preview"
  | "graphviz-preview"
  | "d2-preview"
  | "drawio-preview"
  | "mind-map-preview"
  | "sequence-diagram-preview"
  | "json-to-diagram"
  | "yaml-to-diagram";

export type ToolCategory = "preview" | "converter" | "developer" | "data";

export type ToolNavGroup = "preview-tools" | "converters" | "developer-diagrams" | "data-visualizers" | "ai-diagram";

export type ToolConfig = {
  slug: ToolSlug;
  category: ToolCategory;
  navGroup: ToolNavGroup;
  icon: typeof Code2;
  popular?: boolean;
  recentlyAdded?: boolean;
  priority: number;
  implemented: boolean;
  renderer:
    | "mermaid"
    | "plantuml"
    | "markdown"
    | "graphviz"
    | "d2"
    | "drawio"
    | "mindmap"
    | "json"
    | "yaml";
  sampleKeys: string[];
};

export const tools: ToolConfig[] = [
  {
    slug: "mermaid-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: Workflow,
    popular: true,
    priority: 100,
    implemented: true,
    renderer: "mermaid",
    sampleKeys: ["flowchart", "sequence", "class", "state", "gantt", "er"]
  },
  {
    slug: "plantuml-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: Route,
    popular: true,
    priority: 90,
    implemented: true,
    renderer: "plantuml",
    sampleKeys: ["sequence", "class", "usecase", "activity"]
  },
  {
    slug: "markdown-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: FileText,
    popular: true,
    priority: 85,
    implemented: true,
    renderer: "markdown",
    sampleKeys: ["docs", "mermaid", "release"]
  },
  {
    slug: "graphviz-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitFork,
    popular: true,
    priority: 72,
    implemented: true,
    renderer: "graphviz",
    sampleKeys: ["digraph", "dependency", "state"]
  },
  {
    slug: "d2-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: Boxes,
    popular: true,
    recentlyAdded: true,
    priority: 70,
    implemented: true,
    renderer: "d2",
    sampleKeys: ["architecture", "service", "sequence"]
  },
  {
    slug: "drawio-preview",
    category: "preview",
    navGroup: "preview-tools",
    icon: FileCode2,
    recentlyAdded: true,
    priority: 58,
    implemented: true,
    renderer: "drawio",
    sampleKeys: ["xml"]
  },
  {
    slug: "mind-map-preview",
    category: "developer",
    navGroup: "ai-diagram",
    icon: Network,
    popular: true,
    recentlyAdded: true,
    priority: 65,
    implemented: true,
    renderer: "mindmap",
    sampleKeys: ["outline", "product", "research"]
  },
  {
    slug: "sequence-diagram-preview",
    category: "developer",
    navGroup: "developer-diagrams",
    icon: GitBranch,
    popular: true,
    priority: 80,
    implemented: true,
    renderer: "mermaid",
    sampleKeys: ["api", "login", "payment"]
  },
  {
    slug: "json-to-diagram",
    category: "data",
    navGroup: "converters",
    icon: FileJson,
    popular: true,
    recentlyAdded: true,
    priority: 62,
    implemented: true,
    renderer: "json",
    sampleKeys: ["api", "package", "config"]
  },
  {
    slug: "yaml-to-diagram",
    category: "data",
    navGroup: "converters",
    icon: Braces,
    recentlyAdded: true,
    priority: 60,
    implemented: true,
    renderer: "yaml",
    sampleKeys: ["workflow", "kubernetes", "config"]
  }
];

export const toolSlugs = tools.map((tool) => tool.slug);

export const sortedTools = [...tools].sort((a, b) => b.priority - a.priority);

export function getToolsByGroup(group: ToolNavGroup) {
  return sortedTools.filter((tool) => tool.navGroup === group);
}

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slug: ToolSlug) {
  const tool = getTool(slug);
  if (!tool) {
    return tools.slice(0, 3);
  }

  return tools
    .filter((candidate) => candidate.slug !== slug && candidate.category === tool.category)
    .concat(tools.filter((candidate) => candidate.slug !== slug && candidate.category !== tool.category))
    .slice(0, 3);
}
