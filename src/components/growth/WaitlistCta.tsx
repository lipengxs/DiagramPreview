"use client";

import {useState} from "react";
import {Button} from "@/components/ui/Button";
import {trackEvent} from "@/lib/analytics";

export type MonetizationIntent = "ai_review" | "batch_conversion" | "advanced_export" | "plugin_pro" | "team_workspace";

type WaitlistCtaProps = {
  locale: string;
  source: "tool" | "workflow" | "plugin" | "home";
  toolSlug?: string;
  intent?: MonetizationIntent;
  compact?: boolean;
};

export function WaitlistCta({locale, source, toolSlug, intent = source === "plugin" ? "plugin_pro" : source === "workflow" ? "team_workspace" : "batch_conversion", compact = false}: WaitlistCtaProps) {
  const isChineseLocale = locale.startsWith("zh");
  const copy = getCopy(isChineseLocale, source, intent);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [teamSize, setTeamSize] = useState("1");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit() {
    setStatus("loading");
    trackEvent("waitlist_submit", {
      source,
      tool_slug: toolSlug,
      team_size: teamSize,
      intent
    });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, useCase, teamSize, source, toolSlug, intent})
      });

      if (!response.ok) {
        throw new Error("waitlist failed");
      }

      setStatus("done");
      setEmail("");
      setUseCase("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={compact ? "rounded-lg border border-blue-100 bg-blue-50 p-4" : "rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm"}>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
          <h2 className={compact ? "mt-1 text-base font-bold text-ink" : "mt-2 text-xl font-bold text-ink"}>{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setOpen((value) => !value);
            trackEvent("waitlist_open", {source, tool_slug: toolSlug, intent});
          }}
        >
          {copy.action}
        </Button>
      </div>
      {open ? (
        <div className="mt-4 grid gap-3 rounded-md border border-blue-100 bg-white p-3 sm:grid-cols-[1fr_180px]">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            type="email"
            className="h-10 rounded-md border border-slate-200 px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={teamSize}
            onChange={(event) => setTeamSize(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
          >
            {["1", "2-5", "6-20", "21+"].map((size) => (
              <option key={size} value={size}>
                {copy.teamPrefix} {size}
              </option>
            ))}
          </select>
          <textarea
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            placeholder={copy.useCasePlaceholder}
            className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-ink outline-none focus:ring-2 focus:ring-primary sm:col-span-2"
          />
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="button" variant="primary" onClick={submit} disabled={!email || status === "loading"}>
              {status === "loading" ? copy.submitting : copy.submit}
            </Button>
            <span className="text-xs leading-5 text-slate-500">{copy.privacy}</span>
            {status === "done" ? <span className="text-xs font-semibold text-emerald-700">{copy.done}</span> : null}
            {status === "error" ? <span className="text-xs font-semibold text-red-700">{copy.error}</span> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getCopy(isChineseLocale: boolean, source: WaitlistCtaProps["source"], intent: MonetizationIntent) {
  if (isChineseLocale) {
    const title = {
      ai_review: "需要更深入的 AI 图表 Review？",
      batch_conversion: "需要批量转换一批图表文件？",
      advanced_export: "需要高级导出或私有分享？",
      plugin_pro: "想要 VS Code 插件增强版？",
      team_workspace: "需要团队图表工作流？"
    }[intent];

    return {
      eyebrow: "付费能力验证",
      title,
      body: "我们正在验证批量转换、高级导出、私有分享、团队模板库、插件增强和 AI Review 额度。告诉我们你的场景，优先安排。",
      action: "加入候补",
      emailPlaceholder: "工作邮箱",
      useCasePlaceholder: "你的使用场景，例如：一次转换 80 个 Mermaid、团队模板库、PR 图表 review...",
      teamPrefix: "团队",
      submit: "提交",
      submitting: "提交中",
      done: "已收到",
      error: "提交失败，请稍后重试",
      privacy: "不收集源码、prompt 或 diagram source。"
    };
  }

  const title = {
    ai_review: "Need deeper AI diagram review?",
    batch_conversion: "Need batch conversion?",
    advanced_export: "Need advanced export or private sharing?",
    plugin_pro: "Want the enhanced VS Code workflow?",
    team_workspace: "Need a team diagram workflow?"
  }[intent];

  return {
    eyebrow: "Paid workflow validation",
    title,
    body: "We are validating batch conversion, advanced export, private sharing, team templates, and AI review credits.",
    action: "Join waitlist",
    emailPlaceholder: "Work email",
    useCasePlaceholder: "Your use case, for example: convert 80 Mermaid files, team templates, PR diagram review...",
    teamPrefix: "Team",
    submit: "Submit",
    submitting: "Submitting",
    done: "Received",
    error: "Submit failed. Try again later.",
    privacy: "No source, prompt, or diagram content is collected."
  };
}
