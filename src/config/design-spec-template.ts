import {designSpecMessages} from "./design-spec-messages";
import type {Locale} from "./locales";

// Static downloads must match these localized sources byte for byte.
export const designSpecSources = Object.fromEntries(Object.entries(designSpecMessages).map(([locale, messages]) => [locale, messages.template.source])) as Record<Locale, string>;
