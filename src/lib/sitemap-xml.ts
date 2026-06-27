import type {MetadataRoute} from "next";

export function buildSitemapXml(entries: MetadataRoute.Sitemap) {
  const urls = entries.map((entry) => {
    const lastmod = entry.lastModified ? `<lastmod>${formatDate(entry.lastModified)}</lastmod>` : "";
    const changefreq = entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "";
    const priority = typeof entry.priority === "number" ? `<priority>${entry.priority}</priority>` : "";

    return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}${changefreq}${priority}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function sitemapResponse(entries: MetadataRoute.Sitemap) {
  return new Response(buildSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}

function formatDate(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
