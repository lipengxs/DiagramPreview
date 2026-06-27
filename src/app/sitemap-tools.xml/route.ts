import type {MetadataRoute} from "next";
import {indexableLocales} from "@/config/locales";
import {siteConfig} from "@/config/site";
import {tools} from "@/config/tools";
import {getToolLastModified} from "@/lib/seo";
import {sitemapResponse} from "@/lib/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of indexableLocales) {
    for (const tool of tools) {
      entries.push({
        url: `${siteConfig.url}/${locale}/${tool.slug}`,
        lastModified: getToolLastModified(tool),
        changeFrequency: "weekly",
        priority: tool.popular ? 0.9 : 0.75
      });
    }
  }

  return sitemapResponse(entries);
}
