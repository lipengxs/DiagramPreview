"use client";

import {Copy, Download, FileDown, FileText, ImageDown, Link2, Printer, RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/Button";

type ExportToolbarProps = {
  actions: {
    copyCode: string;
    copyHtml: string;
    exportSvg: string;
    exportPng: string;
    exportPdf: string;
    downloadFile?: string;
    copyMarkdown?: string;
    shareLink?: string;
    clear: string;
  };
  canExportSvg: boolean;
  canExportPng: boolean;
  canCopyHtml: boolean;
  showCopyHtml?: boolean;
  showExportSvg?: boolean;
  showExportPng?: boolean;
  showPrint?: boolean;
  onCopyCode: () => void;
  onCopyHtml: () => void;
  onCopyMarkdown?: () => void;
  onShareLink?: () => void;
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
  showCopyHtml = true,
  showExportSvg = true,
  showExportPng = true,
  showPrint = true,
  onCopyCode,
  onCopyHtml,
  onCopyMarkdown,
  onShareLink,
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
      {showCopyHtml ? (
        <Button onClick={onCopyHtml} disabled={!canCopyHtml}>
          <FileDown className="h-4 w-4" />
          {actions.copyHtml}
        </Button>
      ) : null}
      {onCopyMarkdown ? (
        <Button onClick={onCopyMarkdown}>
          <FileText className="h-4 w-4" />
          {actions.copyMarkdown ?? "Markdown"}
        </Button>
      ) : null}
      {onShareLink ? (
        <Button onClick={onShareLink}>
          <Link2 className="h-4 w-4" />
          {actions.shareLink ?? "Share"}
        </Button>
      ) : null}
      {showExportSvg ? (
        <Button onClick={onExportSvg} disabled={!canExportSvg}>
          <Download className="h-4 w-4" />
          {actions.exportSvg}
        </Button>
      ) : null}
      {showExportPng ? (
        <Button onClick={onExportPng} disabled={!canExportPng}>
          <ImageDown className="h-4 w-4" />
          {actions.exportPng}
        </Button>
      ) : null}
      {actions.downloadFile && onDownloadFile ? (
        <Button onClick={onDownloadFile} disabled={!canDownloadFile}>
          <FileDown className="h-4 w-4" />
          {actions.downloadFile}
        </Button>
      ) : null}
      {showPrint ? (
        <Button onClick={onPrint}>
          <Printer className="h-4 w-4" />
          {actions.exportPdf}
        </Button>
      ) : null}
      <Button onClick={onClear}>
        <RotateCcw className="h-4 w-4" />
        {actions.clear}
      </Button>
    </div>
  );
}
