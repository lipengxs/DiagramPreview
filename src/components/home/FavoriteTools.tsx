"use client";

import {Star} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import type {SearchTool} from "./ToolSearch";
import {Link} from "@/i18n/navigation";
import {readFavoriteToolSlugs} from "@/lib/favorite-tools";

type FavoriteToolsProps = {
  tools: SearchTool[];
  title: string;
  actionLabel: string;
};

export function FavoriteTools({tools, title, actionLabel}: FavoriteToolsProps) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    function refresh() {
      setFavoriteSlugs(readFavoriteToolSlugs(window.localStorage));
    }

    setHasMounted(true);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("diagrampreview:favorites-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("diagrampreview:favorites-updated", refresh);
    };
  }, []);

  const favoriteTools = useMemo(
    () =>
      favoriteSlugs
        .map((slug) => tools.find((tool) => tool.slug === slug))
        .filter((tool): tool is SearchTool => Boolean(tool)),
    [favoriteSlugs, tools]
  );

  if (!hasMounted || !favoriteTools.length) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
        <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {favoriteTools.slice(0, 4).map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} className="group rounded-lg border border-amber-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-workspace">
            <div className="font-semibold text-ink group-hover:text-primary">{tool.name}</div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{tool.description}</p>
            <span className="mt-3 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{actionLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
