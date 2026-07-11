import type {MetadataRoute} from "next";
import {sitemapBlogPosts} from "@/config/blog";
import {blogIndexableLocales, growthContentIndexableLocales, seoCoreBlogSlugs, seoCoreToolSlugs, seoFocusLocales} from "@/config/seo-focus";
import {siteConfig} from "@/config/site";
import {toolHubs} from "@/config/navigation";
import {tools} from "@/config/tools";
import {workflows} from "@/config/workflows";
import {getToolLastModified} from "@/lib/seo";
import {sitemapResponse} from "@/lib/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  const entries: MetadataRoute.Sitemap = [];
  const coreTools = tools.filter((tool) => seoCoreToolSlugs.includes(tool.slug));
  const coreBlogs = sitemapBlogPosts.filter((post) => seoCoreBlogSlugs.includes(post.slug));

  for (const locale of seoFocusLocales) {
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: getLatestBlogDate(),
      changeFrequency: "weekly",
      priority: 1
    });

    for (const hub of toolHubs) {
      entries.push({
        url: `${siteConfig.url}/${locale}${hub.href}`,
        lastModified: getLatestBlogDate(),
        changeFrequency: "weekly",
        priority: hub.slug === "tools" ? 0.9 : 0.82
      });
    }

    for (const tool of coreTools) {
      entries.push({
        url: `${siteConfig.url}/${locale}/${tool.slug}`,
        lastModified: getToolLastModified(tool),
        changeFrequency: "weekly",
        priority: tool.popular ? 0.95 : 0.86
      });
    }

    if (blogIndexableLocales.includes(locale)) {
      entries.push({
        url: `${siteConfig.url}/${locale}/blog`,
        lastModified: getLatestBlogDate(),
        changeFrequency: "weekly",
        priority: 0.72
      });
    }

    if (growthContentIndexableLocales.includes(locale)) {
      entries.push({
        url: `${siteConfig.url}/${locale}/templates`,
        lastModified: getLatestBlogDate(),
        changeFrequency: "weekly",
        priority: 0.8
      });

      entries.push({
        url: `${siteConfig.url}/${locale}/workflows`,
        lastModified: getLatestBlogDate(),
        changeFrequency: "weekly",
        priority: 0.8
      });

      for (const workflow of workflows) {
        entries.push({
          url: `${siteConfig.url}/${locale}/workflows/${workflow.slug}`,
          lastModified: getLatestBlogDate(),
          changeFrequency: "monthly",
          priority: 0.76
        });
      }
    }

    if (blogIndexableLocales.includes(locale)) {
      for (const post of coreBlogs) {
        entries.push({
          url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.date),
          changeFrequency: "monthly",
          priority: post.tier === "core" ? 0.76 : 0.7
        });
      }
    }
  }

  return sitemapResponse(entries);
}

function getLatestBlogDate() {
  const timestamps = sitemapBlogPosts.map((post) => new Date(post.date).getTime()).filter(Number.isFinite);
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.UTC(2026, 5, 25));
}
