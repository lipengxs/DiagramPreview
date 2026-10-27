import assert from "node:assert/strict";
import test from "node:test";
import {sanitizedAnalyticsLocation} from "../src/lib/analytics-location";
import {convertMermaidModelToDrawio, convertMermaidToDrawio} from "../src/lib/renderers/drawio-converters";
import {acceptsDetectedInput, detectInputTool} from "../src/lib/input-detector";
import type {MermaidDrawioModel} from "../src/lib/renderers/mermaid-drawio-model";
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

const model: MermaidDrawioModel = {
  diagramType: "flowchart",
  nodes: [{key: "A", label: "服务"}, {key: "B", label: "服务"}, {key: "C", label: "完成"}],
  edges: [{source: "A", target: "B", label: "Yes"}, {source: "B", target: "C", label: ""}],
  warnings: ["Layout is regenerated."]
};

test("graph identity uses source IDs instead of Chinese or duplicate labels", () => {
  const result = convertMermaidModelToDrawio(model);
  assert.deepEqual(result.stats, {nodes: 3, edges: 2});
  assert.match(result.xml, /source="node_1" target="node_2"/);
  assert.match(result.xml, /source="node_2" target="node_3"/);
  assert.deepEqual(result.warnings, model.warnings);
  const ids = [...result.xml.matchAll(/<mxCell id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("export keeps arrow direction, shape, dashed lines and literal text", () => {
  const result = convertMermaidModelToDrawio({
    ...model,
    nodes: [{key: "A", label: '<img src="x">\n服务', shape: "diamond"}, {key: "B", label: '"Done" & ready'}],
    edges: [{source: "A", target: "B", label: "Yes & no", startArrow: "block", endArrow: "none", dashed: true}]
  });
  assert.match(result.xml, /startArrow=block;endArrow=none;dashed=1/);
  assert.match(result.xml, /rhombus;/);
  assert.match(result.xml, /&lt;img src=&quot;x&quot;&gt;&#10;服务/);
  assert.match(result.xml, /html=0/);
  assert.ok(!result.svg.includes('<img src="x">'));
  assert.match(result.svg, /marker-start="url\(#arrow-block\)"/);
  assert.ok(!result.svg.includes('marker-end='));
});

test("invalid graph models stop export instead of dropping relationships", () => {
  assert.throws(() => convertMermaidModelToDrawio({...model, nodes: []}), /No supported/);
  assert.throws(() => convertMermaidModelToDrawio({...model, nodes: [model.nodes[0], model.nodes[0]]}), /Duplicate/);
  assert.throws(() => convertMermaidModelToDrawio({...model, edges: [{source: "A", target: "missing", label: ""}]}), /unresolved endpoint/);
});

test("blank labels remain blank instead of inventing replacement text", () => {
  const result = convertMermaidModelToDrawio({...model, nodes: [{key: "A", label: ""}], edges: []});
  assert.match(result.xml, /id="node_1" value=""/);
});

test("large graphs stop export instead of silently truncating", () => {
  assert.throws(() => convertMermaidModelToDrawio({...model, nodes: Array.from({length: 37}, (_, index) => ({key: `N${index}`, label: "Node"}))}), /36 nodes \/ 40 relationships/);
  assert.throws(() => convertMermaidModelToDrawio({...model, edges: Array.from({length: 41}, () => model.edges[0])}), /no partial file/);
});

test("Mermaid parsing never bypasses syntax validation outside a browser", async () => {
  await assert.rejects(() => convertMermaidToDrawio("flowchart LR\n A --> B"), /browser DOM/);
});

test("format-compatible tools do not redirect valid converter input", () => {
  const mermaid = detectInputTool("flowchart LR\n A --> B")!;
  assert.equal(acceptsDetectedInput("mermaid-to-drawio", mermaid), true);
  assert.equal(acceptsDetectedInput("plantuml-preview", mermaid), false);
  assert.equal(acceptsDetectedInput("plantuml-to-drawio", detectInputTool("@startuml\n A -> B\n@enduml")!), true);
  assert.equal(acceptsDetectedInput("drawio-to-svg", detectInputTool('<mxfile><diagram /></mxfile>')!), true);
  assert.equal(detectInputTool("graph G { A -- B }")?.slug, "graphviz-preview");
});

test("PlantUML requires document boundaries", () => {
  assert.throws(() => plantUmlSvgUrl("Alice -> Bob: ping"), /@startuml and @enduml/);
  assert.match(plantUmlSvgUrl("@startuml\nAlice -> Bob: ping\n@enduml"), /^https:\/\/www\.plantuml\.com\/plantuml\/svg\//);
});
