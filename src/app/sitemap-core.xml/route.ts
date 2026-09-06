import type {MetadataRoute} from "next";
import {sitemapBlogPosts} from "@/config/blog";
import {
  seoSubmissionBlogSlugs,
  seoSubmissionBlogLocales,
  seoSubmissionHomeLocales,
  seoSubmissionHubLocales,
  seoSubmissionHubSlugs,
  seoSubmissionLocales,
  seoSubmissionToolSlugsByLocale,
  seoSubmissionWorkflowSlugs
} from "@/config/seo-focus";
import {siteConfig} from "@/config/site";
import {toolHubs} from "@/config/navigation";
import {tools} from "@/config/tools";
import {workflows} from "@/config/workflows";
import {getToolLastModified} from "@/lib/seo";
import {sitemapResponse} from "@/lib/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  const entries: MetadataRoute.Sitemap = [];
  const coreBlogs = sitemapBlogPosts.filter((post) => seoSubmissionBlogSlugs.includes(post.slug));
  const coreWorkflows = workflows.filter((workflow) => seoSubmissionWorkflowSlugs.includes(workflow.slug));

  for (const locale of seoSubmissionHomeLocales) {
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: getLatestBlogDate(),
      changeFrequency: "weekly",
      priority: 1
    });
  }

  for (const locale of seoSubmissionHubLocales) {
    const submissionHubs = toolHubs.filter((candidate) =>
      seoSubmissionHubSlugs.includes(candidate.slug as (typeof seoSubmissionHubSlugs)[number])
    );
    for (const hub of submissionHubs) {
      entries.push({
        url: `${siteConfig.url}/${locale}${hub.href}`,
        lastModified: getLatestBlogDate(),
        changeFrequency: "weekly",
        priority: hub.slug === "tools" ? 0.9 : 0.82
      });
    }
  }

  for (const locale of seoSubmissionLocales) {
    const submissionSlugs = seoSubmissionToolSlugsByLocale[locale] ?? [];
    for (const slug of submissionSlugs) {
      const tool = tools.find((candidate) => candidate.slug === slug);
      if (!tool) continue;
      entries.push({
        url: `${siteConfig.url}/${locale}/${tool.slug}`,
        lastModified: getToolLastModified(tool),
        changeFrequency: "weekly",
        priority: tool.popular ? 0.95 : 0.86
      });
    }
  }

  for (const locale of seoSubmissionBlogLocales) {
    entries.push({
      url: `${siteConfig.url}/${locale}/blog`,
      lastModified: getLatestBlogDate(),
      changeFrequency: "weekly",
      priority: 0.72
    });

    for (const post of coreBlogs) {
      entries.push({
        url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: post.tier === "core" ? 0.76 : 0.7
      });
    }
  }

  for (const workflow of coreWorkflows) {
    entries.push({
      url: `${siteConfig.url}/en/workflows/${workflow.slug}`,
      lastModified: getLatestBlogDate(),
      changeFrequency: "monthly",
      priority: 0.76
    });
  }

  return sitemapResponse(entries);
}

function getLatestBlogDate() {
  const timestamps = sitemapBlogPosts.map((post) => new Date(post.date).getTime()).filter(Number.isFinite);
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.UTC(2026, 5, 25));
}
