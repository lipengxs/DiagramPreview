import type {Locale} from "@/config/locales";
import {TrackedToolLink} from "@/components/tools/TrackedToolLink";
import {Link} from "@/i18n/navigation";

export function PrimaryTasks({locale}: {locale: Locale}) {
  const zh = locale.startsWith("zh");
  const entries = zh ? [
    {slug: "mermaid-to-drawio", title: "Mermaid 转可编辑 draw.io", body: "粘贴流程图或时序源码，下载可编辑 XML；转换范围和布局变化会明确提示。"},
    {slug: "drawio-preview", title: "打开 Draw.io 文件", body: "本地打开压缩或多页文件，查看基础图形，导出当前页 SVG、PNG 或 XML。"},
    {slug: "plantuml-preview", title: "PlantUML 预览与导出", body: "预览时序、类、用例和活动图，下载 SVG、PNG 及原始 .puml；使用公共渲染服务。"}
  ] : [
    {slug: "mermaid-to-drawio", title: "Convert Mermaid to editable draw.io", body: "Paste a flowchart or sequence diagram and download editable XML, with clear conversion and layout limits."},
    {slug: "drawio-preview", title: "Open a Draw.io file", body: "Open compressed or multi-page files locally, inspect basic shapes, and export the selected page as SVG, PNG or XML."},
    {slug: "plantuml-preview", title: "Preview and export PlantUML", body: "Render sequence, class, use-case and activity diagrams. Download SVG, PNG or .puml using the public rendering service."}
  ];
  return (
    <section data-home-tasks aria-label={zh ? "选择要完成的任务" : "Choose your task"}>
      <h2 className="mb-4 text-xl font-bold text-ink">{zh ? "你现在想完成什么？" : "What do you want to do?"}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {entries.map((entry) => <TrackedToolLink key={entry.slug} href={`/${entry.slug}`} eventName="tool_entry_click" targetToolSlug={entry.slug} source="home_primary_task" className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-primary hover:bg-blue-50">
          <h3 className="text-lg font-semibold text-ink">{entry.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{entry.body}</p>
          <span className="mt-4 inline-block text-sm font-semibold text-primary">{zh ? "打开工具 →" : "Open tool →"}</span>
        </TrackedToolLink>)}
      </div>
      {zh ? <p className="mt-4 text-sm text-slate-600">用文本描述服务关系？ <Link href="/d2-preview" className="font-semibold text-primary hover:underline">试用 D2 基础预览</Link>，支持平面节点、标签和有向关系。</p> : null}
    </section>
  );
}
