"use client";

import {Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/Button";
import {trackEvent, type AnalyticsEventName} from "@/lib/analytics";
import {WaitlistCta, type MonetizationIntent} from "./WaitlistCta";

type MonetizationIntentCtaProps = {
  locale: string;
  source: "tool" | "workflow" | "plugin" | "home";
  toolSlug?: string;
  intent: MonetizationIntent;
  compact?: boolean;
};

export function MonetizationIntentCta({locale, source, toolSlug, intent, compact = false}: MonetizationIntentCtaProps) {
  const [open, setOpen] = useState(false);
  const copy = getCopy(locale, intent);

  useEffect(() => {
    trackEvent("monetization_cta_view", {
      source,
      tool_slug: toolSlug,
      intent
    });
  }, [intent, source, toolSlug]);

  function onOpen() {
    setOpen((value) => !value);
    trackEvent("monetization_cta_click", {
      source,
      tool_slug: toolSlug,
      intent
    });
    const intentEvent = intentEventName(intent);
    if (intentEvent) {
      trackEvent(intentEvent, {
        source,
        tool_slug: toolSlug,
        intent
      });
    }
  }

  return (
    <section className={compact ? "rounded-lg border border-indigo-100 bg-indigo-50 p-4" : "rounded-lg border border-indigo-100 bg-indigo-50 p-5 shadow-sm"}>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{copy.eyebrow}</p>
          <h2 className={compact ? "mt-1 text-base font-bold text-ink" : "mt-2 text-xl font-bold text-ink"}>{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.body}</p>
        </div>
        <Button type="button" variant="primary" onClick={onOpen}>
          <Sparkles className="h-4 w-4" />
          {copy.action}
        </Button>
      </div>
      {open ? <div className="mt-4"><WaitlistCta locale={locale} source={source} toolSlug={toolSlug} intent={intent} compact /></div> : null}
    </section>
  );
}

function intentEventName(intent: MonetizationIntent): AnalyticsEventName | undefined {
  if (intent === "batch_conversion") return "batch_conversion_intent";
  if (intent === "advanced_export") return "advanced_export_intent";
  return undefined;
}

function getCopy(locale: string, intent: MonetizationIntent) {
  const zh = locale.startsWith("zh");
  const copies = zh
    ? {
        ai_review: {
          eyebrow: "AI Review beta",
          title: "需要更深入的 AI 图表 Review？",
          body: "当前免费工具继续开放。我们正在验证语法检查、可读性评分、修复建议和发布前 checklist。",
          action: "登记 AI Review"
        },
        batch_conversion: {
          eyebrow: "Batch conversion beta",
          title: "需要批量转换一批图表文件？",
          body: "适合 Mermaid / PlantUML / OpenAPI 文档迁移。先登记你的文件数量和目标格式，我们会优先安排。",
          action: "登记批量转换"
        },
        advanced_export: {
          eyebrow: "Advanced export beta",
          title: "需要高级导出或私有分享？",
          body: "高清 PNG/PDF、自定义尺寸、README/Confluence 片段和私有分享正在验证中。",
          action: "登记高级导出"
        },
        plugin_pro: {
          eyebrow: "VS Code workflow beta",
          title: "想要 VS Code 插件增强版？",
          body: "我们正在验证 repo scan、右键 AI Review、批量转换和 draw.io/SVG 导出。",
          action: "登记插件增强版"
        },
        team_workspace: {
          eyebrow: "Team workflow beta",
          title: "需要团队图表工作流？",
          body: "团队模板库、私有链接、权限和导出规范会在有明确团队线索后优先推进。",
          action: "登记团队场景"
        }
      }
    : {
        ai_review: {
          eyebrow: "AI Review beta",
          title: "Need deeper AI diagram review?",
          body: "Free tools stay open. We are validating syntax checks, readability scoring, fix suggestions, and publish-ready checklists.",
          action: "Join AI Review beta"
        },
        batch_conversion: {
          eyebrow: "Batch conversion beta",
          title: "Need to convert a batch of diagram files?",
          body: "Best for Mermaid, PlantUML, and OpenAPI migration. Tell us your file count and target format so we can prioritize it.",
          action: "Join batch beta"
        },
        advanced_export: {
          eyebrow: "Advanced export beta",
          title: "Need advanced export or private sharing?",
          body: "High-resolution PNG/PDF, custom size, README/Confluence snippets, and private sharing are being validated.",
          action: "Join export beta"
        },
        plugin_pro: {
          eyebrow: "VS Code workflow beta",
          title: "Want the enhanced VS Code workflow?",
          body: "We are validating repo scan, right-click AI Review, batch conversion, and draw.io/SVG export.",
          action: "Join plugin beta"
        },
        team_workspace: {
          eyebrow: "Team workflow beta",
          title: "Need a team diagram workflow?",
          body: "Team templates, private links, permissions, and export standards will be prioritized when team demand is clear.",
          action: "Join team beta"
        }
      };

  return copies[intent];
}

