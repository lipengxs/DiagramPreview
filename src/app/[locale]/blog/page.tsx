import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {ArrowRight, CalendarDays} from "lucide-react";
import {blogTopics, coreBlogPosts, getVisibleBlogPostsByTopic, type BlogPostConfig, type BlogTopic} from "@/config/blog";
import type {Locale} from "@/config/locales";
import {Link} from "@/i18n/navigation";
import {buildMetadata} from "@/lib/seo";

type BlogPageProps = {
  params: Promise<{locale: Locale}>;
};

const blogIndexCopy: Record<string, {coreTitle: string; coreDescription: string; topicTitle: string; topicDescription: string; coreBadge: string; supportingBadge: string; readMore: string; countLabel: string}> = {
  en: {
    coreTitle: "Core workflow guides",
    coreDescription: "Start with the pillar articles that connect tools, examples, and repeatable developer workflows.",
    topicTitle: "Browse by topic",
    topicDescription: "Use these clusters to move from a specific debugging task to the broader workflow around it.",
    coreBadge: "Core guide",
    supportingBadge: "Supporting guide",
    readMore: "Read guide",
    countLabel: "guides"
  },
  "zh-CN": {
    coreTitle: "核心工作流指南",
    coreDescription: "优先阅读这些支柱文章，它们把工具、示例和可复用的开发流程串起来。",
    topicTitle: "按主题浏览",
    topicDescription: "从具体调试任务进入更完整的工作流，减少零散文章带来的内容稀释。",
    coreBadge: "核心指南",
    supportingBadge: "支撑指南",
    readMore: "阅读指南",
    countLabel: "篇指南"
  }
};

const topicCopy: Record<BlogTopic, Record<string, {title: string; description: string}>> = {
  "api-debugging": {
    "zh-CN": {
      title: "API 调试",
      description: "围绕 HAR、Postman、OpenAPI、jq、JSONPath、XPath、Header 和请求链路复盘。"
    }
  },
  "schema-contracts": {
    "zh-CN": {
      title: "Schema 与契约",
      description: "覆盖 JSON Schema、Zod、TypeScript、GraphQL、Protobuf、表单预览和契约漂移。"
    }
  },
  "diagram-authoring": {
    "zh-CN": {
      title: "图表创作",
      description: "覆盖 Mermaid、PlantUML、Graphviz、C4、Draw.io、Markdown 图表和可编辑导出。"
    }
  },
  "ai-diagramming": {
    "zh-CN": {
      title: "AI 图表生成",
      description: "聚焦 AI 生成图表、修复工作流、架构文档和 prompt 到预览的闭环。"
    }
  },
  "infrastructure-config": {
    "zh-CN": {
      title: "基础设施与配置",
      description: "覆盖 Docker、Kubernetes、Terraform、CloudFormation、Nginx、YAML、TOML、cron 和观测配置。"
    }
  },
  "technical-seo": {
    "zh-CN": {
      title: "技术 SEO",
      description: "覆盖 robots.txt、sitemap XML、Open Graph、hreflang、社交卡片和索引检查。"
    }
  },
  "publishing-preview": {
    "zh-CN": {
      title: "发布前预览",
      description: "覆盖 Markdown、SVG、HTML、CSS、截图、视觉代码片段和可发布示例。"
    }
  }
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
  const copy = blogIndexCopy[locale] ?? blogIndexCopy.en;

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold text-primary">{t("blog.index.eyebrow")}</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-normal text-ink sm:text-4xl">{t("blog.index.title")}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t("blog.index.description")}</p>
      </section>

      <section className="grid gap-4">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-normal text-ink">{copy.coreTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.coreDescription}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coreBlogPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} t={t} badge={copy.coreBadge} readMore={copy.readMore} featured />
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t border-slate-200 pt-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-normal text-ink">{copy.topicTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.topicDescription}</p>
        </div>
        <div className="grid gap-8">
          {blogTopics.map((topic) => {
            const posts = getVisibleBlogPostsByTopic(topic.slug);
            const localizedTopic = topicCopy[topic.slug][locale] ?? topic;

            return (
              <section key={topic.slug} className="grid gap-4">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div>
                    <h3 className="text-xl font-bold tracking-normal text-ink">{localizedTopic.title}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{localizedTopic.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{posts.length} {copy.countLabel}</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <BlogPostCard key={post.slug} post={post} t={t} badge={post.tier === "core" ? copy.coreBadge : copy.supportingBadge} readMore={copy.readMore} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BlogPostCard({post, t, badge, readMore, featured = false}: {post: BlogPostConfig; t: Awaited<ReturnType<typeof getTranslations>>; badge: string; readMore: string; featured?: boolean}) {
  const title = t(`blog.posts.${post.slug}.title`);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-primary hover:shadow-workspace ${featured ? "shadow-sm" : ""}`}
    >
      <img src={post.image} alt={title} className="aspect-[16/9] w-full object-cover" />
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{badge}</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {post.date}
          </span>
          <span>{t(`blog.posts.${post.slug}.readingTime`)}</span>
        </div>
        <h4 className="text-lg font-bold leading-6 text-ink">{title}</h4>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{t(`blog.posts.${post.slug}.excerpt`)}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {readMore}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
