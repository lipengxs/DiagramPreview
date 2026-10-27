export const PLANTUML_MAX_SOURCE_BYTES = 64 * 1024;
export const PLANTUML_MAX_SVG_BYTES = 2 * 1024 * 1024;
export const PLANTUML_TIMEOUT_MS = 10_000;

export function validatePlantUmlSource(source: string) {
  if (new TextEncoder().encode(source).byteLength > PLANTUML_MAX_SOURCE_BYTES) {
    throw new Error("PlantUML source exceeds the 64 KiB limit. Split the diagram and try again.");
  }
  if (!/^\s*@startuml\b/i.test(source) || !/@enduml\s*$/i.test(source)) {
    throw new Error("PlantUML source must include @startuml and @enduml.");
  }
  // The preview is a single diagram, rather than an archive of several rendered files.
  if ((source.match(/^\s*@startuml\b/gim) || []).length !== 1 || (source.match(/^\s*@enduml\b/gim) || []).length !== 1) {
    throw new Error("Preview one PlantUML document at a time.");
  }
}
