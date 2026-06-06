import {marked} from "marked";
import {renderMermaid} from "./mermaid";

const mermaidFencePattern = /```mermaid\s*([\s\S]*?)```/gi;

export async function renderMarkdown(source: string) {
  const blocks: string[] = [];
  const placeholderPrefix = "DIAGRAM_PREVIEW_MERMAID_BLOCK_";

  const markdownWithoutMermaid = source.replace(mermaidFencePattern, (_, code: string) => {
    const index = blocks.push(code.trim()) - 1;
    return `<div>${placeholderPrefix}${index}</div>`;
  });

  let html = await marked.parse(markdownWithoutMermaid, {
    async: true,
    gfm: true,
    breaks: false
  });

  for (let index = 0; index < blocks.length; index += 1) {
    const svg = await renderMermaid(blocks[index]);
    html = html.replace(`<div>${placeholderPrefix}${index}</div>`, `<div class="diagram-preview-output">${svg}</div>`);
  }

  return html;
}
