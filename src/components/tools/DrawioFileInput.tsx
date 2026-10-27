"use client";

import {useEffect, useRef} from "react";
import {DRAWIO_MAX_FILE_BYTES} from "@/lib/renderers/drawio-viewer-model";
import {drawioViewerCopy} from "./drawio-viewer-copy";

type Props = {value: string; locale?: string; onLoad: (source: string) => void; onError: (message: string | null) => void; onReading: (reading: boolean) => void};

export function DrawioFileInput({value, locale, onLoad, onError, onReading}: Props) {
  const copy = drawioViewerCopy(locale);
  const reader = useRef<FileReader | null>(null);
  useEffect(() => {
    return () => {
      if (reader.current?.readyState === FileReader.LOADING) reader.current.abort();
    };
  }, [value]);
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
      <label className="block text-sm font-semibold text-ink">
        {copy.upload}
        <input type="file" accept=".drawio,.xml,application/xml,text/xml" className="mt-2 block w-full min-w-0 max-w-full text-sm file:mr-3 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-3 file:py-2" onChange={(event) => {
          if (reader.current?.readyState === FileReader.LOADING) reader.current.abort();
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          onError(null);
          if (!file.size) {onError(copy.fileError); return;}
          if (file.size > DRAWIO_MAX_FILE_BYTES) {onError(copy.errors.LIMIT); return;}
          const next = new FileReader();
          reader.current = next;
          onReading(true);
          next.onload = () => {
            onReading(false);
            try {
              if (!(next.result instanceof ArrayBuffer)) throw new Error("Invalid file buffer");
              onLoad(new TextDecoder("utf-8", {fatal: true}).decode(next.result));
            } catch {onError(copy.fileError);}
          };
          next.onerror = () => {onReading(false); onError(copy.fileError);};
          next.onabort = () => onReading(false);
          next.readAsArrayBuffer(file);
        }} />
      </label>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy.local}</p>
    </div>
  );
}
