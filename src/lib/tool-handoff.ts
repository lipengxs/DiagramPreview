import {boundedSourceUrl} from "./source-links";

type Artifact = {filename: string; mime: string; content: string};
type HandoffInput = {
  slug: string;
  source: string;
  current: boolean;
  artifact?: Artifact;
};

const mermaidTools = ["mermaid-preview", "mermaid-ai-fixer", "mermaid-to-drawio"];
const plantumlTools = ["plantuml-preview", "plantuml-to-drawio"];
const converters = ["mermaid-to-drawio", "plantuml-to-drawio"];

export function toolHandoff(input: HandoffInput, target: string) {
  let kind: "none" | "source" | "drawio" | "unavailable" = "none";
  let file: Artifact | undefined;
  if ((mermaidTools.includes(input.slug) && mermaidTools.includes(target)) ||
      (plantumlTools.includes(input.slug) && plantumlTools.includes(target))) {
    kind = "source";
    file = input.source.trim() ? sourceFile(input.slug, input.source) : undefined;
  } else if (converters.includes(input.slug) && target === "drawio-preview") {
    kind = input.current && input.artifact ? "drawio" : "unavailable";
    if (kind === "drawio") file = input.artifact;
  }
  const link = boundedSourceUrl(`/${target}`, file?.content ?? "");
  return {...link, kind, file};
}

export function sourceFile(slug: string, source: string): Artifact {
  const extension = slug.includes("drawio") && !converters.includes(slug) ? "drawio"
    : slug.includes("plantuml") ? "puml"
    : slug.includes("mermaid") ? "mmd" : "txt";
  return {filename: `${slug}-source.${extension}`, content: source, mime: "text/plain;charset=utf-8"};
}
