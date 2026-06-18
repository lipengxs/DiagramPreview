import type {Metadata} from "next";
import {defaultLocale, indexableLocales, type Locale} from "@/config/locales";
import {siteConfig} from "@/config/site";
import {ToolSlug} from "@/config/tools";
import {absoluteUrl, toolPath} from "./paths";

export type SeoInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  keywords?: string[];
};

export function buildMetadata({locale, path, title, description, keywords = []}: SeoInput): Metadata {
  const isIndexableLocale = indexableLocales.includes(locale);
  const pathWithoutLocale = stripLocalePrefix(path);
  const canonicalPath = isIndexableLocale ? path : `/${indexableLocales[0]}${pathWithoutLocale}`;
  const canonical = absoluteUrl(canonicalPath);
  const languageAlternates = Object.fromEntries(
    indexableLocales.map((candidate) => [candidate, absoluteUrl(`/${candidate}${pathWithoutLocale}`)])
  );
  languageAlternates["x-default"] = absoluteUrl(`/${defaultLocale}${pathWithoutLocale}`);

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    keywords,
    icons: {
      icon: [
        {url: "/favicon.ico"},
        {url: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
        {url: "/favicon-16x16.png", sizes: "16x16", type: "image/png"}
      ],
      apple: [{url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png"}]
    },
    alternates: {
      canonical,
      languages: languageAlternates
    },
    robots: isIndexableLocale
      ? {
          index: true,
          follow: true
        }
      : {
          index: false,
          follow: true
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
      images: [
        {
          url: siteConfig.ogImagePath,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} diagram preview tools`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(siteConfig.twitterHandle ? {creator: siteConfig.twitterHandle} : {})
    }
  };
}

function stripLocalePrefix(path: string) {
  const matchedLocale = indexableLocales.find((candidate) => path === `/${candidate}` || path.startsWith(`/${candidate}/`));
  if (!matchedLocale) return path.startsWith("/") ? path : `/${path}`;
  const stripped = path.slice(matchedLocale.length + 1);
  return stripped || "";
}

export function softwareApplicationJsonLd(input: {
  locale: Locale;
  slug: ToolSlug;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: absoluteUrl(toolPath(input.locale, input.slug)),
    description: input.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

export function faqJsonLd(items: Array<{question: string; answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
