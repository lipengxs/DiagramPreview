"use client";

import {Clock3} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import type {SearchTool} from "./ToolSearch";
import {Link} from "@/i18n/navigation";
import {readRecentTools, type RecentToolEntry} from "@/lib/recent-tools";

type RecentlyUsedToolsProps = {
  tools: SearchTool[];
  title: string;
  actionLabel: string;
};

export function RecentlyUsedTools({tools, title, actionLabel}: RecentlyUsedToolsProps) {
  const [recentEntries, setRecentEntries] = useState<RecentToolEntry[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setRecentEntries(readRecentTools(window.localStorage));
  }, []);

  const recentTools = useMemo(
    () =>
      recentEntries
        .map((entry) => tools.find((tool) => tool.slug === entry.slug))
        .filter((tool): tool is SearchTool => Boolean(tool)),
    [recentEntries, tools]
  );

  if (!hasMounted) {
    return null;
  }

  if (!recentTools.length) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
        <Clock3 className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recentTools.slice(0, 4).map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-primary hover:shadow-workspace">
            <div className="font-semibold text-ink group-hover:text-primary">{tool.name}</div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{tool.description}</p>
            <span className="mt-3 inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-primary">{actionLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
