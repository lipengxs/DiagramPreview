export const locales = [
  "en",
  "zh-CN",
  "zh-TW",
  "pt",
  "es",
  "de",
  "fr",
  "ru",
  "ja",
  "ko"
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const indexableLocales: Locale[] = [...locales];

export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  pt: "Português",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어"
};
