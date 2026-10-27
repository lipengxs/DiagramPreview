import {deflateRawSync} from "node:zlib";
import {readFile} from "node:fs/promises";
import sharp from "sharp";
import {expect, test, type Page} from "./fixtures";

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const vertex = (id: string, label: string, style = "rounded=0;fillColor=#dbeafe;strokeColor=#2563eb;", x = 40, y = 50) => `<mxCell id="${id}" value="${escape(label)}" vertex="1" parent="1" style="${escape(style)}"><mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry"/></mxCell>`;
const edge = '<mxCell id="edge" value="HTTPS" edge="1" parent="1" source="a" target="b" style="endArrow=block;startArrow=open;dashed=1;"><mxGeometry relative="1" as="geometry"/></mxCell>';
const model = (cells: string) => `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel>`;
const compressed = (source: string) => deflateRawSync(encodeURIComponent(source)).toString("base64");
const pageXml = (source: string, name = "Context", zip = false) => `<diagram id="${escape(name)}" name="${escape(name)}">${zip ? compressed(source) : source}</diagram>`;
const file = (source: string) => `<mxfile>${pageXml(source)}</mxfile>`;
const base = model(vertex("a", "Client") + vertex("b", "API", "ellipse;fillColor=#dcfce7;", 280) + edge);

async function open(page: Page, source = file(base), locale = "en") {
  await page.goto(`/${locale}/drawio-preview#source=` + encodeURIComponent(source));
  await expect(page.locator("[data-drawio-viewer]")).toBeVisible();
}
async function download(page: Page, label: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: label, exact: true}).click();
  const result = await pending;
  return {filename: result.suggestedFilename(), content: await readFile((await result.path())!)};
}
async function events(page: Page, name: string) {
  return page.evaluate((name) => ((window as Window & {dataLayer?: unknown[]}).dataLayer || []).map((entry) => Array.from(entry as ArrayLike<unknown>)).filter((entry) => entry[1] === name).map((entry) => entry[2] as Record<string, unknown>), name);
}

test("local compressed multi-page upload, selection, current-page downloads and no content upload", async ({page}) => {
  const marker = "PRIVATE_DRAWIO_仅在本地_20261025";
  const first = model(vertex("a", marker, "rounded=1;fillColor=#dbeafe;strokeColor=#2563eb;", -180, -40) + vertex("b", "API", "rhombus;", 180, 20) + edge);
  const second = model(vertex("database", "第二页数据库", "ellipse;fillColor=#dcfce7;"));
  const source = `<mxfile>${pageXml(first, "Context 系统", true)}${pageXml(second, "Data 数据", true)}</mxfile>`;
  const requests: string[] = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.postData() || ""}`));
  await page.goto("/en/drawio-preview");
  await page.getByLabel("Open local .drawio / XML file").setInputFiles({name: "private.drawio", mimeType: "application/xml", buffer: Buffer.from(source)});
  await expect(page.locator(".drawio-page-image")).toContainText(marker);
  await expect(page.locator("textarea").first()).toHaveValue(source);
  await expect(page.getByText("2 pages · 5 objects", {exact: true})).toBeVisible();
  const firstSvg = await download(page, "SVG");
  expect(firstSvg.filename).toBe("drawio-preview-page-1.svg");
  expect(firstSvg.content.toString()).toContain(marker);
  expect(firstSvg.content.toString()).toContain('viewBox="-');
  expect(firstSvg.content.toString()).toContain('marker-start="url(#drawio-arrow-open)"');
  const firstPng = await download(page, "PNG");
  expect(firstPng.filename).toBe("drawio-preview-page-1.png");
  expect((await sharp(firstPng.content).stats()).channels.some((channel) => channel.min < 100)).toBe(true);
  await page.getByRole("combobox", {name: "Page", exact: true}).selectOption("1");
  await expect(page.locator(".drawio-page-image")).toContainText("第二页数据库");
  await expect(page.getByText("2 pages · 3 objects", {exact: true})).toBeVisible();
  const selected = await download(page, "Download file");
  expect(selected.filename).toBe("drawio-preview-page-2.drawio");
  expect(selected.content.toString()).toContain('name="Data 数据"');
  expect(selected.content.toString()).not.toContain(marker);
  expect((selected.content.toString().match(/<diagram\b/g) || [])).toHaveLength(1);
  const secondSvg = await download(page, "SVG");
  expect(secondSvg.filename).toBe("drawio-preview-page-2.svg");
  expect(secondSvg.content.toString()).toContain("第二页数据库");
  expect(secondSvg.content.toString()).not.toContain(marker);
  expect((await sharp((await download(page, "PNG")).content).metadata()).format).toBe("png");
  await expect.poll(async () => (await events(page, "workspace_draft_saved")).length).toBeGreaterThan(0);
  expect(requests.join("\n")).not.toContain(marker);
  expect(requests.join("\n")).not.toContain(source);
  expect(requests.join("\n")).not.toContain(compressed(first));
  expect(requests.some((request) => /\/api\/|viewer\.diagrams\.net|app\.diagrams\.net/.test(request))).toBe(false);
  expect(await events(page, "tool_conversion_success")).toHaveLength(0);
  expect((await events(page, "tool_export_success")).map((event) => event.artifact_type)).toEqual(["svg", "png", "drawio", "svg", "png"]);
  expect(JSON.stringify(await events(page, "tool_render_success"))).not.toContain(marker);
});

test("zoom changes display dimensions but not downloaded SVG dimensions", async ({page}) => {
  await open(page);
  const image = page.locator(".drawio-page-image");
  const before = await image.boundingBox();
  const original = (await download(page, "SVG")).content;
  await page.getByRole("button", {name: "Zoom in", exact: true}).click();
  expect((await image.boundingBox())!.width).toBeGreaterThan(before!.width);
  expect((await download(page, "SVG")).content).toEqual(original);
  await page.getByRole("button", {name: "Fit width", exact: true}).click();
  expect((await image.boundingBox())!.width).toBeCloseTo(before!.width, 0);
});

test("PR1 downloaded Mermaid conversion is readable without losing nodes or labels", async ({page}) => {
  const source = await readFile("reports/implementation-2026-10-25/mermaid-flowchart.drawio", "utf8");
  await open(page, source);
  const svg = page.locator(".drawio-page-image svg");
  await expect(svg).toContainText("Start");
  await expect(svg).toContainText("Review");
  await expect(svg).toContainText("Done");
  await expect(svg).toContainText("Yes");
  await expect(svg.locator("g[data-cell-id]")).toHaveCount(5);
});

test("standalone model, wrapped labels, explicit waypoints and escaped text remain inert", async ({page}) => {
  const network: string[] = [];
  await page.route("**/example.invalid/**", (route) => {network.push(route.request().url()); return route.abort();});
  const wrapper = `<object id="a" label="${escape('<img src="https://example.invalid/image.png" onerror="window.drawioXss=1"><b>中文 &amp; Safe</b><br>Second line')}" link="javascript:alert(1)"><mxCell vertex="1" parent="1" style="rounded=1;html=1;"><mxGeometry x="-120" y="-80" width="180" height="90" as="geometry"/></mxCell></object>`;
  const routed = edge.replace('<mxGeometry relative="1" as="geometry"/>', '<mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="160" y="-40"/><mxPoint x="160" y="80"/></Array></mxGeometry>');
  await open(page, model(wrapper + vertex("b", "<Literal>", "ellipse;html=0;", 300, 100) + routed));
  await expect(page.locator(".drawio-page-image")).toContainText("中文 & Safe");
  const result = (await download(page, "SVG")).content.toString();
  expect(result).toContain("&lt;Literal&gt;");
  expect(result).toContain("L 160 -40 L 160 80");
  expect(result).not.toMatch(/<img|<script|<foreignObject|href=|onerror=|example\.invalid/);
  expect(await page.evaluate(() => (window as Window & {drawioXss?: number}).drawioXss)).toBeUndefined();
  expect(network).toHaveLength(0);
  expect((await sharp((await download(page, "PNG")).content).metadata()).format).toBe("png");
});

for (const [name, invalid, message] of [
  ["custom shapes", base.replace('rounded=0;', 'shape=mxgraph.aws4.ec2;'), /unsupported shapes/i],
  ["groups", base.replace('rounded=0;', 'group;'), /groups/i],
  ["nested nodes", base.replace('id="b" value="API" vertex="1" parent="1"', 'id="b" value="API" vertex="1" parent="a"'), /nested/i],
  ["images", base.replace('rounded=0;', 'shape=image;image=https://example.invalid/icon.png;'), /images/i],
  ["hidden cells", base.replace('id="a"', 'id="a" visible="0"'), /hidden/i],
  ["transparent objects", base.replace('rounded=0;', 'opacity=0;'), /hidden/i],
  ["missing endpoints", base.replace('target="b"', 'target="missing"'), /missing/i],
  ["duplicate IDs", base.replace('id="b"', 'id="a"'), /unique ID/i],
  ["non-finite coordinates", base.replace('x="40"', 'x="NaN"'), /numeric geometry/i]
] as const) {
  test(`${name} blocks only that page and preserves its source XML`, async ({page}) => {
    await open(page, `<mxfile>${pageXml(invalid, "Unsupported")}${pageXml(base, "Supported")}</mxfile>`);
    await expect(page.locator("[data-drawio-viewer]").getByRole("alert")).toContainText(message);
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
    await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeDisabled();
    const xml = (await download(page, "Download file")).content.toString();
    expect(xml).toContain('name="Unsupported"');
    expect(xml).not.toContain('name="Supported"');
    expect(await events(page, "tool_render_success")).toHaveLength(0);
    await page.getByRole("combobox", {name: "Page", exact: true}).selectOption("1");
    await expect(page.locator(".drawio-page-image")).toContainText("Client");
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  });
}

for (const [name, source, message] of [
  ["broken XML", "<mxfile><diagram>", /Invalid draw.io XML/],
  ["non-drawio XML", "<html><body>not drawio</body></html>", /containing mxfile/],
  ["DOCTYPE", '<!DOCTYPE mxfile [<!ENTITY secret SYSTEM "https://example.invalid/file">]>' + file(base), /DOCTYPE/],
  ["too many pages", `<mxfile>${Array.from({length: 21}, (_, index) => pageXml(base, String(index))).join("")}</mxfile>`, /20-page/],
  ["too many cells", file(model(Array.from({length: 499}, (_, index) => vertex(`n${index}`, "N")).join(""))), /500-cell/],
  ["decompression bomb", `<mxfile><diagram>${deflateRawSync("x".repeat(2 * 1024 * 1024 + 1)).toString("base64")}</diagram></mxfile>`, /2 MiB/]
] as const) {
  test(`${name} clears previous downloads and allows recovery`, async ({page}) => {
    await open(page);
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
    await page.locator("textarea").first().fill(source);
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
    await expect(page.getByText(message).first()).toBeVisible();
    await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeDisabled();
    await page.locator("textarea").first().fill(file(base));
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  });
}

test("broken compressed page leaves another page usable", async ({page}) => {
  await open(page, `<mxfile><diagram name="Broken">not-base64</diagram>${pageXml(base, "Good", true)}</mxfile>`);
  await expect(page.locator("[data-drawio-viewer]").getByRole("alert")).toContainText("Invalid compressed");
  await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeDisabled();
  await page.getByRole("combobox", {name: "Page", exact: true}).selectOption("1");
  await expect(page.locator(".drawio-page-image")).toContainText("Client");
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
});

test("oversized file rejects before reading and a subsequent upload recovers", async ({page}) => {
  await open(page);
  await page.getByLabel("Open local .drawio / XML file").setInputFiles({name: "large.drawio", mimeType: "application/xml", buffer: Buffer.alloc(2 * 1024 * 1024 + 1)});
  await expect(page.getByText(/This file exceeds a viewer limit/)).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await page.getByLabel("Open local .drawio / XML file").setInputFiles({name: "valid.drawio", mimeType: "application/xml", buffer: Buffer.from(file(base))});
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
});

test("global decoded size and cell limits include all compressed pages", async ({page}) => {
  await open(page);
  const padded = base.replace("<mxGraphModel>", '<mxGraphModel metadata="' + "x".repeat(500_000) + '">');
  const oversized = `<mxfile>${Array.from({length: 17}, (_, i) => pageXml(padded, `P${i}`, true)).join("")}</mxfile>`;
  await page.locator("textarea").first().fill(oversized);
  await expect(page.getByText(/8 MiB total/).first()).toBeVisible();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  const full = model(Array.from({length: 498}, (_, i) => vertex(`n${i}`, "N")).join(""));
  const manyCells = `<mxfile>${Array.from({length: 11}, (_, i) => pageXml(full, `P${i}`, true)).join("")}</mxfile>`;
  await page.locator("textarea").first().fill(manyCells);
  await expect(page.getByText(/5000-cell total/).first()).toBeVisible();
  await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeDisabled();
  await page.locator("textarea").first().fill(file(base));
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
});

test("invalid UTF-8 and empty uploads do not reuse a previous downloadable result", async ({page}) => {
  await open(page);
  const input = page.getByLabel("Open local .drawio / XML file");
  for (const buffer of [Buffer.from([0xff, 0xfe, 0x80]), Buffer.alloc(0)]) {
    await input.setInputFiles({name: "invalid.drawio", mimeType: "application/xml", buffer});
    await expect(page.getByText(/Unable to read this file/).first()).toBeVisible();
    await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
    await expect(page.getByRole("button", {name: "Download file", exact: true})).toBeDisabled();
  }
  await input.setInputFiles({name: "valid.drawio", mimeType: "application/xml", buffer: Buffer.from(file(base))});
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
});

test("disabled local history cannot turn a completed download into a failed export", async ({page}) => {
  await open(page);
  await page.evaluate(() => {Storage.prototype.setItem = () => {throw new DOMException("Quota exceeded", "QuotaExceededError");};});
  const xml = await download(page, "Download file");
  expect(xml.content.toString()).toContain('name="Context"');
  await expect.poll(async () => (await events(page, "tool_download_file")).some((event) => event.success === true)).toBe(true);
  expect((await events(page, "tool_export_success")).map((event) => event.artifact_type)).toEqual(["drawio"]);
});

test("empty pages are explicit and 390px localized pages contain zoom overflow", async ({page}) => {
  for (const [locale, upload, pageLabel, zoomIn] of [["zh-CN", "打开本地 .drawio / XML 文件", "页面", "放大"], ["es", "Abrir archivo local .drawio / XML", "Página", "Ampliar"]]) {
    await page.setViewportSize({width: 390, height: 844});
    await open(page, `<mxfile>${pageXml(base, "Basic")}${pageXml(model(""), "Empty")}</mxfile>`, locale);
    await expect(page.getByLabel(upload)).toBeVisible();
    for (let i = 0; i < 5; i++) await page.getByRole("button", {name: zoomIn, exact: true}).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.getByRole("combobox", {name: pageLabel, exact: true}).selectOption("1");
    await expect(page.getByText(locale === "zh-CN" ? "当前页面为空。" : "Esta página está vacía.", {exact: true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});
