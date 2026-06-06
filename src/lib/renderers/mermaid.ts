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

  mermaid.setParseErrorHandler(() => {
    // Mermaid can otherwise write parser errors into the document body.
  });

  await mermaid.parse(source, {suppressErrors: false});

  const container = document.createElement("div");
  container.id = `${id}-container`;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  try {
    const result = await mermaid.render(id, source, container);
    return result.svg;
  } finally {
    container.remove();
    document.getElementById(id)?.remove();
  }
}
