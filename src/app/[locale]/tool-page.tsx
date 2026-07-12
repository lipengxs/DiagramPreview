import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {ToolHeader} from "@/components/tools/ToolHeader";
import {summarizeToolSamples, ToolSeoSections, type ToolDeepDive} from "@/components/tools/ToolSeoSections";
import {ToolShell, type ToolCopy} from "@/components/tools/ToolShell";
import {type Locale} from "@/config/locales";
import {getRelatedTools, getTool, type ToolSlug} from "@/config/tools";
import {buildMetadata, faqJsonLd, softwareApplicationJsonLd} from "@/lib/seo";
import {toolPath} from "@/lib/paths";
import {getToolMaturityCopy} from "@/lib/tool-maturity";

export type ToolRouteProps = {
  params: Promise<{locale: Locale}>;
};

export function createToolMetadata(slug: ToolSlug) {
  return async function generateMetadata({params}: ToolRouteProps): Promise<Metadata> {
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

export async function ToolPage({params, slug}: ToolRouteProps & {slug: ToolSlug}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const t = await getTranslations({locale});
  const faq = t.raw(`tools.${slug}.faq`) as Array<{question: string; answer: string}>;
  const samples = t.raw(`tools.${slug}.samples`) as ToolCopy["samples"];
  const deepDives = getOptionalRaw<ToolDeepDive[]>(t, `tools.${slug}.deepDives`, []);
  const relatedTools = getRelatedTools(slug).map((related) => ({
    slug: related.slug,
    name: t(`tools.${related.slug}.name`),
    description: t(`tools.${related.slug}.shortDescription`)
  }));
  const maturity = getToolMaturityCopy(locale, tool.renderer);

  const copy: ToolCopy = {
    inputLabel: t(`tools.${slug}.inputLabel`),
    outputLabel: t(`tools.${slug}.outputLabel`),
    placeholder: t(`tools.${slug}.placeholder`),
    emptyPreview: t(`tools.${slug}.emptyPreview`),
    samplesTitle: t("common.workspace.samples"),
    statusReady: t("common.workspace.ready"),
    statusRendering: t("common.workspace.rendering"),
    renderError: t("common.workspace.renderError"),
    fallbackTitle: t("common.workspace.fallbackTitle"),
    fallbackBody: t("common.workspace.fallbackBody"),
    treeHint: t("common.workspace.treeHint"),
    actions: {
      copyCode: t("common.actions.copyCode"),
      copyHtml: t("common.actions.copyHtml"),
      exportSvg: t("common.actions.exportSvg"),
      exportPng: t("common.actions.exportPng"),
      exportPdf: t("common.actions.exportPdf"),
      downloadFile: t("common.actions.downloadFile"),
      copyMarkdown: locale.startsWith("zh") ? "复制 Markdown" : "Copy Markdown",
      shareLink: locale.startsWith("zh") ? "分享链接" : "Share link",
      clear: t("common.actions.clear"),
      loadSample: t("common.actions.loadSample")
    },
    settings: {
      settings: t("common.workspace.settings"),
      theme: t("common.workspace.theme"),
      layout: t("common.workspace.layout"),
      zoom: t("common.workspace.zoom"),
      background: t("common.workspace.background"),
      themeLight: t("common.workspace.themeLight"),
      layoutSplit: t("common.workspace.layoutSplit"),
      zoomDefault: t("common.workspace.zoomDefault"),
      backgroundWhite: t("common.workspace.backgroundWhite")
    },
    drawioSummary: {
      pages: t("common.workspace.drawioPages"),
      objects: t("common.workspace.drawioObjects"),
      pageNames: t("common.workspace.drawioPageNames"),
      defaultPage: t("common.workspace.drawioDefaultPage"),
      none: t("common.workspace.none")
    },
    samples
  };

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
      <ToolShell
        tool={{
          slug: tool.slug,
          implemented: tool.implemented,
          renderer: tool.renderer,
          sampleKeys: tool.sampleKeys
        }}
        copy={copy}
        relatedTools={relatedTools}
      />
      <ToolSeoSections
        currentSlug={slug}
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
        locale={locale}
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
