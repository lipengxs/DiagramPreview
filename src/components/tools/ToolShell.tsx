"use client";

import {Star} from "lucide-react";
import dynamic from "next/dynamic";
import {useEffect, useMemo, useState} from "react";
import {CodeEditor} from "./CodeEditor";
import {ExportToolbar} from "./ExportToolbar";
import {NextStepRecommendations} from "./NextStepRecommendations";
import {PreviewPane} from "./PreviewPane";
import {AiReviewPanel} from "./AiReviewPanel";
import {BatchConversionBeta} from "./BatchConversionBeta";
import {WaitlistCta} from "@/components/growth/WaitlistCta";
import type {MonetizationIntent} from "@/components/growth/WaitlistCta";
import {Button} from "@/components/ui/Button";
import {detectInputTool} from "@/lib/input-detector";
import {downloadSvgAsPng} from "@/lib/exporters/png";
import {printPreview} from "@/lib/exporters/pdf";
import {copyText, downloadText} from "@/lib/exporters/svg";
import {absoluteSourceUrl, markdownSnippet} from "@/lib/source-links";
import {recordRecentTool} from "@/lib/recent-tools";
import {isFavoriteTool, setFavoriteTool} from "@/lib/favorite-tools";
import {trackEvent, type AnalyticsEventName} from "@/lib/analytics";
import {
  readWorkspaceDraft,
  recordConversionHistory,
  recordExportHistory,
  recordWorkspaceDraft,
  removeWorkspaceDraft,
  type WorkspaceHistoryEntry
} from "@/lib/workspace-history";
import type {TreeNode} from "@/lib/renderers/tree";
import type {ToolConfig, ToolSlug} from "@/config/tools";
import type {RJSFSchema} from "@rjsf/utils";
import {Link} from "@/i18n/navigation";

const JsonSchemaFormPreview = dynamic(
  () => import("./JsonSchemaFormPreview").then((module) => module.JsonSchemaFormPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-80 items-center justify-center rounded-md border border-dashed border-slate-300 bg-surface p-6 text-center text-sm text-slate-500">
        Loading form preview...
      </div>
    )
  }
);

export type ToolCopy = {
  locale?: string;
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
    copyMarkdown?: string;
    shareLink?: string;
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
  relatedTools?: Array<{slug: string; name: string; description: string}>;
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
  formSchema?: RJSFSchema;
  error?: string;
};

export function ToolShell({tool, copy, relatedTools = []}: ToolShellProps) {
  const firstSample = useMemo(() => copy.samples[tool.sampleKeys[0]], [copy.samples, tool.sampleKeys]);
  const [source, setSource] = useState(firstSample?.code ?? "");
  const [status, setStatus] = useState(copy.statusReady);
  const [renderState, setRenderState] = useState<RenderState>({});
  const [toast, setToast] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState<WorkspaceHistoryEntry | null>(null);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const [showWorkflowWaitlist, setShowWorkflowWaitlist] = useState(false);
  const [postActionIntent, setPostActionIntent] = useState<MonetizationIntent>("advanced_export");
  const detectedTool = useMemo(() => detectInputTool(source), [source]);
  const suggestedTool = detectedTool?.slug !== tool.slug ? detectedTool : null;
  const uiCopy = getUiCopy(copy);

  useEffect(() => {
    recordRecentTool(window.localStorage, tool.slug);
    setFavorite(isFavoriteTool(window.localStorage, tool.slug));
    trackEvent("tool_open", {
      tool_slug: tool.slug,
      renderer: tool.renderer,
      implemented: tool.implemented
    });
  }, [tool.implemented, tool.renderer, tool.slug]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sharedSource = url.searchParams.get("source");
    if (sharedSource) {
      setSource(sharedSource);
      return;
    }

    const draft = readWorkspaceDraft(window.localStorage, tool.slug);
    if (draft && draft.source.trim() && draft.source !== (firstSample?.code ?? "")) {
      setDraftToRestore(draft);
    }
  }, [firstSample?.code, tool.slug]);

  useEffect(() => {
    if (!source.trim()) {
      removeWorkspaceDraft(window.localStorage, tool.slug);
      setDraftToRestore(null);
      return;
    }

    if (source === (firstSample?.code ?? "")) {
      return;
    }

    const timeout = window.setTimeout(() => {
      recordWorkspaceDraft(window.localStorage, {
        toolSlug: tool.slug,
        source,
        artifactType: "draft"
      });
      trackEvent("workspace_draft_saved", {
        tool_slug: tool.slug,
        renderer: tool.renderer,
        source_length: source.length
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [firstSample?.code, source, tool.renderer, tool.slug]);

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
        const nextState = await renderSource(tool.renderer, source, copy, tool.slug);
        if (!cancelled) {
          setRenderState(nextState);
          setStatus(copy.statusReady);
          trackEvent("tool_render_success", {
            tool_slug: tool.slug,
            renderer: tool.renderer,
            has_svg: Boolean(nextState.svg),
            has_html: Boolean(nextState.html),
            has_artifact: Boolean(nextState.artifact)
          });
        }
      } catch (error) {
        if (!cancelled) {
          setRenderState({
            error: renderErrorMessage(error, copy.renderError, tool.renderer)
          });
          setStatus(copy.statusReady);
          trackEvent("tool_render_error", {
            tool_slug: tool.slug,
            renderer: tool.renderer
          });
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [copy, copy.renderError, copy.statusReady, copy.statusRendering, source, tool.renderer, tool.slug]);

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
  const capabilities = getRendererCapabilities(tool.renderer);

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
                onClick={() => {
                  trackEvent("tool_sample_load", {
                    tool_slug: tool.slug,
                    sample_key: key
                  });
                  setSource(sample.code);
                }}
                type="button"
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
                setFavoriteTool(window.localStorage, tool.slug, nextFavorite);
                trackEvent(nextFavorite ? "tool_favorite_add" : "tool_favorite_remove", {
                  tool_slug: tool.slug
                });
                showToast(nextFavorite ? uiCopy.favoriteAdded : uiCopy.favoriteRemoved);
              }}
            >
              <Star className={favorite ? "h-4 w-4 fill-amber-400 text-amber-500" : "h-4 w-4"} />
              {favorite ? uiCopy.favorited : uiCopy.favorite}
            </Button>
          </div>
          <ExportToolbar
            actions={copy.actions}
            canCopyHtml={canCopyHtml}
            canExportSvg={canExportSvg}
            canExportPng={canExportPng}
            canDownloadFile={canDownloadFile}
            showCopyHtml={capabilities.html}
            showExportSvg={capabilities.svg}
            showExportPng={capabilities.svg}
            showPrint={capabilities.print}
            onCopyCode={() => void runAction(copy.actions.copyCode, "tool_copy_code", () => copyText(source))}
            onCopyHtml={() => void runAction(copy.actions.copyHtml, "tool_copy_html", () => copyText(renderState.html ?? ""))}
            onCopyMarkdown={() => void runAction(copy.actions.copyMarkdown ?? "Markdown", "tool_copy_markdown", () => copyText(markdownSnippet(source, shareUrl(tool.slug, source), tool.renderer)))}
            onShareLink={() => void runAction(copy.actions.shareLink ?? "Share", "tool_share_link", () => copyText(shareUrl(tool.slug, source)))}
            onExportSvg={() =>
              renderState.svg &&
              void runAction(copy.actions.exportSvg, "tool_export_svg", () => {
                downloadText(`${tool.slug}.svg`, renderState.svg ?? "", "image/svg+xml;charset=utf-8");
                recordExport("svg");
              })
            }
            onExportPng={() =>
              renderState.svg &&
              void runAction(copy.actions.exportPng, "tool_export_png", () => {
                void downloadSvgAsPng(renderState.svg ?? "", `${tool.slug}.png`);
                recordExport("png");
              })
            }
            onDownloadFile={() =>
              renderState.artifact &&
              void runAction(copy.actions.downloadFile ?? "Download", "tool_download_file", () => {
                downloadText(renderState.artifact?.filename ?? `${tool.slug}.txt`, renderState.artifact?.content ?? "", renderState.artifact?.mime ?? "text/plain;charset=utf-8");
                recordConversion(renderState.artifact?.mime ?? "file");
              })
            }
            onPrint={() =>
              void runAction(copy.actions.exportPdf, "tool_export_pdf", () => {
                printPreview();
                recordExport("pdf");
              })
            }
            onClear={() => {
              trackEvent("tool_clear", {tool_slug: tool.slug});
              removeWorkspaceDraft(window.localStorage, tool.slug);
              setDraftDismissed(true);
              setDraftToRestore(null);
              setSource("");
            }}
          />
        </div>
        {suggestedTool ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
            <div className="font-semibold text-ink">Detected {suggestedTool.label}</div>
            <p className="mt-1">
              This input may work better in the matching tool.
              {" "}
              <Link
                href={`/${suggestedTool.slug}?source=${encodeURIComponent(source)}`}
                className="font-semibold text-primary hover:underline"
                onClick={() => trackEvent("tool_detected_tool_click", {tool_slug: tool.slug, target_tool_slug: suggestedTool.slug})}
              >
                Open {suggestedTool.label} tool
              </Link>
            </p>
          </div>
        ) : null}
        {draftToRestore && !draftDismissed ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <div className="font-semibold">{uiCopy.restoreTitle}</div>
            <p className="mt-1">{uiCopy.restoreDescription}</p>
            <p className="mt-2 line-clamp-2 rounded-md bg-white/70 px-3 py-2 text-xs text-amber-900">{draftToRestore.sourcePreview}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setSource(draftToRestore.source);
                  setDraftDismissed(true);
                  trackEvent("workspace_draft_restored", {tool_slug: tool.slug, renderer: tool.renderer});
                }}
              >
                {uiCopy.restoreAction}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDraftDismissed(true);
                  trackEvent("workspace_draft_dismissed", {tool_slug: tool.slug, renderer: tool.renderer});
                }}
              >
                {uiCopy.restoreDismiss}
              </Button>
            </div>
          </div>
        ) : null}
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
            normalizePreviewHeadings={tool.renderer !== "markdown"}
            className="min-h-[560px] border-slate-300"
          >
            {renderState.formSchema ? <JsonSchemaFormPreview schema={renderState.formSchema} locale={uiCopy.locale} /> : null}
          </PreviewPane>
        </div>
        <NextStepRecommendations
          relatedTools={relatedTools}
          title={uiCopy.nextTitle}
          description={uiCopy.nextDescription}
          actionLabel={uiCopy.nextAction}
          currentSlug={tool.slug}
        />
        <AiReviewPanel locale={uiCopy.locale} toolSlug={tool.slug} renderer={tool.renderer} source={source} />
        <BatchConversionBeta locale={uiCopy.locale} toolSlug={tool.slug} renderer={tool.renderer} source={source} />
        {showWorkflowWaitlist ? <WaitlistCta locale={uiCopy.locale} source="tool" toolSlug={tool.slug} intent={postActionIntent} compact /> : null}
      </div>
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50">
        {toast ? <div className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div> : null}
      </div>
    </section>
  );

  async function runAction(label: string, eventName: AnalyticsEventName, action: () => void | Promise<void>) {
    try {
      await action();
      trackEvent(eventName, {
        tool_slug: tool.slug,
        renderer: tool.renderer,
        success: true
      });
      showToast(successMessage(label));
    } catch {
      trackEvent(eventName, {
        tool_slug: tool.slug,
        renderer: tool.renderer,
        success: false
      });
      showToast(failureMessage(label));
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function recordExport(artifactType: string) {
    recordExportHistory(window.localStorage, {
      toolSlug: tool.slug,
      source,
      artifactType
    });
    trackEvent("tool_export_success", {
      tool_slug: tool.slug,
      renderer: tool.renderer,
      source_length: source.length,
      intent: "advanced_export"
    });
    setPostActionIntent("advanced_export");
    setShowWorkflowWaitlist(true);
  }

  function recordConversion(artifactType: string) {
    recordConversionHistory(window.localStorage, {
      toolSlug: tool.slug,
      source,
      artifactType
    });
    trackEvent("tool_conversion_success", {
      tool_slug: tool.slug,
      renderer: tool.renderer,
      source_length: source.length,
      intent: "batch_conversion"
    });
    setPostActionIntent("batch_conversion");
    setShowWorkflowWaitlist(true);
  }
}

function getUiCopy(copy: ToolCopy) {
  const locale = copy.locale || (hasCjk(copy.actions.copyCode) ? "zh-CN" : "en");
  const localized = {
    en: {
      locale: "en",
      favorite: "Favorite",
      favorited: "Favorited",
      favoriteAdded: "Added to favorites",
      favoriteRemoved: "Removed from favorites",
      nextTitle: "Continue with a related tool",
      nextDescription: "Move this preview into a nearby workflow for conversion, debugging, or export.",
      nextAction: "Open",
      restoreTitle: "Local draft found",
      restoreDescription: "This draft is stored only in this browser. Restoring it will replace the current input.",
      restoreAction: "Restore draft",
      restoreDismiss: "Not now"
    },
    "zh-CN": {
      locale: "zh-CN",
      favorite: "收藏",
      favorited: "已收藏",
      favoriteAdded: "已加入收藏",
      favoriteRemoved: "已取消收藏",
      nextTitle: "下一步可以继续",
      nextDescription: "把当前预览结果带到相关工具里继续转换、排查或导出。",
      nextAction: "打开",
      restoreTitle: "发现本地草稿",
      restoreDescription: "这个草稿只保存在当前浏览器。恢复后会覆盖当前输入。",
      restoreAction: "恢复草稿",
      restoreDismiss: "暂不恢复"
    },
    "zh-TW": {
      locale: "zh-TW",
      favorite: "收藏",
      favorited: "已收藏",
      favoriteAdded: "已加入收藏",
      favoriteRemoved: "已取消收藏",
      nextTitle: "下一步可以繼續",
      nextDescription: "把目前預覽結果帶到相關工具，繼續轉換、排查或匯出。",
      nextAction: "開啟",
      restoreTitle: "發現本機草稿",
      restoreDescription: "這個草稿只保存在目前瀏覽器。恢復後會覆蓋目前輸入。",
      restoreAction: "恢復草稿",
      restoreDismiss: "暫不恢復"
    },
    es: {
      locale: "es",
      favorite: "Favorito",
      favorited: "En favoritos",
      favoriteAdded: "Añadido a favoritos",
      favoriteRemoved: "Eliminado de favoritos",
      nextTitle: "Continúa con una herramienta relacionada",
      nextDescription: "Lleva esta vista previa a un flujo cercano para convertir, depurar o exportar.",
      nextAction: "Abrir",
      restoreTitle: "Borrador local encontrado",
      restoreDescription: "Este borrador solo está guardado en este navegador. Restaurarlo reemplazará la entrada actual.",
      restoreAction: "Restaurar borrador",
      restoreDismiss: "Ahora no"
    },
    de: {
      locale: "de",
      favorite: "Favorit",
      favorited: "Favorisiert",
      favoriteAdded: "Zu Favoriten hinzugefügt",
      favoriteRemoved: "Aus Favoriten entfernt",
      nextTitle: "Mit einem verwandten Tool fortfahren",
      nextDescription: "Nutze diese Vorschau im nächsten Workflow zum Konvertieren, Debuggen oder Exportieren.",
      nextAction: "Öffnen",
      restoreTitle: "Lokaler Entwurf gefunden",
      restoreDescription: "Dieser Entwurf ist nur in diesem Browser gespeichert. Wiederherstellen ersetzt die aktuelle Eingabe.",
      restoreAction: "Entwurf wiederherstellen",
      restoreDismiss: "Nicht jetzt"
    },
    fr: {
      locale: "fr",
      favorite: "Favori",
      favorited: "En favori",
      favoriteAdded: "Ajouté aux favoris",
      favoriteRemoved: "Retiré des favoris",
      nextTitle: "Continuer avec un outil lié",
      nextDescription: "Envoyez cette prévisualisation vers un workflow proche pour convertir, déboguer ou exporter.",
      nextAction: "Ouvrir",
      restoreTitle: "Brouillon local trouvé",
      restoreDescription: "Ce brouillon est stocké uniquement dans ce navigateur. Le restaurer remplacera l'entrée actuelle.",
      restoreAction: "Restaurer le brouillon",
      restoreDismiss: "Pas maintenant"
    },
    pt: {
      locale: "pt",
      favorite: "Favorito",
      favorited: "Favoritado",
      favoriteAdded: "Adicionado aos favoritos",
      favoriteRemoved: "Removido dos favoritos",
      nextTitle: "Continue com uma ferramenta relacionada",
      nextDescription: "Leve esta prévia para um fluxo próximo para converter, depurar ou exportar.",
      nextAction: "Abrir",
      restoreTitle: "Rascunho local encontrado",
      restoreDescription: "Este rascunho fica salvo apenas neste navegador. Restaurar substituirá a entrada atual.",
      restoreAction: "Restaurar rascunho",
      restoreDismiss: "Agora não"
    },
    ru: {
      locale: "ru",
      favorite: "В избранное",
      favorited: "В избранном",
      favoriteAdded: "Добавлено в избранное",
      favoriteRemoved: "Удалено из избранного",
      nextTitle: "Продолжить в связанном инструменте",
      nextDescription: "Перенесите предпросмотр в близкий workflow для конвертации, отладки или экспорта.",
      nextAction: "Открыть",
      restoreTitle: "Найден локальный черновик",
      restoreDescription: "Этот черновик хранится только в этом браузере. Восстановление заменит текущий ввод.",
      restoreAction: "Восстановить черновик",
      restoreDismiss: "Не сейчас"
    },
    ja: {
      locale: "ja",
      favorite: "お気に入り",
      favorited: "お気に入り済み",
      favoriteAdded: "お気に入りに追加しました",
      favoriteRemoved: "お気に入りから削除しました",
      nextTitle: "関連ツールで続ける",
      nextDescription: "このプレビューを近いワークフローに移して、変換、デバッグ、エクスポートを続けます。",
      nextAction: "開く",
      restoreTitle: "ローカル下書きが見つかりました",
      restoreDescription: "この下書きはこのブラウザ内だけに保存されています。復元すると現在の入力を置き換えます。",
      restoreAction: "下書きを復元",
      restoreDismiss: "今はしない"
    },
    ko: {
      locale: "ko",
      favorite: "즐겨찾기",
      favorited: "즐겨찾기됨",
      favoriteAdded: "즐겨찾기에 추가됨",
      favoriteRemoved: "즐겨찾기에서 제거됨",
      nextTitle: "관련 도구로 계속하기",
      nextDescription: "현재 미리보기를 가까운 워크플로로 옮겨 변환, 디버깅 또는 내보내기를 계속하세요.",
      nextAction: "열기",
      restoreTitle: "로컬 초안 발견",
      restoreDescription: "이 초안은 현재 브라우저에만 저장됩니다. 복원하면 현재 입력이 대체됩니다.",
      restoreAction: "초안 복원",
      restoreDismiss: "나중에"
    }
  };

  return localized[locale as keyof typeof localized] || localized.en;
}

function successMessage(label: string) {
  return hasCjk(label) ? `已完成：${label}` : `${label} done`;
}

function failureMessage(label: string) {
  return hasCjk(label) ? `操作失败：${label}` : `${label} failed`;
}

function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function renderErrorMessage(error: unknown, fallback: string, renderer: ToolRuntimeConfig["renderer"]) {
  const message = error instanceof Error && error.message ? error.message : fallback;
  const hintsEn: Partial<Record<ToolRuntimeConfig["renderer"], string>> = {
    mermaid: "Check diagram type, node IDs, brackets, quotes, and whether AI output included Markdown fences.",
    openapi: "Use a focused OpenAPI YAML/JSON document with a paths object, HTTP methods, responses, and optional requestBody schemas.",
    "api-error-flow": "Use rows like 401 | Missing token | Return login required, or load one of the error-flow samples.",
    "mermaid-to-drawio": "Supported conversion focuses on Mermaid flowchart and sequence structures with explicit nodes, participants, and arrows.",
    "plantuml-to-drawio": "Supported conversion focuses on PlantUML actors, participants, components, classes, databases, and arrows.",
    drawio: "Paste uncompressed diagrams.net XML with drawable mxCell vertices. Compressed draw.io payloads are not supported yet.",
    "json-schema": "Paste a JSON Schema object with type, properties, required, enum, oneOf, anyOf, or allOf.",
    "json-schema-form": "Paste a JSON Schema object with non-empty properties so a form can be generated."
  };
  const hintsZh: Partial<Record<ToolRuntimeConfig["renderer"], string>> = {
    mermaid: "请检查图表类型、节点 ID、括号、引号，以及 AI 输出里是否混入了 Markdown 代码围栏。",
    openapi: "请使用包含 paths、HTTP method、responses 和可选 requestBody schema 的 OpenAPI YAML/JSON。",
    "api-error-flow": "请使用类似 401 | Missing token | Return login required 的行格式，或先加载错误流示例。",
    "mermaid-to-drawio": "当前转换优先支持 Mermaid flowchart 和 sequence 的显式节点、participant 与箭头。",
    "plantuml-to-drawio": "当前转换优先支持 PlantUML actor、participant、component、class、database 和箭头关系。",
    drawio: "请粘贴未压缩的 diagrams.net XML，且包含可绘制的 mxCell vertex。暂不支持压缩 draw.io payload。",
    "json-schema": "请粘贴包含 type、properties、required、enum、oneOf、anyOf 或 allOf 的 JSON Schema 对象。",
    "json-schema-form": "请粘贴包含非空 properties 的 JSON Schema 对象，才能生成表单。"
  };
  const hints = hasCjk(fallback) ? hintsZh : hintsEn;
  const hint = hints[renderer];

  return hint ? `${message} ${hint}` : message;
}

function shareUrl(slug: ToolSlug, source: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return absoluteSourceUrl(window.location.origin, window.location.pathname || `/${slug}`, source);
}

function getRendererCapabilities(renderer: ToolRuntimeConfig["renderer"]) {
  const svgRenderers = new Set<ToolRuntimeConfig["renderer"]>([
    "mermaid",
    "graphviz",
    "d2",
    "mindmap",
    "openapi",
    "sql",
    "docker-compose",
    "package-json",
    "regex",
    "plantuml-to-drawio",
    "mermaid-to-drawio",
    "drawio-svg",
    "terraform",
    "github-actions",
    "dockerfile",
    "nginx",
    "otel-trace",
    "log-sequence",
    "graphql",
    "protobuf",
    "asyncapi",
    "dbml",
    "prisma",
    "cron",
    "jwt",
    "api-error-flow",
    "kubernetes-topology",
    "cicd-pipeline",
    "postman",
    "har",
    "svg-preview",
    "typescript",
    "zod",
    "cloudformation",
    "c4"
  ]);
  const htmlRenderers = new Set<ToolRuntimeConfig["renderer"]>([
    "markdown",
    "har-timeline",
    "open-graph",
    "json-schema-form",
    "jsonpath",
    "nginx-location",
    "jq-filter",
    "xpath",
    "yaml-path",
    "toml",
    "env-diff",
    "robots-txt",
    "sitemap-xml",
    "http-headers",
    "html-preview",
    "webpage-markdown",
    "css-gradient",
    "json-diff",
    "base64-image",
    "curl-parser",
    "url-query",
    "css-shadow",
    "color-palette"
  ]);

  return {
    html: svgRenderers.has(renderer) || htmlRenderers.has(renderer),
    svg: svgRenderers.has(renderer),
    print: renderer !== "ai"
  };
}

async function renderSource(
  renderer: ToolRuntimeConfig["renderer"],
  source: string,
  copy: ToolCopy,
  slug: ToolSlug
): Promise<RenderState> {
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
      return withHtmlArtifact(slug, html);
    }
    case "svg-preview": {
      const {renderSvgPreview} = await import("@/lib/renderers/growth-tools");
      const result = renderSvgPreview(source);
      return {html: result.html, svg: result.svg};
    }
    case "open-graph": {
      const {renderOpenGraphPreview} = await import("@/lib/renderers/growth-tools");
      const html = renderOpenGraphPreview(source);
      return withHtmlArtifact(slug, html);
    }
    case "json-schema-form": {
      return {formSchema: parseJsonSchemaFormSchema(source)};
    }
    case "jsonpath": {
      const {renderJsonPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderJsonPathTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "nginx-location": {
      const {renderNginxLocationTester} = await import("@/lib/renderers/growth-tools");
      const html = renderNginxLocationTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "jq-filter": {
      const {renderJqFilterTester} = await import("@/lib/renderers/growth-tools");
      const html = renderJqFilterTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "xpath": {
      const {renderXPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderXPathTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "yaml-path": {
      const {renderYamlPathTester} = await import("@/lib/renderers/growth-tools");
      const html = renderYamlPathTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "toml": {
      const {renderTomlVisualizer} = await import("@/lib/renderers/growth-tools");
      const html = renderTomlVisualizer(source);
      return withHtmlArtifact(slug, html);
    }
    case "env-diff": {
      const {renderEnvDiffChecker} = await import("@/lib/renderers/growth-tools");
      const html = renderEnvDiffChecker(source);
      return withHtmlArtifact(slug, html);
    }
    case "robots-txt": {
      const {renderRobotsTxtTester} = await import("@/lib/renderers/growth-tools");
      const html = renderRobotsTxtTester(source);
      return withHtmlArtifact(slug, html);
    }
    case "sitemap-xml": {
      const {renderSitemapXmlViewer} = await import("@/lib/renderers/growth-tools");
      const html = renderSitemapXmlViewer(source);
      return withHtmlArtifact(slug, html);
    }
    case "http-headers": {
      const {renderHttpHeaderParser} = await import("@/lib/renderers/growth-tools");
      const html = renderHttpHeaderParser(source);
      return withHtmlArtifact(slug, html);
    }
    case "html-preview": {
      const {renderHtmlPreviewSandbox} = await import("@/lib/renderers/growth-tools");
      const html = renderHtmlPreviewSandbox(source);
      return withHtmlArtifact(slug, html);
    }
    case "webpage-markdown": {
      const result = await convertWebpageToMarkdown(source);
      return {
        html: result.html,
        artifact: {
          filename: `${copyFileName(result.title || "webpage")}.md`,
          mime: "text/markdown;charset=utf-8",
          content: result.markdown
        }
      };
    }
    case "css-gradient": {
      const {renderCssGradientPreview} = await import("@/lib/renderers/growth-tools");
      const html = renderCssGradientPreview(source);
      return withHtmlArtifact(slug, html);
    }
    case "json-diff": {
      const {renderJsonDiffViewer} = await import("@/lib/renderers/growth-tools");
      const html = renderJsonDiffViewer(source);
      return withHtmlArtifact(slug, html);
    }
    case "base64-image": {
      const {renderBase64ImagePreview} = await import("@/lib/renderers/growth-tools");
      const html = renderBase64ImagePreview(source);
      return withHtmlArtifact(slug, html);
    }
    case "curl-parser": {
      const {renderCurlCommandParser} = await import("@/lib/renderers/growth-tools");
      const html = renderCurlCommandParser(source);
      return withHtmlArtifact(slug, html);
    }
    case "url-query": {
      const {renderUrlQueryParser} = await import("@/lib/renderers/growth-tools");
      const html = renderUrlQueryParser(source);
      return withHtmlArtifact(slug, html);
    }
    case "css-shadow": {
      const {renderCssBoxShadowPreview} = await import("@/lib/renderers/growth-tools");
      const html = renderCssBoxShadowPreview(source);
      return withHtmlArtifact(slug, html);
    }
    case "color-palette": {
      const {renderColorPalettePreview} = await import("@/lib/renderers/growth-tools");
      const html = renderColorPalettePreview(source);
      return withHtmlArtifact(slug, html);
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

function withHtmlArtifact(slug: ToolSlug, html: string): RenderState {
  return {
    html,
    artifact: {
      filename: `${slug}-preview.html`,
      mime: "text/html;charset=utf-8",
      content: `<!doctype html><html><head><meta charset="utf-8"><title>${slug} preview</title></head><body>${html}</body></html>`
    }
  };
}

function parseJsonSchemaFormSchema(source: string): RJSFSchema {
  const schema = JSON.parse(source) as RJSFSchema;

  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    throw new Error("Paste a JSON Schema object with properties.");
  }

  if (!schema.properties || typeof schema.properties !== "object" || Array.isArray(schema.properties) || !Object.keys(schema.properties).length) {
    throw new Error("Paste a JSON Schema object with properties.");
  }

  return {
    type: "object",
    ...schema
  };
}

async function convertWebpageToMarkdown(source: string) {
  const response = await fetch("/api/tools/webpage-to-markdown", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({source})
  });
  const data = (await response.json()) as {
    title?: string;
    markdown?: string;
    wordCount?: number;
    linkCount?: number;
    sourceUrl?: string;
    error?: string;
  };
  if (!response.ok || !data.markdown) throw new Error(data.error || "Unable to convert webpage to Markdown.");

  return {
    title: data.title || "webpage",
    markdown: data.markdown,
    html: `
      <div class="dp-preview">
        <div class="dp-grid">
          <div class="dp-card"><strong>Title</strong><span>${escapePreviewHtml(data.title || "Untitled")}</span></div>
          <div class="dp-card"><strong>Words</strong><span>${data.wordCount || 0}</span></div>
          <div class="dp-card"><strong>Links</strong><span>${data.linkCount || 0}</span></div>
        </div>
        <h2>Markdown output</h2>
        <pre class="dp-code">${escapePreviewHtml(data.markdown)}</pre>
      </div>
    `
  };
}

function escapePreviewHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
