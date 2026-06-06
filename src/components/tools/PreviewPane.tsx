"use client";

import {AlertCircle, FileSearch2} from "lucide-react";
import type {TreeNode} from "@/lib/renderers/tree";
import {cn} from "@/lib/utils";

type PreviewPaneProps = {
  label: string;
  status: string;
  emptyText: string;
  error?: string;
  html?: string;
  imageUrl?: string;
  tree?: TreeNode;
  fallback?: {
    title: string;
    body: string;
  };
  className?: string;
};

export function PreviewPane({label, status, emptyText, error, html, imageUrl, tree, fallback, className}: PreviewPaneProps) {
  return (
    <div className={cn("flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{status}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-gradient-to-b from-white to-surface p-4">
        {error ? (
          <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
            <span>{error}</span>
          </div>
        ) : fallback ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-surface p-6 text-center">
            <FileSearch2 className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-base font-semibold text-ink">{fallback.title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{fallback.body}</p>
          </div>
        ) : tree ? (
          <TreeView node={tree} />
        ) : imageUrl ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <img src={imageUrl} alt={label} className="max-h-full max-w-full" />
          </div>
        ) : html ? (
          <div className="markdown-preview diagram-preview-output" dangerouslySetInnerHTML={{__html: html}} />
        ) : (
          <div className="flex h-full min-h-80 items-center justify-center rounded-md border border-dashed border-slate-300 bg-surface p-6 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function TreeView({node}: {node: TreeNode}) {
  return (
    <div className="rounded-md border border-slate-200 bg-surface p-4 font-mono text-sm">
      <TreeNodeView node={node} depth={0} />
    </div>
  );
}

function TreeNodeView({node, depth}: {node: TreeNode; depth: number}) {
  return (
    <div>
      <div className="flex items-start gap-2 py-1" style={{paddingLeft: depth * 18}}>
        <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-primary ring-1 ring-slate-200">{node.key}</span>
        {node.value ? <span className="break-all text-slate-600">{node.value}</span> : null}
      </div>
      {node.children?.map((child, index) => (
        <TreeNodeView key={`${child.key}-${index}`} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
