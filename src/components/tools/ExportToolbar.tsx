"use client";

import {Copy, Download, FileDown, ImageDown, Printer, RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/Button";

type ExportToolbarProps = {
  actions: {
    copyCode: string;
    copyHtml: string;
    exportSvg: string;
    exportPng: string;
    exportPdf: string;
    downloadFile?: string;
    clear: string;
  };
  canExportSvg: boolean;
  canExportPng: boolean;
  canCopyHtml: boolean;
  onCopyCode: () => void;
  onCopyHtml: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  canDownloadFile?: boolean;
  onDownloadFile?: () => void;
  onPrint: () => void;
  onClear: () => void;
};

export function ExportToolbar({
  actions,
  canExportSvg,
  canExportPng,
  canCopyHtml,
  onCopyCode,
  onCopyHtml,
  onExportSvg,
  onExportPng,
  canDownloadFile,
  onDownloadFile,
  onPrint,
  onClear
}: ExportToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <Button onClick={onCopyCode}>
        <Copy className="h-4 w-4" />
        {actions.copyCode}
      </Button>
      <Button onClick={onCopyHtml} disabled={!canCopyHtml}>
        <FileDown className="h-4 w-4" />
        {actions.copyHtml}
      </Button>
      <Button onClick={onExportSvg} disabled={!canExportSvg}>
        <Download className="h-4 w-4" />
        {actions.exportSvg}
      </Button>
      <Button onClick={onExportPng} disabled={!canExportPng}>
        <ImageDown className="h-4 w-4" />
        {actions.exportPng}
      </Button>
      {actions.downloadFile && onDownloadFile ? (
        <Button onClick={onDownloadFile} disabled={!canDownloadFile}>
          <FileDown className="h-4 w-4" />
          {actions.downloadFile}
        </Button>
      ) : null}
      <Button onClick={onPrint}>
        <Printer className="h-4 w-4" />
        {actions.exportPdf}
      </Button>
      <Button onClick={onClear}>
        <RotateCcw className="h-4 w-4" />
        {actions.clear}
      </Button>
    </div>
  );
}
