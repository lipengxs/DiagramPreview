import {readFile} from "node:fs/promises";
import {expect, test, type Page} from "./fixtures";

async function exportedGraph(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download file", exact: true}).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("mermaid-diagram.drawio");
  const xml = await readFile((await download.path())!, "utf8");
  return page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    const cells = Array.from(document.querySelectorAll("mxCell"));
    const nodes = cells.filter((cell) => cell.getAttribute("vertex") === "1");
    const labels = new Map(nodes.map((node) => [node.id, node.getAttribute("value")]));
    return {
      invalid: Boolean(document.querySelector("parsererror")),
      ids: cells.map((cell) => cell.id),
      labels: nodes.map((node) => node.getAttribute("value")),
      edges: cells.filter((cell) => cell.getAttribute("edge") === "1").map((edge) => ({
        source: labels.get(edge.getAttribute("source")!), target: labels.get(edge.getAttribute("target")!),
        label: edge.getAttribute("value"), style: edge.getAttribute("style")
      }))
    };
  }, xml);
}

const examples = [
  {name: "chained arrows", source: "flowchart LR\n A --> B --> C", labels: ["A", "B", "C"], edges: [["A", "B", ""], ["B", "C", ""]]},
  {name: "edge labels", source: "flowchart LR\n A[Start] -->|Yes| B[Done]", labels: ["Start", "Done"], edges: [["Start", "Done", "Yes"]]},
  {name: "branches", source: "flowchart LR\n A --> B & C", labels: ["A", "B", "C"], edges: [["A", "B", ""], ["A", "C", ""]]},
  {name: "Chinese IDs and duplicate labels", source: "flowchart LR\n 甲[服务] --> 乙[服务]\n 乙 --> 丙[完成]", labels: ["服务", "服务", "完成"], edges: [["服务", "服务", ""], ["服务", "完成", ""]]},
  {name: "subgraphs", source: "flowchart LR\n subgraph Group\n A[Start] --> B[Done]\n end", labels: ["Start", "Done"], edges: [["Start", "Done", ""]]},
  {name: "sequence aliases and replies", source: "sequenceDiagram\n participant A as 用户\n participant B as 服务\n A->>B: 请求\n B-->>A: 返回", labels: ["用户", "服务"], edges: [["用户", "服务", "请求"], ["服务", "用户", "返回"]]},
  {name: "isolated nodes", source: "flowchart LR\n A[Start]\n B[Done]", labels: ["Start", "Done"], edges: []},
  {name: "comments before the diagram", source: "%% copied from a README\nflowchart LR\n A --> B", labels: ["A", "B"], edges: [["A", "B", ""]]},
  {name: "punctuation and entities", source: 'flowchart LR\n A["用户 (App) & API"] -->|请求| B["Done!"]', labels: ["用户 (App) & API", "Done!"], edges: [["用户 (App) & API", "Done!", "请求"]]}
];

for (const example of examples) {
  test(`download preserves ${example.name}`, async ({page}) => {
    await page.goto("/en/mermaid-to-drawio");
    await page.locator("textarea").first().fill(example.source);
    await expect(page.getByText(new RegExp(`Detected (flowchart|sequence): ${example.labels.length} nodes, ${example.edges.length} relationships\\.`))).toBeVisible();
    await expect(page.getByText("Detected Mermaid", {exact: true})).toHaveCount(0);
    const graph = await exportedGraph(page);
    expect(graph.invalid).toBe(false);
    expect(new Set(graph.ids).size).toBe(graph.ids.length);
    expect(graph.labels).toEqual(example.labels);
    expect(graph.edges.map(({source, target, label}) => [source, target, label])).toEqual(example.edges);
    if (example.name === "subgraphs") await expect(page.getByText(/Subgraph boundaries are flattened/)).toBeVisible();
    if (example.name === "sequence aliases and replies") expect(graph.edges[1].style).toContain("dashed=1");
  });
}

test("arrowheads preserve bidirectional and undirected connections", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await page.locator("textarea").first().fill("flowchart LR\n A <--> B\n B --- C\n C -.-> A");
  await expect(page.getByText(/Detected flowchart: 3 nodes, 3 relationships/)).toBeVisible();
  const graph = await exportedGraph(page);
  expect(graph.edges[0].style).toContain("startArrow=block;endArrow=block");
  expect(graph.edges[1].style).toContain("startArrow=none;endArrow=none");
  expect(graph.edges[2].style).toContain("dashed=1");
});

const invalidExamples = [
  {name: "syntax error", source: "flowchart LR\n A[Broken --> B", error: /Parse error/},
  {name: "unsupported diagram", source: "classDiagram\n class User", error: /Unsupported Mermaid diagram type/},
  {name: "subgraph endpoint", source: "flowchart LR\n subgraph Group\n A --> B\n end\n Group --> C", error: /subgraph boundaries cannot be converted/},
  {name: "node limit", source: "flowchart LR\n" + Array.from({length: 37}, (_, index) => `N${index}[Node ${index}]`).join("\n"), error: /no partial file was generated/},
  {name: "edge limit", source: "flowchart LR\n" + Array.from({length: 41}, () => "A --> B").join("\n"), error: /no partial file was generated/}
];

for (const example of invalidExamples) {
  test(`${example.name} clears stale downloads`, async ({page}) => {
    await page.goto("/en/mermaid-to-drawio");
    const download = page.getByRole("button", {name: "Download file", exact: true});
    await expect(download).toBeEnabled();
    await page.locator("textarea").first().fill(example.source);
    await expect(download).toBeDisabled();
    await expect(page.getByText(example.error)).toBeVisible();
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
    await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeDisabled();
    // The parser queue must recover after an invalid diagram.
    await page.locator("textarea").first().fill("flowchart LR\n A --> B --> C");
    await expect(page.getByText(/Detected flowchart: 3 nodes, 2 relationships/)).toBeVisible();
    await expect(download).toBeEnabled();
  });
}

test("Chinese converter keeps the user in place and explains layout changes", async ({page}) => {
  await page.goto("/zh-CN/mermaid-to-drawio");
  await page.locator("textarea").first().fill("flowchart LR\n A[开始] -->|是| B[结束]");
  await expect(page.getByText(/识别为 flowchart：2 个节点，1 条关系。/)).toBeVisible();
  await expect(page.getByText("Detected Mermaid", {exact: true})).toHaveCount(0);
  await expect(page.getByRole("listitem").filter({hasText: "布局会重新生成"})).toBeVisible();
});
