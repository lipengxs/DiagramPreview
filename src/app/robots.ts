import type {MetadataRoute} from "next";
import {siteConfig} from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      }
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-core.xml`,
      `${siteConfig.url}/sitemap-tools.xml`,
      `${siteConfig.url}/sitemap-blog.xml`
    ],
    host: siteConfig.url
  };
}
