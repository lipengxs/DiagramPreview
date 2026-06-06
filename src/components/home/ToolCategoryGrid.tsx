import {useTranslations} from "next-intl";
import {toolHubs} from "@/config/navigation";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";

export function ToolCategoryGrid() {
  const t = useTranslations();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {toolHubs
        .filter((hub) => hub.slug !== "tools")
        .map((hub) => {
          const categoryTools =
            hub.slug === "data-visualizers"
              ? tools.filter((tool) => tool.category === "data")
              : tools.filter((tool) => tool.navGroup === hub.navGroup);
        return (
          <div key={hub.slug} className="rounded-lg border border-slate-200 bg-white p-4">
            <Link href={hub.href} className="text-base font-semibold text-ink hover:text-primary">
              {t(hub.titleKey)}
            </Link>
            <div className="mt-4 flex flex-col gap-2">
              {categoryTools.map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}`} className="text-sm text-slate-600 hover:text-primary">
                  {t(`tools.${tool.slug}.name`)}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
