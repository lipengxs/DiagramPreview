import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {growthContentIndexableLocales} from "@/config/seo-focus";
import {templateCategories, templates} from "@/config/templates";
import {type Locale} from "@/config/locales";
import {getTool} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {breadcrumbJsonLd, buildMetadata, collectionPageJsonLd} from "@/lib/seo";
import {absoluteUrl} from "@/lib/paths";
import {sourceUrl} from "@/lib/source-links";

type TemplatesPageProps = {
  params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: TemplatesPageProps): Promise<Metadata> {
  const {locale} = await params;
  const metadata = buildMetadata({
    locale,
    path: `/${locale}/templates`,
    title: "Diagram Templates and Examples - DiagramPreview",
    description: "Paste-ready Mermaid, draw.io, API, schema, and DevOps diagram templates that open directly in DiagramPreview tools.",
    keywords: ["diagram templates", "mermaid templates", "drawio examples", "api sequence diagram examples"]
  });

  if (growthContentIndexableLocales.includes(locale)) {
    return metadata;
  }

  return {
    ...metadata,
    alternates: {canonical: absoluteUrl("/en/templates")},
    robots: {index: false, follow: true}
  };
}

export default async function TemplatesPage({params}: TemplatesPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale});
  const isChineseLocale = locale.startsWith("zh");
  const pageTitle = isChineseLocale ? "可直接打开的图表模板" : "Paste-ready diagram templates";
  const pageDescription = isChineseLocale
    ? "从 Mermaid、draw.io、API、Schema 和 DevOps 示例开始，直接打开对应工具并带入示例输入。"
    : "Start from Mermaid, draw.io, API, schema, and DevOps examples that open directly in the matching DiagramPreview tool.";
  const collectionLd = collectionPageJsonLd({
    name: pageTitle,
    description: pageDescription,
    url: absoluteUrl(`/${locale}/templates`),
    items: templates.map((template) => ({
      name: template.title,
      description: template.description,
      url: absoluteUrl(`/${locale}${sourceUrl(`/${template.tool}`, template.source)}`)
    }))
  });
  const breadcrumbLd = breadcrumbJsonLd([
    {name: "DiagramPreview", url: absoluteUrl(`/${locale}`)},
    {name: pageTitle, url: absoluteUrl(`/${locale}/templates`)}
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(collectionLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary">{isChineseLocale ? "示例库" : "Template library"}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{pageTitle}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{pageDescription}</p>
      </section>

      {templateCategories.map((category) => {
        const categoryTemplates = templates.filter((template) => template.category === category.id);
        return (
          <section key={category.id} className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">{category.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryTemplates.map((template) => {
                const tool = getTool(template.tool);
                const Icon = tool?.icon;
                return (
                  <article key={template.slug} className="rounded-lg border border-slate-200 bg-white p-4">
                    {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
                    <h3 className="mt-4 text-base font-semibold text-ink">{template.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={sourceUrl(`/${template.tool}`, template.source)}
                        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {isChineseLocale ? "打开模板" : "Open template"}
                      </Link>
                      <Link href={`/${template.tool}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                        {tool ? t(`tools.${tool.slug}.name`) : template.tool}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      </div>
    </>
  );
}
