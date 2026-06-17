import {Link} from "@/i18n/navigation";
import type {ReactNode} from "react";

type ToolSeoSectionsProps = {
  toolName: string;
  toolDescription: string;
  howTitle: string;
  useCasesTitle: string;
  relatedTitle: string;
  faqTitle: string;
  howToUse: string[];
  useCases: string[];
  relatedTools: Array<{slug: string; name: string; description: string}>;
  faq: Array<{question: string; answer: string}>;
  seoBody: string[];
  sampleSummaries: string[];
};

type SampleValue = {
  label?: string;
  prompt?: string;
  code?: string;
  diagramType?: string;
};

export function ToolSeoSections({
  toolName,
  toolDescription,
  howTitle,
  useCasesTitle,
  relatedTitle,
  faqTitle,
  howToUse,
  useCases,
  relatedTools,
  faq,
  seoBody,
  sampleSummaries
}: ToolSeoSectionsProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
      <InfoBlock title={howTitle}>
        <ol className="grid gap-2">
          {howToUse.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </InfoBlock>
      <InfoBlock title={useCasesTitle}>
        <div className="flex flex-wrap gap-2">
          {useCases.map((item) => (
            <span key={item} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock title={relatedTitle}>
        <div className="grid gap-3">
          {relatedTools.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-md border border-slate-200 p-3 hover:border-primary hover:bg-blue-50">
              <div className="font-semibold text-ink">{tool.name}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock title={faqTitle}>
        <div className="grid gap-4">
          {faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-semibold text-ink">{item.question}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </InfoBlock>
      <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
        <div className="grid gap-4 text-sm leading-7 text-slate-600 md:grid-cols-3">
          {seoBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      <InfoBlock title={`Review checklist for ${toolName}`}>
        <div className="grid gap-3 text-sm leading-7 text-slate-600">
          <p>
            Use {toolName} when you need to inspect source content visually before it becomes documentation,
            a pull request note, an incident write-up, or a handoff artifact. {toolDescription}
          </p>
          <p>
            Before exporting, check that labels are readable, relationships match the source, generated examples do not
            contain private data, and the preview still makes sense after you edit the input.
          </p>
        </div>
      </InfoBlock>
      <InfoBlock title="Limits and troubleshooting">
        <div className="grid gap-3 text-sm leading-7 text-slate-600">
          <p>
            If the preview fails, reduce the input to the smallest complete example, confirm the format syntax, and then
            add sections back one at a time. Many rendering failures come from partial files, indentation mistakes,
            missing diagram headers, or copied snippets that depend on hidden context.
          </p>
          <p>
            Treat the preview as a review surface rather than a source of truth. Generated diagrams, converted files,
            dashboards, and rule examples should be checked before they are used in production documentation or operations.
          </p>
        </div>
      </InfoBlock>
      {sampleSummaries.length ? (
        <InfoBlock title="Example inputs to test">
          <ul className="grid gap-2 text-sm leading-7 text-slate-600">
            {sampleSummaries.map((sample) => (
              <li key={sample}>{sample}</li>
            ))}
          </ul>
        </InfoBlock>
      ) : null}
    </section>
  );
}

function InfoBlock({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}

export function summarizeToolSamples(samples: Record<string, SampleValue>, limit = 3) {
  return Object.values(samples)
    .slice(0, limit)
    .map((sample) => {
      const label = sample.label || "Sample";
      const source = sample.prompt || sample.code || sample.diagramType || "";
      const summary = source.replace(/\s+/g, " ").trim();
      return summary ? `${label}: ${summary.slice(0, 180)}${summary.length > 180 ? "..." : ""}` : label;
    });
}
