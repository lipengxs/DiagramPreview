import plantumlEncoder from "plantuml-encoder";

export function plantUmlSvgUrl(source: string) {
  if (!/^\s*@startuml\b/im.test(source) || !/@enduml\s*$/im.test(source)) {
    throw new Error("PlantUML source must include @startuml and @enduml.");
  }
  return `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(source)}`;
}
