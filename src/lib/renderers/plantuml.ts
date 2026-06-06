import plantumlEncoder from "plantuml-encoder";

export function plantUmlSvgUrl(source: string) {
  return `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(source)}`;
}
