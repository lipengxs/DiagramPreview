import {hasLocale} from "next-intl";
import {getRequestConfig} from "next-intl/server";
import {routing} from "./routing";

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  // New guides have complete English and Simplified Chinese editions. Other
  // blog locales already use noindex and an English canonical URL.
  const designSpecPosts = (await import(`../messages/blog-design-specs/${locale === "zh-CN" ? "zh-CN" : "en"}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      blog: {...messages.blog, posts: {...messages.blog.posts, ...designSpecPosts}}
    }
  };
});
