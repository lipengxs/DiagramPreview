import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {CalendarDays} from "lucide-react";
import {blogPosts, getBlogPost} from "@/config/blog";
import type {Locale} from "@/config/locales";
import {tools} from "@/config/tools";
import {Link} from "@/i18n/navigation";
import {buildMetadata} from "@/lib/seo";

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

  return buildMetadata({
    locale,
    path: `/${locale}/blog/${slug}`,
    title: t(`blog.posts.${post.slug}.seoTitle`),
    description: t(`blog.posts.${post.slug}.description`),
    keywords: t.raw(`blog.posts.${post.slug}.keywords`)
  });
}

export default async function BlogPostPage({params}: BlogPostPageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const post = getBlogPost(slug);
  if (!post) notFound();
  const t = await getTranslations({locale});
  const sections = t.raw(`blog.posts.${post.slug}.sections`) as Array<{
    heading: string;
    paragraphs: string[];
    image?: {
      src: string;
      alt: string;
      caption?: string;
    };
  }>;
  const relatedTools = tools.filter((tool) => post.tools.includes(tool.slug));

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img src={post.image} alt="" className="aspect-[16/9] w-full object-cover" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <span>{post.date}</span>
            <span>{t(`blog.posts.${post.slug}.readingTime`)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{t(`blog.posts.${post.slug}.title`)}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{t(`blog.posts.${post.slug}.description`)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
          {sections.map((section) => (
            <section key={section.heading} className="mb-8 last:mb-0">
              <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
              <div className="mt-3 grid gap-4 text-base leading-8 text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.image ? (
                <figure className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-surface">
                  <img src={section.image.src} alt={section.image.alt} className="aspect-[16/9] w-full object-cover" />
                  {section.image.caption ? (
                    <figcaption className="border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-500">
                      {section.image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </section>
          ))}
        </div>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-ink">{t("blog.common.relatedTools")}</h2>
          <div className="mt-4 grid gap-3">
            {relatedTools.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-md border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                {t(`tools.${tool.slug}.name`)}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}
