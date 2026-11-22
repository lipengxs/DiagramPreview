"use client";

import {useState} from "react";
import type {DesignSpecMessages} from "@/config/design-spec-messages";
import {reviewDesignSpec} from "@/lib/design-spec-review";
import {sourceUrl} from "@/lib/source-links";
import {trackEvent} from "@/lib/analytics";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/Button";
import {CodeEditor} from "./CodeEditor";

export function DesignSpecReview({source, copy, rules, unresolvedTerms, diagram, setDiagram}: {
  source: string;
  copy: DesignSpecMessages["review"];
  rules: DesignSpecMessages["rules"];
  unresolvedTerms: string[];
  diagram: string;
  setDiagram: (value: string) => void;
}) {
  const [review, setReview] = useState<{source: string; report: ReturnType<typeof reviewDesignSpec>} | null>(null);
  const current = review?.source === source ? review.report : null;

  return (
    <section className="mt-8 min-w-0 rounded-lg border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="spec-review-title">
      <h2 id="spec-review-title" className="text-xl font-bold text-ink">{copy.title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{copy.intro}</p>
      <Button type="button" variant="primary" className="mt-4" disabled={!source.trim()} onClick={() => {
        setReview({source, report: reviewDesignSpec(source, {rules, unresolvedTerms})});
        trackEvent("spec_check", {tool_slug: "design-spec-generator"});
      }}>{copy.check}</Button>
      <p role="status" className="mt-3 text-sm font-medium text-slate-700">{review ? current ? copy.checked : copy.stale : ""}</p>
      <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600">{copy.limits}</p>
      {current ? (
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
          {current.results.map(({id, evidence}, index) => {
            const rule = rules[index];
            return (
              <article key={id} className="min-w-0 rounded-md border border-slate-200 p-4">
                <h3 className="font-semibold text-ink">{rule.title}</h3>
                <p className={`mt-2 text-sm font-medium ${evidence ? "text-slate-700" : "text-amber-800"}`}>{evidence ? copy.found : copy.missing}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy.rule}：{rule.criteria}</p>
                {rule.terms.length ? <p className="mt-1 break-words text-xs leading-5 text-slate-500">{rule.terms.map((group) => group.join(" / ")).join(" + ")}</p> : null}
                {evidence ? <blockquote className="mt-3 whitespace-pre-wrap break-words border-l-2 border-slate-300 pl-3 text-sm leading-6 text-slate-700"><span className="block font-semibold">{copy.line} {evidence.line}</span>{evidence.original}</blockquote> : <p className="mt-3 whitespace-pre-wrap break-words rounded bg-amber-50 p-3 text-sm leading-6 text-amber-950"><span className="block font-semibold">{copy.suggestion}</span>{rule.suggestion}</p>}
              </article>
            );
          })}
          <article className="min-w-0 rounded-md border border-slate-200 p-4">
            <h3 className="font-semibold text-ink">{copy.unresolved}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy.unresolvedRule}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{current.unresolved.length ? copy.unresolvedFound : copy.unresolvedMissing}</p>
            {current.unresolved.slice(0, 5).map((evidence) => <blockquote key={evidence.line} className="mt-3 whitespace-pre-wrap break-words border-l-2 border-amber-300 pl-3 text-sm leading-6 text-slate-700"><span className="block font-semibold">{copy.line} {evidence.line}</span>{evidence.original}</blockquote>)}
          </article>
        </div>
      ) : null}
      <details className="mt-6 min-w-0 rounded-md border border-slate-200 p-4">
        <summary className="cursor-pointer font-semibold text-ink">{copy.diagramTitle}</summary>
        <p className="my-3 max-w-4xl text-sm leading-6 text-slate-600">{copy.diagramHint}</p>
        <CodeEditor label={copy.diagramLabel} value={diagram} onChange={setDiagram} placeholder="flowchart TD" />
        {diagram.trim() ? <Link href={sourceUrl("/mermaid-preview", diagram)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("tool_next_step_click", {tool_slug: "design-spec-generator", target_tool_slug: "mermaid-preview"})} className="mt-3 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-primary hover:border-primary">{copy.diagramOpen}</Link> : null}
        <p className="mt-2 text-xs leading-5 text-slate-500">{copy.diagramPrivacy}</p>
      </details>
    </section>
  );
}
