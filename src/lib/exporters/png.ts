export async function downloadSvgAsPng(svg: string, filename: string) {
  const image = new Image();
  const parsedSvg = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsedSvg.documentElement;
  if (parsedSvg.querySelector("parsererror") || root.localName !== "svg") {
    throw new Error("Unable to load SVG for PNG export.");
  }
  const viewBox = root.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (viewBox?.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0) {
    // Responsive Mermaid SVGs need concrete image dimensions outside the page.
    if (!root.hasAttribute("width") || root.getAttribute("width")?.includes("%")) root.setAttribute("width", String(Math.ceil(viewBox[2])));
    if (!root.hasAttribute("height") || root.getAttribute("height")?.includes("%")) root.setAttribute("height", String(Math.ceil(viewBox[3])));
  }
  // Chromium taints canvases for blob SVGs containing Mermaid's foreignObject labels.
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(root));

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("SVG loading timed out during PNG export.")), 10_000);
      image.onload = () => {clearTimeout(timeout); resolve();};
      image.onerror = () => {clearTimeout(timeout); reject(new Error("Unable to load SVG for PNG export."));};
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    if (!canvas.width || !canvas.height || canvas.width > 8192 || canvas.height > 8192 || canvas.width * canvas.height > 16_777_216) {
      throw new Error("The image is too large for PNG export. Download SVG or split the diagram.");
    }
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not available.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Unable to create a PNG image.")), "image/png"));
    const pngUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
  } finally {
    image.onload = null;
    image.onerror = null;
  }
}
