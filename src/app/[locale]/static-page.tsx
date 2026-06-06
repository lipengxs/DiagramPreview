import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound, redirect} from "next/navigation";
import type {Locale} from "@/config/locales";
import {isStaticPageSlug, type StaticPageSlug} from "@/config/static-pages";
import {buildMetadata} from "@/lib/seo";

export type StaticRouteProps = {
  params: Promise<{locale: Locale}>;
};

export function createStaticPageMetadata(slug: StaticPageSlug) {
  return async function generateMetadata({params}: StaticRouteProps): Promise<Metadata> {
    const {locale} = await params;
    const t = await getTranslations({locale});

    return buildMetadata({
      locale,
      path: `/${locale}/${slug}`,
      title: t(`staticPages.${slug}.seoTitle`),
      description: t(`staticPages.${slug}.description`),
      keywords: t.raw(`staticPages.${slug}.keywords`)
    });
  };
}

export async function StaticPage({params, slug}: StaticRouteProps & {slug: StaticPageSlug}) {
  const {locale} = await params;
  if (!isStaticPageSlug(slug)) notFound();
  if (locale !== "en") redirect(`/en/${slug}`);

  setRequestLocale(locale);
  const t = await getTranslations({locale});
  const sections = t.raw(`staticPages.${slug}.sections`) as Array<{heading: string; paragraphs: string[]}>;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-primary">{t("staticPages.common.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{t(`staticPages.${slug}.title`)}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{t(`staticPages.${slug}.description`)}</p>
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        {sections.map((section) => (
          <section key={section.heading} className="mb-8 last:mb-0">
            <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
            <div className="mt-3 grid gap-4 text-base leading-8 text-slate-600">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
