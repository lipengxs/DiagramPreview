"use client";

import {useEffect, useRef, useState} from "react";
import DOMPurify from "dompurify";
import {marked} from "marked";
import type {DesignSpecMessages} from "@/config/design-spec-messages";
import {createDesignSpecDraft, designSpecLanguage, generateDesignSpec} from "@/lib/design-spec-generator";
import {copyText, downloadText} from "@/lib/exporters/svg";
import {sourceUrl} from "@/lib/source-links";
import {trackEvent} from "@/lib/analytics";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/Button";
import {CodeEditor} from "./CodeEditor";
import {PreviewPane} from "./PreviewPane";
import {DesignSpecReview} from "./DesignSpecReview";

const toolSlug = "design-spec-generator";

export function DesignSpecGenerator({locale, messages}: {locale: string; messages: DesignSpecMessages}) {
  const language = designSpecLanguage(locale);
  const copy = messages.generator;
  const [draft, setDraft] = useState(() => createDesignSpecDraft(messages.template.source));
  const [source, setSource] = useState(() => generateDesignSpec(draft, copy));
  const [lastGenerated, setLastGenerated] = useState(source);
  const [diagram, setDiagram] = useState(messages.review.diagramSource);
  const [view, setView] = useState<"preview" | "edit">("preview");
  const [replacePending, setReplacePending] = useState(false);
  const [notice, setNotice] = useState("");
  const [languageChange, setLanguageChange] = useState<null | (() => void)>(null);
  const languagePrompt = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState({html: "", error: "", busy: true});
  const nextSource = generateDesignSpec(draft, copy);
  const hasSource = Boolean(source.trim());

  const dirty = nextSource !== messages.template.source || source !== messages.template.source || diagram !== messages.review.diagramSource;
  useEffect(() => {
    if (languageChange) languagePrompt.current?.focus();
  }, [languageChange]);
  useEffect(() => {
    if (!dirty) return;
    const beforeLanguageChange = (event: Event) => {
      const proceed = (event as CustomEvent<{proceed: () => void}>).detail?.proceed;
      if (!proceed) return;
      event.preventDefault();
      setLanguageChange(() => proceed);
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = "";};
    window.addEventListener("before-locale-change", beforeLanguageChange);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("before-locale-change", beforeLanguageChange);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);

  useEffect(() => {
    trackEvent("tool_open", {tool_slug: toolSlug, renderer: "markdown", implemented: true});
  }, []);

  useEffect(() => {
    setPreview((current) => ({...current, busy: true}));
    const timer = window.setTimeout(() => {
      try {
        const html = DOMPurify.sanitize(marked.parse(source, {async: false, gfm: true}), {
          USE_PROFILES: {html: true},
          FORBID_TAGS: ["img", "video", "audio", "source", "style"],
          FORBID_ATTR: ["style", "src", "srcset", "poster", "background"]
        });
        setPreview({html, error: "", busy: false});
      } catch {
        setPreview({html: "", error: copy.previewError, busy: false});
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [source, copy.previewError]);

  function generate(confirmed = false) {
    if (!confirmed && source !== lastGenerated && source !== nextSource) {
      setReplacePending(true);
      return;
    }
    setSource(nextSource);
    setLastGenerated(nextSource);
    setReplacePending(false);
    setNotice(copy.generated);
    trackEvent("spec_generate", {tool_slug: toolSlug, output_language: language});
  }

  async function copyMarkdown() {
    try {
      await copyText(source);
      setNotice(copy.copied);
      trackEvent("tool_copy_markdown", {tool_slug: toolSlug, success: true});
    } catch {
      setNotice(copy.copyError);
      trackEvent("tool_copy_markdown", {tool_slug: toolSlug, success: false});
    }
  }

  function download() {
    try {
      downloadText(`design-spec.${language}.md`, source, "text/markdown;charset=utf-8");
      setNotice(copy.downloadStarted);
      trackEvent("tool_download_file", {tool_slug: toolSlug, success: true});
    } catch {
      setNotice(copy.downloadError);
      trackEvent("tool_download_file", {tool_slug: toolSlug, success: false});
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {languageChange ? (
        <div role="alert" ref={languagePrompt} tabIndex={-1} className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p>{copy.leaveWarning}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => setLanguageChange(null)}>{copy.cancel}</Button>
            <Button type="button" onClick={() => {setLanguageChange(null); languageChange();}}>{copy.switchLanguage}</Button>
          </div>
        </div>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={(event) => {event.preventDefault(); generate();}} className="grid min-w-0 gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-ink">{copy.formTitle}</h2>
          <p className="text-sm leading-6 text-slate-600">{copy.formHint}</p>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {copy.titleLabel}
            <input value={draft.title} maxLength={120} onChange={(event) => {setDraft({...draft, title: event.target.value}); setNotice("");}} className="min-w-0 rounded-md border border-slate-300 px-3 py-2 font-normal focus:outline-primary" />
          </label>
          {draft.sections.map((section, index) => (
            <details key={section.heading} open={index === 0 ? true : undefined} className="rounded-md border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">{section.heading}</summary>
              <label className="mt-3 grid gap-2">
                <span className="sr-only">{section.heading}</span>
                <textarea rows={index === 0 ? 5 : 8} value={section.body} maxLength={8000} onChange={(event) => {
                  setDraft({...draft, sections: draft.sections.map((item, itemIndex) => itemIndex === index ? {...item, body: event.target.value} : item)});
                  setNotice("");
                }} className="w-full min-w-0 resize-y rounded-md border border-slate-300 p-2 text-sm leading-6 text-slate-700 focus:outline-primary" />
              </label>
            </details>
          ))}
          <Button type="submit" variant="primary">{copy.generate}</Button>
          {nextSource !== lastGenerated ? <p className="text-sm text-slate-600">{copy.changed}</p> : null}
        </form>

        <section className="grid min-w-0 gap-4" aria-label={copy.outputTitle}>
          <h2 className="text-xl font-bold text-ink">{copy.outputTitle}</h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyMarkdown} disabled={!hasSource}>{copy.copy}</Button>
            <Button type="button" onClick={download} disabled={!hasSource}>{copy.download}</Button>
            {hasSource ? (
              <Link href={sourceUrl("/markdown-preview", source)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("tool_next_step_click", {tool_slug: toolSlug, target_tool_slug: "markdown-preview"})} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:border-primary">
                {copy.openPreview}
              </Link>
            ) : null}
          </div>
          <p className="text-xs leading-5 text-slate-500">{copy.openHint}</p>
          {replacePending ? (
            <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <p>{copy.replaceWarning}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={() => generate(true)}>{copy.replace}</Button>
                <Button type="button" onClick={() => setReplacePending(false)}>{copy.cancel}</Button>
              </div>
            </div>
          ) : null}
          <p role="status" className="min-h-5 text-sm text-slate-700">{notice}</p>
          <div className="flex gap-2">
            <Button type="button" aria-pressed={view === "preview"} variant={view === "preview" ? "primary" : "secondary"} onClick={() => setView("preview")}>{copy.preview}</Button>
            <Button type="button" aria-pressed={view === "edit"} variant={view === "edit" ? "primary" : "secondary"} onClick={() => setView("edit")}>{copy.edit}</Button>
          </div>
          {view === "edit" ? (
            <CodeEditor label={copy.editorLabel} value={source} placeholder={copy.placeholder} onChange={(value) => {setSource(value); setNotice(""); setReplacePending(false);}} minHeightClassName="min-h-[640px]" />
          ) : (
            <PreviewPane label={copy.preview} status={preview.busy ? copy.rendering : copy.ready} emptyText={copy.empty} error={preview.error} html={hasSource ? preview.html : ""} normalizePreviewHeadings className="max-h-[900px]" />
          )}
          <p className="text-sm leading-6 text-slate-600">{copy.manualHint}</p>
        </section>
      </div>
      <DesignSpecReview source={source} copy={messages.review} rules={messages.rules} unresolvedTerms={messages.unresolvedTerms} diagram={diagram} setDiagram={setDiagram} />
      <p className="mt-6 max-w-4xl text-sm leading-6 text-slate-600">{copy.privacy}</p>
    </div>
  );
}
