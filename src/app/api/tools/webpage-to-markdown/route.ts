import dns from "node:dns/promises";
import net from "node:net";
import {NextResponse} from "next/server";

export const runtime = "nodejs";

const maxBytes = 1_200_000;
const maxRedirects = 3;
const timeoutMs = 9000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON request body."}, {status: 400});
  }

  const source = typeof (body as Record<string, unknown>)?.source === "string" ? (body as {source: string}).source.trim() : "";
  if (!source) return NextResponse.json({error: "Paste a URL or HTML document."}, {status: 400});

  try {
    const result = source.startsWith("<") || /<html[\s>]|<article[\s>]|<body[\s>]/i.test(source)
      ? convertHtml(source, "Pasted HTML")
      : convertHtml(await fetchPublicHtml(source), source);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Unable to convert webpage to Markdown."},
      {status: 400}
    );
  }
}

async function fetchPublicHtml(input: string) {
  let current = parsePublicUrl(input);

  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    await assertPublicHost(current.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(current, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.2,*/*;q=0.1",
        "user-agent": "DiagramPreview-WebpageToMarkdown/1.0"
      }
    }).finally(() => clearTimeout(timeout));

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The page redirected without a Location header.");
      current = parsePublicUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) throw new Error(`The page returned HTTP ${response.status}.`);

    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      throw new Error(`Expected an HTML page, received ${contentType || "an unknown content type"}.`);
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > maxBytes) throw new Error("The page is too large to convert in this preview.");

    const html = await response.text();
    if (new TextEncoder().encode(html).length > maxBytes) {
      throw new Error("The page is too large to convert in this preview.");
    }
    return html;
  }

  throw new Error("The page redirected too many times.");
}

function parsePublicUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a valid http or https URL, or paste raw HTML.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http and https URLs are supported.");
  return url;
}

async function assertPublicHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (["localhost", "0.0.0.0"].includes(normalized) || normalized.endsWith(".local")) {
    throw new Error("Local and private network URLs are not supported.");
  }

  const literalVersion = net.isIP(normalized);
  if (literalVersion && isPrivateIp(normalized)) throw new Error("Private network URLs are not supported.");

  if (!literalVersion) {
    const records = await dns.lookup(normalized, {all: true, verbatim: true});
    if (!records.length) throw new Error("Could not resolve the webpage host.");
    if (records.some((record) => isPrivateIp(record.address))) {
      throw new Error("Private network URLs are not supported.");
    }
  }
}

function isPrivateIp(address: string) {
  if (net.isIP(address) === 6) {
    const value = address.toLowerCase();
    return value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
  }

  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function convertHtml(html: string, sourceUrl: string) {
  const title = textFromTag(html, "title") || headingFromHtml(html) || "Converted webpage";
  const description = metaContent(html, "description");
  const mainHtml = extractMainHtml(html);
  const markdown = htmlToMarkdown(mainHtml, title, sourceUrl, description);
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const linkCount = (markdown.match(/\]\(/g) || []).length;

  return {
    title,
    markdown,
    wordCount,
    linkCount,
    sourceUrl
  };
}

function htmlToMarkdown(source: string, title: string, sourceUrl: string, description?: string) {
  const codeBlocks: string[] = [];
  let html = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
      const index = codeBlocks.push(cleanText(code)) - 1;
      return `\n\n%%CODE_BLOCK_${index}%%\n\n`;
    });

  html = html
    .replace(/<img[^>]*alt=["']?([^"'>]*)["']?[^>]*src=["']?([^"'>\s]+)["']?[^>]*>/gi, (_, alt, src) => `![${cleanInline(alt)}](${src})`)
    .replace(/<a[^>]*href=["']?([^"'>\s]+)["']?[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `[${cleanInline(label)}](${href})`);

  for (let level = 1; level <= 6; level += 1) {
    html = html.replace(new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi"), (_, text) => `\n\n${"#".repeat(level)} ${cleanInline(text)}\n\n`);
  }

  html = html
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${cleanInline(text)}`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> ${cleanInline(text)}\n\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|main|header|footer|nav|ul|ol|table|tr)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  let markdown = cleanText(html)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  markdown = markdown.replace(/%%CODE_BLOCK_(\d+)%%/g, (_, index) => `\n\n\`\`\`\n${codeBlocks[Number(index)] || ""}\n\`\`\`\n\n`);
  markdown = removeDuplicateTitle(markdown, title);

  const frontMatter = [`# ${cleanInline(title)}`];
  if (/^https?:\/\//i.test(sourceUrl)) frontMatter.push(`\nSource: ${sourceUrl}`);
  if (description) frontMatter.push(`\n${cleanInline(description)}`);
  return `${frontMatter.join("\n")}\n\n${markdown}`.trim();
}

function extractMainHtml(html: string) {
  return (
    firstMatch(html, /<article[\s\S]*?<\/article>/i) ||
    firstMatch(html, /<main[\s\S]*?<\/main>/i) ||
    firstMatch(html, /<body[\s\S]*?<\/body>/i) ||
    html
  );
}

function headingFromHtml(html: string) {
  return textFromTag(html, "h1");
}

function textFromTag(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanInline(match[1]) : "";
}

function metaContent(html: string, name: string) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[0] || "";
}

function cleanInline(value: string) {
  return cleanText(value).replace(/\n+/g, " ").trim();
}

function cleanText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/[ \t]{2,}/g, " "));
}

function decodeEntities(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " "
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    const key = String(entity).toLowerCase();
    if (key.startsWith("#x")) return String.fromCharCode(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCharCode(parseInt(key.slice(1), 10));
    return entities[key] || `&${entity};`;
  });
}

function removeDuplicateTitle(markdown: string, title: string) {
  const normalizedTitle = cleanInline(title).toLowerCase();
  const lines = markdown.split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines[0]?.startsWith("# ")) {
    const firstHeading = lines[0].replace(/^#\s+/, "").trim().toLowerCase();
    if (firstHeading === normalizedTitle) {
      lines.shift();
      while (lines.length && !lines[0].trim()) lines.shift();
    }
  }
  return lines.join("\n").trim();
}
