import {Locale} from "@/config/locales";
import {siteConfig} from "@/config/site";
import {ToolSlug} from "@/config/tools";

export function localizedPath(locale: Locale | string, path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function toolPath(locale: Locale | string, slug: ToolSlug | string) {
  return localizedPath(locale, slug);
}

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}
