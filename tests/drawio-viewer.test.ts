import assert from "node:assert/strict";
import {test} from "node:test";
import {drawioPageXml, type DrawioViewerGraph, type DrawioViewerNode, type DrawioViewerEdge} from "../src/lib/renderers/drawio-viewer-model";
import {renderDrawioPage} from "../src/lib/renderers/drawio-viewer-svg";
import {recordExportHistory, recordWorkspaceDraft} from "../src/lib/workspace-history";

const node = (id: string, x: number, y: number, extra: Partial<DrawioViewerNode> = {}): DrawioViewerNode => ({id, label: id, x, y, width: 100, height: 40, shape: "rectangle", fill: "#ffffff", stroke: "#2563eb", color: "#0f172a", strokeWidth: 2, fontSize: 13, dashed: false, textOnly: false, ...extra});
const edge = (extra: Partial<DrawioViewerEdge> = {}): DrawioViewerEdge => ({id: "edge", source: "a", target: "b", stroke: "#64748b", color: "#0f172a", strokeWidth: 2, fontSize: 12, dashed: true, startArrow: "none", endArrow: "block", points: [], orthogonal: false, ...extra});
const graph = (nodes: DrawioViewerNode[], edges: DrawioViewerEdge[] = []): DrawioViewerGraph => ({title: "Test", nodes, edges});

test("drawio viewer connectors terminate at shape boundaries instead of behind the nodes", () => {
  const image = renderDrawioPage(graph([node("a", 0, 0), node("b", 200, 0)], [edge()]));
  assert.match(image.svg, /d="M 100 20 L 200 20"/);
  assert.match(image.svg, /marker-end="url\(#drawio-arrow-block\)"/);
  assert.match(image.svg, /stroke-dasharray="6 4"/);
});

test("orthogonal routes and explicit attachment points have visible endpoints", () => {
  const nodes = [node("a", 0, 0), node("b", 200, 100)];
  const orthogonal = renderDrawioPage(graph(nodes, [edge({orthogonal: true})]));
  assert.match(orthogonal.svg, /d="M 100 20 L 150 20 L 150 120 L 200 120"/);
  const explicit = renderDrawioPage(graph(nodes, [edge({exit: {x: 1, y: 0}, entry: {x: 0, y: 1}})]));
  assert.match(explicit.svg, /d="M 100 0 L 200 140"/);
});

test("self-loops extend outside the node and remain inside the SVG viewBox", () => {
  const image = renderDrawioPage(graph([node("a", 0, 0)], [edge({target: "a"})]));
  assert.match(image.svg, /d="M 100 20 L 132 20 L 132 -32 L 50 -32 L 50 0"/);
  assert.match(image.svg, /viewBox="-36 -68 /);
});

test("negative and translated coordinates use tight bounds without losing off-canvas content", () => {
  const negative = renderDrawioPage(graph([node("a", -400, -200), node("b", -200, -200)]));
  const positive = renderDrawioPage(graph([node("a", 1_000_000, 1_000_000), node("b", 1_000_200, 1_000_000)]));
  assert.equal(negative.width, 372);
  assert.equal(positive.width, negative.width);
  assert.equal(positive.height, negative.height);
  assert.match(negative.svg, /viewBox="-436 -236 372 160"/);
});

test("static viewer SVG escapes labels, IDs and page names while preserving supported shapes", () => {
  const image = renderDrawioPage({title: '\"><script>alert(1)</script>', nodes: [
    node('a\"><image href="https://example.invalid">', 0, 0, {label: '<script>中文 & text</script>', shape: "rounded"}),
    node("b", 200, 0, {shape: "ellipse"}), node("c", 400, 0, {shape: "diamond"})
  ], edges: []});
  assert.doesNotMatch(image.svg, /<script|<image|href="https/);
  assert.match(image.svg, /&lt;script&gt;中文 &amp; text&lt;\/script&gt;/);
  assert.match(image.svg, /rx="10"/);
  assert.match(image.svg, /<ellipse cx="250"/);
  assert.match(image.svg, /<polygon points="450,0 500,20 450,40 400,20"/);
});

test("single-page XML export retains the original model and escapes wrapper metadata", () => {
  const modelXml = '<mxGraphModel><root><mxCell id="0" custom="preserved"/></root></mxGraphModel>';
  const result = drawioPageXml({id: 'id"&', name: 'Context " & < >\n第二页', compressed: true, modelXml, cellCount: 1, warnings: []});
  assert.ok(result?.includes(modelXml));
  assert.ok(result?.includes('name="Context &quot; &amp; &lt; &gt;&#10;第二页"'));
  assert.equal((result?.match(/<diagram\b/g) || []).length, 1);
  assert.equal(drawioPageXml({id: "broken", name: "Broken", compressed: true, cellCount: 0, warnings: []}), undefined);
});

test("full local storage cannot interrupt an export and does not report a saved draft", () => {
  const storage = {getItem: () => null, setItem: () => {throw new Error("Quota exceeded");}} as unknown as Storage;
  const entry = {toolSlug: "drawio-preview", source: "<mxfile/>", artifactType: "drawio"};
  assert.doesNotThrow(() => recordExportHistory(storage, entry));
  assert.equal(recordWorkspaceDraft(storage, entry), false);
});
