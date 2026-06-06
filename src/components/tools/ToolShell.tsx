"use client";

import {useEffect, useMemo, useState} from "react";
import {CodeEditor} from "./CodeEditor";
import {ExportToolbar} from "./ExportToolbar";
import {PreviewPane} from "./PreviewPane";
import {ToolSettings} from "./ToolSettings";
import {downloadSvgAsPng} from "@/lib/exporters/png";
import {printPreview} from "@/lib/exporters/pdf";
import {copyText, downloadText} from "@/lib/exporters/svg";
import type {TreeNode} from "@/lib/renderers/tree";
import type {ToolConfig, ToolSlug} from "@/config/tools";

export type ToolCopy = {
  inputLabel: string;
  outputLabel: string;
  placeholder: string;
  emptyPreview: string;
  samplesTitle: string;
  statusReady: string;
  statusRendering: string;
  renderError: string;
  fallbackTitle: string;
  fallbackBody: string;
  treeHint: string;
  actions: {
    copyCode: string;
    copyHtml: string;
    exportSvg: string;
    exportPng: string;
    exportPdf: string;
    clear: string;
    loadSample: string;
  };
  settings: {
    settings: string;
    theme: string;
    layout: string;
    zoom: string;
    background: string;
    themeLight: string;
    layoutSplit: string;
    zoomDefault: string;
    backgroundWhite: string;
  };
  drawioSummary: {
    pages: string;
    objects: string;
    pageNames: string;
    defaultPage: string;
    none: string;
  };
  samples: Record<string, {label: string; code: string}>;
};

type ToolShellProps = {
  tool: ToolRuntimeConfig;
  copy: ToolCopy;
};

export type ToolRuntimeConfig = {
  slug: ToolSlug;
  implemented: boolean;
  renderer: ToolConfig["renderer"];
  sampleKeys: string[];
};

type RenderState = {
  html?: string;
  imageUrl?: string;
  tree?: TreeNode;
  svg?: string;
  error?: string;
};

export function ToolShell({tool, copy}: ToolShellProps) {
  const firstSample = useMemo(() => copy.samples[tool.sampleKeys[0]], [copy.samples, tool.sampleKeys]);
  const [source, setSource] = useState(firstSample?.code ?? "");
  const [status, setStatus] = useState(copy.statusReady);
  const [renderState, setRenderState] = useState<RenderState>({});

  useEffect(() => {
    if (!source.trim()) {
      setRenderState({});
      setStatus(copy.statusReady);
      return;
    }

    let cancelled = false;
    setStatus(copy.statusRendering);

    const timeout = window.setTimeout(async () => {
      try {
        const nextState = await renderSource(tool.renderer, source, copy);
        if (!cancelled) {
          setRenderState(nextState);
          setStatus(copy.statusReady);
        }
      } catch (error) {
        if (!cancelled) {
          setRenderState({
            error: error instanceof Error && error.message ? error.message : copy.renderError
          });
          setStatus(copy.statusReady);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [copy.renderError, copy.statusReady, copy.statusRendering, source, tool.renderer]);

  const sampleButtons = tool.sampleKeys
    .map((key) => [key, copy.samples[key]] as const)
    .filter(([, sample]) => Boolean(sample));

  const fallback = tool.implemented
    ? undefined
    : {
        title: copy.fallbackTitle,
        body: copy.fallbackBody
      };

  const canCopyHtml = Boolean(renderState.html);
  const canExportSvg = Boolean(renderState.svg);
  const canExportPng = Boolean(renderState.svg);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4">
        <ExportToolbar
          actions={copy.actions}
          canCopyHtml={canCopyHtml}
          canExportSvg={canExportSvg}
          canExportPng={canExportPng}
          onCopyCode={() => void copyText(source)}
          onCopyHtml={() => void copyText(renderState.html ?? "")}
          onExportSvg={() => renderState.svg && downloadText(`${tool.slug}.svg`, renderState.svg, "image/svg+xml;charset=utf-8")}
          onExportPng={() => renderState.svg && void downloadSvgAsPng(renderState.svg, `${tool.slug}.png`)}
          onPrint={printPreview}
          onClear={() => setSource("")}
        />
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
          <span className="text-sm font-semibold text-slate-700">{copy.samplesTitle}</span>
          {sampleButtons.map(([key, sample]) => (
            <button
              key={key}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:bg-blue-50 hover:text-primary"
              onClick={() => setSource(sample.code)}
              type="button"
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeEditor label={copy.inputLabel} value={source} placeholder={copy.placeholder} onChange={setSource} />
          <PreviewPane
            label={copy.outputLabel}
            status={status}
            emptyText={copy.emptyPreview}
            error={renderState.error}
            html={renderState.html}
            imageUrl={renderState.imageUrl}
            tree={renderState.tree}
            fallback={fallback}
          />
        </div>
        <ToolSettings labels={copy.settings} />
      </div>
    </section>
  );
}

async function renderSource(renderer: ToolRuntimeConfig["renderer"], source: string, copy: ToolCopy): Promise<RenderState> {
  switch (renderer) {
    case "mermaid": {
      const {renderMermaid} = await import("@/lib/renderers/mermaid");
      const svg = await renderMermaid(source);
      return {html: svg, svg};
    }
    case "markdown": {
      const {renderMarkdown} = await import("@/lib/renderers/markdown");
      const html = await renderMarkdown(source);
      return {html};
    }
    case "graphviz": {
      const {renderGraphviz} = await import("@/lib/renderers/graphviz");
      const svg = await renderGraphviz(source);
      return {html: svg, svg};
    }
    case "d2": {
      const {renderD2Preview} = await import("@/lib/renderers/d2");
      const svg = renderD2Preview(source);
      return {html: svg, svg};
    }
    case "mindmap": {
      const {renderMindMap} = await import("@/lib/renderers/mindmap");
      const svg = renderMindMap(source);
      return {html: svg, svg};
    }
    case "plantuml": {
      const {plantUmlSvgUrl} = await import("@/lib/renderers/plantuml");
      return {imageUrl: plantUmlSvgUrl(source)};
    }
    case "json": {
      const {parseJsonTree} = await import("@/lib/renderers/tree");
      return {tree: parseJsonTree(source)};
    }
    case "yaml": {
      const {parseYamlTree} = await import("@/lib/renderers/tree");
      return {tree: parseYamlTree(source)};
    }
    case "drawio": {
      const {parseDrawioSummary} = await import("@/lib/renderers/drawio");
      return {tree: parseDrawioSummary(source, copy.drawioSummary)};
    }
    default:
      return {};
  }
}
