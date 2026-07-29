import {Download, Eye, GitCompareArrows, SearchCheck} from "lucide-react";
import type {Locale} from "@/config/locales";

export function ProductCapabilityStrip({locale}: {locale: Locale}) {
  const isChineseLocale = locale.startsWith("zh");
  const items = isChineseLocale
    ? [
        {label: "Preview", title: "先预览", body: "把 Mermaid、PlantUML、draw.io、OpenAPI、Schema 和配置文件快速变成可检查视图。", icon: Eye},
        {label: "Convert", title: "再转换", body: "在 Mermaid、PlantUML、draw.io、SVG 和文档资产之间转换，减少手工搬运。", icon: GitCompareArrows},
        {label: "Review", title: "能检查", body: "针对 AI 输出、API 错误流、Schema 结构和配置依赖做发布前 review。", icon: SearchCheck},
        {label: "Export", title: "可交付", body: "导出 SVG、PNG、PDF、Markdown 或可编辑文件，直接放进 README、PR 和设计文档。", icon: Download}
      ]
    : [
        {label: "Preview", title: "Preview first", body: "Turn Mermaid, PlantUML, draw.io, OpenAPI, schema, and config sources into reviewable views.", icon: Eye},
        {label: "Convert", title: "Convert next", body: "Move between Mermaid, PlantUML, draw.io, SVG, and documentation assets with less manual cleanup.", icon: GitCompareArrows},
        {label: "Review", title: "Review output", body: "Check AI output, API error flows, schema structure, and config dependencies before publishing.", icon: SearchCheck},
        {label: "Export", title: "Export cleanly", body: "Ship SVG, PNG, PDF, Markdown, or editable files into READMEs, PRs, and architecture docs.", icon: Download}
      ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <section key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.label}</p>
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
          </section>
        );
      })}
    </div>
  );
}
