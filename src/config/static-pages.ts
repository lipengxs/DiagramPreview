export type StaticPageSlug = "about" | "help-center" | "contact" | "privacy-policy" | "terms-of-use";

export const staticPageSlugs: StaticPageSlug[] = [
  "about",
  "help-center",
  "contact",
  "privacy-policy",
  "terms-of-use"
];

export function isStaticPageSlug(value: string): value is StaticPageSlug {
  return staticPageSlugs.includes(value as StaticPageSlug);
}
