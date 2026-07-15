"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {ChevronDown, PanelsTopLeft} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {headerNavItems} from "@/config/navigation";
import {sortedTools, type ToolConfig, type ToolSlug} from "@/config/tools";
import {Link} from "@/i18n/navigation";

export function HeaderNav() {
  const locale = useLocale();
  const t = useTranslations();
  const resourceLinks = getResourceLinks(locale);

  return (
    <nav className="order-3 flex w-full gap-1 overflow-x-auto text-sm text-slate-300 md:order-none md:ml-5 md:w-auto md:flex-1">
      <ToolsMegaMenu />
      {resourceLinks.map((item) => (
        <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white">
          {item.label}
        </Link>
      ))}
      {headerNavItems
        .filter((item) => item.href !== "/tools")
        .map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-slate-800 hover:text-white">
            {t(item.labelKey)}
          </Link>
        ))}
    </nav>
  );
}

function getResourceLinks(locale: string) {
  const labels: Record<string, {templates: string; workflows: string}> = {
    "zh-CN": {templates: "模板", workflows: "工作流"},
    "zh-TW": {templates: "範本", workflows: "工作流"},
    ja: {templates: "テンプレート", workflows: "ワークフロー"},
    ko: {templates: "템플릿", workflows: "워크플로"},
    ru: {templates: "Шаблоны", workflows: "Workflows"},
    es: {templates: "Plantillas", workflows: "Flujos"},
    fr: {templates: "Modèles", workflows: "Workflows"},
    de: {templates: "Vorlagen", workflows: "Workflows"},
    pt: {templates: "Templates", workflows: "Workflows"}
  };
  const copy = labels[locale] ?? {templates: "Templates", workflows: "Workflows"};

  return [
    {href: "/templates", label: copy.templates},
    {href: "/workflows", label: copy.workflows}
  ];
}

function ToolsMegaMenu() {
  const t = useTranslations();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="inline-flex whitespace-nowrap rounded-md px-3 py-2 outline-none hover:bg-slate-800 hover:text-white data-[state=open]:bg-slate-800 data-[state=open]:text-white">
        <span>{t("common.nav.tools")}</span>
        <ChevronDown className="ml-1 mt-0.5 h-4 w-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          className="z-50 max-h-[min(720px,calc(100vh-6rem))] w-[min(960px,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl"
        >
          <div className="mb-3 rounded-md bg-surface p-3">
            <div className="flex items-center gap-2">
              <PanelsTopLeft className="h-4 w-4 text-primary" />
              <div className="font-semibold text-ink">{t("common.nav.tools")}</div>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                {sortedTools.length}
              </span>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {toolMenuSections.map((section) => (
              <ToolMenuGroup key={section.id} section={section} />
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ToolMenuGroup({section}: {section: ToolMenuSection}) {
  const t = useTranslations();
  const sectionTools = getSectionTools(section);

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{t(section.labelKey)}</div>
          <div className="mt-0.5 text-xs font-medium text-slate-500">{sectionTools.length}</div>
        </div>
        <Link
          href={section.href}
          className="inline-flex flex-none items-center gap-1 rounded-md bg-blue-50 px-2 py-1.5 text-xs font-semibold text-primary hover:bg-blue-100"
        >
          <PanelsTopLeft className="h-3.5 w-3.5" />
          {t("common.nav.viewAll")}
        </Link>
      </div>
      <div className="grid gap-1">
        {sectionTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <DropdownMenu.Item key={tool.slug} asChild>
              <Link
                href={`/${tool.slug}`}
                className="flex min-h-9 items-start gap-2 rounded-md px-2 py-1.5 text-sm leading-5 outline-none hover:bg-blue-50"
              >
                <Icon className="mt-0.5 h-4 w-4 flex-none text-primary" />
                <span className="min-w-0 break-words text-slate-700">{t(`tools.${tool.slug}.name`)}</span>
              </Link>
            </DropdownMenu.Item>
          );
        })}
      </div>
    </section>
  );
}

type ToolMenuSection = {
  id: string;
  labelKey: string;
  href: string;
  slugs: ToolSlug[];
};

const toolMenuSections: ToolMenuSection[] = [
  {
    id: "ai",
    labelKey: "common.toolMenu.ai",
    href: "/ai-diagram",
    slugs: [
      "ai-diagram-generator",
      "ai-drawio-generator",
      "observability-pack-generator",
      "text-to-mermaid",
      "mermaid-ai-fixer",
      "architecture-diagram-generator",
      "ai-plantuml-generator"
    ]
  },
  {
    id: "preview",
    labelKey: "common.toolMenu.preview",
    href: "/preview-tools",
    slugs: [
      "mermaid-preview",
      "plantuml-preview",
      "markdown-preview",
      "html-preview-sandbox",
      "css-gradient-preview",
      "css-box-shadow-preview",
      "color-palette-preview",
      "base64-image-preview",
      "svg-code-preview-editor",
      "open-graph-preview-debugger",
      "robots-txt-tester",
      "sitemap-xml-viewer",
      "graphviz-preview",
      "d2-preview",
      "sequence-diagram-preview",
      "mind-map-preview"
    ]
  },
  {
    id: "drawio",
    labelKey: "common.toolMenu.drawio",
    href: "/converters",
    slugs: ["plantuml-to-drawio", "mermaid-to-drawio", "drawio-to-svg", "drawio-preview"]
  },
  {
    id: "devops",
    labelKey: "common.toolMenu.devops",
    href: "/developer-diagrams",
    slugs: [
      "grafana-dashboard-generator",
      "prometheus-alert-rule-generator",
      "kubernetes-service-topology-diagram",
      "ci-cd-pipeline-generator",
      "cloudformation-template-diagram",
      "c4-model-diagram-generator",
      "docker-compose-diagram",
      "kubernetes-manifest-visualizer",
      "terraform-architecture-diagram",
      "github-actions-workflow-diagram",
      "dockerfile-visualizer",
      "helm-values-visualizer",
      "nginx-config-visualizer",
      "nginx-location-tester",
      "opentelemetry-trace-sequence",
      "log-to-sequence-diagram"
    ]
  },
  {
    id: "data",
    labelKey: "common.toolMenu.data",
    href: "/data-visualizers",
    slugs: [
      "sql-to-er-diagram",
      "json-schema-visualizer",
      "json-schema-form-preview",
      "json-diff-viewer",
      "jsonpath-tester",
      "jq-filter-tester",
      "xpath-tester",
      "yaml-path-tester",
      "toml-visualizer",
      "json-to-diagram",
      "yaml-to-diagram",
      "xml-to-diagram",
      "csv-to-diagram",
      "typescript-interface-visualizer",
      "zod-schema-visualizer",
      "graphql-schema-visualizer",
      "protobuf-schema-visualizer",
      "asyncapi-event-flow-diagram",
      "dbml-to-er-diagram",
      "prisma-schema-diagram"
    ]
  },
  {
    id: "code",
    labelKey: "common.toolMenu.code",
    href: "/developer-diagrams",
    slugs: [
      "openapi-to-sequence",
      "postman-collection-sequence-diagram",
      "har-file-sequence-diagram",
      "har-file-viewer",
      "api-error-flow-diagram",
      "env-diff-checker",
      "http-header-parser",
      "curl-command-parser",
      "url-query-parser",
      "cron-expression-visualizer",
      "jwt-decoder-diagram",
      "package-json-dependency-diagram",
      "regex-railroad-diagram"
    ]
  }
];

function getSectionTools(section: ToolMenuSection): ToolConfig[] {
  const bySlug = new Map(sortedTools.map((tool) => [tool.slug, tool]));
  return section.slugs.map((slug) => bySlug.get(slug)).filter((tool): tool is ToolConfig => Boolean(tool));
}
