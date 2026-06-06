import {downloadText} from "./svg";

export async function downloadSvgAsPng(svg: string, filename: string) {
  const image = new Image();
  const svgBlob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
  const url = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to load SVG for PNG export."));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(image.naturalWidth, 1200);
    canvas.height = Math.max(image.naturalHeight, 800);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not available.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const pngUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = filename;
    anchor.click();
  } catch {
    downloadText(filename.replace(/\.png$/, ".svg"), svg, "image/svg+xml;charset=utf-8");
  } finally {
    URL.revokeObjectURL(url);
  }
}
