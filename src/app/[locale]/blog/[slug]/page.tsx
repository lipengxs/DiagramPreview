import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {CalendarDays, Clock3} from "lucide-react";
import {blogPosts, getBlogPost, getCanonicalBlogPost, getBlogPostLocales, type BlogSection} from "@/config/blog";
import {getLocalizedTemplates} from "@/config/templates";
import {TrackedToolLink} from "@/components/tools/TrackedToolLink";
import {ToolEvidence} from "@/components/tools/ToolEvidence";
import type {Locale} from "@/config/locales";
import {getDesignSpecMessages} from "@/config/design-spec-messages";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {absoluteUrl} from "@/lib/paths";
import {blogPostingJsonLd, buildMetadata} from "@/lib/seo";
import {sourceUrl} from "@/lib/source-links";

type BlogPostPageProps = {
  params: Promise<{locale: Locale; slug: string}>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({slug: post.slug}));
}

export async function generateMetadata({params}: BlogPostPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const t = await getTranslations({locale});
  const canonicalPost = getCanonicalBlogPost(post);
  const pageLocales = getBlogPostLocales(canonicalPost ?? post);

  const metadata = buildMetadata({
    locale,
    path: `/${locale}/blog/${canonicalPost?.slug ?? slug}`,
    pageLocales: pageLocales,
    title: t(`blog.posts.${post.slug}.seoTitle`),
    description: t(`blog.posts.${post.slug}.description`),
    keywords: t.raw(`blog.posts.${post.slug}.keywords`)
  });
  const canonical = absoluteUrl(`/${pageLocales.includes(locale) ? locale : "en"}/blog/${canonicalPost?.slug ?? slug}`);
  const languages = Object.fromEntries(pageLocales.map((language) => [language, absoluteUrl(`/${language}/blog/${canonicalPost?.slug ?? slug}`)]));
  metadata.alternates = {canonical, languages: {...languages, "x-default": absoluteUrl(`/en/blog/${canonicalPost?.slug ?? slug}`)}};
  metadata.openGraph = {
    ...metadata.openGraph,
    type: "article",
    url: canonical,
    publishedTime: post.date,
    modifiedTime: post.updatedAt ?? post.date,
    images: [{url: absoluteUrl(post.image), alt: t(`blog.posts.${post.slug}.title`)}]
  };
  metadata.twitter = {...metadata.twitter, card: "summary_large_image", images: [absoluteUrl(post.image)]};

  if (!pageLocales.includes(locale)) {
    return {
      ...metadata,
      alternates: {canonical: absoluteUrl(`/en/blog/${canonicalPost?.slug ?? slug}`)},
      robots: {index: false, follow: true}
    };
  }

  return post.tier === "merge" ? {...metadata, alternates: {canonical}, robots: {index: false, follow: true}} : metadata;
}

export default async function BlogPostPage({params}: BlogPostPageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const post = getBlogPost(slug);
  if (!post) notFound();
  const t = await getTranslations({locale});
  const sections = t.raw(`blog.posts.${post.slug}.sections`) as BlogSection[];
  const templates = getLocalizedTemplates(locale);
  const relatedTools = tools.filter((tool) => post.tools.includes(tool.slug));
  const canonicalPost = getCanonicalBlogPost(post);
  const isChineseLocale = locale.startsWith("zh");
  const specCopy = post.pageLocales ? getDesignSpecMessages(locale).template : null;
  const title = t(`blog.posts.${post.slug}.title`);
  const description = t(`blog.posts.${post.slug}.description`);
  const articleLd = blogPostingJsonLd({
    headline: title,
    description,
    url: absoluteUrl(`/${locale}/blog/${canonicalPost?.slug ?? post.slug}`),
    image: absoluteUrl(post.image),
    datePublished: post.date,
    dateModified: post.updatedAt,
    locale
  });

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleLd)}} />
      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />
              {t(`blog.posts.${post.slug}.readingTime`)}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
          {relatedTools.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedTools.slice(0, 5).map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-md border border-slate-200 bg-surface px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                  {t(`tools.${tool.slug}.name`)}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <img src={post.image} alt={title} className="aspect-[16/10] h-full w-full object-cover" />
      </div>

      {slug === "plantuml-to-drawio-editable-diagram" && ["en", "zh-CN"].includes(locale) ? <div className="mt-8"><ToolEvidence family="plantuml-conversion" locale={locale} /></div> : null}
      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
          {canonicalPost ? (
            <div className="mb-8 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-ink">
                {isChineseLocale ? "这篇文章已经合并到更完整的主题指南中。" : "This topic is now covered in a more complete workflow guide."}
              </p>
              <p className="mt-2">
                {isChineseLocale ? "建议优先阅读：" : "Recommended primary article: "}
                <Link href={`/blog/${canonicalPost.slug}`} className="font-semibold text-primary hover:underline">
                  {t(`blog.posts.${canonicalPost.slug}.title`)}
                </Link>
              </p>
            </div>
          ) : null}
          {sections.map((section, index) => {
            const template = section.templateSlug ? templates.find((item) => item.slug === section.templateSlug) : undefined;
            const code = section.code ?? (template ? {language: "markdown", content: template.source, caption: template.description} : undefined);
            return (
              <section key={section.heading} id={`section-${index + 1}`} className="min-w-0 scroll-mt-28 border-b border-slate-100 py-8 first:pt-0 last:border-b-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="min-w-0 break-words text-xl font-bold leading-8 text-ink">{section.heading}</h2>
                </div>
                <div className="mt-4 grid min-w-0 gap-4 break-words text-base leading-8 text-slate-600">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.links?.length ? (
                  <ul className="mt-4 grid gap-2 text-sm leading-6">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.kind === "internal" ? (
                          <Link href={link.href} className="font-semibold text-primary underline underline-offset-4">{link.label}</Link>
                        ) : (
                          <a href={link.href} className="font-semibold text-primary underline underline-offset-4">{link.label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {template ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <TrackedToolLink href={sourceUrl(`/${template.tool}`, template.source)} eventName="tool_entry_click" targetToolSlug={template.tool} source={`blog:${post.slug}`} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      {specCopy?.open ?? (isChineseLocale ? "打开模板并预览" : "Open template and preview")}
                    </TrackedToolLink>
                    {template.downloadHref ? (
                      <a href={template.downloadHref} download className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                        {specCopy?.download ?? (isChineseLocale ? "下载 Markdown 模板" : "Download Markdown template")}
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {section.image ? (
                  <figure className="mt-5 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-surface">
                    <img src={section.image.src} alt={section.image.alt} className="aspect-[16/9] w-full object-cover" />
                    {section.image.caption ? (
                      <figcaption className="break-words border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-500">
                        {section.image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
                {code ? (
                  <figure className="mt-5 min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span>{code.language}</span>
                      <span>{specCopy?.demo ?? (isChineseLocale ? "可复制 Demo" : "Copyable demo")}</span>
                    </div>
                    <pre className="overflow-auto p-4 text-sm leading-7 text-slate-100">
                      <code>{code.content}</code>
                    </pre>
                    {code.caption ? (
                      <figcaption className="break-words border-t border-slate-800 px-4 py-3 text-sm leading-6 text-slate-400">
                        {code.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </section>
            );
          })}
        </div>
        <aside className="min-w-0 h-fit rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
          <div>
            <h2 className="text-base font-bold text-ink">{specCopy?.contents ?? (isChineseLocale ? "文章目录" : "Contents")}</h2>
            <div className="mt-4 grid gap-2">
              {sections.map((section, index) => (
                <a key={section.heading} href={`#section-${index + 1}`} className="min-w-0 break-words rounded-md px-3 py-2 text-sm leading-5 text-slate-600 hover:bg-surface hover:text-primary">
                  {String(index + 1).padStart(2, "0")} {section.heading}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <h2 className="text-base font-bold text-ink">{t("blog.common.relatedTools")}</h2>
            <div className="mt-4 grid gap-3">
              {relatedTools.map((tool) => (
                <Link key={tool.slug} href={`/${tool.slug}`} className="min-w-0 break-words rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                  {t(`tools.${tool.slug}.name`)}
                </Link>
              ))}
            </div>
          </div>
          {post.relatedPosts?.length ? (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h2 className="text-base font-bold text-ink">{specCopy?.related ?? (isChineseLocale ? "延伸阅读" : "Related guides")}</h2>
              <div className="mt-4 grid gap-3">
                {post.relatedPosts.map((relatedSlug) => (
                  <Link key={relatedSlug} href={`/blog/${relatedSlug}`} className="rounded-md border border-slate-200 p-3 text-sm font-semibold leading-6 text-slate-700 hover:border-primary hover:text-primary">
                    {t(`blog.posts.${relatedSlug}.title`)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
