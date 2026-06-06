"use client";

type ToolSettingsProps = {
  labels: {
    settings: string;
    theme: string;
    layout: string;
    zoom: string;
    background: string;
    themeLight: string;
    layoutSplit: string;
    zoomDefault: string;
    backgroundWhite: string;
  };
};

export function ToolSettings({labels}: ToolSettingsProps) {
  return (
    <aside className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm md:grid-cols-4">
      <h2 className="font-semibold text-ink md:col-span-4">{labels.settings}</h2>
      <Setting label={labels.theme} value={labels.themeLight} />
      <Setting label={labels.layout} value={labels.layoutSplit} />
      <Setting label={labels.zoom} value={labels.zoomDefault} />
      <Setting label={labels.background} value={labels.backgroundWhite} />
    </aside>
  );
}

function Setting({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-surface px-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
