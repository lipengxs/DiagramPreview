"use client";

import {Copy, Download, ImageDown, Link2, Sparkles, Star, WandSparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/Button";
import {NextStepRecommendations} from "./NextStepRecommendations";
import {trackEvent, type AnalyticsEventName} from "@/lib/analytics";
import {downloadSvgAsPng} from "@/lib/exporters/png";
import {copyText, downloadText} from "@/lib/exporters/svg";
import {isFavoriteTool, setFavoriteTool} from "@/lib/favorite-tools";
import {recordRecentTool} from "@/lib/recent-tools";
import {renderMermaid} from "@/lib/renderers/mermaid";
import {absoluteSourceUrl} from "@/lib/source-links";

type AiDiagramWorkspaceProps = {
  locale: string;
  slug: string;
  mode:
    | "generate"
    | "text-to-mermaid"
    | "fix-mermaid"
    | "architecture"
    | "plantuml"
    | "drawio"
    | "grafana"
    | "prometheus"
    | "observability";
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
    samplesTitle: string;
    samples: Record<string, {label: string; prompt: string; code?: string; diagramType?: string}>;
  };
  sampleKeys: string[];
  relatedTools?: Array<{slug: string; name: string; description: string}>;
};

const diagramTypes = ["flowchart", "sequenceDiagram", "classDiagram", "stateDiagram-v2", "erDiagram", "gantt"];
const plantUmlDiagramTypes = ["sequence", "component", "class", "activity", "usecase", "state"];
const drawioDiagramTypes = ["architecture", "microservices", "cicd", "data-flow", "cloud", "deployment"];
const grafanaDashboardTypes = ["prometheus", "loki", "node-exporter", "api-service", "kubernetes", "database"];
const prometheusRuleTypes = ["api-service", "infrastructure", "kubernetes", "database", "queue", "slo"];
const observabilityPackTypes = ["api-service", "kubernetes", "worker", "database", "queue", "slo"];

export function AiDiagramWorkspace({locale, slug, mode, outputLanguage = "mermaid", copy, sampleKeys, relatedTools = []}: AiDiagramWorkspaceProps) {
  const statusCopy = getAiStatusCopy(locale);
  const uiCopy = getUiCopy(locale);
  const firstSample = copy.samples[sampleKeys[0]];
  const availableDiagramTypes =
    outputLanguage === "plantuml"
      ? plantUmlDiagramTypes
      : outputLanguage === "drawio"
        ? drawioDiagramTypes
          : outputLanguage === "json"
            ? grafanaDashboardTypes
            : outputLanguage === "yaml"
            ? mode === "observability"
              ? observabilityPackTypes
              : prometheusRuleTypes
            : diagramTypes;
  const [prompt, setPrompt] = useState(firstSample?.prompt ?? "");
  const [existingCode, setExistingCode] = useState(firstSample?.code ?? "");
  const [diagramType, setDiagramType] = useState(firstSample?.diagramType ?? availableDiagramTypes[0]);
  const [generatedCode, setGeneratedCode] = useState(firstSample?.code ?? "");
  const [html, setHtml] = useState("");
  const [svg, setSvg] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [fallbackErrors, setFallbackErrors] = useState<Array<{provider: string; status?: number; message: string}>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool(window.localStorage, slug);
    setFavorite(isFavoriteTool(window.localStorage, slug));
    trackEvent("tool_open", {
      tool_slug: slug,
      renderer: "ai",
      mode,
      output_language: outputLanguage,
      implemented: true
    });
  }, [mode, outputLanguage, slug]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sharedSource = url.searchParams.get("source");
    if (sharedSource) {
      setPrompt(sharedSource);
      setGeneratedCode(sharedSource);
    }
  }, []);

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
            trackRenderSuccess("image");
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
            trackRenderSuccess("svg");
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
            trackRenderSuccess("html");
          }
          return;
        }

        const nextSvg = await renderMermaid(generatedCode);
        if (!cancelled) {
          setHtml(nextSvg);
          setSvg(nextSvg);
          setImageUrl("");
          setError("");
          trackRenderSuccess("svg");
        }
      } catch (renderError) {
        if (!cancelled) {
          setHtml("");
          setSvg("");
          setImageUrl("");
          setError(renderError instanceof Error ? renderError.message : copy.error);
          trackEvent("tool_render_error", {
            tool_slug: slug,
            renderer: "ai",
            mode,
            output_language: outputLanguage
          });
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [copy.error, generatedCode, mode, outputLanguage, slug]);

  async function generate() {
    setLoading(true);
    setError("");
    setProvider("");
    setFallbackErrors([]);
    trackEvent("ai_generate_start", {
      tool_slug: slug,
      mode,
      output_language: outputLanguage,
      diagram_type: diagramType
    });

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

      const responseText = await response.text();
      const data = parseGenerateResponse(responseText);

      if (!response.ok || !data.code) {
        setFallbackErrors(data.fallbackErrors || data.providers || []);
        throw new Error(formatAiError(data.error || responseText || copy.error, data.providers || [], statusCopy));
      }

      setGeneratedCode(data.code);
      setProvider(data.provider || "");
      setFallbackErrors(data.fallbackErrors || []);
      trackEvent("ai_generate_success", {
        tool_slug: slug,
        mode,
        output_language: outputLanguage,
        provider: data.provider || "unknown"
      });
      showToast(uiCopy.generated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : copy.error);
      trackEvent("ai_generate_error", {
        tool_slug: slug,
        mode,
        output_language: outputLanguage
      });
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
          <span className="text-sm font-semibold text-slate-700">{copy.samplesTitle}</span>
          {sampleButtons.map(([key, sample]) => (
            <button
              key={key}
              className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:bg-blue-50 hover:text-primary"
              type="button"
              onClick={() => {
                trackEvent("tool_sample_load", {
                  tool_slug: slug,
                  sample_key: key
                });
                setPrompt(sample.prompt);
                setExistingCode(sample.code ?? "");
                setGeneratedCode(sample.code ?? "");
                setDiagramType(sample.diagramType ?? availableDiagramTypes[0]);
                setProvider("");
                setFallbackErrors([]);
                setError("");
              }}
            >
              {sample.label}
            </button>
          ))}
          <Button
            type="button"
            className="ml-auto"
            onClick={() => {
              const nextFavorite = !favorite;
              setFavorite(nextFavorite);
              setFavoriteTool(window.localStorage, slug, nextFavorite);
              trackEvent(nextFavorite ? "tool_favorite_add" : "tool_favorite_remove", {tool_slug: slug});
              showToast(nextFavorite ? uiCopy.favoriteAdded : uiCopy.favoriteRemoved);
            }}
          >
            <Star className={favorite ? "h-4 w-4 fill-amber-400 text-amber-500" : "h-4 w-4"} />
            {favorite ? uiCopy.favorited : uiCopy.favorite}
          </Button>
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
            <Button onClick={() => void runAction(copy.copyCode, "tool_copy_code", () => copyText(generatedCode))} disabled={!generatedCode}>
              <Copy className="h-4 w-4" />
              {copy.copyCode}
            </Button>
            <Button onClick={() => svg && void runAction(copy.exportSvg, "tool_export_svg", () => downloadText(`${slug}.svg`, svg, "image/svg+xml;charset=utf-8"))} disabled={!svg}>
              <Download className="h-4 w-4" />
              {copy.exportSvg}
            </Button>
            <Button onClick={() => svg && void runAction(copy.exportPng, "tool_export_png", () => downloadSvgAsPng(svg, `${slug}.png`))} disabled={!svg}>
              <ImageDown className="h-4 w-4" />
              {copy.exportPng}
            </Button>
            <Button onClick={() => void runAction(copy.downloadFile, "tool_download_file", () => downloadText(fileNameFor(slug, outputLanguage), generatedCode, mimeFor(outputLanguage)))} disabled={!generatedCode}>
              <Download className="h-4 w-4" />
              {copy.downloadFile}
            </Button>
            <Button onClick={() => void runAction(uiCopy.shareLink, "tool_share_link", () => copyText(absoluteSourceUrl(window.location.origin, window.location.pathname, generatedCode || prompt)))} disabled={!generatedCode && !prompt}>
              <Link2 className="h-4 w-4" />
              {uiCopy.shareLink}
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
                  {copy.providerLabel}: {providerLabel(provider, statusCopy)}
                </span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-gradient-to-b from-white to-surface p-4">
              {fallbackErrors.length ? <FallbackNotice errors={fallbackErrors} copy={statusCopy} /> : null}
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
          <NextStepRecommendations
            relatedTools={relatedTools}
            title={uiCopy.nextTitle}
            description={uiCopy.nextDescription}
            actionLabel={uiCopy.nextAction}
            currentSlug={slug}
          />
        </div>
      </div>
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50">
        {toast ? <div className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div> : null}
      </div>
    </section>
  );

  function trackRenderSuccess(kind: string) {
    trackEvent("tool_render_success", {
      tool_slug: slug,
      renderer: "ai",
      mode,
      output_language: outputLanguage,
      preview_kind: kind
    });
  }

  async function runAction(label: string, eventName: AnalyticsEventName, action: () => void | Promise<void>) {
    try {
      await action();
      trackEvent(eventName, {
        tool_slug: slug,
        renderer: "ai",
        success: true
      });
      showToast(successMessage(label, locale));
    } catch {
      trackEvent(eventName, {
        tool_slug: slug,
        renderer: "ai",
        success: false
      });
      showToast(failureMessage(label, locale));
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }
}

function getUiCopy(locale: string) {
  return locale.startsWith("zh")
    ? {
        favorite: "收藏",
        favorited: "已收藏",
        favoriteAdded: "已加入收藏",
        favoriteRemoved: "已取消收藏",
        generated: "生成完成",
        shareLink: "分享链接",
        nextTitle: "下一步可以继续",
        nextDescription: "把生成结果带到相关工具里继续预览、转换或排查。",
        nextAction: "打开"
      }
    : {
        favorite: "Favorite",
        favorited: "Favorited",
        favoriteAdded: "Added to favorites",
        favoriteRemoved: "Removed from favorites",
        generated: "Generated",
        shareLink: "Share link",
        nextTitle: "Continue with a related tool",
        nextDescription: "Move this output into a nearby workflow for preview, conversion, or debugging.",
        nextAction: "Open"
      };
}

function successMessage(label: string, locale: string) {
  return locale.startsWith("zh") ? `已完成：${label}` : `${label} done`;
}

function failureMessage(label: string, locale: string) {
  return locale.startsWith("zh") ? `操作失败：${label}` : `${label} failed`;
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

function parseGenerateResponse(value: string) {
  try {
    return JSON.parse(value) as {
      code?: string;
      provider?: string;
      error?: string;
      fallbackErrors?: Array<{provider: string; status?: number; message: string}>;
      providers?: Array<{provider: string; status?: number; message: string}>;
    };
  } catch {
    return {error: value};
  }
}

function FallbackNotice({
  errors,
  copy
}: {
  errors: Array<{provider: string; status?: number; message: string}>;
  copy: ReturnType<typeof getAiStatusCopy>;
}) {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <div className="font-semibold">{copy.fallbackTitle}</div>
      <ul className="mt-2 grid gap-1">
        {errors.map((item) => (
          <li key={`${item.provider}-${item.status || "unknown"}`}>
            <span className="font-semibold">{providerLabel(item.provider, copy)}</span>
            {item.status ? ` · ${item.status}` : ""}: {summarizeAiProviderMessage(item.message, copy)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getAiStatusCopy(locale: string) {
  if (locale.startsWith("zh")) {
    return {
      fallbackTitle: "已启用备用生成路径",
      genericError: "AI 生成暂时不可用，请稍后重试，或检查服务端 API Key、额度和模型配置。",
      missingKey: "未配置 API Key",
      quota: "额度或限流问题",
      auth: "认证失败",
      deepseek: "DeepSeek",
      local: "本地兜底"
    };
  }

  return {
    fallbackTitle: "Fallback generation path used",
    genericError: "AI generation is temporarily unavailable. Try again later, or check server API keys, quota, and model settings.",
    missingKey: "API key is not configured",
    quota: "quota or rate limit issue",
    auth: "authentication failed",
    deepseek: "DeepSeek",
    local: "local fallback"
  };
}

function providerLabel(provider: string, copy: ReturnType<typeof getAiStatusCopy>) {
  if (provider === "deepseek") return copy.deepseek;
  if (provider === "local") return copy.local;
  return provider;
}

function formatAiError(
  error: string,
  providers: Array<{provider: string; status?: number; message: string}>,
  copy: ReturnType<typeof getAiStatusCopy>
) {
  if (!providers.length) return error || copy.genericError;
  return `${copy.genericError} ${providers
    .map((providerError) => `${providerLabel(providerError.provider, copy)}: ${summarizeAiProviderMessage(providerError.message, copy)}`)
    .join(" / ")}`;
}

function summarizeAiProviderMessage(message: string, copy: ReturnType<typeof getAiStatusCopy>) {
  if (/not configured|api key/i.test(message)) return copy.missingKey;
  if (/quota|rate.?limit|429|resource_exhausted/i.test(message)) return copy.quota;
  if (/unauthorized|forbidden|permission|401|403/i.test(message)) return copy.auth;
  return message.replace(/\s+/g, " ").slice(0, 180);
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
