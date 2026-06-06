import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";

type ComposeFile = {
  services?: Record<string, {depends_on?: string[] | Record<string, unknown>; networks?: string[] | Record<string, unknown>}>;
  networks?: Record<string, unknown>;
  volumes?: Record<string, unknown>;
};

export async function renderDockerComposeDiagram(source: string) {
  const compose = yaml.load(source) as ComposeFile;
  const services = compose?.services || {};

  if (!Object.keys(services).length) {
    throw new Error("Docker Compose file must include services.");
  }

  const lines = ["flowchart LR"];

  for (const [service, config] of Object.entries(services)) {
    lines.push(`  ${id(service)}["${label(service)}"]`);

    for (const dependency of getDependsOn(config.depends_on)) {
      lines.push(`  ${id(service)} --> ${id(dependency)}`);
    }

    for (const network of getNames(config.networks)) {
      lines.push(`  ${id(service)} -.-> net_${id(network)}(("network: ${label(network)}"))`);
    }
  }

  for (const volume of Object.keys(compose.volumes || {}).slice(0, 12)) {
    lines.push(`  vol_${id(volume)}[("volume: ${label(volume)}")]`);
  }

  return renderMermaid(lines.join("\n"));
}

function getDependsOn(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === "object") return Object.keys(value);
  return [];
}

function getNames(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === "object") return Object.keys(value);
  return [];
}

function id(value: string) {
  return value.replace(/[^\w]/g, "_");
}

function label(value: string) {
  return value.replace(/"/g, "'");
}
