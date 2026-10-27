import {readFile} from "node:fs/promises";
import {expect, test, type Page} from "./fixtures";

const source = 'flowchart LR\n A["开始 & API"] -->|Yes| B["完成🙂"]';
const card = (page: Page, slug: string) => page.locator(`[data-handoff-target="${slug}"]`);
const editor = (page: Page) => page.locator("textarea").first();
const ready = (page: Page) => expect(page.getByRole("button", {name: "Download file", exact: true})).toBeEnabled();

test("Mermaid source travels into conversion and the exact converted XML travels into the viewer", async ({page}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url() + (request.postData() || "")));
  await page.goto("/en/mermaid-preview");
  await editor(page).fill(source);
  await card(page, "mermaid-to-drawio").getByRole("link").click();
  await expect(page).toHaveURL(/\/en\/mermaid-to-drawio#source=/);
  await expect(editor(page)).toHaveValue(source);
  await ready(page);
  const link = card(page, "drawio-preview").getByRole("link");
  await expect(link).toHaveText("Continue with converted XML");
  const xml = new URLSearchParams((await link.getAttribute("href"))!.split("#")[1]).get("source")!;
  expect(xml).toContain("<mxfile");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download file", exact: true}).click();
  expect(await readFile((await (await pending).path())!, "utf8")).toBe(xml);
  await link.click();
  await expect(page).toHaveURL(/\/en\/drawio-preview#source=/);
  await expect(editor(page)).toHaveValue(xml);
  await expect(page.locator(".drawio-page-image svg")).toContainText("开始 & API");
  await expect(page.locator(".drawio-page-image svg")).toContainText("完成🙂");
  expect(requests.some((value) => value.includes(source) || value.includes(xml) || value.includes("%E5%BC%80%E5%A7%8B"))).toBe(false);
  const analytics = await page.evaluate(() => JSON.stringify((window as Window & {dataLayer?: unknown[]}).dataLayer));
  expect(analytics).not.toContain("<mxfile");
  expect(analytics).not.toContain("开始");
  expect(analytics).not.toContain("#source=");
});

test("preview receives source and incompatible tools open with their own sample", async ({page}) => {
  await page.goto("/zh-CN/mermaid-to-drawio");
  await editor(page).fill(source);
  await card(page, "mermaid-preview").getByRole("link").click();
  await expect(page).toHaveURL(/\/zh-CN\/mermaid-preview#source=/);
  await expect(editor(page)).toHaveValue(source);
  await card(page, "mermaid-to-drawio").getByRole("link").click();
  await expect(editor(page)).toHaveValue(source);
  const incompatible = card(page, "plantuml-to-drawio").getByRole("link");
  await expect(incompatible).toHaveAttribute("href", "/zh-CN/plantuml-to-drawio");
  await incompatible.click();
  await expect(editor(page)).not.toHaveValue(source);
  await expect(editor(page)).toHaveValue(/@startuml/);
});

test("changed, failed, and empty conversions cannot hand off stale XML", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await ready(page);
  const viewer = card(page, "drawio-preview");
  await expect(viewer.getByRole("link")).toHaveCount(1);
  await editor(page).fill("flowchart LR\n A[broken --> B");
  await expect(viewer.getByRole("link")).toHaveCount(0);
  await expect(page.getByText(/Parse error/)).toBeVisible();
  await expect(viewer.getByRole("link")).toHaveCount(0);
  await editor(page).fill("");
  await expect(viewer.getByRole("link")).toHaveCount(0);
  await editor(page).fill(source);
  await expect(viewer.getByRole("link")).toHaveCount(1);
  const href = await viewer.getByRole("link").getAttribute("href");
  expect(new URLSearchParams(href!.split("#")[1]).get("source")).toContain("完成🙂");
});

test("PlantUML source reaches conversion and current XML reaches the viewer", async ({page}) => {
  await page.route("**/api/tools/plantuml", (route) => route.fulfill({json: {svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><text x="0" y="20">ping</text></svg>'}}));
  const plantuml = "@startuml\nAlice -> Bob: ping\n@enduml";
  await page.goto("/en/plantuml-preview");
  await editor(page).fill(plantuml);
  await card(page, "plantuml-to-drawio").getByRole("link").click();
  await expect(editor(page)).toHaveValue(plantuml);
  await ready(page);
  await card(page, "drawio-preview").getByRole("link").click();
  await expect(editor(page)).toHaveValue(/<mxfile/);
  await expect(page.locator(".drawio-page-image svg")).toContainText("Alice");
  await expect(page.locator(".drawio-page-image svg")).toContainText("ping");
});

test("oversized source pauses link sharing, downloads exactly, and still hands off small XML", async ({page}) => {
  const large = `%% ${"中文".repeat(2000)}\nflowchart LR\n A --> B`;
  await page.goto("/en/mermaid-to-drawio");
  await editor(page).fill(large);
  await expect(page.getByRole("button", {name: "Share link", exact: true})).toBeDisabled();
  await expect(page.getByRole("button", {name: "Copy Markdown", exact: true})).toBeDisabled();
  const preview = card(page, "mermaid-preview");
  await expect(preview.getByRole("link")).toHaveAttribute("href", "/en/mermaid-preview");
  await expect(preview.getByText(/exceeds 32 KiB/)).toBeVisible();
  const pending = page.waitForEvent("download");
  await preview.getByRole("button", {name: "Download file to continue"}).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("mermaid-to-drawio-source.mmd");
  expect(await readFile((await file.path())!, "utf8")).toBe(large);
  await expect(card(page, "drawio-preview").getByRole("link")).toHaveAttribute("href", /#source=/);
  await editor(page).fill(source);
  await expect(page.getByRole("button", {name: "Share link", exact: true})).toBeEnabled();
});

test("oversized converted XML downloads exactly and can be opened locally in the viewer", async ({page}) => {
  const large = "flowchart LR\n" + Array.from({length: 5}, (_, i) => `N${i}["${i}${"中".repeat(800)}"]`).join("\n");
  await page.goto("/en/mermaid-to-drawio");
  await editor(page).fill(large);
  await ready(page);
  const viewer = card(page, "drawio-preview");
  await expect(viewer.getByText(/exceeds 32 KiB/)).toBeVisible();
  await expect(viewer.getByRole("link")).toHaveAttribute("href", "/en/drawio-preview");
  const pending = page.waitForEvent("download");
  await viewer.getByRole("button").click();
  const file = await pending;
  const xml = await readFile((await file.path())!, "utf8");
  expect(file.suggestedFilename()).toBe("mermaid-diagram.drawio");
  expect(xml).toContain("4" + "中".repeat(800));
  await viewer.getByRole("link").click();
  await page.locator('input[type="file"]').setInputFiles({name: file.suggestedFilename(), mimeType: "application/xml", buffer: Buffer.from(xml)});
  await expect(editor(page)).toHaveValue(xml);
  await expect(page.locator(".drawio-page-image svg")).toBeVisible();
  await expect(page.locator(".drawio-page-image svg text")).toHaveCount(5);
});

test("detected-tool suggestions use the same bounded fragment fallback", async ({page}) => {
  await page.goto("/en/mermaid-preview");
  const large = `@startuml\n' ${"中文".repeat(2000)}\nAlice -> Bob: ping\n@enduml`;
  await editor(page).fill(large);
  const matching = page.getByRole("link", {name: "Open PlantUML tool"});
  await expect(matching).toHaveAttribute("href", "/en/plantuml-preview");
  await expect(page.getByRole("button", {name: "Download current input"})).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download current input"}).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("plantuml-preview-source.puml");
  expect(await readFile((await file.path())!, "utf8")).toBe(large);
});

test("short Unicode input still copies usable Share and Markdown links", async ({page, context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/mermaid-preview");
  await editor(page).fill(source);
  await page.getByRole("button", {name: "Share link", exact: true}).click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URLSearchParams(new URL(url).hash.slice(1)).get("source")).toBe(source);
  expect(new URL(url).search).toBe("");
  await page.getByRole("button", {name: "Copy Markdown", exact: true}).click();
  const markdown = await page.evaluate(() => navigator.clipboard.readText());
  expect(markdown).toContain(source);
  expect(markdown).toContain(url);
});

test("tall diagrams and wide zoom stay scrollable inside the desktop workspace", async ({page}) => {
  await page.setViewportSize({width: 1024, height: 900});
  await page.goto("/en/mermaid-preview");
  await editor(page).fill(`%% ${"longword".repeat(600)}\nflowchart TB\n${Array.from({length: 25}, (_, i) => `N${i} --> N${i + 1}`).join("\n")}`);
  await expect(page.locator(".diagram-preview-output svg")).toContainText("N25");
  const scroll = page.locator("[data-tool-workspace] > div > div").nth(1);
  expect(await scroll.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  expect((await page.locator("[data-tool-workspace]").boundingBox())!.height).toBe(640);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.goto("/en/drawio-preview");
  await expect(page.locator(".drawio-page-image svg")).toBeVisible();
  for (let i = 0; i < 8; i++) await page.getByRole("button", {name: "Zoom in", exact: true}).click();
  const viewport = page.locator("[data-drawio-viewer] > div").nth(1);
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

for (const path of ["/en/mermaid-preview", "/en/mermaid-to-drawio", "/en/plantuml-preview", "/zh-CN/plantuml-to-drawio", "/en/drawio-preview", "/es/drawio-preview"]) {
  test(`${path} has a contained desktop split and stacked mobile workspace`, async ({page}) => {
    await page.route("**/api/tools/plantuml", (route) => route.fulfill({json: {svg: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100"><text x="1" y="40">Test</text></svg>'}}));
    await page.setViewportSize({width: 1440, height: 1000});
    await page.goto(path);
    const workspace = page.locator("[data-tool-workspace]");
    const input = workspace.locator(":scope > label");
    const output = workspace.locator(":scope > div");
    const a = (await input.boundingBox())!;
    const b = (await output.boundingBox())!;
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(b.x).toBeGreaterThan(a.x + a.width);
    expect(Math.abs(a.height - b.height)).toBeLessThan(2);
    expect(a.height).toBe(640);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({width, height: 844});
      const a = (await input.boundingBox())!;
      const b = (await output.boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${path} at ${width}`).toBeLessThanOrEqual(1);
    }
  });
}
