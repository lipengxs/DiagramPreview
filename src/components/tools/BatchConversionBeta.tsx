"use client";

import JSZip from "jszip";
import {Archive, Play} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/Button";
import {trackEvent} from "@/lib/analytics";
import type {ToolConfig, ToolSlug} from "@/config/tools";
import {MonetizationIntentCta} from "@/components/growth/MonetizationIntentCta";

type BatchConversionBetaProps = {
  locale: string;
  toolSlug: ToolSlug;
  renderer: ToolConfig["renderer"];
  source: string;
};

type BatchResult = {
  name: string;
  ok: boolean;
  message: string;
};

const supportedRenderers = new Set(["mermaid-to-drawio", "plantuml-to-drawio", "openapi"]);

export function BatchConversionBeta({locale, toolSlug, renderer, source}: BatchConversionBetaProps) {
  const copy = getCopy(locale);
  const [batchSource, setBatchSource] = useState(source);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [batchEdited, setBatchEdited] = useState(false);
  const supported = supportedRenderers.has(renderer);
  const items = useMemo(() => splitBatch(batchSource), [batchSource]);

  useEffect(() => {
    if (!batchEdited) {
      setBatchSource(source);
    }
  }, [batchEdited, source]);

  if (!supported) {
    return null;
  }

  async function runBatch() {
    setRunning(true);
    trackEvent("batch_conversion_intent", {
      tool_slug: toolSlug,
      renderer,
      source_length: batchSource.length,
      item_count: items.length,
      intent: "batch_conversion"
    });

    const zip = new JSZip();
    const nextResults: BatchResult[] = [];

    for (const [index, item] of items.entries()) {
      const baseName = `${toolSlug}-${index + 1}`;
      try {
        if (renderer === "mermaid-to-drawio") {
          const {convertMermaidToDrawio} = await import("@/lib/renderers/drawio-converters");
          const result = convertMermaidToDrawio(item);
          zip.file(`${baseName}.drawio`, result.xml);
          zip.file(`${baseName}.svg`, result.svg);
        } else if (renderer === "plantuml-to-drawio") {
          const {convertPlantUmlToDrawio} = await import("@/lib/renderers/drawio-converters");
          const result = convertPlantUmlToDrawio(item);
          zip.file(`${baseName}.drawio`, result.xml);
          zip.file(`${baseName}.svg`, result.svg);
        } else {
          const {renderOpenApiSequence} = await import("@/lib/renderers/openapi");
          const svg = await renderOpenApiSequence(item);
          zip.file(`${baseName}.svg`, svg);
        }
        nextResults.push({name: baseName, ok: true, message: copy.success});
      } catch (error) {
        const message = error instanceof Error ? error.message : copy.failed;
        nextResults.push({name: baseName, ok: false, message});
      }
    }

    zip.file("README.md", readmeFor(toolSlug, nextResults, copy));
    zip.file("failures.json", JSON.stringify(nextResults.filter((result) => !result.ok), null, 2));

    const blob = await zip.generateAsync({type: "blob"});
    downloadBlob(blob, `${toolSlug}-batch-beta.zip`);
    setResults(nextResults);
    setRunning(false);
    trackEvent("tool_conversion_success", {
      tool_slug: toolSlug,
      renderer,
      source_length: batchSource.length,
      item_count: items.length,
      success: nextResults.some((result) => result.ok),
      intent: "batch_conversion"
    });
  }

  return (
    <section className="rounded-lg border border-purple-100 bg-purple-50 p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Batch conversion beta</p>
          <h2 className="mt-1 text-base font-bold text-ink">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>
        </div>
        <Button type="button" variant="primary" onClick={runBatch} disabled={running || !items.length}>
          {running ? <Archive className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
          {running ? copy.running : copy.action}
        </Button>
      </div>
      <textarea
        value={batchSource}
        onChange={(event) => {
          setBatchEdited(true);
          setBatchSource(event.target.value);
        }}
        placeholder={copy.placeholder}
        className="mt-4 min-h-44 w-full rounded-md border border-purple-100 bg-white p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:ring-2 focus:ring-primary"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">{copy.hint.replace("{count}", String(items.length))}</p>
      {results.length ? (
        <div className="mt-4 grid gap-2 text-sm">
          {results.map((result) => (
            <div key={result.name} className={result.ok ? "rounded-md border border-emerald-100 bg-white p-3 text-emerald-800" : "rounded-md border border-red-100 bg-white p-3 text-red-800"}>
              <span className="font-semibold">{result.name}</span>: {result.message}
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        <MonetizationIntentCta locale={locale} source="tool" toolSlug={toolSlug} intent="batch_conversion" compact />
      </div>
    </section>
  );
}

function splitBatch(value: string) {
  return value
    .split(/\n-{3,}\n|\n###\s+NEXT\s+###\n/i)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readmeFor(toolSlug: string, results: BatchResult[], copy: ReturnType<typeof getCopy>) {
  const successCount = results.filter((result) => result.ok).length;
  return `# DiagramPreview batch conversion beta\n\nTool: ${toolSlug}\nSuccess: ${successCount}/${results.length}\n\n${results.map((result) => `- ${result.ok ? "OK" : "FAILED"} ${result.name}: ${result.message}`).join("\n")}\n\n${copy.privacy}\n`;
}

function getCopy(locale: string) {
  if (locale.startsWith("zh")) {
    return {
      title: "批量转换 beta",
      body: "粘贴多个 Mermaid、PlantUML 或 OpenAPI 片段，用 --- 分隔。结果会打包成 ZIP 下载，失败项会写入报告。",
      action: "生成 ZIP",
      running: "转换中",
      placeholder: "第一个文件源码\n---\n第二个文件源码\n---\n第三个文件源码",
      hint: "当前会处理 {count} 个片段。最多处理 12 个，适合验证批量转换需求。",
      success: "转换成功",
      failed: "转换失败",
      privacy: "本地批量 beta 不上传源码。"
    };
  }

  return {
    title: "Batch conversion beta",
    body: "Paste multiple Mermaid, PlantUML, or OpenAPI snippets separated by ---. Results are downloaded as a ZIP with a failure report.",
    action: "Generate ZIP",
    running: "Converting",
    placeholder: "First file source\n---\nSecond file source\n---\nThird file source",
    hint: "This will process {count} snippet(s). The beta processes up to 12 snippets.",
    success: "Converted",
    failed: "Conversion failed",
    privacy: "Local batch beta does not upload source."
  };
}
