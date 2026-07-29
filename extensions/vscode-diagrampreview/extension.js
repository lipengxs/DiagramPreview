const vscode = require("vscode");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("diagramPreview.previewSelection", () => previewSelection(context)),
    vscode.commands.registerCommand("diagramPreview.openSelectionInWeb", () => openSelectionInWeb("mermaid-preview")),
    vscode.commands.registerCommand("diagramPreview.convertMermaidToDrawio", () => openSelectionInWeb("mermaid-to-drawio")),
    vscode.commands.registerCommand("diagramPreview.convertPlantumlToDrawio", () => openSelectionInWeb("plantuml-to-drawio")),
    vscode.commands.registerCommand("diagramPreview.reviewDiagram", reviewDiagram)
  );
}

function deactivate() {}

async function previewSelection(context) {
  const source = selectedText();
  if (!source) return;

  const panel = vscode.window.createWebviewPanel(
    "diagramPreview",
    "DiagramPreview",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  const kind = detectKind(source);
  panel.webview.onDidReceiveMessage((message) => {
    if (message && message.type === "openInWeb") {
      void openSourceInWeb(toolForKind(kind), source);
    }
  });
  panel.webview.html = webviewHtml(source, kind, panel.webview.cspSource);
  context.subscriptions.push(panel);
}

async function openSelectionInWeb(toolSlug) {
  const source = selectedText();
  if (!source) return;

  await openSourceInWeb(toolSlug, source);
}

async function openSourceInWeb(toolSlug, source) {
  const baseUrl = vscode.workspace.getConfiguration("diagramPreview").get("webBaseUrl", "https://diagrampreview.com/en");
  const target = `${trimSlash(baseUrl)}/${toolSlug}?source=${encodeURIComponent(source)}`;
  await vscode.env.openExternal(vscode.Uri.parse(target));
}

async function reviewDiagram() {
  const source = selectedText();
  if (!source) return;

  const answer = await vscode.window.showWarningMessage(
    "AI Review opens DiagramPreview in the browser and may send the selected diagram source to a remote AI service after you submit it there.",
    {modal: true},
    "Open AI Review"
  );

  if (answer === "Open AI Review") {
    await openSelectionInWeb("mermaid-ai-fixer");
  }
}

function selectedText() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    void vscode.window.showInformationMessage("Open a file and select diagram source first.");
    return "";
  }

  const source = editor.document.getText(editor.selection).trim();

  if (!source) {
    void vscode.window.showInformationMessage("Select Mermaid, PlantUML, OpenAPI, JSON Schema, or related diagram source first.");
    return "";
  }

  return source;
}

function detectKind(source) {
  if (/^\s*@startuml/i.test(source)) return "plantuml";
  if (/^\s*(openapi|swagger)\s*:/i.test(source)) return "openapi";
  if (/^\s*[{[]/.test(source)) return looksLikeJsonSchema(source) ? "json-schema" : "json";
  if (/^\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|mindmap)\b/i.test(source)) return "mermaid";
  return "source";
}

function webviewHtml(source, kind, cspSource) {
  const escapedSource = escapeHtml(source);
  const encodedSource = JSON.stringify(source);
  const previewBlock = kind === "mermaid"
    ? `<div class="preview"><pre class="mermaid">${escapedSource}</pre></div><script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script><script nonce="diagram-preview">mermaid.initialize({startOnLoad:true,securityLevel:"strict"});</script>`
    : structuredPreview(source, kind);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-diagram-preview' https://cdn.jsdelivr.net;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DiagramPreview</title>
  <style>
    body { margin: 0; padding: 20px; color: #0f172a; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .shell { display: grid; gap: 16px; }
    .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    h1 { margin: 0; font-size: 18px; }
    .badge { border: 1px solid #bfdbfe; border-radius: 6px; color: #1d4ed8; background: #eff6ff; padding: 4px 8px; font-size: 12px; font-weight: 700; }
    .notice { border: 1px solid #e2e8f0; border-radius: 8px; background: white; padding: 12px; color: #475569; font-size: 13px; line-height: 1.6; }
    .preview, .code { min-height: 360px; overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: white; padding: 16px; }
    .code { white-space: pre-wrap; color: #e2e8f0; background: #020617; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.7; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; background: white; padding: 12px; }
    .card span { display: block; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .card strong { display: block; margin-top: 6px; font-size: 18px; color: #0f172a; }
    .list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .list li { border: 1px solid #e2e8f0; border-radius: 8px; background: white; padding: 10px; font-size: 13px; color: #334155; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    button { border: 0; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; font-weight: 700; padding: 8px 12px; }
  </style>
</head>
<body>
  <main class="shell">
    <div class="header">
      <h1>DiagramPreview selection preview</h1>
      <span class="badge">${escapeHtml(kind)}</span>
    </div>
    <div class="notice">Preview runs inside VS Code. Opening the web tool uses an encoded URL and is an explicit action. AI Review asks again before opening the remote workflow.</div>
    <div class="actions"><button type="button" id="open-web">Open in DiagramPreview</button></div>
    ${previewBlock}
  </main>
  <script nonce="diagram-preview">
    window.diagramPreviewSource = ${encodedSource};
    const vscode = acquireVsCodeApi();
    document.getElementById("open-web")?.addEventListener("click", () => vscode.postMessage({type: "openInWeb"}));
  </script>
</body>
</html>`;
}

function structuredPreview(source, kind) {
  if (kind === "plantuml") return plantUmlSummary(source);
  if (kind === "openapi") return openApiSummary(source);
  if (kind === "json-schema") return jsonSchemaSummary(source);
  return `<pre class="code">${escapeHtml(source)}</pre>`;
}

function plantUmlSummary(source) {
  const declarations = Array.from(source.matchAll(/\b(actor|participant|database|component|class|interface|queue)\s+"?([\w .-]+)"?/gi));
  const arrows = source.split(/\r?\n/).filter((line) => /[-.]+>|<[-.]+/.test(line));
  return `<div class="grid">
    ${metric("Elements", declarations.length)}
    ${metric("Connectors", arrows.length)}
    ${metric("Preview mode", "PlantUML source")}
  </div>
  <ul class="list">${declarations.slice(0, 10).map((match) => `<li><strong>${escapeHtml(match[1])}</strong> ${escapeHtml(match[2])}</li>`).join("") || "<li>No explicit declarations found. Use Open in DiagramPreview for full preview.</li>"}</ul>
  <pre class="code">${escapeHtml(source)}</pre>`;
}

function openApiSummary(source) {
  const operations = Array.from(source.matchAll(/^\s{2,}(get|post|put|patch|delete|head|options)\s*:/gim)).map((match) => match[1].toUpperCase());
  const paths = Array.from(source.matchAll(/^\s{2}(\/[^:\n]+):/gm)).map((match) => match[1]);
  const responses = Array.from(source.matchAll(/^\s{8,}["']?([245]\d\d|default)["']?\s*:/gm)).map((match) => match[1]);
  return `<div class="grid">
    ${metric("Paths", paths.length)}
    ${metric("Operations", operations.length)}
    ${metric("Responses", responses.length)}
  </div>
  <ul class="list">${paths.slice(0, 12).map((path) => `<li>${escapeHtml(path)}</li>`).join("") || "<li>No OpenAPI paths detected.</li>"}</ul>
  <pre class="code">${escapeHtml(source)}</pre>`;
}

function jsonSchemaSummary(source) {
  try {
    const schema = JSON.parse(source);
    const properties = schema && typeof schema === "object" && schema.properties && typeof schema.properties === "object" ? Object.keys(schema.properties) : [];
    const required = Array.isArray(schema.required) ? schema.required : [];
    return `<div class="grid">
      ${metric("Properties", properties.length)}
      ${metric("Required", required.length)}
      ${metric("Type", String(schema.type || "schema"))}
    </div>
    <ul class="list">${properties.slice(0, 16).map((property) => `<li>${escapeHtml(property)}${required.includes(property) ? " · required" : ""}</li>`).join("") || "<li>No properties found.</li>"}</ul>
    <pre class="code">${escapeHtml(source)}</pre>`;
  } catch {
    return `<pre class="code">${escapeHtml(source)}</pre>`;
  }
}

function metric(label, value) {
  return `<div class="card"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function looksLikeJsonSchema(source) {
  try {
    const parsed = JSON.parse(source);
    return Boolean(parsed && typeof parsed === "object" && (parsed.properties || parsed.type || parsed.$schema));
  } catch {
    return false;
  }
}

function toolForKind(kind) {
  if (kind === "plantuml") return "plantuml-preview";
  if (kind === "openapi") return "openapi-to-sequence";
  if (kind === "json-schema") return "json-schema-visualizer";
  if (kind === "mermaid") return "mermaid-preview";
  return "mermaid-preview";
}

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = {activate, deactivate};
