"use client";

import {Link} from "@/i18n/navigation";
import {trackEvent} from "@/lib/analytics";

type NextStepRecommendationsProps = {
  relatedTools: Array<{slug: string; name: string; description: string}>;
  title: string;
  description: string;
  actionLabel: string;
  currentSlug: string;
};

export function NextStepRecommendations({
  relatedTools,
  title,
  description,
  actionLabel,
  currentSlug
}: NextStepRecommendationsProps) {
  if (!relatedTools.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {relatedTools.slice(0, 3).map((related) => (
          <Link
            key={related.slug}
            href={`/${related.slug}`}
            className="group rounded-md border border-slate-200 p-3 hover:border-primary hover:bg-blue-50"
            onClick={() => trackEvent("tool_next_step_click", {tool_slug: currentSlug, target_tool_slug: related.slug})}
          >
            <div className="font-semibold text-ink group-hover:text-primary">{related.name}</div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{related.description}</p>
            <span className="mt-3 inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-primary ring-1 ring-blue-100">
              {actionLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
