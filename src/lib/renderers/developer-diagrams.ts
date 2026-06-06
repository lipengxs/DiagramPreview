import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";
import {toTree} from "./tree";

export async function renderTerraformArchitecture(source: string) {
  const resources = Array.from(source.matchAll(/resource\s+"([^"]+)"\s+"([^"]+)"/g)).map((match) => ({
    type: match[1],
    name: match[2],
    id: id(`${match[1]}_${match[2]}`)
  }));
  if (!resources.length) throw new Error("Add at least one Terraform resource block.");
  const lines = ["flowchart LR", ...resources.map((resource) => `  ${resource.id}["${label(resource.type)}\\n${label(resource.name)}"]`)];
  for (const resource of resources) {
    for (const target of resources) {
      if (resource.id !== target.id && source.includes(`${target.type}.${target.name}`)) {
        lines.push(`  ${resource.id} --> ${target.id}`);
      }
    }
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderGithubActionsWorkflow(source: string) {
  const workflow = yaml.load(source) as {jobs?: Record<string, {needs?: string | string[]; steps?: Array<{name?: string; run?: string; uses?: string}>}>};
  const jobs = workflow?.jobs || {};
  if (!Object.keys(jobs).length) throw new Error("GitHub Actions workflow must include jobs.");
  const lines = ["flowchart LR"];
  for (const [jobName, job] of Object.entries(jobs)) {
    lines.push(`  ${id(jobName)}["${label(jobName)}"]`);
    for (const need of normalizeList(job.needs)) lines.push(`  ${id(need)} --> ${id(jobName)}`);
    for (const [index, step] of (job.steps || []).slice(0, 5).entries()) {
      const stepId = `${id(jobName)}_step_${index + 1}`;
      lines.push(`  ${stepId}["${label(step.name || step.uses || step.run || `step ${index + 1}`)}"]`);
      lines.push(index === 0 ? `  ${id(jobName)} --> ${stepId}` : `  ${id(jobName)}_step_${index} --> ${stepId}`);
    }
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderDockerfile(source: string) {
  const instructions = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[A-Z]+\b/.test(line))
    .slice(0, 24);
  if (!instructions.length) throw new Error("Add Dockerfile instructions such as FROM, RUN, COPY, EXPOSE, or CMD.");
  const lines = ["flowchart TD"];
  instructions.forEach((instruction, index) => {
    lines.push(`  step_${index + 1}["${label(instruction.slice(0, 80))}"]`);
    if (index > 0) lines.push(`  step_${index} --> step_${index + 1}`);
  });
  return renderMermaid(lines.join("\n"));
}

export function parseHelmValues(source: string) {
  return toTree(yaml.load(source), "values.yaml");
}

export async function renderNginxConfig(source: string) {
  const upstreams = Array.from(source.matchAll(/upstream\s+([\w.-]+)\s*\{([\s\S]*?)\}/g)).map((match) => ({
    name: match[1],
    servers: Array.from(match[2].matchAll(/server\s+([^;]+);/g)).map((server) => server[1].trim())
  }));
  const servers = Array.from(source.matchAll(/server\s*\{([\s\S]*?)\}/g)).map((match, index) => ({
    name: match[1].match(/server_name\s+([^;]+);/)?.[1] || `server_${index + 1}`,
    locations: Array.from(match[1].matchAll(/location\s+([^\s{]+)\s*\{([\s\S]*?)\}/g)).map((location) => ({
      path: location[1],
      proxy: location[2].match(/proxy_pass\s+([^;]+);/)?.[1] || "static"
    }))
  }));
  if (!upstreams.length && !servers.length) throw new Error("Add at least one nginx server, location, or upstream block.");
  const lines = ["flowchart LR"];
  for (const upstream of upstreams) {
    lines.push(`  ${id(upstream.name)}["upstream ${label(upstream.name)}"]`);
    upstream.servers.forEach((server, index) => lines.push(`  ${id(upstream.name)} --> ${id(upstream.name)}_${index}["${label(server)}"]`));
  }
  for (const server of servers) {
    const serverId = id(server.name);
    lines.push(`  ${serverId}["${label(server.name)}"]`);
    server.locations.forEach((location, index) => {
      const locationId = `${serverId}_location_${index}`;
      lines.push(`  ${serverId} --> ${locationId}["${label(location.path)}"]`);
      lines.push(`  ${locationId} --> ${id(location.proxy)}["${label(location.proxy)}"]`);
    });
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderOpenTelemetryTrace(source: string) {
  const parsed = JSON.parse(source) as {spans?: unknown[]; resourceSpans?: unknown[]};
  const spans = extractSpans(parsed);
  if (!spans.length) throw new Error("Add OpenTelemetry spans JSON.");
  const lines = ["sequenceDiagram", "  autonumber"];
  const services = Array.from(new Set(spans.map((span) => span.service)));
  services.forEach((service) => lines.push(`  participant ${id(service)} as ${label(service)}`));
  for (const span of spans.slice(0, 30)) {
    const sourceService = span.parentService || "client";
    if (!services.includes(sourceService)) lines.splice(2, 0, `  participant ${id(sourceService)} as ${label(sourceService)}`);
    lines.push(`  ${id(sourceService)}->>${id(span.service)}: ${label(span.name)}`);
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderLogSequence(source: string) {
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.match(/([\w.-]+)\s*(?:->|=>|calls?)\s*([\w.-]+)\s*:?\s*(.*)/i))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .slice(0, 40);
  if (!rows.length) throw new Error("Add log lines like api -> auth: validate token.");
  const actors = Array.from(new Set(rows.flatMap((row) => [row[1], row[2]])));
  const lines = ["sequenceDiagram", "  autonumber", ...actors.map((actor) => `  participant ${id(actor)} as ${label(actor)}`)];
  rows.forEach((row) => lines.push(`  ${id(row[1])}->>${id(row[2])}: ${label(row[3] || "event")}`));
  return renderMermaid(lines.join("\n"));
}

function extractSpans(input: unknown) {
  const spans: Array<{name: string; service: string; parentService?: string}> = [];
  const visit = (value: unknown, service = "service") => {
    if (Array.isArray(value)) return value.forEach((item) => visit(item, service));
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const nextService = String(
      (record.resource && typeof record.resource === "object"
        ? ((record.resource as Record<string, unknown>).attributes as Array<{key?: string; value?: {stringValue?: string}}>)?.find(
            (attr) => attr.key === "service.name"
          )?.value?.stringValue
        : "") || record.serviceName || service
    );
    if (typeof record.name === "string") spans.push({name: record.name, service: nextService, parentService: String(record.parentService || "client")});
    Object.values(record).forEach((child) => visit(child, nextService));
  };
  visit(input);
  return spans;
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

function id(value: string) {
  return value.replace(/[^\w]/g, "_") || "node";
}

function label(value: string) {
  return value.replace(/"/g, "'").replace(/\n/g, " ").slice(0, 90);
}
