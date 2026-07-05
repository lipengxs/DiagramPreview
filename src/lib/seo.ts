import type {Metadata} from "next";
import {defaultLocale, indexableLocales, locales, type Locale} from "@/config/locales";
import {defaultToolUpdatedAt} from "@/config/seo-focus";
import {siteConfig} from "@/config/site";
import type {ToolConfig, ToolSlug} from "@/config/tools";
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
  const matchedLocale = locales.find((candidate) => path === `/${candidate}` || path.startsWith(`/${candidate}/`));
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

export function websiteJsonLd(input: {locale: Locale; name: string; description: string; url: string}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    description: input.description,
    inLanguage: input.locale
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  items: Array<{name: string; url: string; description?: string}>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: item.name,
          url: item.url,
          ...(item.description ? {description: item.description} : {})
        }
      }))
    }
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  url: string;
  steps: Array<{name: string; text: string; url?: string}>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: input.url,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? {url: step.url} : {})
    }))
  };
}

export function breadcrumbJsonLd(items: Array<{name: string; url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function blogPostingJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    url: input.url,
    image: input.image,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.locale,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logoPath)
      }
    }
  };
}

export function getToolLastModified(tool: Pick<ToolConfig, "updatedAt">) {
  return new Date(tool.updatedAt ?? defaultToolUpdatedAt);
}
