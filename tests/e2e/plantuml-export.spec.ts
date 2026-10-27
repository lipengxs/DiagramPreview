import {readFile} from "node:fs/promises";
import sharp from "sharp";
import {expect, test, type Page} from "./fixtures";

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><rect x="1" y="1" width="238" height="118" fill="#dbeafe" style="stroke:#181818;stroke-width:1"/><text x="12" y="60" font-size="18">Alice → Bob: ping</text></svg>';
const source = "@startuml\nAlice -> Bob: 请求\n@enduml";

async function mockRenderer(page: Page) {
  await page.route("**/api/tools/plantuml", (route) => route.fulfill({json: {svg}}));
}

async function download(page: Page, button: string, filename: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: button, exact: true}).click();
  const result = await pending;
  expect(result.suggestedFilename()).toBe(filename);
  return readFile((await result.path())!);
}

async function events(page: Page, name: string) {
  return page.evaluate((name) => {
    const entries = ((window as Window & {dataLayer?: unknown[]}).dataLayer || []).map((item) => Array.from(item as ArrayLike<unknown>));
    return entries.filter((item) => item[1] === name).map((item) => item[2] as Record<string, unknown>);
  }, name);
}

test("PlantUML exports SVG, correctly sized PNG, and exact Unicode source through same-origin API", async ({page}) => {
  await mockRenderer(page);
  const remoteRequests: string[] = [];
  page.on("request", (request) => {if (request.url().includes("plantuml.com")) remoteRequests.push(request.url());});
  await page.goto("/en/plantuml-preview");
  const request = page.waitForRequest((request) => request.url().endsWith("/api/tools/plantuml") && request.postDataJSON().source === source);
  await page.locator("textarea").first().fill(source);
  expect((await request).method()).toBe("POST");
  await expect(page.locator(".diagram-preview-output svg")).toBeVisible();
  const exportedSvg = await download(page, "SVG", "plantuml-preview.svg");
  expect(exportedSvg.toString()).toContain("Alice → Bob: ping");
  expect(exportedSvg.toString()).toContain("stroke-width: 1");
  const png = await download(page, "PNG", "plantuml-preview.png");
  const metadata = await sharp(png).metadata();
  expect(metadata.format).toBe("png");
  expect([metadata.width, metadata.height]).toEqual([240, 120]);
  const stats = await sharp(png).stats();
  expect(stats.channels.some((channel) => channel.min < 100)).toBe(true);
  expect((await download(page, "Download file", "plantuml-preview.puml")).toString()).toBe(source);
  const exports = await events(page, "tool_export_success");
  expect(exports.map((item) => item.artifact_type)).toEqual(["svg", "png", "puml"]);
  expect(await events(page, "tool_conversion_success")).toHaveLength(0);
  expect(remoteRequests).toHaveLength(0);
});

test("static SVG removes scripts, external requests, CSS URLs, images, and hyperlinks", async ({page}) => {
  const malicious = String.raw`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:base="https://example.invalid/" width="240" height="120" onload="window.__plantumlXss=1">
  <script>window.__plantumlXss=2</script><style>@import url(https://example.invalid/style.css);</style>
  <image href="https://example.invalid/image.png" width="20" height="20"/><use xlink:href="https://example.invalid/sprite.svg#icon"/>
  <foreignObject><div xmlns="http://www.w3.org/1999/xhtml"><img src="https://example.invalid/foreign.png"/></div></foreignObject>
  <rect width="240" height="120" fill="#dbeafe" style="stroke:#181818;stroke-width:1;background-image:url(https://example.invalid/css.png)"/>
  <path d="M1 1 L2 2" fill="u\72l(https://example.invalid/paint.svg)"/>
  <a href="https://example.invalid/link"><text x="12" y="60">Safe label</text></a></svg>`;
  const externalRequests: string[] = [];
  await page.route("**/example.invalid/**", (route) => {externalRequests.push(route.request().url()); return route.abort();});
  await page.route("**/api/tools/plantuml", (route) => route.fulfill({json: {svg: malicious}}));
  await page.goto("/en/plantuml-preview");
  await expect(page.locator(".diagram-preview-output svg")).toBeVisible();
  expect(await page.evaluate(() => (window as Window & {__plantumlXss?: number}).__plantumlXss)).toBeUndefined();
  const result = (await download(page, "SVG", "plantuml-preview.svg")).toString();
  expect(result).not.toMatch(/example\.invalid|<script|<style|<image|<use\b|<a\b|foreignObject|onload|xml:base/);
  expect(result).toContain("Safe label");
  const png = await download(page, "PNG", "plantuml-preview.png");
  expect((await sharp(png).metadata()).width).toBe(240);
  expect(externalRequests).toHaveLength(0);
});

test("failed renderer leaves source download available and retries the same input", async ({page}) => {
  let attempts = 0;
  await page.route("**/api/tools/plantuml", (route) => {
    attempts++;
    return attempts === 1 ? route.fulfill({status: 502, json: {code: "UPSTREAM_FAILURE", error: "The public PlantUML service is unavailable. Try rendering again."}}) : route.fulfill({json: {svg}});
  });
  await page.goto("/en/plantuml-preview");
  await expect(page.getByText(/The public PlantUML service is unavailable/)).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeDisabled();
  const currentSource = await page.locator("textarea").first().inputValue();
  expect((await download(page, "Download file", "plantuml-preview.puml")).toString()).toBe(currentSource);
  await expect(page.getByText(/source is sent through this site's API/)).toBeVisible();
  await page.getByRole("button", {name: "Retry rendering", exact: true}).click();
  await expect(page.locator(".diagram-preview-output svg")).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  expect(attempts).toBe(2);
});

for (const failure of [
  {name: "timeout", status: 504, code: "RENDER_TIMEOUT", error: "PlantUML rendering timed out. Try again or use a smaller diagram."},
  {name: "syntax error", status: 400, code: "INVALID_SOURCE", error: "PlantUML could not render this source. Check syntax and try again."},
  {name: "response too large", status: 502, code: "RESPONSE_TOO_LARGE", error: "The rendered diagram exceeds the 2 MiB limit."}
]) {
  test(`${failure.name} disables image downloads without claiming render success`, async ({page}) => {
    await page.route("**/api/tools/plantuml", (route) => route.fulfill({status: failure.status, json: failure}));
    await page.goto("/en/plantuml-preview");
    await expect(page.getByText(failure.error, {exact: true})).toBeVisible();
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
    await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeDisabled();
    expect(await events(page, "tool_render_success")).toHaveLength(0);
    expect(await events(page, "tool_export_success")).toHaveLength(0);
  });
}

test("malformed SVG is rejected and source remains recoverable", async ({page}) => {
  await page.route("**/api/tools/plantuml", (route) => route.fulfill({json: {svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect>'}}));
  await page.goto("/en/plantuml-preview");
  await expect(page.getByText(/invalid or unsupported SVG/)).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeEnabled();
});

test("editing cancels the previous render and cannot restore or export its stale SVG", async ({page}) => {
  let releaseSlow!: () => void;
  const slowGate = new Promise<void>((resolve) => {releaseSlow = resolve;});
  let aborted = false;
  page.on("requestfailed", (request) => {if (request.postData()?.includes("Slow")) aborted = true;});
  await page.route("**/api/tools/plantuml", async (route) => {
    const content = route.request().postDataJSON().source as string;
    if (content.includes("Slow")) await slowGate;
    await route.fulfill({json: {svg: svg.replace("ping", content.includes("Slow") ? "Slow" : "Latest")}}).catch(() => {});
  });
  await page.goto("/en/plantuml-preview");
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  const pending = page.waitForRequest((request) => request.url().endsWith("/api/tools/plantuml") && request.postData()?.includes("Slow") === true);
  await page.locator("textarea").first().fill("@startuml\nAlice -> Bob: Slow\n@enduml");
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await pending;
  await page.locator("textarea").first().fill("@startuml\nAlice -> Bob: Latest\n@enduml");
  await expect(page.locator(".diagram-preview-output")).toContainText("Latest");
  releaseSlow();
  await expect.poll(() => aborted).toBe(true);
  const result = (await download(page, "SVG", "plantuml-preview.svg")).toString();
  expect(result).toContain("Latest");
  expect(result).not.toContain("Slow");
});

test("invalid and oversized source fails locally without sending another render request", async ({page}) => {
  let requests = 0;
  await page.route("**/api/tools/plantuml", (route) => {requests++; return route.fulfill({json: {svg}});});
  await page.goto("/en/plantuml-preview");
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  const before = requests;
  await page.locator("textarea").first().fill("Alice -> Bob: invalid document");
  await expect(page.getByText(/must include @startuml and @enduml/)).toBeVisible();
  await page.locator("textarea").first().fill("@startuml\n" + "x".repeat(65_536) + "\n@enduml");
  await expect(page.getByText(/64 KiB/).first()).toBeVisible();
  expect(requests).toBe(before);
});

test("PNG conversion failure emits no export success", async ({page}) => {
  await mockRenderer(page);
  await page.goto("/en/plantuml-preview");
  await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeEnabled();
  await page.evaluate(() => {HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;});
  await page.getByRole("button", {name: "PNG", exact: true}).click();
  await expect.poll(async () => (await events(page, "tool_export_png")).some((event) => event.success === false)).toBe(true);
  expect(await events(page, "tool_export_success")).toHaveLength(0);
});

test("client timeout recovers when the site API never responds", async ({page}) => {
  await page.route("**/api/tools/plantuml", () => {});
  await page.goto("/en/plantuml-preview");
  await expect(page.getByText("PlantUML rendering timed out. Try again or use a smaller diagram.", {exact: true})).toBeVisible({timeout: 15_000});
  await expect(page.getByRole("button", {name: "Retry rendering", exact: true})).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeEnabled();
  expect(await events(page, "tool_render_success")).toHaveLength(0);
});

test("shared PNG exporter still downloads a visible Mermaid diagram", async ({page}) => {
  await page.goto("/en/mermaid-preview#source=" + encodeURIComponent("flowchart LR\n A[Start] --> B[Done]"));
  await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeEnabled();
  const png = await download(page, "PNG", "mermaid-preview.png");
  const metadata = await sharp(png).metadata();
  expect(metadata.format).toBe("png");
  expect(metadata.width).toBeGreaterThan(100);
  expect(metadata.height).toBeGreaterThan(20);
  expect((await sharp(png).stats()).channels.some((channel) => channel.min < 100)).toBe(true);
});

test("Chinese errors, retry and privacy notice are translated, with no mobile overflow", async ({page}) => {
  await page.route("**/api/tools/plantuml", (route) => route.fulfill({status: 504, json: {code: "RENDER_TIMEOUT", error: "Timed out"}}));
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/zh-CN/plantuml-preview");
  await expect(page.getByText("PlantUML 渲染超时，请重试或缩小图表。", {exact: true})).toBeVisible();
  await expect(page.getByRole("button", {name: "重试渲染", exact: true})).toBeVisible();
  await expect(page.getByText(/源码会经本站接口发送到公共 PlantUML 渲染服务/).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
