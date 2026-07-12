"use client";

import {Search} from "lucide-react";
import {useMemo, useState} from "react";
import {FavoriteToolButton} from "@/components/tools/FavoriteToolButton";
import {Link} from "@/i18n/navigation";
import {trackEvent} from "@/lib/analytics";
import {favoriteLabelsFromAction} from "@/lib/favorite-labels";

export type SearchTool = {
  slug: string;
  name: string;
  description: string;
  category: string;
};

type ToolSearchProps = {
  tools: SearchTool[];
  defaultTools?: SearchTool[];
  placeholder: string;
  actionLabel: string;
};

export function ToolSearch({tools, defaultTools, placeholder, actionLabel}: ToolSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const favoriteLabels = favoriteLabelsFromAction(actionLabel);
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return (defaultTools && defaultTools.length ? defaultTools : tools).slice(0, 6);
    }

    return tools
      .filter((tool) => `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [defaultTools, normalizedQuery, tools]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-workspace">
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-surface px-3 py-3">
        <Search className="h-5 w-5 flex-none text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {results.map((tool) => (
          <div key={tool.slug} className="relative rounded-md border border-slate-200 transition hover:border-primary hover:bg-blue-50">
            <FavoriteToolButton
              slug={tool.slug}
              labels={favoriteLabels}
              compact
              className="absolute right-2 top-2 z-10 bg-white/95"
            />
            <Link
              href={`/${tool.slug}`}
              className="group block p-3 pr-12"
              onClick={() =>
                trackEvent("tool_entry_click", {
                  tool_slug: tool.slug,
                  source: "home_search",
                  has_query: Boolean(normalizedQuery),
                  query_length: normalizedQuery.length
                })
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-ink group-hover:text-primary">{tool.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{tool.description}</p>
                </div>
                <span className="mt-10 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-primary ring-1 ring-blue-100 sm:mt-0">
                  {actionLabel}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
