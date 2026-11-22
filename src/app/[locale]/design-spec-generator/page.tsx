import {setRequestLocale} from "next-intl/server";
import {getDesignSpecMessages} from "@/config/design-spec-messages";
import {DesignSpecGenerator} from "@/components/tools/DesignSpecGenerator";
import {ToolHeader} from "@/components/tools/ToolHeader";
import {getDesignSpecGeneratorCopy} from "@/config/design-spec-generator-copy";
import {designSpecLocales} from "@/lib/design-spec-generator";
import {buildMetadata, faqJsonLd, softwareApplicationJsonLd} from "@/lib/seo";
import {Link} from "@/i18n/navigation";
import type {ToolRouteProps} from "../tool-page";

export async function generateMetadata({params}: ToolRouteProps) {
  const {locale} = await params;
  const copy = getDesignSpecGeneratorCopy(locale);
  return buildMetadata({locale, path: `/${locale}/design-spec-generator`, title: copy.seoTitle, description: copy.seoDescription, keywords: copy.keywords, pageLocales: designSpecLocales});
}

export default async function DesignSpecGeneratorPage({params}: ToolRouteProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const copy = getDesignSpecGeneratorCopy(locale);
  const appLd = softwareApplicationJsonLd({locale, slug: "design-spec-generator", name: copy.name, description: copy.seoDescription});
  return (
    <>
      <ToolHeader h1={copy.name} intro={copy.intro} badges={copy.badges} />
      <DesignSpecGenerator key={locale} locale={locale} messages={getDesignSpecMessages(locale)} />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <Link href="/blog/design-spec-markdown-template" className="font-semibold text-primary underline underline-offset-4">{copy.guide}</Link>
        <h2 className="mt-8 text-2xl font-bold text-ink">{copy.faqTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {copy.faq.map((item) => <div key={item.question} className="rounded-lg border border-slate-200 bg-white p-5"><h3 className="font-semibold text-ink">{item.question}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p></div>)}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(appLd)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd(copy.faq))}} />
    </>
  );
}
