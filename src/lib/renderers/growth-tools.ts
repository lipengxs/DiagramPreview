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

export async function renderPostmanCollectionSequence(source: string) {
  const collection = JSON.parse(source) as Record<string, unknown>;
  const items = flattenPostmanItems(Array.isArray(collection.item) ? collection.item : []);
  if (!items.length) throw new Error("Paste a Postman collection JSON with item requests.");
  const lines = ["sequenceDiagram", "  autonumber", "  participant Client"];
  const hosts = Array.from(new Set(items.map((item) => item.host)));
  hosts.forEach((host) => lines.push(`  participant ${id(host)} as ${label(host)}`));
  items.slice(0, 30).forEach((item) => {
    lines.push(`  Client->>${id(item.host)}: ${label(item.method)} ${label(item.path)}`);
    lines.push(`  ${id(item.host)}-->>Client: ${label(item.name)}`);
  });
  return renderMermaid(lines.join("\n"));
}

export async function renderHarSequence(source: string) {
  const har = JSON.parse(source) as {log?: {entries?: unknown[]}};
  const entries = Array.isArray(har.log?.entries) ? har.log.entries : [];
  if (!entries.length) throw new Error("Paste a HAR JSON file with log.entries.");
  const rows = entries
    .map((entry) => {
      const record = objectOf(entry);
      const request = objectOf(record.request);
      const response = objectOf(record.response);
      const url = String(request.url || "");
      try {
        const parsed = new URL(url);
        return {
          host: parsed.host,
          path: `${parsed.pathname}${parsed.search}`,
          method: String(request.method || "GET"),
          status: String(response.status || ""),
          time: String(Math.round(Number(record.time || 0)))
        };
      } catch {
        return null;
      }
    })
    .filter((row): row is {host: string; path: string; method: string; status: string; time: string} => Boolean(row));
  if (!rows.length) throw new Error("HAR entries must include request.url values.");
  const lines = ["sequenceDiagram", "  autonumber", "  participant Browser"];
  Array.from(new Set(rows.map((row) => row.host))).forEach((host) => lines.push(`  participant ${id(host)} as ${label(host)}`));
  rows.slice(0, 40).forEach((row) => {
    lines.push(`  Browser->>${id(row.host)}: ${label(row.method)} ${label(row.path)}`);
    lines.push(`  ${id(row.host)}-->>Browser: ${label(row.status)} ${label(row.time)}ms`);
  });
  return renderMermaid(lines.join("\n"));
}

export function renderHarTimeline(source: string) {
  const har = JSON.parse(source) as {log?: {entries?: unknown[]}};
  const entries = Array.isArray(har.log?.entries) ? har.log.entries : [];
  if (!entries.length) throw new Error("Paste a HAR JSON file with log.entries.");

  const rows = entries
    .map((entry, index) => {
      const record = objectOf(entry);
      const request = objectOf(record.request);
      const response = objectOf(record.response);
      const timings = objectOf(record.timings);
      const url = String(request.url || "");
      try {
        const parsed = new URL(url);
        return {
          index: index + 1,
          method: String(request.method || "GET"),
          status: Number(response.status || 0),
          host: parsed.host,
          path: `${parsed.pathname}${parsed.search}`,
          time: Math.max(0, Math.round(Number(record.time || 0))),
          wait: Math.max(0, Math.round(Number(timings.wait || 0))),
          receive: Math.max(0, Math.round(Number(timings.receive || 0))),
          mime: String(objectOf(response.content).mimeType || "unknown")
        };
      } catch {
        return null;
      }
    })
    .filter((row): row is {index: number; method: string; status: number; host: string; path: string; time: number; wait: number; receive: number; mime: string} => Boolean(row));
  if (!rows.length) throw new Error("HAR entries must include request.url values.");

  const total = rows.reduce((sum, row) => sum + row.time, 0);
  const max = Math.max(...rows.map((row) => row.time), 1);
  const failed = rows.filter((row) => row.status >= 400).length;
  const slowest = [...rows].sort((a, b) => b.time - a.time).slice(0, 5);
  const hosts = Array.from(new Set(rows.map((row) => row.host)));

  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("Requests", String(rows.length))}
        ${metricCard("Total time", `${total}ms`)}
        ${metricCard("Failed", String(failed))}
        ${metricCard("Hosts", String(hosts.length))}
      </div>
      <h2>Waterfall timeline</h2>
      <div class="dp-stack">
        ${rows
          .slice(0, 60)
          .map((row) => {
            const width = Math.max(4, Math.round((row.time / max) * 100));
            return `
              <div class="dp-row">
                <div class="dp-row-main">
                  <strong>${escapeHtml(row.method)} ${escapeHtml(row.path)}</strong>
                  <span>${escapeHtml(row.host)} · ${escapeHtml(row.mime)}</span>
                </div>
                <span class="dp-pill ${row.status >= 400 ? "danger" : row.status >= 300 ? "warn" : ""}">${row.status || "?"}</span>
                <div class="dp-bar"><span style="width:${width}%"></span></div>
                <code>${row.time}ms</code>
              </div>
            `;
          })
          .join("")}
      </div>
      <h2>Slowest requests</h2>
      <table class="dp-table">
        <thead><tr><th>#</th><th>Request</th><th>Status</th><th>Time</th><th>Wait</th></tr></thead>
        <tbody>
          ${slowest
            .map(
              (row) => `
                <tr>
                  <td>${row.index}</td>
                  <td><strong>${escapeHtml(row.method)}</strong> ${escapeHtml(row.host)}${escapeHtml(row.path)}</td>
                  <td>${row.status || "?"}</td>
                  <td>${row.time}ms</td>
                  <td>${row.wait}ms</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

export function renderSvgPreview(source: string) {
  const svg = sanitizeSvg(decodeSvgSource(source));
  if (!svg.includes("<svg")) throw new Error("Paste raw SVG markup or a data:image/svg+xml URL.");
  return {
    svg,
    html: previewHtml(`
      <div class="dp-preview">
        <div class="dp-canvas">${svg}</div>
        <h2>Sanitized SVG code</h2>
        <pre class="dp-code">${escapeHtml(svg)}</pre>
      </div>
    `)
  };
}

export function renderOpenGraphPreview(source: string) {
  const meta = parseOpenGraphSource(source);
  const title = meta["og:title"] || meta["twitter:title"] || meta.title || "Untitled page";
  const description = meta["og:description"] || meta["twitter:description"] || meta.description || "No description found.";
  const image = meta["og:image"] || meta["twitter:image"] || "";
  const url = meta["og:url"] || meta.url || "https://example.com/page";
  const site = meta["og:site_name"] || new URL(url.startsWith("http") ? url : "https://example.com").host;

  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-social-card">
        ${
          image
            ? `<img src="${escapeAttribute(image)}" alt="" class="dp-social-image" />`
            : `<div class="dp-social-placeholder">OG image</div>`
        }
        <div class="dp-social-body">
          <span>${escapeHtml(site)}</span>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(description)}</p>
          <code>${escapeHtml(url)}</code>
        </div>
      </div>
      <h2>Detected tags</h2>
      <table class="dp-table">
        <tbody>
          ${Object.entries(meta)
            .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

export function renderJsonSchemaFormPreview(source: string) {
  const schema = JSON.parse(source) as Record<string, unknown>;
  const properties = objectOf(schema.properties);
  const required = new Set(Array.isArray(schema.required) ? schema.required.map(String) : []);
  if (!Object.keys(properties).length) throw new Error("Paste a JSON Schema object with properties.");

  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-form">
        <h2>${escapeHtml(String(schema.title || "Generated form preview"))}</h2>
        <p>${escapeHtml(String(schema.description || "A local form preview generated from JSON Schema properties."))}</p>
        ${Object.entries(properties)
          .slice(0, 40)
          .map(([name, value]) => renderSchemaField(name, objectOf(value), required.has(name)))
          .join("")}
      </div>
    </div>
  `);
}

export function renderJsonPathTester(source: string) {
  const {expression, jsonText} = splitJsonPathSource(source);
  const data = JSON.parse(jsonText);
  const matches = evaluateJsonPath(data, expression);
  return previewHtml(`
    <div class="dp-preview">
      ${metricCard("Expression", escapeHtml(expression))}
      ${metricCard("Matches", String(matches.length))}
      <h2>Matched values</h2>
      <pre class="dp-code">${escapeHtml(JSON.stringify(matches, null, 2))}</pre>
    </div>
  `);
}

export function renderNginxLocationTester(source: string) {
  const {uri, config} = splitNginxTesterSource(source);
  const locations = parseNginxLocations(config);
  if (!locations.length) throw new Error("Paste Nginx config with location blocks and add URI: /path at the top.");
  const match = selectNginxLocation(uri, locations);

  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-result">
        <span>Matched location</span>
        <h2>${match ? escapeHtml(`${match.modifier} ${match.pattern}`.trim()) : "No match"}</h2>
        <p>${escapeHtml(match?.reason || "No location block matched the URI.")}</p>
      </div>
      <h2>Location candidates for ${escapeHtml(uri)}</h2>
      <table class="dp-table">
        <thead><tr><th>Modifier</th><th>Pattern</th><th>Match</th><th>Precedence note</th></tr></thead>
        <tbody>
          ${locations
            .map((location) => {
              const candidate = nginxLocationMatches(uri, location);
              return `<tr>
                <td>${escapeHtml(location.modifier || "prefix")}</td>
                <td><code>${escapeHtml(location.pattern)}</code></td>
                <td>${candidate ? "yes" : "no"}</td>
                <td>${escapeHtml(locationNote(location))}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `);
}

export function renderJqFilterTester(source: string) {
  const {expression, jsonText} = splitExpressionSource(source, ".");
  const data = JSON.parse(jsonText);
  const matches = evaluateJqLikeFilter(data, expression);
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("Filter", `<code>${escapeHtml(expression)}</code>`)}
        ${metricCard("Result type", escapeHtml(Array.isArray(matches) ? "array" : typeof matches))}
      </div>
      <h2>Filtered result</h2>
      <pre class="dp-code">${escapeHtml(JSON.stringify(matches, null, 2))}</pre>
      <p class="dp-note">This preview supports common jq-style filters such as <code>.</code>, <code>.users[].email</code>, <code>.orders[0].total</code>, <code>keys</code>, <code>length</code>, and <code>map(.field)</code>.</p>
    </div>
  `);
}

export function renderXPathTester(source: string) {
  const {expression, documentText} = splitMarkupExpressionSource(source, "//item/title");
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentText, documentText.trim().startsWith("<!doctype html") || documentText.includes("<html") ? "text/html" : "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error(parseError.textContent || "Invalid XML/HTML input.");
  const result = doc.evaluate(expression, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const matches = Array.from({length: result.snapshotLength}, (_, index) => formatXPathNode(result.snapshotItem(index)));
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("XPath", `<code>${escapeHtml(expression)}</code>`)}
        ${metricCard("Matches", String(matches.length))}
      </div>
      <h2>Matched nodes</h2>
      <table class="dp-table">
        <thead><tr><th>#</th><th>Node</th></tr></thead>
        <tbody>
          ${matches.map((value, index) => `<tr><td>${index + 1}</td><td><code>${escapeHtml(value)}</code></td></tr>`).join("") || `<tr><td colspan="2">No nodes matched.</td></tr>`}
        </tbody>
      </table>
    </div>
  `);
}

export function renderYamlPathTester(source: string) {
  const {expression, documentText} = splitMarkupExpressionSource(source, "spec.template.spec.containers[0].image");
  const data = yaml.load(documentText);
  const matches = evaluatePathExpression(data, expression);
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("YAML path", `<code>${escapeHtml(expression)}</code>`)}
        ${metricCard("Matches", String(matches.length))}
      </div>
      <h2>Matched values</h2>
      <pre class="dp-code">${escapeHtml(JSON.stringify(matches, null, 2))}</pre>
    </div>
  `);
}

export function renderTomlVisualizer(source: string) {
  const rows = parseTomlRows(source);
  if (!rows.length) throw new Error("Paste TOML with sections or key-value pairs.");
  const sections = Array.from(new Set(rows.map((row) => row.section)));
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("Sections", String(sections.length))}
        ${metricCard("Keys", String(rows.length))}
      </div>
      <h2>TOML structure</h2>
      <table class="dp-table">
        <thead><tr><th>Section</th><th>Key</th><th>Value</th></tr></thead>
        <tbody>
          ${rows.map((row) => `<tr><td>${escapeHtml(row.section)}</td><td><code>${escapeHtml(row.key)}</code></td><td><code>${escapeHtml(row.value)}</code></td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `);
}

export function renderEnvDiffChecker(source: string) {
  const {left, right} = splitEnvDiffSource(source);
  const env = parseEnvLines(left);
  const example = parseEnvLines(right);
  const envKeys = new Set(env.map((item) => item.key));
  const exampleKeys = new Set(example.map((item) => item.key));
  const missingInEnv = example.filter((item) => !envKeys.has(item.key));
  const missingInExample = env.filter((item) => !exampleKeys.has(item.key));
  const emptyValues = env.filter((item) => !item.value);
  const duplicates = findDuplicateKeys([...env, ...example]);
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("Missing in .env", String(missingInEnv.length))}
        ${metricCard("Missing in example", String(missingInExample.length))}
        ${metricCard("Empty values", String(emptyValues.length))}
        ${metricCard("Duplicates", String(duplicates.length))}
      </div>
      ${envIssueTable("Missing in .env", missingInEnv)}
      ${envIssueTable("Missing in .env.example", missingInExample)}
      ${envIssueTable("Empty runtime values", emptyValues)}
      ${envIssueTable("Duplicate keys", duplicates.map((key) => ({key, value: "duplicate"})))}
    </div>
  `);
}

export function renderRobotsTxtTester(source: string) {
  const {url, robots} = splitUrlSource(source, "https://example.com/blog/post");
  const rules = parseRobotsTxt(robots);
  const decision = testRobotsUrl(url, rules);
  const sitemaps = robots
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*Sitemap\s*:\s*(.+)$/i)?.[1]?.trim())
    .filter((value): value is string => Boolean(value));
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-result ${decision.allowed ? "" : "danger"}">
        <span>Robots result</span>
        <h2>${decision.allowed ? "Allowed" : "Disallowed"}</h2>
        <p>${escapeHtml(decision.reason)}</p>
      </div>
      <div class="dp-grid">
        ${metricCard("Rule groups", String(rules.length))}
        ${metricCard("Sitemaps", String(sitemaps.length))}
      </div>
      <h2>Parsed rules</h2>
      <table class="dp-table">
        <thead><tr><th>User-agent</th><th>Directive</th><th>Path</th></tr></thead>
        <tbody>${rules.flatMap((group) => group.rules.map((rule) => `<tr><td>${escapeHtml(group.agent)}</td><td>${escapeHtml(rule.type)}</td><td><code>${escapeHtml(rule.path)}</code></td></tr>`)).join("")}</tbody>
      </table>
    </div>
  `);
}

export function renderSitemapXmlViewer(source: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error(parseError.textContent || "Invalid sitemap XML.");
  const urls = Array.from(doc.querySelectorAll("url"));
  const indexes = Array.from(doc.querySelectorAll("sitemap"));
  const entries = urls.map((node) => ({
    loc: node.querySelector("loc")?.textContent?.trim() || "",
    lastmod: node.querySelector("lastmod")?.textContent?.trim() || "",
    alternates: node.querySelectorAll("link[rel='alternate']").length
  }));
  const duplicateCount = entries.length - new Set(entries.map((entry) => entry.loc)).size;
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("URLs", String(entries.length))}
        ${metricCard("Sitemap indexes", String(indexes.length))}
        ${metricCard("Duplicate URLs", String(Math.max(0, duplicateCount)))}
        ${metricCard("Alternates", String(entries.reduce((sum, entry) => sum + entry.alternates, 0)))}
      </div>
      <h2>URL preview</h2>
      <table class="dp-table">
        <thead><tr><th>URL</th><th>Last modified</th><th>Alternates</th></tr></thead>
        <tbody>
          ${entries.slice(0, 80).map((entry) => `<tr><td><code>${escapeHtml(entry.loc)}</code></td><td>${escapeHtml(entry.lastmod || "-")}</td><td>${entry.alternates}</td></tr>`).join("") || `<tr><td colspan="3">No url entries found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `);
}

export function renderHttpHeaderParser(source: string) {
  const parsed = parseHttpHeaders(source);
  const checks = analyzeHttpHeaders(parsed.headers);
  return previewHtml(`
    <div class="dp-preview">
      <div class="dp-grid">
        ${metricCard("Status", escapeHtml(parsed.status || "headers only"))}
        ${metricCard("Headers", String(Object.keys(parsed.headers).length))}
        ${metricCard("Warnings", String(checks.filter((check) => check.level === "warn").length))}
      </div>
      <h2>Header checks</h2>
      <table class="dp-table">
        <thead><tr><th>Check</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>${checks.map((check) => `<tr><td>${escapeHtml(check.name)}</td><td><span class="dp-pill ${check.level === "warn" ? "warn" : ""}">${escapeHtml(check.level)}</span></td><td>${escapeHtml(check.note)}</td></tr>`).join("")}</tbody>
      </table>
      <h2>Parsed headers</h2>
      <table class="dp-table">
        <tbody>${Object.entries(parsed.headers).map(([key, value]) => `<tr><td><code>${escapeHtml(key)}</code></td><td>${escapeHtml(value)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `);
}

export async function renderTypeScriptInterface(source: string) {
  const blocks = parseTypeScriptBlocks(source);
  if (!blocks.length) throw new Error("Paste TypeScript interface or type definitions.");
  const lines = ["flowchart LR"];
  blocks.slice(0, 12).forEach((block) => {
    lines.push(`  ${id(block.name)}["${label(block.kind)}\\n${label(block.name)}"]`);
    block.fields.slice(0, 18).forEach((field, index) => {
      const fieldId = `${id(block.name)}_${index}`;
      lines.push(`  ${id(block.name)} --> ${fieldId}["${label(field.name)}\\n${label(field.type)}"]`);
      const target = blocks.find((candidate) => field.type.includes(candidate.name) && candidate.name !== block.name);
      if (target) lines.push(`  ${fieldId} -.-> ${id(target.name)}`);
    });
  });
  return renderMermaid(lines.join("\n"));
}

export async function renderZodSchema(source: string) {
  const schemas = Array.from(source.matchAll(/(?:export\s+const|const)\s+(\w+)\s*=\s*z\.object\(\s*\{([\s\S]*?)\}\s*\)/g)).map((match) => ({
    name: match[1],
    body: match[2]
  }));
  if (!schemas.length) throw new Error("Paste Zod object schemas such as const UserSchema = z.object({...}).");
  const lines = ["flowchart LR"];
  schemas.slice(0, 12).forEach((schema) => {
    lines.push(`  ${id(schema.name)}["Zod schema\\n${label(schema.name)}"]`);
    parseZodFields(schema.body).slice(0, 18).forEach((field, index) => {
      const fieldId = `${id(schema.name)}_${index}`;
      lines.push(`  ${id(schema.name)} --> ${fieldId}["${label(field.name)}\\n${label(field.validator)}"]`);
    });
  });
  return renderMermaid(lines.join("\n"));
}

export async function renderCloudFormationTemplate(source: string) {
  const parsed = tryLoadYaml(normalizeCloudFormationYaml(source));
  const template = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : JSON.parse(source);
  const resources = objectOf(template.Resources);
  const entries = Object.entries(resources).map(([name, value]) => ({
    name,
    type: String(objectOf(value).Type || "AWS::Resource"),
    props: objectOf(objectOf(value).Properties)
  }));
  if (!entries.length) throw new Error("Paste a CloudFormation template with Resources.");
  const lines = ["flowchart LR"];
  entries.slice(0, 40).forEach((resource) => lines.push(`  ${id(resource.name)}["${label(resource.type)}\\n${label(resource.name)}"]`));
  for (const sourceResource of entries) {
    const serialized = JSON.stringify(sourceResource.props);
    for (const target of entries) {
      if (sourceResource.name !== target.name && serialized.includes(target.name)) {
        lines.push(`  ${id(sourceResource.name)} --> ${id(target.name)}`);
      }
    }
  }
  return renderMermaid(lines.join("\n"));
}

export async function renderC4Model(source: string) {
  const elements = new Map<string, {kind: string; label: string}>();
  const relations: Array<{from: string; to: string; label: string}> = [];
  source.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return;
    const rel = trimmed.match(/^Rel\(([^,]+),\s*([^,]+),\s*"?([^)"]+)"?\)/i) || trimmed.match(/^(\w+)\s*(?:->|=>)\s*(\w+)\s*:?\s*(.*)$/);
    if (rel) {
      relations.push({from: cleanToken(rel[1]), to: cleanToken(rel[2]), label: cleanToken(rel[3] || "uses")});
      return;
    }
    const element = trimmed.match(/^(Person|System|Container|Component|Database|Queue)\(([^,]+),\s*"?([^,")]+)"?/i);
    if (element) {
      elements.set(cleanToken(element[2]), {kind: element[1], label: cleanToken(element[3])});
    }
  });
  if (!elements.size && !relations.length) throw new Error("Add C4 lines such as Person(user, \"User\"), System(api, \"API\"), Rel(user, api, \"Uses\").");
  relations.forEach((relation) => {
    if (!elements.has(relation.from)) elements.set(relation.from, {kind: "System", label: relation.from});
    if (!elements.has(relation.to)) elements.set(relation.to, {kind: "System", label: relation.to});
  });
  const lines = ["flowchart LR"];
  for (const [key, element] of elements) lines.push(`  ${id(key)}["${label(element.kind)}\\n${label(element.label)}"]`);
  relations.forEach((relation) => lines.push(`  ${id(relation.from)} -->|${label(relation.label)}| ${id(relation.to)}`));
  return renderMermaid(lines.join("\n"));
}

function previewHtml(body: string) {
  return `
    <style>
      .dp-preview{display:grid;gap:18px;color:#0f172a}
      .dp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
      .dp-card,.dp-result{border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:14px}
      .dp-result.danger{border-color:#fecaca;background:#fff1f2}
      .dp-card span,.dp-result span,.dp-row-main span,.dp-social-body span{display:block;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
      .dp-card strong{display:block;margin-top:5px;font-size:22px}
      .dp-stack{display:grid;gap:10px}
      .dp-row{display:grid;grid-template-columns:minmax(220px,1fr) auto minmax(120px,220px) auto;gap:10px;align-items:center;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:10px}
      .dp-row-main strong{display:block;font-size:13px;overflow-wrap:anywhere}
      .dp-pill{border-radius:6px;background:#dcfce7;color:#166534;padding:4px 8px;font-size:12px;font-weight:700}
      .dp-pill.warn{background:#fef3c7;color:#92400e}
      .dp-pill.danger{background:#fee2e2;color:#991b1b}
      .dp-bar{height:10px;border-radius:999px;background:#e2e8f0;overflow:hidden}
      .dp-bar span{display:block;height:100%;border-radius:999px;background:#2563eb}
      .dp-table{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff;font-size:13px}
      .dp-table th,.dp-table td{border-bottom:1px solid #e2e8f0;padding:10px;text-align:left;vertical-align:top}
      .dp-table th{background:#f8fafc;color:#475569;font-size:12px}
      .dp-canvas{display:flex;min-height:260px;align-items:center;justify-content:center;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:20px}
      .dp-canvas svg{max-width:100%;max-height:480px}
      .dp-code{overflow:auto;border-radius:8px;background:#0f172a;color:#e2e8f0;padding:14px;font-size:12px;line-height:1.6}
      .dp-social-card{overflow:hidden;border:1px solid #cbd5e1;border-radius:8px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.08)}
      .dp-social-image{display:block;width:100%;aspect-ratio:1.91/1;object-fit:cover;background:#e2e8f0}
      .dp-social-placeholder{display:grid;aspect-ratio:1.91/1;place-items:center;background:linear-gradient(135deg,#dbeafe,#f8fafc);color:#2563eb;font-weight:800}
      .dp-social-body{padding:18px}
      .dp-social-body h2{margin:8px 0;color:#0f172a}
      .dp-social-body p{margin:0 0 12px;color:#475569}
      .dp-form{border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:18px}
      .dp-field{display:grid;gap:7px;margin-top:14px}
      .dp-field label{font-weight:700}
      .dp-field small{color:#64748b}
      .dp-field input,.dp-field textarea,.dp-field select{width:100%;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;padding:10px;color:#334155}
      .dp-required{margin-left:6px;color:#dc2626}
      .dp-note{border:1px solid #dbeafe;border-radius:8px;background:#eff6ff;padding:12px;color:#1e3a8a}
      @media (max-width:720px){.dp-row{grid-template-columns:1fr}.dp-bar{width:100%}}
    </style>
    ${body}
  `;
}

function metricCard(labelText: string, value: string) {
  return `<div class="dp-card"><span>${escapeHtml(labelText)}</span><strong>${value}</strong></div>`;
}

function decodeSvgSource(source: string) {
  const trimmed = source.trim();
  if (trimmed.startsWith("data:image/svg+xml;base64,")) {
    return atob(trimmed.replace("data:image/svg+xml;base64,", ""));
  }
  if (trimmed.startsWith("data:image/svg+xml,")) {
    return decodeURIComponent(trimmed.replace("data:image/svg+xml,", ""));
  }
  return trimmed;
}

function sanitizeSvg(source: string) {
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function parseOpenGraphSource(source: string) {
  const meta: Record<string, string> = {};
  for (const match of source.matchAll(/<meta\s+[^>]*(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi)) {
    meta[match[1]] = decodeHtmlEntities(match[2]);
  }
  for (const match of source.matchAll(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']([^"']+)["'][^>]*>/gi)) {
    meta[match[2]] = decodeHtmlEntities(match[1]);
  }
  const title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) meta.title = decodeHtmlEntities(title[1].trim());
  source.split(/\r?\n/).forEach((line) => {
    const pair = line.match(/^\s*([\w:.-]+)\s*[:=]\s*(.+)\s*$/);
    if (pair) meta[pair[1]] = pair[2].trim();
  });
  return meta;
}

function renderSchemaField(name: string, schema: Record<string, unknown>, required: boolean) {
  const type = String(schema.type || inferSchemaType(schema));
  const description = String(schema.description || `${type} field`);
  const enumValues = Array.isArray(schema.enum) ? schema.enum.map(String) : [];
  const input =
    enumValues.length > 0
      ? `<select disabled>${enumValues.map((value) => `<option>${escapeHtml(value)}</option>`).join("")}</select>`
      : type === "boolean"
        ? `<input disabled type="checkbox" />`
        : type === "integer" || type === "number"
          ? `<input disabled type="number" placeholder="${escapeAttribute(String(schema.default ?? 0))}" />`
          : type === "array" || type === "object"
            ? `<textarea disabled rows="3" placeholder="${escapeAttribute(type === "array" ? "[]" : "{}")}"></textarea>`
            : `<input disabled type="${String(schema.format) === "email" ? "email" : "text"}" placeholder="${escapeAttribute(String(schema.example || schema.format || name))}" />`;
  return `
    <div class="dp-field">
      <label>${escapeHtml(name)}${required ? `<span class="dp-required">*</span>` : ""}</label>
      ${input}
      <small>${escapeHtml(description)}</small>
    </div>
  `;
}

function inferSchemaType(schema: Record<string, unknown>) {
  if (schema.properties) return "object";
  if (schema.items) return "array";
  if (schema.enum) return "string";
  return "string";
}

function splitJsonPathSource(source: string) {
  const parts = source.split(/\n---+\n/);
  if (parts.length >= 2) return {expression: parts[0].trim(), jsonText: parts.slice(1).join("\n---\n").trim()};
  const lines = source.trim().split(/\r?\n/);
  const expression = lines.shift()?.trim() || "$";
  return {expression, jsonText: lines.join("\n").trim()};
}

function evaluateJsonPath(data: unknown, expression: string) {
  const trimmed = expression.trim();
  if (!trimmed.startsWith("$")) throw new Error("JSONPath must start with $.");
  const recursive = trimmed.match(/^\$\.\.([A-Za-z_$][\w$-]*)$/);
  if (recursive) {
    const matches: unknown[] = [];
    collectRecursiveValues(data, recursive[1], matches);
    return matches;
  }
  let current: unknown[] = [data];
  const pattern = /\.([A-Za-z_$][\w$-]*)|\[['"]([^'"]+)['"]\]|\[(\d+|\*)\]/g;
  for (const match of trimmed.slice(1).matchAll(pattern)) {
    const prop = match[1] || match[2];
    const index = match[3];
    if (prop) current = current.flatMap((item) => (item && typeof item === "object" && prop in item ? [(item as Record<string, unknown>)[prop]] : []));
    if (index === "*") current = current.flatMap((item) => (Array.isArray(item) ? item : []));
    if (index && index !== "*") current = current.flatMap((item) => (Array.isArray(item) ? [item[Number(index)]].filter((value) => value !== undefined) : []));
  }
  return current;
}

function collectRecursiveValues(value: unknown, key: string, matches: unknown[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRecursiveValues(item, key, matches));
    return;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (key in record) matches.push(record[key]);
    Object.values(record).forEach((child) => collectRecursiveValues(child, key, matches));
  }
}

function splitNginxTesterSource(source: string) {
  const match = source.match(/^\s*URI\s*:\s*(\S+)\s*$/im);
  const uri = match?.[1] || "/";
  const config = source.replace(/^\s*URI\s*:\s*\S+\s*$/im, "").replace(/^\s*---+\s*$/m, "");
  return {uri, config};
}

function parseNginxLocations(config: string) {
  return Array.from(config.matchAll(/location\s+(?:(=|\^~|~\*|~)\s+)?([^\s{]+)\s*\{/g)).map((match, index) => ({
    modifier: match[1] || "",
    pattern: match[2],
    index
  }));
}

function selectNginxLocation(uri: string, locations: Array<{modifier: string; pattern: string; index: number}>) {
  const exact = locations.find((location) => location.modifier === "=" && location.pattern === uri);
  if (exact) return {...exact, reason: "Exact match has the highest Nginx location precedence."};
  const prefixMatches = locations
    .filter((location) => ["", "^~"].includes(location.modifier) && uri.startsWith(location.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length);
  const lockedPrefix = prefixMatches.find((location) => location.modifier === "^~");
  if (lockedPrefix) return {...lockedPrefix, reason: "^~ longest prefix match wins before regex locations are tested."};
  const regex = locations.find((location) => ["~", "~*"].includes(location.modifier) && nginxLocationMatches(uri, location));
  if (regex) return {...regex, reason: "First matching regex wins after exact and ^~ prefix checks."};
  if (prefixMatches[0]) return {...prefixMatches[0], reason: "Longest plain prefix match wins when no earlier exact, ^~, or regex location matched."};
  return null;
}

function nginxLocationMatches(uri: string, location: {modifier: string; pattern: string}) {
  if (location.modifier === "=") return uri === location.pattern;
  if (location.modifier === "^~" || location.modifier === "") return uri.startsWith(location.pattern);
  try {
    return new RegExp(location.pattern, location.modifier === "~*" ? "i" : "").test(uri);
  } catch {
    return false;
  }
}

function locationNote(location: {modifier: string}) {
  if (location.modifier === "=") return "exact";
  if (location.modifier === "^~") return "locked prefix";
  if (location.modifier === "~" || location.modifier === "~*") return "regex in file order";
  return "plain prefix";
}

function splitExpressionSource(source: string, fallbackExpression: string) {
  const parts = source.split(/\n---+\n/);
  if (parts.length >= 2) return {expression: parts[0].trim() || fallbackExpression, jsonText: parts.slice(1).join("\n---\n").trim()};
  const lines = source.trim().split(/\r?\n/);
  const expression = lines.shift()?.trim() || fallbackExpression;
  return {expression, jsonText: lines.join("\n").trim()};
}

function splitMarkupExpressionSource(source: string, fallbackExpression: string) {
  const parts = source.split(/\n---+\n/);
  if (parts.length >= 2) return {expression: parts[0].trim() || fallbackExpression, documentText: parts.slice(1).join("\n---\n").trim()};
  const lines = source.trim().split(/\r?\n/);
  const expression = lines.shift()?.trim() || fallbackExpression;
  return {expression, documentText: lines.join("\n").trim()};
}

function evaluateJqLikeFilter(data: unknown, expression: string): unknown {
  const trimmed = expression.trim();
  if (!trimmed || trimmed === ".") return data;
  if (trimmed === "keys") return data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data) : [];
  if (trimmed === "length") return Array.isArray(data) || typeof data === "string" ? data.length : data && typeof data === "object" ? Object.keys(data).length : 0;
  const map = trimmed.match(/^map\((\.[^)]+)\)$/);
  if (map) {
    if (!Array.isArray(data)) throw new Error("map(...) requires the input JSON to be an array.");
    return data.map((item) => evaluateJqPath(item, map[1]));
  }
  if (trimmed.startsWith(".")) return evaluateJqPath(data, trimmed);
  throw new Error("Supported filters include ., keys, length, .path[].field, and map(.field).");
}

function evaluateJqPath(data: unknown, expression: string) {
  let current: unknown[] = [data];
  const pattern = /\.([A-Za-z_$][\w$-]*)|(\[\])|\[(\d+)\]/g;
  for (const match of expression.matchAll(pattern)) {
    if (match[1]) current = current.flatMap((item) => (item && typeof item === "object" && match[1] in item ? [(item as Record<string, unknown>)[match[1]]] : []));
    if (match[2]) current = current.flatMap((item) => (Array.isArray(item) ? item : []));
    if (match[3]) current = current.flatMap((item) => (Array.isArray(item) ? [item[Number(match[3])]].filter((value) => value !== undefined) : []));
  }
  return current.length === 1 ? current[0] : current;
}

function formatXPathNode(node: Node | null) {
  if (!node) return "";
  if (node.nodeType === Node.ATTRIBUTE_NODE) return `${node.nodeName}="${node.nodeValue || ""}"`;
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || "";
  const element = node as Element;
  return element.outerHTML ? element.outerHTML.replace(/\s+/g, " ").slice(0, 300) : node.textContent?.trim() || "";
}

function evaluatePathExpression(data: unknown, expression: string) {
  let current: unknown[] = [data];
  const normalized = expression.replace(/^\$\.?/, "");
  if (!normalized) return current;
  for (const segment of normalized.split(".")) {
    const match = segment.match(/^([A-Za-z_$][\w$-]*)(?:\[(\d+|\*)\])?$/);
    if (!match) throw new Error(`Unsupported path segment: ${segment}`);
    current = current.flatMap((item) => (item && typeof item === "object" && match[1] in item ? [(item as Record<string, unknown>)[match[1]]] : []));
    if (match[2] === "*") current = current.flatMap((item) => (Array.isArray(item) ? item : []));
    if (match[2] && match[2] !== "*") current = current.flatMap((item) => (Array.isArray(item) ? [item[Number(match[2])]].filter((value) => value !== undefined) : []));
  }
  return current;
}

function parseTomlRows(source: string) {
  const rows: Array<{section: string; key: string; value: string}> = [];
  let section = "root";
  source.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const sectionMatch = trimmed.match(/^\[+([^\]]+)\]+$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      return;
    }
    const keyValue = trimmed.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (keyValue) rows.push({section, key: keyValue[1], value: keyValue[2].replace(/\s+#.*$/, "")});
  });
  return rows;
}

function splitEnvDiffSource(source: string) {
  const parts = source.split(/\n---+\n/);
  if (parts.length >= 2) return {left: parts[0], right: parts.slice(1).join("\n---\n")};
  return {left: source, right: ""};
}

function parseEnvLines(source: string) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return index >= 0 ? {key: line.slice(0, index).trim(), value: line.slice(index + 1).trim().replace(/^["']|["']$/g, "")} : null;
    })
    .filter((item): item is {key: string; value: string} => Boolean(item?.key));
}

function findDuplicateKeys(items: Array<{key: string}>) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  items.forEach((item) => {
    if (seen.has(item.key)) duplicates.add(item.key);
    seen.add(item.key);
  });
  return Array.from(duplicates);
}

function envIssueTable(title: string, rows: Array<{key: string; value: string}>) {
  return `
    <h2>${escapeHtml(title)}</h2>
    <table class="dp-table">
      <thead><tr><th>Key</th><th>Value</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td><code>${escapeHtml(row.key)}</code></td><td>${escapeHtml(row.value || "-")}</td></tr>`).join("") || `<tr><td colspan="2">No issues found.</td></tr>`}</tbody>
    </table>
  `;
}

function splitUrlSource(source: string, fallbackUrl: string) {
  const match = source.match(/^\s*URL\s*:\s*(\S+)\s*$/im);
  const url = match?.[1] || fallbackUrl;
  const robots = source.replace(/^\s*URL\s*:\s*\S+\s*$/im, "").replace(/^\s*---+\s*$/m, "").trim();
  return {url, robots};
}

function parseRobotsTxt(source: string) {
  const groups: Array<{agent: string; rules: Array<{type: string; path: string}>}> = [];
  let current: {agent: string; rules: Array<{type: string; path: string}>} | null = null;
  source.split(/\r?\n/).forEach((line) => {
    const clean = line.replace(/#.*$/, "").trim();
    if (!clean) return;
    const agent = clean.match(/^User-agent\s*:\s*(.+)$/i);
    if (agent) {
      current = {agent: agent[1].trim(), rules: []};
      groups.push(current);
      return;
    }
    const rule = clean.match(/^(Allow|Disallow)\s*:\s*(.*)$/i);
    if (rule && current) current.rules.push({type: rule[1].toLowerCase(), path: rule[2].trim() || "/"});
  });
  return groups;
}

function testRobotsUrl(rawUrl: string, groups: Array<{agent: string; rules: Array<{type: string; path: string}>}>) {
  let path = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    path = `${parsed.pathname}${parsed.search}`;
  } catch {
    path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  }
  const candidateGroups = groups.filter((group) => group.agent === "*" || /googlebot/i.test(group.agent));
  const rules = candidateGroups.flatMap((group) => group.rules).filter((rule) => rule.path && path.startsWith(rule.path.replace(/\*.*$/, "")));
  const winner = rules.sort((a, b) => b.path.length - a.path.length)[0];
  if (!winner) return {allowed: true, reason: `No Allow or Disallow rule matched ${path}.`};
  return {allowed: winner.type === "allow", reason: `${winner.type.toUpperCase()} ${winner.path} is the longest matching rule for ${path}.`};
}

function parseHttpHeaders(source: string) {
  const headers: Record<string, string> = {};
  let status = "";
  source.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^HTTP\//i.test(trimmed)) {
      status = trimmed;
      return;
    }
    const index = trimmed.indexOf(":");
    if (index > 0) headers[trimmed.slice(0, index).trim().toLowerCase()] = trimmed.slice(index + 1).trim();
  });
  if (!Object.keys(headers).length) throw new Error("Paste HTTP response headers such as Content-Type, Cache-Control, CSP, CORS, or HSTS.");
  return {status, headers};
}

function analyzeHttpHeaders(headers: Record<string, string>) {
  const has = (key: string) => Boolean(headers[key]);
  return [
    {name: "Content-Type", level: has("content-type") ? "ok" : "warn", note: has("content-type") ? headers["content-type"] : "Missing content type."},
    {name: "Cache-Control", level: has("cache-control") ? "ok" : "warn", note: has("cache-control") ? headers["cache-control"] : "No explicit cache policy."},
    {name: "Strict-Transport-Security", level: has("strict-transport-security") ? "ok" : "warn", note: has("strict-transport-security") ? "HSTS is present." : "Missing HSTS for HTTPS responses."},
    {name: "Content-Security-Policy", level: has("content-security-policy") ? "ok" : "warn", note: has("content-security-policy") ? "CSP is present." : "No CSP header detected."},
    {name: "CORS", level: has("access-control-allow-origin") ? "ok" : "warn", note: has("access-control-allow-origin") ? `Access-Control-Allow-Origin: ${headers["access-control-allow-origin"]}` : "No CORS allow-origin header."}
  ];
}

function escapeHtml(value: string) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function decodeHtmlEntities(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
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

function flattenPostmanItems(items: unknown[], folder: string[] = []): Array<{name: string; method: string; host: string; path: string}> {
  return items.flatMap((item) => {
    const record = objectOf(item);
    const name = String(record.name || folder.at(-1) || "Request");
    if (Array.isArray(record.item)) return flattenPostmanItems(record.item, [...folder, name]);
    const request = typeof record.request === "string" ? {url: record.request, method: "GET"} : objectOf(record.request);
    const url = normalizePostmanUrl(request.url);
    if (!url) return [];
    return [{name, method: String(request.method || "GET"), host: url.host, path: url.path}];
  });
}

function normalizePostmanUrl(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") return parseUrlParts(value);
  const record = objectOf(value);
  const raw = String(record.raw || "");
  if (raw) return parseUrlParts(raw);
  const host = Array.isArray(record.host) ? record.host.join(".") : String(record.host || "api.example.com");
  const path = Array.isArray(record.path) ? `/${record.path.join("/")}` : String(record.path || "/");
  return {host, path};
}

function parseUrlParts(raw: string) {
  const replaced = raw.replace(/{{[^}]+}}/g, "api.example.com");
  try {
    const parsed = new URL(replaced.startsWith("http") ? replaced : `https://${replaced}`);
    return {host: parsed.host, path: `${parsed.pathname}${parsed.search}`};
  } catch {
    return {host: "api.example.com", path: raw};
  }
}

function parseTypeScriptBlocks(source: string) {
  const interfaces = Array.from(source.matchAll(/(?:export\s+)?interface\s+(\w+)[^{]*\{([\s\S]*?)\n\}/g)).map((match) => ({
    kind: "interface",
    name: match[1],
    fields: parseTypeFields(match[2])
  }));
  const types = Array.from(source.matchAll(/(?:export\s+)?type\s+(\w+)\s*=\s*\{([\s\S]*?)\n\}/g)).map((match) => ({
    kind: "type",
    name: match[1],
    fields: parseTypeFields(match[2])
  }));
  return [...interfaces, ...types];
}

function parseTypeFields(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ""))
    .map((line) => line.match(/^(\w+)(\??):\s*([^;]+);?$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({name: `${match[1]}${match[2] || ""}`, type: match[3]}));
}

function parseZodFields(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ""))
    .map((line) => line.match(/^(\w+):\s*(z\.[^,]+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({name: match[1], validator: match[2].replace(/\s+/g, " ")}));
}

function normalizeCloudFormationYaml(source: string) {
  return source
    .replace(/!Ref\s+([^\n]+)/g, "{ Ref: $1 }")
    .replace(/!Sub\s+([^\n]+)/g, "{ Fn::Sub: $1 }")
    .replace(/!GetAtt\s+([^\n]+)/g, "{ Fn::GetAtt: $1 }")
    .replace(/!Join\s+([^\n]+)/g, "{ Fn::Join: $1 }");
}

function cleanToken(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
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
