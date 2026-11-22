import {hasLocale} from "next-intl";
import {getRequestConfig} from "next-intl/server";
import {routing} from "./routing";
import {getDesignSpecGeneratorCopy} from "../config/design-spec-generator-copy";

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  const designSpecPosts = (await import(`../messages/blog-design-specs/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      tools: {...messages.tools, "design-spec-generator": {name: getDesignSpecGeneratorCopy(locale).name, shortDescription: getDesignSpecGeneratorCopy(locale).shortDescription}},
      blog: {...messages.blog, posts: {...messages.blog.posts, ...designSpecPosts}}
    }
  };
});
