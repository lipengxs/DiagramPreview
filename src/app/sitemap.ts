import type {MetadataRoute} from "next";
import {sitemapBlogPosts} from "@/config/blog";
import {indexableLocales} from "@/config/locales";
import {toolHubs} from "@/config/navigation";
import {blogIndexableLocales, growthContentIndexableLocales} from "@/config/seo-focus";
import {siteConfig} from "@/config/site";
import {staticPageSlugs} from "@/config/static-pages";
import {tools} from "@/config/tools";
import {workflows} from "@/config/workflows";
import {getToolLastModified} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const latestContentDate = latestDate(sitemapBlogPosts.map((post) => post.date));
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of indexableLocales) {
    urls.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: latestContentDate,
      changeFrequency: "weekly",
      priority: 1
    });

    for (const hub of toolHubs) {
      urls.push({
        url: `${siteConfig.url}/${locale}${hub.href}`,
        lastModified: latestContentDate,
        changeFrequency: "weekly",
        priority: 0.82
      });
    }

    if (blogIndexableLocales.includes(locale)) {
      urls.push({
        url: `${siteConfig.url}/${locale}/blog`,
        lastModified: latestContentDate,
        changeFrequency: "weekly",
        priority: 0.72
      });
    }

    if (growthContentIndexableLocales.includes(locale)) {
      urls.push({
        url: `${siteConfig.url}/${locale}/templates`,
        lastModified: latestContentDate,
        changeFrequency: "weekly",
        priority: 0.76
      });

      urls.push({
        url: `${siteConfig.url}/${locale}/workflows`,
        lastModified: latestContentDate,
        changeFrequency: "weekly",
        priority: 0.78
      });

      for (const workflow of workflows) {
        urls.push({
          url: `${siteConfig.url}/${locale}/workflows/${workflow.slug}`,
          lastModified: latestContentDate,
          changeFrequency: "monthly",
          priority: 0.74
        });
      }
    }

    if (blogIndexableLocales.includes(locale)) {
      for (const post of sitemapBlogPosts) {
        urls.push({
          url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.date),
          changeFrequency: "monthly",
          priority: 0.68
        });
      }
    }

    for (const tool of tools) {
      urls.push({
        url: `${siteConfig.url}/${locale}/${tool.slug}`,
        lastModified: getToolLastModified(tool),
        changeFrequency: "weekly",
        priority: tool.popular ? 0.9 : 0.75
      });
    }
  }

  for (const slug of staticPageSlugs) {
    urls.push({
      url: `${siteConfig.url}/en/${slug}`,
      lastModified: latestContentDate,
      changeFrequency: "monthly",
      priority: slug === "privacy-policy" || slug === "terms-of-use" ? 0.35 : 0.55
    });
  }

  return urls;
}

function latestDate(values: string[]) {
  const timestamps = values.map((value) => new Date(value).getTime()).filter((value) => Number.isFinite(value));
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.UTC(2026, 5, 18));
}
