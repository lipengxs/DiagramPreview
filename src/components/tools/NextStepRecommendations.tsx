"use client";

import {Link} from "@/i18n/navigation";
import {trackEvent} from "@/lib/analytics";
import {toolHandoff} from "@/lib/tool-handoff";
import {handoffCopy} from "./handoff-copy";

type NextStepRecommendationsProps = {
  relatedTools: Array<{slug: string; name: string; description: string}>;
  title: string;
  description: string;
  actionLabel: string;
  currentSlug: string;
  source?: string;
  current?: boolean;
  artifact?: {filename: string; mime: string; content: string};
  locale?: string;
  onDownload?: (file: {filename: string; mime: string; content: string}) => void;
};

export function NextStepRecommendations({
  relatedTools,
  title,
  description,
  actionLabel,
  currentSlug,
  source = "",
  current = false,
  artifact,
  locale,
  onDownload
}: NextStepRecommendationsProps) {
  const workflow = workflowForTool(currentSlug);
  const orderedTools = orderRelatedTools(relatedTools, workflow?.tools || []);
  const copy = handoffCopy(locale);

  if (!orderedTools.length) {
    return null;
  }

  return (
    <section aria-label={title} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      {workflow ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-primary">{hasCjk(title) ? workflow.labelZh : workflow.label}</span>
          {workflow.tools.map((slug) => (
            <span key={slug} className={slug === currentSlug ? "rounded-md bg-slate-900 px-2 py-1 text-white" : "rounded-md bg-slate-100 px-2 py-1"}>
              {slug}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {orderedTools.slice(0, 3).map((related) => {
          const handoff = toolHandoff({slug: currentSlug, source, current, artifact}, related.slug);
          const label = handoff.tooLarge ? copy.open : handoff.kind === "source" && handoff.file ? copy.source : handoff.kind === "drawio" ? copy.xml : actionLabel;
          return (
          <div key={related.slug} data-handoff-target={related.slug} className="min-w-0 rounded-md border border-slate-200 p-3">
            <div className="font-semibold text-ink">{related.name}</div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{related.description}</p>
            {handoff.kind === "unavailable" ? <p className="mt-3 text-sm text-slate-600" role="status">{copy.unavailable}</p> : <Link
              href={handoff.href}
              className="mt-3 inline-flex rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-primary hover:bg-blue-100"
              onClick={() => trackEvent("tool_next_step_click", {tool_slug: currentSlug, target_tool_slug: related.slug, entry_surface: "workspace_next_step"})}
            >{label}</Link>}
            {handoff.tooLarge && handoff.file && onDownload ? <div className="mt-3 text-sm leading-6 text-slate-600">
              <p>{copy.large}</p>
              <button type="button" className="mt-2 rounded-md border border-slate-300 px-3 py-2 font-semibold text-primary" onClick={() => onDownload(handoff.file!)}>{copy.download}</button>
            </div> : null}
          </div>
        );})}
      </div>
    </section>
  );
}

function workflowForTool(currentSlug: string) {
  return workflowPaths.find((workflow) => workflow.tools.includes(currentSlug));
}

function orderRelatedTools(relatedTools: NextStepRecommendationsProps["relatedTools"], workflowTools: string[]) {
  if (!workflowTools.length) return relatedTools;
  return [...relatedTools].sort((left, right) => {
    const leftIndex = workflowTools.indexOf(left.slug);
    const rightIndex = workflowTools.indexOf(right.slug);
    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

const workflowPaths = [
  {
    label: "AI Mermaid workflow",
    labelZh: "AI Mermaid 工作流",
    tools: ["text-to-mermaid", "mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio", "drawio-preview"]
  },
  {
    label: "PlantUML handoff workflow",
    labelZh: "PlantUML 交付工作流",
    tools: ["plantuml-preview", "plantuml-to-drawio", "drawio-preview"]
  },
  {
    label: "API debugging workflow",
    labelZh: "API 排障工作流",
    tools: ["openapi-to-sequence", "postman-collection-sequence-diagram", "har-file-sequence-diagram", "api-error-flow-diagram"]
  },
  {
    label: "Schema documentation workflow",
    labelZh: "Schema 文档工作流",
    tools: ["json-schema-visualizer", "json-schema-form-preview", "zod-schema-visualizer", "typescript-interface-visualizer"]
  }
];

function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}
