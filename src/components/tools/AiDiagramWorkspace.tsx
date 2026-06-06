"use client";

import {Copy, Download, ImageDown, Sparkles, WandSparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/Button";
import {downloadSvgAsPng} from "@/lib/exporters/png";
import {copyText, downloadText} from "@/lib/exporters/svg";
import {renderMermaid} from "@/lib/renderers/mermaid";

type AiDiagramWorkspaceProps = {
  slug: string;
  mode: "generate" | "text-to-mermaid" | "fix-mermaid" | "architecture" | "plantuml" | "drawio" | "grafana" | "prometheus";
  outputLanguage?: "mermaid" | "plantuml" | "drawio" | "json" | "yaml";
  copy: {
    promptLabel: string;
    promptPlaceholder: string;
    existingCodeLabel: string;
    existingCodePlaceholder: string;
    diagramTypeLabel: string;
    generateButton: string;
    generatedCodeLabel: string;
    previewLabel: string;
    providerLabel: string;
    emptyPreview: string;
    copyCode: string;
    exportSvg: string;
    exportPng: string;
    downloadFile: string;
    error: string;
    samples: Record<string, {label: string; prompt: string; code?: string; diagramType?: string}>;
  };
  sampleKeys: string[];
};

const diagramTypes = ["flowchart", "sequenceDiagram", "classDiagram", "stateDiagram-v2", "erDiagram", "gantt"];
const plantUmlDiagramTypes = ["sequence", "component", "class", "activity", "usecase", "state"];
const drawioDiagramTypes = ["architecture", "microservices", "cicd", "data-flow", "cloud", "deployment"];
const grafanaDashboardTypes = ["prometheus", "loki", "node-exporter", "api-service", "kubernetes", "database"];
const prometheusRuleTypes = ["api-service", "infrastructure", "kubernetes", "database", "queue", "slo"];

export function AiDiagramWorkspace({slug, mode, outputLanguage = "mermaid", copy, sampleKeys}: AiDiagramWorkspaceProps) {
  const firstSample = copy.samples[sampleKeys[0]];
  const availableDiagramTypes =
    outputLanguage === "plantuml"
      ? plantUmlDiagramTypes
      : outputLanguage === "drawio"
        ? drawioDiagramTypes
        : outputLanguage === "json"
          ? grafanaDashboardTypes
          : outputLanguage === "yaml"
            ? prometheusRuleTypes
            : diagramTypes;
  const [prompt, setPrompt] = useState(firstSample?.prompt ?? "");
  const [existingCode, setExistingCode] = useState(firstSample?.code ?? "");
  const [diagramType, setDiagramType] = useState(firstSample?.diagramType ?? availableDiagramTypes[0]);
  const [generatedCode, setGeneratedCode] = useState(firstSample?.code ?? "");
  const [html, setHtml] = useState("");
  const [svg, setSvg] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!generatedCode.trim()) {
        setHtml("");
        setSvg("");
        setImageUrl("");
        return;
      }

      try {
        if (outputLanguage === "plantuml") {
          const {plantUmlSvgUrl} = await import("@/lib/renderers/plantuml");
          if (!cancelled) {
            setHtml("");
            setSvg("");
            setImageUrl(plantUmlSvgUrl(generatedCode));
            setError("");
          }
          return;
        }

        if (outputLanguage === "drawio") {
          const {previewDrawioAsSvg} = await import("@/lib/renderers/drawio-converters");
          const result = previewDrawioAsSvg(generatedCode);
          if (!cancelled) {
            setHtml(result.svg);
            setSvg(result.svg);
            setImageUrl("");
            setError("");
          }
          return;
        }

        if (outputLanguage === "json" || outputLanguage === "yaml") {
          const nextHtml =
            outputLanguage === "json"
              ? renderJsonSummary(generatedCode)
              : await renderYamlSummary(generatedCode);
          if (!cancelled) {
            setHtml(nextHtml);
            setSvg("");
            setImageUrl("");
            setError("");
          }
          return;
        }

        const nextSvg = await renderMermaid(generatedCode);
        if (!cancelled) {
          setHtml(nextSvg);
          setSvg(nextSvg);
          setImageUrl("");
          setError("");
        }
      } catch (renderError) {
        if (!cancelled) {
          setHtml("");
          setSvg("");
          setImageUrl("");
          setError(renderError instanceof Error ? renderError.message : copy.error);
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [copy.error, generatedCode, outputLanguage]);

  async function generate() {
    setLoading(true);
    setError("");
    setProvider("");

    try {
      const response = await fetch("/api/ai/generate-diagram", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          mode,
          diagramType,
          prompt,
          existingCode,
          outputLanguage
        })
      });

      const data = (await response.json()) as {code?: string; provider?: string; error?: string};

      if (!response.ok || !data.code) {
        throw new Error(data.error || copy.error);
      }

      setGeneratedCode(data.code);
      setProvider(data.provider || "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : copy.error);
    } finally {
      setLoading(false);
    }
  }

  const sampleButtons = sampleKeys
    .map((key) => [key, copy.samples[key]] as const)
    .filter(([, sample]) => Boolean(sample));

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <span className="text-sm font-semibold text-slate-700">Examples</span>
          {sampleButtons.map(([key, sample]) => (
            <button
              key={key}
              className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:bg-blue-50 hover:text-primary"
              type="button"
              onClick={() => {
                setPrompt(sample.prompt);
                setExistingCode(sample.code ?? "");
                setGeneratedCode(sample.code ?? "");
                setDiagramType(sample.diagramType ?? availableDiagramTypes[0]);
                setProvider("");
                setError("");
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div>
              <label className="text-sm font-semibold text-ink" htmlFor={`${slug}-diagram-type`}>
                {copy.diagramTypeLabel}
              </label>
              <select
                id={`${slug}-diagram-type`}
                value={diagramType}
                onChange={(event) => setDiagramType(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
              >
                {availableDiagramTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex min-h-56 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
              <span className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-ink">{copy.promptLabel}</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={copy.promptPlaceholder}
                className="min-h-0 flex-1 resize-none p-4 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            {mode === "fix-mermaid" ? (
              <label className="flex min-h-56 flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                <span className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200">
                  {copy.existingCodeLabel}
                </span>
                <textarea
                  value={existingCode}
                  onChange={(event) => setExistingCode(event.target.value)}
                  placeholder={copy.existingCodePlaceholder}
                  spellCheck={false}
                  className="min-h-0 flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
                />
              </label>
            ) : null}

            <Button variant="primary" className="w-full sm:w-auto" onClick={generate} disabled={loading}>
              {loading ? <Sparkles className="h-4 w-4 animate-pulse" /> : <WandSparkles className="h-4 w-4" />}
              {copy.generateButton}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <Button onClick={() => void copyText(generatedCode)} disabled={!generatedCode}>
              <Copy className="h-4 w-4" />
              {copy.copyCode}
            </Button>
            <Button onClick={() => svg && downloadText(`${slug}.svg`, svg, "image/svg+xml;charset=utf-8")} disabled={!svg}>
              <Download className="h-4 w-4" />
              {copy.exportSvg}
            </Button>
            <Button onClick={() => svg && void downloadSvgAsPng(svg, `${slug}.png`)} disabled={!svg}>
              <ImageDown className="h-4 w-4" />
              {copy.exportPng}
            </Button>
            <Button onClick={() => downloadText(fileNameFor(slug, outputLanguage), generatedCode, mimeFor(outputLanguage))} disabled={!generatedCode}>
              <Download className="h-4 w-4" />
              {copy.downloadFile}
            </Button>
          </div>

          <label className="flex min-h-72 flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            <span className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200">
              {copy.generatedCodeLabel}
            </span>
            <textarea
              value={generatedCode}
              onChange={(event) => setGeneratedCode(event.target.value)}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>

          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-ink">{copy.previewLabel}</span>
              {provider ? (
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-primary">
                  {copy.providerLabel}: {provider}
                </span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-gradient-to-b from-white to-surface p-4">
              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>
              ) : imageUrl ? (
                <div className="flex h-full min-h-[480px] items-center justify-center">
                  <img src={imageUrl} alt={copy.previewLabel} className="max-h-full max-w-full" />
                </div>
              ) : html ? (
                <div className="diagram-preview-output" dangerouslySetInnerHTML={{__html: html}} />
              ) : (
                <div className="flex h-full min-h-[480px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {copy.emptyPreview}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function fileNameFor(slug: string, outputLanguage: NonNullable<AiDiagramWorkspaceProps["outputLanguage"]>) {
  if (outputLanguage === "drawio") return `${slug}.drawio`;
  if (outputLanguage === "json") return `${slug}.json`;
  if (outputLanguage === "yaml") return `${slug}.yaml`;
  if (outputLanguage === "plantuml") return `${slug}.puml`;
  return `${slug}.mmd`;
}

function mimeFor(outputLanguage: NonNullable<AiDiagramWorkspaceProps["outputLanguage"]>) {
  if (outputLanguage === "drawio") return "application/xml;charset=utf-8";
  if (outputLanguage === "json") return "application/json;charset=utf-8";
  if (outputLanguage === "yaml") return "application/yaml;charset=utf-8";
  return "text/plain;charset=utf-8";
}

function renderJsonSummary(source: string) {
  const parsed = JSON.parse(source) as Record<string, unknown>;
  return renderObjectPreview("Grafana dashboard JSON", parsed);
}

async function renderYamlSummary(source: string) {
  const yaml = await import("js-yaml");
  const parsed = yaml.load(source) as Record<string, unknown>;
  return renderObjectPreview("Prometheus alert rules YAML", parsed);
}

function renderObjectPreview(title: string, value: unknown) {
  const summary = summarize(value);
  return `<div class="grid gap-4"><div class="rounded-lg border border-slate-200 bg-white p-4"><div class="text-sm font-semibold text-slate-900">${escapeHtml(
    title
  )}</div><div class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(summary)}</div></div><pre class="overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">${escapeHtml(
    JSON.stringify(value, null, 2)
  )}</pre></div>`;
}

function summarize(value: unknown) {
  if (!value || typeof value !== "object") return "Generated source is valid and ready to download.";
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.panels)) return `${record.panels.length} Grafana panels, title: ${String(record.title || "Untitled")}`;
  if (Array.isArray(record.groups)) return `${record.groups.length} Prometheus rule groups generated.`;
  return `Top-level keys: ${Object.keys(record).slice(0, 12).join(", ")}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
