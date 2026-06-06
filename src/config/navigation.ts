import type {ToolNavGroup} from "./tools";

export type NavItem = {
  href: string;
  labelKey: string;
};

export type ToolHub = {
  slug: "tools" | ToolNavGroup;
  href: string;
  navGroup?: ToolNavGroup;
  titleKey: string;
  descriptionKey: string;
  keywordsKey: string;
};

export const headerNavItems: NavItem[] = [
  {href: "/tools", labelKey: "common.nav.tools"},
  {href: "/blog", labelKey: "common.nav.blog"}
];

export const toolHubs: ToolHub[] = [
  {
    slug: "tools",
    href: "/tools",
    titleKey: "hubs.tools.title",
    descriptionKey: "hubs.tools.description",
    keywordsKey: "hubs.tools.keywords"
  },
  {
    slug: "ai-diagram",
    href: "/ai-diagram",
    navGroup: "ai-diagram",
    titleKey: "hubs.ai-diagram.title",
    descriptionKey: "hubs.ai-diagram.description",
    keywordsKey: "hubs.ai-diagram.keywords"
  },
  {
    slug: "preview-tools",
    href: "/preview-tools",
    navGroup: "preview-tools",
    titleKey: "hubs.preview-tools.title",
    descriptionKey: "hubs.preview-tools.description",
    keywordsKey: "hubs.preview-tools.keywords"
  },
  {
    slug: "developer-diagrams",
    href: "/developer-diagrams",
    navGroup: "developer-diagrams",
    titleKey: "hubs.developer-diagrams.title",
    descriptionKey: "hubs.developer-diagrams.description",
    keywordsKey: "hubs.developer-diagrams.keywords"
  },
  {
    slug: "data-visualizers",
    href: "/data-visualizers",
    navGroup: "data-visualizers",
    titleKey: "hubs.data-visualizers.title",
    descriptionKey: "hubs.data-visualizers.description",
    keywordsKey: "hubs.data-visualizers.keywords"
  },
  {
    slug: "converters",
    href: "/converters",
    navGroup: "converters",
    titleKey: "hubs.converters.title",
    descriptionKey: "hubs.converters.description",
    keywordsKey: "hubs.converters.keywords"
  }
];

export const englishStaticPages = [
  {slug: "about", href: "/about", titleKey: "staticPages.about.title"},
  {slug: "help-center", href: "/help-center", titleKey: "staticPages.help-center.title"},
  {slug: "contact", href: "/contact", titleKey: "staticPages.contact.title"},
  {slug: "privacy-policy", href: "/privacy-policy", titleKey: "staticPages.privacy-policy.title"},
  {slug: "terms-of-use", href: "/terms-of-use", titleKey: "staticPages.terms-of-use.title"}
] as const;
