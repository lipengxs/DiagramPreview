import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {toolHubs, type ToolHub} from "@/config/navigation";
import {sortedTools, tools, type ToolNavGroup} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {buildMetadata} from "@/lib/seo";
import type {Locale} from "@/config/locales";

export type HubRouteProps = {
  params: Promise<{locale: Locale}>;
};

export function createHubMetadata(hubSlug: ToolHub["slug"]) {
  return async function generateMetadata({params}: HubRouteProps): Promise<Metadata> {
    const {locale} = await params;
    const hub = toolHubs.find((item) => item.slug === hubSlug);

    if (!hub) {
      notFound();
    }

    const t = await getTranslations({locale});
    return buildMetadata({
      locale,
      path: `/${locale}${hub.href}`,
      title: t(hub.titleKey),
      description: t(hub.descriptionKey),
      keywords: t.raw(hub.keywordsKey)
    });
  };
}

export async function HubPage({params, hubSlug}: HubRouteProps & {hubSlug: ToolHub["slug"]}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const hub = toolHubs.find((item) => item.slug === hubSlug);
  if (!hub) {
    notFound();
  }

  const t = await getTranslations({locale});
  const hubTools = getHubTools(hub.slug, hub.navGroup);
  const planned = t.raw(`hubs.${hub.slug}.planned`) as string[];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary">{t("hubs.common.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{t(hub.titleKey)}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t(hub.descriptionKey)}</p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">{t("hubs.common.availableTools")}</h2>
          <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
            {hubTools.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hubTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-workspace">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-base font-semibold text-ink">{t(`tools.${tool.slug}.name`)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(`tools.${tool.slug}.shortDescription`)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {planned.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-ink">{t("hubs.common.plannedTools")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {planned.map((item) => (
              <span key={item} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function getHubTools(slug: ToolHub["slug"], navGroup?: ToolNavGroup) {
  if (slug === "tools") {
    return sortedTools;
  }

  if (slug === "data-visualizers") {
    return sortedTools.filter((tool) => tool.category === "data");
  }

  if (!navGroup) {
    return tools;
  }

  return sortedTools.filter((tool) => tool.navGroup === navGroup);
}
