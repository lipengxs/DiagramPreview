import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {CalendarDays} from "lucide-react";
import {blogPosts} from "@/config/blog";
import type {Locale} from "@/config/locales";
import {Link} from "@/i18n/navigation";
import {buildMetadata} from "@/lib/seo";

type BlogPageProps = {
  params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: BlogPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale});

  return buildMetadata({
    locale,
    path: `/${locale}/blog`,
    title: t("blog.index.seoTitle"),
    description: t("blog.index.description"),
    keywords: t.raw("blog.index.keywords")
  });
}

export default async function BlogPage({params}: BlogPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale});

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary">{t("blog.index.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink sm:text-4xl">{t("blog.index.title")}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t("blog.index.description")}</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-primary hover:shadow-workspace">
            <img src={post.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <CalendarDays className="h-4 w-4" />
                <span>{post.date}</span>
                <span>{t(`blog.posts.${post.slug}.readingTime`)}</span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-ink">{t(`blog.posts.${post.slug}.title`)}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{t(`blog.posts.${post.slug}.excerpt`)}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
