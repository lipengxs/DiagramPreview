import {getTranslations, setRequestLocale} from "next-intl/server";
import type {Metadata} from "next";
import type {ReactNode} from "react";
import {PopularTools} from "@/components/home/PopularTools";
import {ToolCategoryGrid} from "@/components/home/ToolCategoryGrid";
import {ToolSearch, type SearchTool} from "@/components/home/ToolSearch";
import {type Locale} from "@/config/locales";
import {tools} from "@/config/tools";
import {buildMetadata} from "@/lib/seo";

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

  return (
    <>
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

function HomeSection({title, children}: {title: string; children: ReactNode}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
