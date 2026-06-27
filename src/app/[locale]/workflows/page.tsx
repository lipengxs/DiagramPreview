import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import {growthContentIndexableLocales} from "@/config/seo-focus";
import {workflows} from "@/config/workflows";
import type {Locale} from "@/config/locales";
import {Link} from "@/i18n/navigation";
import {breadcrumbJsonLd, buildMetadata, collectionPageJsonLd} from "@/lib/seo";
import {absoluteUrl} from "@/lib/paths";

type WorkflowsPageProps = {
  params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: WorkflowsPageProps): Promise<Metadata> {
  const {locale} = await params;
  const metadata = buildMetadata({
    locale,
    path: `/${locale}/workflows`,
    title: "Developer Diagram Workflows - DiagramPreview",
    description: "Practical workflows for AI-generated Mermaid diagrams, draw.io files, API debugging, and schema visualization.",
    keywords: ["developer diagram workflows", "ai mermaid workflow", "api debugging sequence diagram", "schema visualization workflow"]
  });

  if (growthContentIndexableLocales.includes(locale)) {
    return metadata;
  }

  return {
    ...metadata,
    alternates: {canonical: absoluteUrl("/en/workflows")},
    robots: {index: false, follow: true}
  };
}

export default async function WorkflowsPage({params}: WorkflowsPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const isChineseLocale = locale.startsWith("zh");
  const pageTitle = isChineseLocale ? "开发者图表工作流" : "Developer diagram workflows";
  const pageDescription = isChineseLocale
    ? "围绕 AI 生成图表、draw.io 文件、API 排障和 Schema 可视化，把多个工具串成可执行流程。"
    : "Connect DiagramPreview tools into practical flows for AI-generated diagrams, draw.io files, API debugging, and schema visualization.";
  const collectionLd = collectionPageJsonLd({
    name: pageTitle,
    description: pageDescription,
    url: absoluteUrl(`/${locale}/workflows`),
    items: workflows.map((workflow) => ({
      name: workflow.title,
      description: workflow.description,
      url: absoluteUrl(`/${locale}/workflows/${workflow.slug}`)
    }))
  });
  const breadcrumbLd = breadcrumbJsonLd([
    {name: "DiagramPreview", url: absoluteUrl(`/${locale}`)},
    {name: pageTitle, url: absoluteUrl(`/${locale}/workflows`)}
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(collectionLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">{isChineseLocale ? "工作流" : "Workflows"}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{pageTitle}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{pageDescription}</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Link key={workflow.slug} href={`/workflows/${workflow.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 hover:border-primary hover:shadow-workspace">
              <h2 className="text-lg font-bold text-ink">{workflow.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {workflow.tools.slice(0, 4).map((tool) => (
                  <span key={tool} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {tool}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
