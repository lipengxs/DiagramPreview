import assert from "node:assert/strict";
import test from "node:test";
import {sanitizedAnalyticsLocation} from "../src/lib/analytics-location";
import {convertMermaidToDrawio} from "../src/lib/renderers/drawio-converters";
import {plantUmlSvgUrl} from "../src/lib/renderers/plantuml";
import {absoluteSourceUrl, sharedSourceFromUrl, sourceUrl} from "../src/lib/source-links";

test("source links keep diagram source in the fragment", () => {
  const source = "flowchart LR\n  A --> B";
  const relative = sourceUrl("/en/mermaid-preview", source);
  const absolute = absoluteSourceUrl("https://diagrampreview.com", "/en/mermaid-preview", source);

  assert.equal(relative.includes("?source="), false);
  assert.match(relative, /#source=/);
  assert.equal(sharedSourceFromUrl(absolute), source);
  assert.equal(sharedSourceFromUrl(`https://diagrampreview.com/en/mermaid-preview?source=${encodeURIComponent(source)}`), source);
});

test("analytics locations discard source and unknown parameters", () => {
  const location = sanitizedAnalyticsLocation(
    "https://diagrampreview.com/en/mermaid-preview?source=private-code&utm_source=medium&gclid=google-click&msclkid=bing-click&ref=secret#source=more-private-code"
  );

  assert.equal(
    location,
    "https://diagrampreview.com/en/mermaid-preview?utm_source=medium&gclid=google-click&msclkid=bing-click"
  );
});

test("Mermaid flowcharts convert with stats and warnings", async () => {
  const result = await convertMermaidToDrawio("flowchart LR\n  A[API] --> B[Worker]\n  style A fill:#fff");

  assert.equal(result.diagramType, "flowchart");
  assert.deepEqual(result.stats, {nodes: 2, edges: 1});
  assert.match(result.xml, /API/);
  assert.ok(result.warnings.some((warning) => warning.includes("styling")));
});

test("Mermaid sequence diagrams convert", async () => {
  const result = await convertMermaidToDrawio(
    "sequenceDiagram\n  participant User\n  participant API\n  User->>API: GET /orders\n  API-->>User: 200 OK"
  );

  assert.equal(result.diagramType, "sequence");
  assert.equal(result.stats.nodes, 2);
  assert.equal(result.stats.edges, 2);
});

test("unsupported and invalid Mermaid fail clearly", async () => {
  await assert.rejects(() => convertMermaidToDrawio("classDiagram\n  class User"), /Unsupported Mermaid diagram type/);
});

test("large Mermaid input reports truncation", async () => {
  const lines = ["flowchart LR", ...Array.from({length: 42}, (_, index) => `  N${index}[Node ${index}] --> N${index + 1}[Node ${index + 1}]`)];
  const result = await convertMermaidToDrawio(lines.join("\n"));

  assert.ok(result.stats.nodes > 36);
  assert.ok(result.stats.edges > 40);
  assert.ok(result.warnings.some((warning) => warning.includes("first 36")));
  assert.ok(result.warnings.some((warning) => warning.includes("first 40")));
});

test("PlantUML requires document boundaries", () => {
  assert.throws(() => plantUmlSvgUrl("Alice -> Bob: ping"), /@startuml and @enduml/);
  assert.match(plantUmlSvgUrl("@startuml\nAlice -> Bob: ping\n@enduml"), /^https:\/\/www\.plantuml\.com\/plantuml\/svg\//);
});
