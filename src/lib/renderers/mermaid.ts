let renderCount = 0;

export async function renderMermaid(source: string) {
  const mermaid = (await import("mermaid")).default;
  const id = `diagram-preview-mermaid-${Date.now()}-${renderCount++}`;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "default",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  });

  const result = await mermaid.render(id, source);
  return result.svg;
}
