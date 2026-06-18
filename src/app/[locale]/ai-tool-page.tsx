import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {AiDiagramWorkspace} from "@/components/tools/AiDiagramWorkspace";
import {ToolHeader} from "@/components/tools/ToolHeader";
import {summarizeToolSamples, ToolSeoSections, type ToolDeepDive} from "@/components/tools/ToolSeoSections";
import type {Locale} from "@/config/locales";
import {getRelatedTools, getTool, type ToolSlug} from "@/config/tools";
import {toolPath} from "@/lib/paths";
import {buildMetadata, faqJsonLd, softwareApplicationJsonLd} from "@/lib/seo";
import {getToolMaturityCopy} from "@/lib/tool-maturity";

export type AiToolRouteProps = {
  params: Promise<{locale: Locale}>;
};

const modes: Partial<
  Record<
    ToolSlug,
    | "generate"
    | "text-to-mermaid"
    | "fix-mermaid"
    | "architecture"
    | "plantuml"
    | "drawio"
    | "grafana"
    | "prometheus"
    | "observability"
  >
> = {
  "ai-diagram-generator": "generate",
  "text-to-mermaid": "text-to-mermaid",
  "mermaid-ai-fixer": "fix-mermaid",
  "architecture-diagram-generator": "architecture",
  "ai-plantuml-generator": "plantuml",
  "ai-drawio-generator": "drawio",
  "grafana-dashboard-generator": "grafana",
  "prometheus-alert-rule-generator": "prometheus",
  "observability-pack-generator": "observability"
};

const outputLanguages: Partial<Record<ToolSlug, "mermaid" | "plantuml" | "drawio" | "json" | "yaml">> = {
  "ai-plantuml-generator": "plantuml",
  "ai-drawio-generator": "drawio",
  "grafana-dashboard-generator": "json",
  "prometheus-alert-rule-generator": "yaml",
  "observability-pack-generator": "yaml"
};

export function createAiToolMetadata(slug: ToolSlug) {
  return async function generateMetadata({params}: AiToolRouteProps): Promise<Metadata> {
    const {locale} = await params;
    const t = await getTranslations({locale});
    return buildMetadata({
      locale,
      path: toolPath(locale, slug),
      title: t(`tools.${slug}.seoTitle`),
      description: t(`tools.${slug}.seoDescription`),
      keywords: t.raw(`tools.${slug}.keywords`)
    });
  };
}

export async function AiToolPage({params, slug}: AiToolRouteProps & {slug: ToolSlug}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const tool = getTool(slug);
  const mode = modes[slug];
  if (!tool || !mode) notFound();

  const t = await getTranslations({locale});
  const faq = t.raw(`tools.${slug}.faq`) as Array<{question: string; answer: string}>;
  const samples = t.raw(`tools.${slug}.samples`) as Record<
    string,
    {label: string; prompt: string; code?: string; diagramType?: string}
  >;
  const deepDives = getOptionalRaw<ToolDeepDive[]>(t, `tools.${slug}.deepDives`, []);
  const relatedTools = getRelatedTools(slug).map((related) => ({
    slug: related.slug,
    name: t(`tools.${related.slug}.name`),
    description: t(`tools.${related.slug}.shortDescription`)
  }));
  const maturity = getToolMaturityCopy(locale, tool.renderer);

  const appJsonLd = softwareApplicationJsonLd({
    locale,
    slug,
    name: t(`tools.${slug}.name`),
    description: t(`tools.${slug}.seoDescription`)
  });
  const faqLd = faqJsonLd(faq);

  return (
    <>
      <ToolHeader
        h1={t(`tools.${slug}.h1`)}
        intro={t(`tools.${slug}.intro`)}
        badges={t.raw(`tools.${slug}.badges`)}
        maturityLabel={maturity.label}
      />
      <AiDiagramWorkspace
        locale={locale}
        slug={slug}
        mode={mode}
        outputLanguage={outputLanguages[slug] || "mermaid"}
        sampleKeys={tool.sampleKeys}
        copy={{
          promptLabel: t(`tools.${slug}.ai.promptLabel`),
          promptPlaceholder: t(`tools.${slug}.ai.promptPlaceholder`),
          existingCodeLabel: t(`tools.${slug}.ai.existingCodeLabel`),
          existingCodePlaceholder: t(`tools.${slug}.ai.existingCodePlaceholder`),
          diagramTypeLabel: t(`tools.${slug}.ai.diagramTypeLabel`),
          generateButton: t(`tools.${slug}.ai.generateButton`),
          generatedCodeLabel: t(`tools.${slug}.ai.generatedCodeLabel`),
          previewLabel: t(`tools.${slug}.ai.previewLabel`),
          providerLabel: t(`tools.${slug}.ai.providerLabel`),
          emptyPreview: t(`tools.${slug}.emptyPreview`),
          copyCode: t("common.actions.copyCode"),
          exportSvg: t("common.actions.exportSvg"),
          exportPng: t("common.actions.exportPng"),
          downloadFile: t("common.actions.downloadFile"),
          error: t("common.workspace.renderError"),
          samplesTitle: t("common.workspace.samples"),
          samples
        }}
      />
      <ToolSeoSections
        locale={locale}
        toolName={t(`tools.${slug}.name`)}
        toolDescription={t(`tools.${slug}.shortDescription`)}
        howTitle={t("common.seoSections.howToUse")}
        useCasesTitle={t("common.seoSections.useCases")}
        relatedTitle={t("common.seoSections.relatedTools")}
        faqTitle={t("common.seoSections.faq")}
        howToUse={t.raw(`tools.${slug}.howToUse`)}
        useCases={t.raw(`tools.${slug}.useCases`)}
        relatedTools={relatedTools}
        faq={faq}
        seoBody={t.raw(`tools.${slug}.seoBody`)}
        sampleSummaries={summarizeToolSamples(samples)}
        deepDives={deepDives}
        maturity={maturity}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(appJsonLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqLd)}} />
    </>
  );
}

function getOptionalRaw<T>(t: Awaited<ReturnType<typeof getTranslations>>, key: string, fallback: T) {
  return t.has(key) ? (t.raw(key) as T) : fallback;
}
