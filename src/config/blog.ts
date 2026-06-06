export type BlogSlug =
  | "mermaid-preview-guide"
  | "plantuml-online-preview-workflow"
  | "markdown-mermaid-documentation"
  | "graphviz-dot-dependency-graphs"
  | "json-yaml-diagram-visualization"
  | "drawio-file-preview-guide";

export type BlogPostConfig = {
  slug: BlogSlug;
  image: string;
  date: string;
  tools: string[];
};

export const blogPosts: BlogPostConfig[] = [
  {
    slug: "mermaid-preview-guide",
    image: "/blog/mermaid-preview-guide.png",
    date: "2026-06-06",
    tools: ["mermaid-preview", "sequence-diagram-preview"]
  },
  {
    slug: "plantuml-online-preview-workflow",
    image: "/blog/plantuml-online-preview-workflow.png",
    date: "2026-06-06",
    tools: ["plantuml-preview"]
  },
  {
    slug: "markdown-mermaid-documentation",
    image: "/blog/markdown-mermaid-documentation.png",
    date: "2026-06-06",
    tools: ["markdown-preview", "mermaid-preview"]
  },
  {
    slug: "graphviz-dot-dependency-graphs",
    image: "/blog/graphviz-dot-dependency-graphs.png",
    date: "2026-06-06",
    tools: ["graphviz-preview"]
  },
  {
    slug: "json-yaml-diagram-visualization",
    image: "/blog/json-yaml-diagram-visualization.png",
    date: "2026-06-06",
    tools: ["json-to-diagram", "yaml-to-diagram"]
  },
  {
    slug: "drawio-file-preview-guide",
    image: "/blog/drawio-file-preview-guide.png",
    date: "2026-06-06",
    tools: ["drawio-preview"]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
