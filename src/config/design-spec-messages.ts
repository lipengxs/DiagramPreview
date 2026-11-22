import {locales, type Locale} from "./locales";
import en from "../messages/design-specs/en.json";
import zhCN from "../messages/design-specs/zh-CN.json";
import zhTW from "../messages/design-specs/zh-TW.json";
import pt from "../messages/design-specs/pt.json";
import es from "../messages/design-specs/es.json";
import de from "../messages/design-specs/de.json";
import fr from "../messages/design-specs/fr.json";
import ru from "../messages/design-specs/ru.json";
import ja from "../messages/design-specs/ja.json";
import ko from "../messages/design-specs/ko.json";

export type DesignSpecMessages = Omit<typeof en, "rules"> & {rules: Array<Omit<typeof en.rules[number], "terms"> & {terms: string[][]}>};
export const designSpecMessages: Record<Locale, DesignSpecMessages> = {en, "zh-CN": zhCN, "zh-TW": zhTW, pt, es, de, fr, ru, ja, ko};

export function getDesignSpecMessages(locale: string): DesignSpecMessages {
  return designSpecMessages[locales.includes(locale as Locale) ? locale as Locale : "en"];
}
