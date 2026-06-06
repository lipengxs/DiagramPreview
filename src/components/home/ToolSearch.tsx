"use client";

import {Search} from "lucide-react";
import {useMemo, useState} from "react";
import {Link} from "@/i18n/navigation";

export type SearchTool = {
  slug: string;
  name: string;
  description: string;
  category: string;
};

type ToolSearchProps = {
  tools: SearchTool[];
  placeholder: string;
  actionLabel: string;
};

export function ToolSearch({tools, placeholder, actionLabel}: ToolSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return tools.slice(0, 6);
    }

    return tools
      .filter((tool) => `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery, tools]);

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
          <Link key={tool.slug} href={`/${tool.slug}`} className="group rounded-md border border-slate-200 p-3 transition hover:border-primary hover:bg-blue-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-ink group-hover:text-primary">{tool.name}</div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{tool.description}</p>
              </div>
              <span className="whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-primary ring-1 ring-blue-100">
                {actionLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
