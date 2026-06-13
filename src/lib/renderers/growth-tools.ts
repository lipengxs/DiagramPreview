import yaml from "js-yaml";
import {renderMermaid} from "./mermaid";

export async function renderCronExpression(source: string) {
  const expression = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));
  if (!expression) throw new Error("Add a cron expression such as 0 9 * * 1-5.");
  const parts = expression.split(/\s+/);
  if (parts.length < 5 || parts.length > 6) throw new Error("Use a 5-field or 6-field cron expression.");

  const labels = parts.length === 6 ? ["second", "minute", "hour", "day of month", "month", "day of week"] : ["minute", "hour", "day of month", "month", "day of week"];
  const lines = ["flowchart LR", `  cron["${label(expression)}"]`];
  parts.forEach((part, index) => {
    const nodeId = `field_${index}`;
    lines.push(`  cron --> ${nodeId}["${label(labels[index])}\\n${label(part)}\\n${label(explainCronPart(part))}"]`);
  });
  lines.push('  field_0 --> note["Check timezone, scheduler dialect, and seconds support before production use"]');
  return renderMermaid(lines.join("\n"));
}

export async function renderJwtDecoderDiagram(source: string) {
  const token = source.trim().split(/\s+/).find((part) => part.split(".").length === 3);
  if (!token) throw new Error("Paste a JWT with header.payload.signature.");
  const [headerPart, payloadPart, signaturePart] = token.split(".");
  const header = decodeJwtPart(headerPart);
  const payload = decodeJwtPart(payloadPart);
  const claims = Object.entries(payload).slice(0, 14);
  const lines = [
    "flowchart LR",
    '  jwt["JWT token"] --> header["Header"]',
    '  jwt --> payload["Payload"]',
    '  jwt --> signature["Signature"]',
    `  header --> alg["alg: ${label(String(header.alg || "unknown"))}"]`,
    `  header --> typ["typ: ${label(String(header.typ || "JWT"))}"]`,
    `  signature --> sig["${label(signaturePart.slice(0, 24))}..."]`
  ];
  claims.forEach(([key, value], index) => {
    lines.push(`  payload --> claim_${index}["${label(key)}: ${label(formatClaim(value))}"]`);
  });
  if (!claims.length) lines.push('  payload --> empty["No payload claims found"]');
  return renderMermaid(lines.join("\n"));
}

export async function renderApiErrorFlow(source: string) {
  const rows = parseErrorRows(source);
  if (!rows.length) throw new Error("Add error rows like 401 | Missing token | Return login required.");
  const lines = ["flowchart TD", '  request["Client request"] --> validate["Validate request"]'];
  rows.slice(0, 20).forEach((row, index) => {
    const decision = `check_${index}`;
    const error = `error_${index}`;
    const action = `action_${index}`;
    lines.push(`  validate --> ${decision}{"${label(row.condition)}"}`);
    lines.push(`  ${decision} -->|yes| ${error}["${label(row.status)} ${label(row.name)}"]`);
    lines.push(`  ${error} --> ${action}["${label(row.action)}"]`);
  });
  lines.push('  validate -->|ok| success["Return successful response"]');
  return renderMermaid(lines.join("\n"));
}

export async function renderKubernetesServiceTopology(source: string) {
  const docs = yaml.loadAll(source).filter(Boolean) as Array<Record<string, unknown>>;
  const resources = docs.map((doc, index) => {
    const metadata = objectOf(doc.metadata);
    return {
      id: id(`${String(doc.kind || "Resource")}_${String(metadata.name || index)}`),
      kind: String(doc.kind || "Resource"),
      name: String(metadata.name || `resource-${index + 1}`),
      spec: objectOf(doc.spec),
      labels: objectOf(metadata.labels)
    };
  });
  if (!resources.length) throw new Error("Paste Kubernetes Service, Deployment, Ingress, or Pod YAML.");

  const lines = ["flowchart LR"];
  resources.forEach((resource) => lines.push(`  ${resource.id}["${label(resource.kind)}\\n${label(resource.name)}"]`));
  for (const ingress of resources.filter((resource) => resource.kind.toLowerCase() === "ingress")) {
    const rules = Array.isArray(ingress.spec.rules) ? ingress.spec.rules : [];
    for (const rule of rules) {
      const rawPaths = objectOf(objectOf(rule).http).paths;
      const paths = Array.isArray(rawPaths) ? rawPaths : [];
      for (const path of paths) {
        const serviceName = String(objectOf(objectOf(path).backend).service ? objectOf(objectOf(objectOf(path).backend).service).name : "");
        connectByName(lines, ingress, resources, serviceName);
      }
    }
  }
  for (const service of resources.filter((resource) => resource.kind.toLowerCase() === "service")) {
    const selector = objectOf(service.spec.selector);
    for (const target of resources.filter((resource) => ["deployment", "statefulset", "daemonset", "pod"].includes(resource.kind.toLowerCase()))) {
      const templateLabels = objectOf(objectOf(objectOf(target.spec.template).metadata).labels);
      if (matchesSelector(selector, {...target.labels, ...templateLabels})) lines.push(`  ${service.id} --> ${target.id}`);
    }
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderCiCdPipeline(source: string) {
  const parsed = tryLoadYaml(source);
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    if (record.jobs && typeof record.jobs === "object") return renderGithubLikePipeline(record.jobs as Record<string, unknown>);
    const stages = Array.isArray(record.stages) ? record.stages.map(String) : [];
    const jobs = Object.entries(record).filter(([, value]) => value && typeof value === "object" && objectOf(value).script);
    if (stages.length || jobs.length) return renderGitlabPipeline(stages, jobs);
  }
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24);
  if (!rows.length) throw new Error("Paste GitHub Actions YAML, GitLab CI YAML, or one pipeline step per line.");
  const lines = ["flowchart LR"];
  rows.forEach((row, index) => {
    lines.push(`  step_${index}["${label(row.replace(/^(?:-|\d+\.)\s*/, ""))}"]`);
    if (index > 0) lines.push(`  step_${index - 1} --> step_${index}`);
  });
  return renderMermaid(lines.join("\n"));
}

async function renderGithubLikePipeline(jobs: Record<string, unknown>) {
  const lines = ["flowchart LR"];
  for (const [jobName, jobValue] of Object.entries(jobs)) {
    const job = objectOf(jobValue);
    lines.push(`  ${id(jobName)}["${label(jobName)}"]`);
    for (const need of normalizeList(job.needs)) lines.push(`  ${id(need)} --> ${id(jobName)}`);
    const steps = Array.isArray(job.steps) ? job.steps : [];
    steps.slice(0, 4).forEach((step, index) => {
      const stepId = `${id(jobName)}_${index}`;
      const stepName = String(objectOf(step).name || objectOf(step).uses || objectOf(step).run || `step ${index + 1}`);
      lines.push(`  ${id(jobName)} --> ${stepId}["${label(stepName)}"]`);
    });
  }
  return renderMermaid(lines.join("\n"));
}

async function renderGitlabPipeline(stages: string[], jobs: Array<[string, unknown]>) {
  const lines = ["flowchart LR"];
  const stageOrder = stages.length ? stages : Array.from(new Set(jobs.map(([, job]) => String(objectOf(job).stage || "test"))));
  stageOrder.forEach((stage, index) => {
    lines.push(`  stage_${index}["${label(stage)}"]`);
    if (index > 0) lines.push(`  stage_${index - 1} --> stage_${index}`);
  });
  jobs.slice(0, 20).forEach(([jobName, job]) => {
    const stageIndex = Math.max(0, stageOrder.indexOf(String(objectOf(job).stage || stageOrder[0])));
    lines.push(`  stage_${stageIndex} --> ${id(jobName)}["${label(jobName)}"]`);
  });
  return renderMermaid(lines.join("\n"));
}

function parseErrorRows(source: string) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length >= 3) return {status: parts[0], condition: parts[1], action: parts.slice(2).join(" | "), name: statusName(parts[0])};
      const match = line.match(/^(\d{3})\s+(.+?)\s+->\s+(.+)$/);
      return match ? {status: match[1], condition: match[2], action: match[3], name: statusName(match[1])} : null;
    })
    .filter((row): row is {status: string; condition: string; action: string; name: string} => Boolean(row));
}

function decodeJwtPart(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

function explainCronPart(value: string) {
  if (value === "*") return "every value";
  if (value.includes("/")) return `step ${value.split("/")[1]}`;
  if (value.includes(",")) return "specific list";
  if (value.includes("-")) return "range";
  return "fixed value";
}

function formatClaim(value: unknown) {
  if (typeof value === "number" && value > 1000000000) return new Date(value * 1000).toISOString();
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function tryLoadYaml(source: string) {
  try {
    return yaml.load(source);
  } catch {
    return null;
  }
}

function connectByName(lines: string[], source: {id: string}, resources: Array<{id: string; name: string}>, targetName: string) {
  const target = resources.find((resource) => resource.name === targetName);
  if (target) lines.push(`  ${source.id} --> ${target.id}`);
}

function matchesSelector(selector: Record<string, unknown>, labels: Record<string, unknown>) {
  const entries = Object.entries(selector);
  return entries.length > 0 && entries.every(([key, value]) => labels[key] === value);
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

function objectOf(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function statusName(value: string) {
  const names: Record<string, string> = {
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "409": "Conflict",
    "422": "Validation Error",
    "429": "Rate Limited",
    "500": "Server Error",
    "503": "Unavailable"
  };
  return names[value] || "Error";
}

function id(value: string) {
  return value.replace(/[^\w]/g, "_") || "node";
}

function label(value: string) {
  return value.replace(/"/g, "'").replace(/\n/g, " ").slice(0, 100);
}
