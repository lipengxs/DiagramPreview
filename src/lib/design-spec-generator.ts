import {locales, type Locale} from "../config/locales";

export const designSpecLocales = locales;
export type DesignSpecLanguage = typeof designSpecLocales[number];
export type DesignSpecDraft = {
  title: string;
  introduction: string;
  sections: Array<{heading: string; body: string}>;
};

export function designSpecLanguage(locale: string): DesignSpecLanguage {
  return locales.includes(locale as Locale) ? locale as Locale : "en";
}

// Only split our own fixed template, not arbitrary user Markdown.
export function createDesignSpecDraft(source: string): DesignSpecDraft {
  const [intro, ...sections] = source.split("\n## ");
  const [title, ...introduction] = intro.split("\n");
  return {
    title: title.slice(2),
    introduction: introduction.join("\n").trim(),
    sections: sections.map((section) => {
      const [heading, ...body] = section.split("\n");
      return {heading, body: body.join("\n").trim()};
    })
  };
}

export function generateDesignSpec(draft: DesignSpecDraft, copy: {unresolved: string; untitled: string}) {
  const unresolved = copy.unresolved;
  const title = draft.title.replace(/[\r\n]+/g, " ").trim() || copy.untitled;
  return [
    `# ${title}`,
    draft.introduction,
    ...draft.sections.map(({heading, body}) => `## ${heading}\n${body.trim() || unresolved}`)
  ].join("\n\n") + "\n";
}
