import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import type {Locale} from "@/config/locales";
import {growthContentIndexableLocales} from "@/config/seo-focus";
import {getWorkflow, workflows} from "@/config/workflows";
import {getTool} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {breadcrumbJsonLd, buildMetadata, faqJsonLd, howToJsonLd} from "@/lib/seo";
import {absoluteUrl} from "@/lib/paths";
import {sourceUrl} from "@/lib/source-links";

type WorkflowPageProps = {
  params: Promise<{locale: Locale; slug: string}>;
};

export function generateStaticParams() {
  return workflows.map((workflow) => ({slug: workflow.slug}));
}

export async function generateMetadata({params}: WorkflowPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();
  const metadata = buildMetadata({
    locale,
    path: `/${locale}/workflows/${workflow.slug}`,
    title: `${workflow.title} - DiagramPreview`,
    description: workflow.description,
    keywords: workflow.keywords
  });

  if (growthContentIndexableLocales.includes(locale)) {
    return metadata;
  }

  return {
    ...metadata,
    alternates: {canonical: absoluteUrl(`/en/workflows/${workflow.slug}`)},
    robots: {index: false, follow: true}
  };
}

export default async function WorkflowPage({params}: WorkflowPageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale});
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();
  const isChineseLocale = locale.startsWith("zh");
  const workflowUrl = absoluteUrl(`/${locale}/workflows/${workflow.slug}`);
  const examplePath = sourceUrl(`/${workflow.example.tool}`, workflow.example.source);
  const exampleTool = getTool(workflow.example.tool);
  const exampleToolName = exampleTool ? t(`tools.${exampleTool.slug}.name`) : workflow.example.tool;
  const howToLd = howToJsonLd({
    name: workflow.title,
    description: workflow.description,
    url: workflowUrl,
    steps: workflow.steps.map((step, index) => ({
      name: step.title,
      text: step.body,
      url: `${workflowUrl}#step-${index + 1}`
    }))
  });
  const faqLd = faqJsonLd(workflow.faq);
  const breadcrumbLd = breadcrumbJsonLd([
    {name: "DiagramPreview", url: absoluteUrl(`/${locale}`)},
    {name: isChineseLocale ? "开发者图表工作流" : "Developer diagram workflows", url: absoluteUrl(`/${locale}/workflows`)},
    {name: workflow.title, url: workflowUrl}
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(howToLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}} />
      <article className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">{isChineseLocale ? "工作流指南" : "Workflow guide"}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{workflow.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{workflow.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={examplePath}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {isChineseLocale ? "打开示例" : "Open example"}
            </Link>
            <Link href={`/${workflow.example.tool}`} className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
              {exampleToolName}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {workflow.steps.map((step, index) => (
            <div id={`step-${index + 1}`} key={step.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{step.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold text-primary">{isChineseLocale ? "可直接试用" : "Paste-ready example"}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">{workflow.example.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{workflow.example.description}</p>
              <Link
                href={examplePath}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {isChineseLocale ? "用这个示例打开工具" : "Open this example"}
              </Link>
            </div>
            <pre className="max-h-80 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{workflow.example.source}</code>
            </pre>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-ink">{isChineseLocale ? "常见问题" : "Workflow FAQ"}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {workflow.faq.map((item) => (
              <div key={item.question} className="rounded-md border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-ink">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-ink">{isChineseLocale ? "相关工具" : "Related tools"}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.tools.map((slug) => {
              const tool = getTool(slug);
              if (!tool) return null;
              const Icon = tool.icon;
              return (
                <Link key={slug} href={`/${slug}`} className="rounded-md border border-slate-200 p-3 hover:border-primary hover:bg-blue-50">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{t(`tools.${slug}.name`)}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{t(`tools.${slug}.shortDescription`)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </>
  );
}
