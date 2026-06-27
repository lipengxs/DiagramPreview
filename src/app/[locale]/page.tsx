import {getTranslations, setRequestLocale} from "next-intl/server";
import type {Metadata} from "next";
import type {ReactNode} from "react";
import {CoreWorkflows} from "@/components/home/CoreWorkflows";
import {PopularTools} from "@/components/home/PopularTools";
import {ToolCategoryGrid} from "@/components/home/ToolCategoryGrid";
import {ToolSearch, type SearchTool} from "@/components/home/ToolSearch";
import {type Locale} from "@/config/locales";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {absoluteUrl} from "@/lib/paths";
import {buildMetadata, websiteJsonLd} from "@/lib/seo";

type HomePageProps = {
  params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale});

  return buildMetadata({
    locale,
    path: `/${locale}`,
    title: t("home.metadata.title"),
    description: t("home.metadata.description"),
    keywords: t.raw("home.metadata.keywords")
  });
}

export default async function HomePage({params}: HomePageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale});

  const searchTools: SearchTool[] = tools.map((tool) => ({
    slug: tool.slug,
    name: t(`tools.${tool.slug}.name`),
    description: t(`tools.${tool.slug}.shortDescription`),
    category: t(`common.category.${tool.category}`)
  }));
  const pageDescription = t("home.metadata.description");
  const websiteLd = websiteJsonLd({
    locale,
    name: "DiagramPreview",
    description: pageDescription,
    url: absoluteUrl(`/${locale}`)
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(websiteLd)}} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-primary">{t("home.hero.eyebrow")}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal text-ink sm:text-5xl">{t("home.hero.h1")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{t("home.hero.subtitle")}</p>
          </div>
          <ToolSearch
            tools={searchTools}
            placeholder={t("home.hero.searchPlaceholder")}
            actionLabel={t("common.actions.openTool")}
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <HomeSection title={locale.startsWith("zh") ? "核心工作流" : "Core Workflows"}>
          <CoreWorkflows />
        </HomeSection>
        <HomeSection title={locale.startsWith("zh") ? "从样例开始" : "Start from an example"}>
          <GrowthEntrySection locale={locale} />
        </HomeSection>
        <HomeSection title={t("home.sections.demo")}>
          <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-5">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-primary">{t("home.demo.eyebrow")}</p>
              <h3 className="mt-2 text-2xl font-bold tracking-normal text-ink">{t("home.demo.title")}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t("home.demo.description")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(t.raw("home.demo.badges") as string[]).map((badge) => (
                  <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <video
                className="aspect-video h-full w-full bg-slate-950 object-cover"
                controls
                playsInline
                preload="metadata"
                aria-label={t("home.demo.videoLabel")}
              >
                <source src="/product-hunt-demo/product-hunt-demo-with-voice.mp4" type="video/mp4" />
                {t("home.demo.videoFallback")}
              </video>
            </div>
          </div>
        </HomeSection>
        <HomeSection title={t("home.sections.popular")}>
          <PopularTools />
        </HomeSection>
        <HomeSection title={t("home.sections.categories")}>
          <ToolCategoryGrid />
        </HomeSection>
        <HomeSection title={t("home.sections.recent")}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((tool) => tool.recentlyAdded)
              .map((tool) => (
                <a key={tool.slug} href={`/${locale}/${tool.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-primary">
                  <div className="font-semibold text-ink">{t(`tools.${tool.slug}.name`)}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(`tools.${tool.slug}.shortDescription`)}</p>
                </a>
              ))}
          </div>
        </HomeSection>
        <HomeSection title={t("home.sections.why")}>
          <div className="grid gap-4 md:grid-cols-3">
            {(t.raw("home.why") as string[]).map((item) => (
              <p key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                {item}
              </p>
            ))}
          </div>
        </HomeSection>
        <HomeSection title={t("home.sections.faq")}>
          <div className="grid gap-4 md:grid-cols-3">
            {(t.raw("home.faq") as Array<{question: string; answer: string}>).map((item) => (
              <div key={item.question} className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="font-semibold text-ink">{item.question}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </HomeSection>
      </div>
    </>
  );
}

function GrowthEntrySection({locale}: {locale: Locale}) {
  const isChineseLocale = locale.startsWith("zh");
  const entries = [
    {
      href: "/templates",
      eyebrow: isChineseLocale ? "模板库" : "Template library",
      title: isChineseLocale ? "打开可直接预览的图表模板" : "Open paste-ready diagram templates",
      description: isChineseLocale
        ? "从 Mermaid、draw.io、API、Schema 和 DevOps 示例开始，直接带入对应工具。"
        : "Start with Mermaid, draw.io, API, schema, and DevOps examples that load directly into the matching tool.",
      action: isChineseLocale ? "查看模板" : "View templates"
    },
    {
      href: "/workflows",
      eyebrow: isChineseLocale ? "工作流指南" : "Workflow guides",
      title: isChineseLocale ? "按开发场景串联多个工具" : "Follow developer diagram workflows",
      description: isChineseLocale
        ? "围绕 AI 生成、draw.io 预览、API 排障和 Schema 可视化，把工具组织成可执行流程。"
        : "Connect tools around AI diagrams, draw.io review, API debugging, and schema visualization.",
      action: isChineseLocale ? "查看工作流" : "View workflows"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => (
        <section key={entry.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{entry.eyebrow}</p>
          <h3 className="mt-3 text-lg font-bold text-ink">{entry.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p>
          <Link
            href={entry.href}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {entry.action}
          </Link>
        </section>
      ))}
    </div>
  );
}

function HomeSection({title, children}: {title: string; children: ReactNode}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
