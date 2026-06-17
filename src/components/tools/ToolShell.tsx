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
    downloadFile: string;
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
  artifact?: {
    filename: string;
    mime: string;
    content: string;
  };
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
  const canDownloadFile = Boolean(renderState.artifact);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">{copy.samplesTitle}</span>
            {sampleButtons.map(([key, sample]) => (
              <button
                key={key}
                className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:bg-blue-50 hover:text-primary"
                onClick={() => setSource(sample.code)}
                type="button"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <ExportToolbar
            actions={copy.actions}
            canCopyHtml={canCopyHtml}
            canExportSvg={canExportSvg}
            canExportPng={canExportPng}
            canDownloadFile={canDownloadFile}
            onCopyCode={() => void copyText(source)}
            onCopyHtml={() => void copyText(renderState.html ?? "")}
            onExportSvg={() => renderState.svg && downloadText(`${tool.slug}.svg`, renderState.svg, "image/svg+xml;charset=utf-8")}
            onExportPng={() => renderState.svg && void downloadSvgAsPng(renderState.svg, `${tool.slug}.png`)}
            onDownloadFile={() =>
              renderState.artifact &&
              downloadText(renderState.artifact.filename, renderState.artifact.content, renderState.artifact.mime)
            }
            onPrint={printPreview}
            onClear={() => setSource("")}
          />
        </div>
        <div className="grid gap-5">
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
            className="min-h-[560px] border-slate-300"
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
    case "openapi": {
      const {renderOpenApiSequence} = await import("@/lib/renderers/openapi");
      const svg = await renderOpenApiSequence(source);
      return {html: svg, svg};
    }
    case "sql": {
      const {renderSqlErDiagram} = await import("@/lib/renderers/sql");
      const svg = await renderSqlErDiagram(source);
      return {html: svg, svg};
    }
    case "json-schema": {
      const {parseJsonSchemaTree} = await import("@/lib/renderers/json-schema");
      return {tree: parseJsonSchemaTree(source)};
    }
    case "xml": {
      const {parseXmlTree} = await import("@/lib/renderers/xml");
      return {tree: parseXmlTree(source)};
    }
    case "csv": {
      const {parseCsvTree} = await import("@/lib/renderers/csv");
      return {tree: parseCsvTree(source)};
    }
    case "docker-compose": {
      const {renderDockerComposeDiagram} = await import("@/lib/renderers/docker-compose");
      const svg = await renderDockerComposeDiagram(source);
      return {html: svg, svg};
    }
    case "kubernetes": {
      const {parseKubernetesManifestTree} = await import("@/lib/renderers/kubernetes");
      return {tree: parseKubernetesManifestTree(source)};
    }
    case "package-json": {
      const {renderPackageJsonDependencyDiagram} = await import("@/lib/renderers/package-json");
      const svg = await renderPackageJsonDependencyDiagram(source);
      return {html: svg, svg};
    }
    case "regex": {
      const {renderRegexRailroad} = await import("@/lib/renderers/regex");
      const svg = renderRegexRailroad(source);
      return {html: svg, svg};
    }
    case "plantuml-to-drawio": {
      const {convertPlantUmlToDrawio} = await import("@/lib/renderers/drawio-converters");
      const result = convertPlantUmlToDrawio(source);
      return {
        html: result.svg,
        svg: result.svg,
        artifact: {filename: `${copyFileName("plantuml-diagram")}.drawio`, mime: "application/xml;charset=utf-8", content: result.xml}
      };
    }
    case "mermaid-to-drawio": {
      const {convertMermaidToDrawio} = await import("@/lib/renderers/drawio-converters");
      const result = convertMermaidToDrawio(source);
      return {
        html: result.svg,
        svg: result.svg,
        artifact: {filename: `${copyFileName("mermaid-diagram")}.drawio`, mime: "application/xml;charset=utf-8", content: result.xml}
      };
    }
    case "drawio-svg": {
      const {previewDrawioAsSvg} = await import("@/lib/renderers/drawio-converters");
      const result = previewDrawioAsSvg(source);
      return {
        html: result.svg,
        svg: result.svg,
        artifact: {filename: "diagram.drawio", mime: "application/xml;charset=utf-8", content: result.xml}
      };
    }
    case "terraform": {
      const {renderTerraformArchitecture} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderTerraformArchitecture(source);
      return {html: svg, svg};
    }
    case "github-actions": {
      const {renderGithubActionsWorkflow} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderGithubActionsWorkflow(source);
      return {html: svg, svg};
    }
    case "dockerfile": {
      const {renderDockerfile} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderDockerfile(source);
      return {html: svg, svg};
    }
    case "helm-values": {
      const {parseHelmValues} = await import("@/lib/renderers/developer-diagrams");
      return {tree: parseHelmValues(source)};
    }
    case "nginx": {
      const {renderNginxConfig} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderNginxConfig(source);
      return {html: svg, svg};
    }
    case "otel-trace": {
      const {renderOpenTelemetryTrace} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderOpenTelemetryTrace(source);
      return {html: svg, svg};
    }
    case "log-sequence": {
      const {renderLogSequence} = await import("@/lib/renderers/developer-diagrams");
      const svg = await renderLogSequence(source);
      return {html: svg, svg};
    }
    case "graphql": {
      const {renderGraphqlSchema} = await import("@/lib/renderers/schema-diagrams");
      const svg = await renderGraphqlSchema(source);
      return {html: svg, svg};
    }
    case "protobuf": {
      const {renderProtobufSchema} = await import("@/lib/renderers/schema-diagrams");
      const svg = await renderProtobufSchema(source);
      return {html: svg, svg};
    }
    case "asyncapi": {
      const {renderAsyncApiEventFlow} = await import("@/lib/renderers/schema-diagrams");
      const svg = await renderAsyncApiEventFlow(source);
      return {html: svg, svg};
    }
    case "dbml": {
      const {renderDbmlErDiagram} = await import("@/lib/renderers/schema-diagrams");
      const svg = await renderDbmlErDiagram(source);
      return {html: svg, svg};
    }
    case "prisma": {
      const {renderPrismaSchema} = await import("@/lib/renderers/schema-diagrams");
      const svg = await renderPrismaSchema(source);
      return {html: svg, svg};
    }
    case "cron": {
      const {renderCronExpression} = await import("@/lib/renderers/growth-tools");
      const svg = await renderCronExpression(source);
      return {html: svg, svg};
    }
    case "jwt": {
      const {renderJwtDecoderDiagram} = await import("@/lib/renderers/growth-tools");
      const svg = await renderJwtDecoderDiagram(source);
      return {html: svg, svg};
    }
    case "api-error-flow": {
      const {renderApiErrorFlow} = await import("@/lib/renderers/growth-tools");
      const svg = await renderApiErrorFlow(source);
      return {html: svg, svg};
    }
    case "kubernetes-topology": {
      const {renderKubernetesServiceTopology} = await import("@/lib/renderers/growth-tools");
      const svg = await renderKubernetesServiceTopology(source);
      return {html: svg, svg};
    }
    case "cicd-pipeline": {
      const {renderCiCdPipeline} = await import("@/lib/renderers/growth-tools");
      const svg = await renderCiCdPipeline(source);
      return {html: svg, svg};
    }
    case "postman": {
      const {renderPostmanCollectionSequence} = await import("@/lib/renderers/growth-tools");
      const svg = await renderPostmanCollectionSequence(source);
      return {html: svg, svg};
    }
    case "har": {
      const {renderHarSequence} = await import("@/lib/renderers/growth-tools");
      const svg = await renderHarSequence(source);
      return {html: svg, svg};
    }
    case "har-timeline": {
      const {renderHarTimeline} = await import("@/lib/renderers/growth-tools");
      const html = renderHarTimeline(source);
      return {html};
    }
    case "svg-preview": {
      const {renderSvgPreview} = await import("@/lib/renderers/growth-tools");
      const result = renderSvgPreview(source);
      return {html: result.html, svg: result.svg};
    }
    case "open-graph": {
      const {renderOpenGraphPreview} = await import("@/lib/renderers/growth-tools");
      const html = renderOpenGraphPreview(source);
      return {html};
    }
    case "json-schema-form": {
      const {renderJsonSchemaFormPreview} = await import("@/lib/renderers/growth-tools");
      const html = renderJsonSchemaFormPreview(source);
      return {html};
    }
    case "jsonpath": {
      const {renderJsonPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderJsonPathTester(source);
      return {html};
    }
    case "nginx-location": {
      const {renderNginxLocationTester} = await import("@/lib/renderers/growth-tools");
      const html = renderNginxLocationTester(source);
      return {html};
    }
    case "jq-filter": {
      const {renderJqFilterTester} = await import("@/lib/renderers/growth-tools");
      const html = renderJqFilterTester(source);
      return {html};
    }
    case "xpath": {
      const {renderXPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderXPathTester(source);
      return {html};
    }
    case "yaml-path": {
      const {renderYamlPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderYamlPathTester(source);
      return {html};
    }
    case "toml": {
      const {renderTomlVisualizer} = await import("@/lib/renderers/growth-tools");
      const html = renderTomlVisualizer(source);
      return {html};
    }
    case "env-diff": {
      const {renderEnvDiffChecker} = await import("@/lib/renderers/growth-tools");
      const html = renderEnvDiffChecker(source);
      return {html};
    }
    case "robots-txt": {
      const {renderRobotsTxtTester} = await import("@/lib/renderers/growth-tools");
      const html = renderRobotsTxtTester(source);
      return {html};
    }
    case "sitemap-xml": {
      const {renderSitemapXmlViewer} = await import("@/lib/renderers/growth-tools");
      const html = renderSitemapXmlViewer(source);
      return {html};
    }
    case "http-headers": {
      const {renderHttpHeaderParser} = await import("@/lib/renderers/growth-tools");
      const html = renderHttpHeaderParser(source);
      return {html};
    }
    case "typescript": {
      const {renderTypeScriptInterface} = await import("@/lib/renderers/growth-tools");
      const svg = await renderTypeScriptInterface(source);
      return {html: svg, svg};
    }
    case "zod": {
      const {renderZodSchema} = await import("@/lib/renderers/growth-tools");
      const svg = await renderZodSchema(source);
      return {html: svg, svg};
    }
    case "cloudformation": {
      const {renderCloudFormationTemplate} = await import("@/lib/renderers/growth-tools");
      const svg = await renderCloudFormationTemplate(source);
      return {html: svg, svg};
    }
    case "c4": {
      const {renderC4Model} = await import("@/lib/renderers/growth-tools");
      const svg = await renderC4Model(source);
      return {html: svg, svg};
    }
    default:
      return {};
  }
}

function copyFileName(value: string) {
  return value.replace(/[^\w-]/g, "-");
}
