"use client";

type CodeEditorProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function CodeEditor({label, value, placeholder, onChange}: CodeEditorProps) {
  return (
    <label className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
      <span className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
      />
    </label>
  );
}
