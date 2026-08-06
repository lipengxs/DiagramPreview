import type {MetadataRoute} from "next";
import {siteConfig} from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "SERankingBacklinksBot",
        disallow: "/"
      },
      {
        userAgent: "AwarioBot",
        disallow: "/"
      },
      {
        userAgent: "AhrefsBot",
        disallow: "/"
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      }
    ],
    sitemap: [`${siteConfig.url}/sitemap-core.xml`],
    host: siteConfig.url
  };
}
