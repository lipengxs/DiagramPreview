import type {MetadataRoute} from "next";
import {blogPosts} from "@/config/blog";
import {locales} from "@/config/locales";
import {toolHubs} from "@/config/navigation";
import {siteConfig} from "@/config/site";
import {staticPageSlugs} from "@/config/static-pages";
import {tools} from "@/config/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    urls.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    });

    for (const hub of toolHubs) {
      urls.push({
        url: `${siteConfig.url}/${locale}${hub.href}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.82
      });
    }

    urls.push({
      url: `${siteConfig.url}/${locale}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.72
    });

    for (const post of blogPosts) {
      urls.push({
        url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.68
      });
    }

    for (const tool of tools) {
      urls.push({
        url: `${siteConfig.url}/${locale}/${tool.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: tool.popular ? 0.9 : 0.75
      });
    }
  }

  for (const slug of staticPageSlugs) {
    urls.push({
      url: `${siteConfig.url}/en/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: slug === "privacy-policy" || slug === "terms-of-use" ? 0.35 : 0.55
    });
  }

  return urls;
}
