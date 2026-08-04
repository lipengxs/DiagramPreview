"use client";

import {ShieldCheck, WandSparkles} from "lucide-react";
import {useState} from "react";
import {Button} from "@/components/ui/Button";
import {trackEvent} from "@/lib/analytics";
import {MonetizationIntentCta} from "@/components/growth/MonetizationIntentCta";
import type {ToolConfig, ToolSlug} from "@/config/tools";

type AiReviewPanelProps = {
  locale: string;
  toolSlug: ToolSlug | string;
  renderer: ToolConfig["renderer"] | "ai";
  source: string;
};

type ReviewResult = {
  summary: string;
  riskLocations: string[];
  suggestions: string[];
  fixedSource: string;
  checklist: string[];
};

const reviewableRenderers = new Set(["mermaid", "plantuml", "openapi", "json-schema", "json-schema-form", "mermaid-to-drawio", "plantuml-to-drawio"]);

export function AiReviewPanel({locale, toolSlug, renderer, source}: AiReviewPanelProps) {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const copy = getCopy(locale);
  const canReview = reviewableRenderers.has(renderer);

  if (!canReview) {
    return null;
  }

  function runReview() {
    trackEvent("ai_review_start", {
      tool_slug: toolSlug,
      renderer,
      source_length: source.length
    });
    const nextResult = reviewSource(source, renderer, locale);
    setResult(nextResult);
    trackEvent("ai_review_success", {
      tool_slug: toolSlug,
      renderer,
      source_length: source.length,
      issue_count: nextResult.riskLocations.length
    });
  }

  return (
    <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">AI Review beta</p>
          <h2 className="mt-1 text-base font-bold text-ink">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>
          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-emerald-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" />
            <span>{copy.privacy}</span>
          </p>
        </div>
        <Button type="button" variant="primary" onClick={runReview} disabled={!source.trim()}>
          <WandSparkles className="h-4 w-4" />
          {copy.action}
        </Button>
      </div>
      {result ? (
        <div className="mt-4 grid gap-3 rounded-md border border-emerald-100 bg-white p-4 text-sm leading-6">
          <ReviewBlock title={copy.summary} items={[result.summary]} />
          <ReviewBlock title={copy.locations} items={result.riskLocations} />
          <ReviewBlock title={copy.suggestions} items={result.suggestions} />
          <ReviewBlock title={copy.checklist} items={result.checklist} />
          <div>
            <div className="font-semibold text-ink">{copy.fixedSource}</div>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">{result.fixedSource}</pre>
          </div>
          <MonetizationIntentCta locale={locale} source="tool" toolSlug={String(toolSlug)} intent="ai_review" compact />
        </div>
      ) : null}
    </section>
  );
}

function ReviewBlock({title, items}: {title: string; items: string[]}) {
  return (
    <div>
      <div className="font-semibold text-ink">{title}</div>
      <ul className="mt-1 grid gap-1 text-slate-600">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}

function reviewSource(source: string, renderer: string, locale: string): ReviewResult {
  const zh = locale.startsWith("zh");
  const lines = source.split(/\r?\n/);
  const trimmed = source.trim();
  const risks: string[] = [];
  const suggestions: string[] = [];

  if (!trimmed) {
    risks.push(zh ? "输入为空，无法检查。" : "Input is empty, so there is nothing to review.");
  }
  if (/```/.test(source)) {
    risks.push(zh ? "发现 Markdown 代码围栏，渲染前应移除。" : "Markdown code fences were found and should be removed before rendering.");
    suggestions.push(zh ? "移除 ```mermaid / ```plantuml 包裹，只保留源码。" : "Remove ```mermaid / ```plantuml wrappers and keep only source.");
  }
  if (lines.some((line) => line.length > 90)) {
    risks.push(zh ? "部分行较长，导出到 README 或 draw.io 后可能不易读。" : "Some lines are long and may be hard to read in README or draw.io exports.");
    suggestions.push(zh ? "缩短节点 label，把说明性文字放到文档正文。" : "Shorten node labels and move explanations into surrounding documentation.");
  }
  if ((renderer === "openapi" || /openapi|swagger/i.test(source)) && !/4\d\d|5\d\d/.test(source)) {
    risks.push(zh ? "OpenAPI 示例缺少 4xx/5xx 响应，排障图不够完整。" : "OpenAPI input has no visible 4xx/5xx responses, so debugging diagrams may be incomplete.");
    suggestions.push(zh ? "补充认证失败、校验失败、超时或服务端错误响应。" : "Add auth failure, validation failure, timeout, or server error responses.");
  }
  if ((renderer === "json-schema" || renderer === "json-schema-form") && !/"required"\s*:/.test(source)) {
    risks.push(zh ? "JSON Schema 未发现 required 字段，表单和文档约束可能不清楚。" : "JSON Schema has no required field, so form and docs constraints may be unclear.");
    suggestions.push(zh ? "显式声明 required、default、enum 和 nested object 约束。" : "Declare required, default, enum, and nested object constraints explicitly.");
  }
  if (!risks.length) {
    risks.push(zh ? "未发现明显结构风险，建议继续检查业务语义。" : "No obvious structural risk found; review business meaning next.");
  }
  if (!suggestions.length) {
    suggestions.push(zh ? "保持一个图只回答一个问题，并保留源码用于后续维护。" : "Keep one diagram focused on one question and save the source for maintenance.");
  }

  return {
    summary: zh ? "这是本地 beta review，不会上传源码。完整远程 AI Review 仍通过 waitlist 验证。" : "This is a local beta review and does not upload source. Full remote AI Review is still being validated through waitlist.",
    riskLocations: risks,
    suggestions,
    fixedSource: source.replace(/```[a-zA-Z-]*\n?/g, "").replace(/```/g, "").trim() || (zh ? "请先粘贴图表源码。" : "Paste diagram source first."),
    checklist: zh
      ? ["语法能否渲染", "图是否只表达一个主题", "label 是否过长", "是否有错误/失败路径", "源码是否会随导出结果一起保存"]
      : ["Syntax renders successfully", "Diagram answers one clear question", "Labels are short enough", "Error/failure paths are documented", "Source is saved beside exported assets"]
  };
}

function getCopy(locale: string) {
  if (locale.startsWith("zh")) {
    return {
      title: "发布前做一次图表 Review",
      body: "先用本地启发式检查语法、可读性、失败路径和交付风险。不会上传源码；远程 AI Review 需要用户主动提交。",
      privacy: "本地 beta review 不发送 source、prompt 或 diagram content。",
      action: "运行本地 Review",
      summary: "问题摘要",
      locations: "风险位置",
      suggestions: "修复建议",
      fixedSource: "清理后的 source",
      checklist: "发布前 checklist"
    };
  }

  return {
    title: "Review the diagram before publishing",
    body: "Run a local heuristic check for syntax, readability, failure paths, and handoff risk. Source is not uploaded; remote AI Review requires explicit submission.",
    privacy: "Local beta review does not send source, prompt, or diagram content.",
    action: "Run local review",
    summary: "Summary",
    locations: "Risk locations",
    suggestions: "Fix suggestions",
    fixedSource: "Cleaned source",
    checklist: "Publish checklist"
  };
}

