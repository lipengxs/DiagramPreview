import {ArrowRight, FileCode2, GitBranch, Sparkles} from "lucide-react";
import type {Locale} from "@/config/locales";
import {getTool, type ToolSlug} from "@/config/tools";
import {Link} from "@/i18n/navigation";

type WorkflowEntry = {
  href: string;
  icon: typeof Sparkles;
  title: string;
  body: string;
  steps: string[];
  tools: ToolSlug[];
};

export function WorkflowEntrypoints({locale}: {locale: Locale}) {
  const isChineseLocale = locale.startsWith("zh");
  const entries: WorkflowEntry[] = isChineseLocale
    ? [
        {
          href: "/workflows/ai-generated-mermaid-workflow",
          icon: Sparkles,
          title: "AI Mermaid -> Preview -> Fix -> draw.io -> Export",
          body: "承接 ChatGPT / Claude 生成的 Mermaid，先预览和修复，再转成 draw.io 或导出文档资产。",
          steps: ["AI output review", "Mermaid preview", "Fix syntax", "draw.io export"],
          tools: ["text-to-mermaid", "mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio"]
        },
        {
          href: "/workflows/api-debugging-sequence-diagram",
          icon: GitBranch,
          title: "OpenAPI / Postman / HAR -> Sequence -> Error Flow",
          body: "把接口契约、调试集合和真实请求轨迹串起来，沉淀可评审的后端排障图。",
          steps: ["Contract", "Runtime traffic", "Sequence", "Error path"],
          tools: ["openapi-to-sequence", "postman-collection-sequence-diagram", "har-file-sequence-diagram", "api-error-flow-diagram"]
        },
        {
          href: "/workflows/schema-visualization-workflow",
          icon: FileCode2,
          title: "JSON Schema / SQL / DBML -> Visualizer -> Form / ER / Types",
          body: "围绕数据契约、数据库关系和类型定义做结构检查，减少发布后返工。",
          steps: ["Schema", "Relationships", "Form preview", "Type review"],
          tools: ["json-schema-visualizer", "json-schema-form-preview", "sql-to-er-diagram", "typescript-interface-visualizer"]
        }
      ]
    : [
        {
          href: "/workflows/ai-generated-mermaid-workflow",
          icon: Sparkles,
          title: "AI Mermaid -> Preview -> Fix -> draw.io -> Export",
          body: "Review Mermaid from ChatGPT or Claude, fix syntax, convert to draw.io, and export documentation assets.",
          steps: ["AI output review", "Mermaid preview", "Fix syntax", "draw.io export"],
          tools: ["text-to-mermaid", "mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio"]
        },
        {
          href: "/workflows/api-debugging-sequence-diagram",
          icon: GitBranch,
          title: "OpenAPI / Postman / HAR -> Sequence -> Error Flow",
          body: "Connect contracts, collections, and captured traffic into reviewable backend debugging diagrams.",
          steps: ["Contract", "Runtime traffic", "Sequence", "Error path"],
          tools: ["openapi-to-sequence", "postman-collection-sequence-diagram", "har-file-sequence-diagram", "api-error-flow-diagram"]
        },
        {
          href: "/workflows/schema-visualization-workflow",
          icon: FileCode2,
          title: "JSON Schema / SQL / DBML -> Visualizer -> Form / ER / Types",
          body: "Inspect data contracts, database relationships, and generated types before they become published docs.",
          steps: ["Schema", "Relationships", "Form preview", "Type review"],
          tools: ["json-schema-visualizer", "json-schema-form-preview", "sql-to-er-diagram", "typescript-interface-visualizer"]
        }
      ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {entries.map((entry) => {
        const Icon = entry.icon;

        return (
          <section key={entry.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold leading-6 text-ink">{entry.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.body}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              {entry.steps.map((step, index) => (
                <span key={step} className="inline-flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1">{step}</span>
                  {index < entry.steps.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-slate-400" /> : null}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              {entry.tools.map((slug) => {
                const tool = getTool(slug);
                if (!tool) return null;
                const ToolIcon = tool.icon;

                return (
                  <Link key={slug} href={`/${slug}`} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-ink hover:border-primary hover:bg-blue-50 hover:text-primary">
                    <ToolIcon className="h-4 w-4 text-primary" />
                    <span>{slug}</span>
                  </Link>
                );
              })}
            </div>
            <Link href={entry.href} locale="en" className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700">
              {isChineseLocale ? "查看完整流程" : "View workflow"}
            </Link>
          </section>
        );
      })}
    </div>
  );
}
