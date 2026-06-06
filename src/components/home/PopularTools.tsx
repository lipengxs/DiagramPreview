import {useTranslations} from "next-intl";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";

export function PopularTools() {
  const t = useTranslations();
  const popularTools = tools.filter((tool) => tool.popular).slice(0, 8);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {popularTools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-workspace">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="mt-4 text-base font-semibold text-ink">{t(`tools.${tool.slug}.name`)}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{t(`tools.${tool.slug}.shortDescription`)}</p>
          </Link>
        );
      })}
    </div>
  );
}
