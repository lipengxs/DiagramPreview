import plantumlEncoder from "plantuml-encoder";
import {validatePlantUmlSource} from "../plantuml-limits";

export function plantUmlSvgUrl(source: string) {
  validatePlantUmlSource(source);
  return `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(source)}`;
}
