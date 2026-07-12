import {useTranslations} from "next-intl";
import {FavoriteToolButton} from "@/components/tools/FavoriteToolButton";
import {TrackedToolLink} from "@/components/tools/TrackedToolLink";
import {getTool, tools} from "@/config/tools";
import {seoPriorityHomeToolSlugs} from "@/config/seo-focus";
import {favoriteLabelsFromAction} from "@/lib/favorite-labels";

export function PopularTools() {
  const t = useTranslations();
  const actionLabel = t("common.actions.openTool");
  const favoriteLabels = favoriteLabelsFromAction(actionLabel);
  const fallbackTools = tools.filter((tool) => tool.popular && !seoPriorityHomeToolSlugs.includes(tool.slug));
  const popularTools = seoPriorityHomeToolSlugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
    .concat(fallbackTools)
    .slice(0, 8);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {popularTools.map((tool) => {
        const Icon = tool.icon;
        return (
          <article key={tool.slug} className="relative rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-primary hover:shadow-workspace">
            <FavoriteToolButton slug={tool.slug} labels={favoriteLabels} compact className="absolute right-3 top-3 z-10 bg-white/95" />
            <TrackedToolLink
              href={`/${tool.slug}`}
              className="block p-4 pr-14"
              eventName="tool_entry_click"
              targetToolSlug={tool.slug}
              source="popular_tools"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold text-ink">{t(`tools.${tool.slug}.name`)}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{t(`tools.${tool.slug}.shortDescription`)}</p>
            </TrackedToolLink>
          </article>
        );
      })}
    </div>
  );
}
