const DEFAULT_BASE_URL = "https://diagrampreview.com";
const EXPECTED_CORE_PATHS = [
  "/en",
  "/zh-CN",
  "/en/tools",
  "/en/converters",
  "/en/preview-tools",
  "/en/developer-diagrams",
  "/en/data-visualizers",
  ...["text-to-mermaid", "mermaid-preview", "mermaid-to-drawio", "plantuml-preview", "plantuml-to-drawio", "drawio-preview", "openapi-to-sequence", "api-error-flow-diagram", "json-schema-visualizer", "json-schema-form-preview"].map((slug) => `/en/${slug}`),
  ...["text-to-mermaid", "mermaid-preview", "mermaid-to-drawio", "drawio-preview", "plantuml-preview", "d2-preview", "openapi-to-sequence", "json-schema-visualizer"].map((slug) => `/zh-CN/${slug}`),
  "/es/protobuf-schema-visualizer",
  "/es/drawio-preview",
  "/fr/openapi-to-sequence",
  "/de/drawio-preview",
  ...["ai-generated-mermaid-workflow", "open-drawio-file-online", "mermaid-to-drawio-documentation-workflow", "api-debugging-sequence-diagram", "schema-visualization-workflow"].map((slug) => `/en/workflows/${slug}`),
  "/en/blog",
  "/en/blog/chatgpt-mermaid-preview-workflow",
  "/en/blog/api-debugging-preview-har-postman-openapi",
  "/en/blog/schema-preview-workflow-json-schema-zod-typescript",
  "/en/blog/plantuml-to-drawio-editable-diagram"
];
const EXPECTED_CORE_URLS = EXPECTED_CORE_PATHS.length;
if (EXPECTED_CORE_URLS !== 39) throw new Error("The reviewed core search list must contain 39 URLs.");
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.SITE_URL || DEFAULT_BASE_URL);
const failures = [];
const pageCache = new Map();
let alternateChecks = 0;

const robotsResponse = await fetchChecked(new URL("/robots.txt", baseUrl), "robots.txt");
const robots = await robotsResponse.text();
const sitemapDeclarations = robots
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^sitemap:/i.test(line))
  .map((line) => line.slice(line.indexOf(":") + 1).trim());

if (sitemapDeclarations.length !== 1 || new URL(sitemapDeclarations[0] || "/", baseUrl).pathname !== "/sitemap-core.xml") {
  failures.push(`robots.txt must declare only /sitemap-core.xml; found: ${sitemapDeclarations.join(", ") || "none"}`);
}

const sitemapResponse = await fetchChecked(new URL("/sitemap-core.xml", baseUrl), "sitemap-core.xml");
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
const uniqueUrls = [...new Set(sitemapUrls)];

if (sitemapUrls.length !== EXPECTED_CORE_URLS) {
  failures.push(`sitemap-core.xml must contain ${EXPECTED_CORE_URLS} URLs; found ${sitemapUrls.length}`);
}
if (uniqueUrls.length !== sitemapUrls.length) {
  failures.push(`sitemap-core.xml contains ${sitemapUrls.length - uniqueUrls.length} duplicate URL(s)`);
}
const actualPaths = new Set(uniqueUrls.map((value) => new URL(value).pathname));
const expectedPaths = new Set(EXPECTED_CORE_PATHS);
for (const pathname of expectedPaths) {
  if (!actualPaths.has(pathname)) failures.push(`sitemap-core.xml is missing ${pathname}`);
}
for (const pathname of actualPaths) {
  if (!expectedPaths.has(pathname)) failures.push(`sitemap-core.xml contains unexpected path ${pathname}`);
}

const results = await mapWithConcurrency(uniqueUrls, 8, async (canonicalUrl) => {
  const target = new URL(new URL(canonicalUrl).pathname, baseUrl);
  try {
    const response = await readPage(target);
    const issues = [];
    if (response.status !== 200) issues.push(`HTTP ${response.status}`);
    if (response.status >= 300 && response.status < 400) issues.push(`redirects to ${response.location || "unknown"}`);
    const html = response.html;
    const canonical = extractTagAttribute(html, "link", "rel", "canonical", "href");
    const robotsValue = extractTagAttribute(html, "meta", "name", "robots", "content")?.toLowerCase();
    if (canonical !== canonicalUrl) issues.push(`canonical is ${canonical || "missing"}`);
    if (!robotsValue?.includes("index") || !robotsValue.includes("follow") || robotsValue.includes("noindex")) {
      issues.push(`robots meta is ${robotsValue || "missing"}`);
    }
    const languages = languageLinks(html);
    const currentLocale = new URL(canonicalUrl).pathname.split("/")[1];
    if (languages[currentLocale] !== canonicalUrl) issues.push("hreflang is missing its self-reference");
    for (const [language, href] of Object.entries(languages)) {
      alternateChecks++;
      const alternate = new URL(href);
      if (alternate.origin !== new URL(canonicalUrl).origin) {issues.push(`hreflang ${language} uses an unexpected origin`); continue;}
      const translated = await readPage(new URL(alternate.pathname, baseUrl));
      const translatedCanonical = extractTagAttribute(translated.html, "link", "rel", "canonical", "href");
      const translatedRobots = extractTagAttribute(translated.html, "meta", "name", "robots", "content");
      if (translated.status !== 200 || translatedCanonical !== href || !translatedRobots || /noindex/i.test(translatedRobots)) issues.push(`hreflang ${language} must point to an indexable self-canonical HTTP 200 page: ${href}`);
      if (language !== "x-default" && languageLinks(translated.html)[currentLocale] !== canonicalUrl) issues.push(`hreflang ${language} does not link back to ${currentLocale}`);
    }
    return {url: canonicalUrl, issues};
  } catch (error) {
    return {url: canonicalUrl, issues: [error instanceof Error ? error.message : String(error)]};
  }
});

for (const result of results) {
  for (const issue of result.issues) failures.push(`${result.url}: ${issue}`);
}

console.log(`SEO submission audit: ${baseUrl}`);
console.log(`Core sitemap URLs: ${sitemapUrls.length} (${uniqueUrls.length} unique)`);
console.log(`Pages checked: ${results.length}`);
console.log(`Hreflang targets checked: ${alternateChecks} (cached by URL, with reciprocal references)`);

if (failures.length) {
  console.error(`Audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Audit passed: robots, sitemap, status, canonical, robots meta, and page-level hreflang are consistent.");
}

function readPage(url) {
  const key = String(url);
  if (!pageCache.has(key)) pageCache.set(key, (async () => {
    const response = await fetch(url, {redirect: "manual", headers: {"user-agent": "DiagramPreviewSeoAudit/1.0"}});
    return {status: response.status, location: response.headers.get("location"), html: await response.text()};
  })());
  return pageCache.get(key);
}

function languageLinks(html) {
  const result = {};
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
    if (attrs.rel === "alternate" && attrs.hreflang && attrs.href) result[attrs.hreflang] = attrs.href;
  }
  return result;
}

async function fetchChecked(url, label) {
  const response = await fetch(url, {redirect: "manual", headers: {"user-agent": "DiagramPreviewSeoAudit/1.0"}});
  if (response.status !== 200) throw new Error(`${label} returned HTTP ${response.status}`);
  return response;
}

function normalizeBaseUrl(value) {
  return new URL(value).origin;
}

function decodeXml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&apos;", "'");
}

function extractTagAttribute(html, tagName, matchName, matchValue, outputName) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];
  for (const tag of tags) {
    const attributes = Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
    const matched = attributes[matchName]?.toLowerCase().split(/\s+/).includes(matchValue);
    if (matched) return attributes[outputName];
  }
  return undefined;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, worker));
  return results;
}
