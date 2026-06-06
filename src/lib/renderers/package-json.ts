import {renderMermaid} from "./mermaid";

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

export async function renderPackageJsonDependencyDiagram(source: string) {
  const pkg = JSON.parse(source) as PackageJson;
  const root = pkg.name || "package";
  const groups = [
    ["dependencies", pkg.dependencies],
    ["devDependencies", pkg.devDependencies],
    ["peerDependencies", pkg.peerDependencies],
    ["optionalDependencies", pkg.optionalDependencies]
  ] as const;

  const lines = ["flowchart LR", `  root["${escapeLabel(root)}"]`];

  for (const [group, dependencies] of groups) {
    const entries = Object.entries(dependencies || {}).slice(0, 24);
    if (!entries.length) continue;

    lines.push(`  subgraph ${id(group)}["${group}"]`);
    for (const [name, version] of entries) {
      lines.push(`    ${id(group)}_${id(name)}["${escapeLabel(name)}\\n${escapeLabel(version)}"]`);
    }
    lines.push("  end");
    for (const [name] of entries) {
      lines.push(`  root --> ${id(group)}_${id(name)}`);
    }
  }

  return renderMermaid(lines.join("\n"));
}

function id(value: string) {
  return value.replace(/[^\w]/g, "_");
}

function escapeLabel(value: string) {
  return value.replace(/"/g, "'");
}
