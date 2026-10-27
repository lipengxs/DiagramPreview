"use client";

import {useEffect, useRef, useState} from "react";
import type {DrawioViewerDocument} from "@/lib/renderers/drawio-viewer-model";
import type {DrawioPageImage} from "@/lib/renderers/drawio-viewer-svg";
import {drawioErrorText, drawioViewerCopy} from "./drawio-viewer-copy";

type Props = {
  document: DrawioViewerDocument;
  pageIndex: number;
  onSelectPage: (index: number) => void;
  image?: DrawioPageImage;
  current: boolean;
  locale?: string;
};

export function DrawioViewer({document, pageIndex, onSelectPage, image, current, locale}: Props) {
  const copy = drawioViewerCopy(locale);
  const page = document.pages[pageIndex];
  const viewport = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(800);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(Math.max(1, entry.contentRect.width - 16)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = zoom === "fit" ? Math.min(1, availableWidth / (image?.width || 1)) : zoom;
  return (
    <div className="min-w-0" data-drawio-viewer>
      <div className="flex min-w-0 flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
        <label className="flex min-w-0 max-w-full items-center gap-2 text-sm font-semibold">
          {copy.page}
          <select aria-label={copy.page} value={pageIndex} disabled={!current} onChange={(event) => {setZoom("fit"); onSelectPage(Number(event.target.value));}} className="min-w-0 max-w-[220px] rounded border border-slate-300 bg-white px-2 py-2">
            {document.pages.map((item, index) => <option key={index} value={index}>{index + 1}. {item.name}</option>)}
          </select>
        </label>
        <span className="text-xs text-slate-600">{document.pages.length} {copy.pages} · {page.cellCount} {copy.objects}</span>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button type="button" aria-label={copy.zoomOut} disabled={!current || !image || scale <= 0.1} onClick={() => setZoom(Math.max(0.1, scale / 1.25))} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">−</button>
          <output aria-label={copy.zoom}>{Math.round(scale * 100)}%</output>
          <button type="button" aria-label={copy.zoomIn} disabled={!current || !image || scale >= 4} onClick={() => setZoom(Math.min(4, scale * 1.25))} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">+</button>
          <button type="button" disabled={!current || !image} onClick={() => setZoom("fit")} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">{copy.fit}</button>
        </div>
      </div>
      <div ref={viewport} className="max-h-[680px] min-h-[360px] w-full min-w-0 overflow-auto py-3" aria-busy={!current}>
        {!current ? <p className="p-4 text-sm text-slate-600">{copy.pending}</p> : page.error ? <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">{drawioErrorText(page.error, locale)}</p> : image ? (
          <>
            {!page.graph?.nodes.length ? <p className="mb-3 text-sm text-slate-600">{copy.empty}</p> : null}
            <div className="drawio-page-image" style={{width: image.width * scale, height: image.height * scale}} dangerouslySetInnerHTML={{__html: image.svg}} />
          </>
        ) : null}
      </div>
      {page.warnings.length ? <p className="text-sm text-amber-900">{page.warnings.includes("labels") ? copy.simplified : ""} {page.warnings.includes("links") ? copy.links : ""}</p> : null}
    </div>
  );
}
