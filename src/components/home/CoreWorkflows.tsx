import {useLocale, useTranslations} from "next-intl";
import {seoCoreToolSlugs} from "@/config/seo-focus";
import {getTool} from "@/config/tools";
import {Link} from "@/i18n/navigation";

const workflows = [
  {
    id: "mermaid",
    tools: ["mermaid-preview", "text-to-mermaid", "mermaid-ai-fixer", "plantuml-preview"]
  },
  {
    id: "drawio",
    tools: ["drawio-preview", "ai-drawio-generator", "plantuml-to-drawio", "drawio-to-svg"]
  },
  {
    id: "api",
    tools: ["openapi-to-sequence", "postman-collection-sequence-diagram", "har-file-sequence-diagram", "api-error-flow-diagram"]
  },
  {
    id: "schema",
    tools: ["json-schema-visualizer", "protobuf-schema-visualizer", "graphql-schema-visualizer", "sql-to-er-diagram"]
  }
] as const;

export function CoreWorkflows() {
  const locale = useLocale();
  const t = useTranslations();
  const copy = getWorkflowCopy(locale);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workflows.map((workflow) => (
        <section key={workflow.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {copy.eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-bold text-ink">{copy.items[workflow.id].title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.items[workflow.id].description}</p>
          <div className="mt-4 grid gap-2">
            {workflow.tools.map((slug) => {
              const tool = getTool(slug);
              if (!tool || !seoCoreToolSlugs.includes(tool.slug)) return null;
              const Icon = tool.icon;

              return (
                <Link key={slug} href={`/${slug}`} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 hover:border-primary hover:bg-blue-50">
                  <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{t(`tools.${slug}.name`)}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-600">{t(`tools.${slug}.shortDescription`)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function getWorkflowCopy(locale: string) {
  const zh = {
    eyebrow: "Core workflow",
    items: {
      mermaid: {
        title: "Mermaid and text diagram workflow",
        description: "Draft diagrams from text, preview Mermaid syntax, fix errors, and export clean documentation assets."
      },
      drawio: {
        title: "Draw.io preview and conversion",
        description: "Open diagrams.net files, generate editable draw.io drafts, and convert diagram sources for sharing."
      },
      api: {
        title: "API debugging and sequence diagrams",
        description: "Turn OpenAPI, Postman, HAR, and error notes into sequence diagrams for backend review."
      },
      schema: {
        title: "Schema and data model visualization",
        description: "Inspect JSON Schema, Protobuf, GraphQL, SQL, and DBML contracts before publishing docs."
      }
    }
  };

  if (locale.startsWith("zh")) {
    return {
      eyebrow: "核心工作流",
      items: {
        mermaid: {
          title: "Mermaid 与文本画图工作流",
          description: "从文字生成图表，预览 Mermaid 语法，修复错误，并导出可放进文档的图。"
        },
        drawio: {
          title: "Draw.io 预览与转换",
          description: "在线打开 diagrams.net 文件，生成可编辑 draw.io 草稿，并转换成适合分享的格式。"
        },
        api: {
          title: "API 排障与时序图",
          description: "把 OpenAPI、Postman、HAR 和错误记录转成时序图，方便后端评审。"
        },
        schema: {
          title: "Schema 与数据模型可视化",
          description: "发布文档前检查 JSON Schema、Protobuf、GraphQL、SQL 和 DBML 契约。"
        }
      }
    };
  }

  return zh;
}
