import type {MetadataRoute} from "next";
import {sitemapBlogPosts} from "@/config/blog";
import {blogIndexableLocales} from "@/config/seo-focus";
import {siteConfig} from "@/config/site";
import {sitemapResponse} from "@/lib/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of blogIndexableLocales) {
    entries.push({
      url: `${siteConfig.url}/${locale}/blog`,
      lastModified: latestDate(),
      changeFrequency: "weekly",
      priority: 0.72
    });

    for (const post of sitemapBlogPosts) {
      entries.push({
        url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: post.tier === "core" ? 0.72 : 0.68
      });
    }
  }

  return sitemapResponse(entries);
}

function latestDate() {
  const timestamps = sitemapBlogPosts.map((post) => new Date(post.date).getTime()).filter(Number.isFinite);
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.UTC(2026, 5, 25));
}
