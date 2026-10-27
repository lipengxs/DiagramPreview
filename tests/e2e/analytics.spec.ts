import {readFile} from "node:fs/promises";
import JSZip from "jszip";
import {expect, test, type Page} from "./fixtures";

async function events(page: Page, name: string) {
  return page.evaluate((name) => (window.dataLayer || []).map((item) => Array.from(item as ArrayLike<unknown>)).filter((item) => item[0] === "event" && item[1] === name).map((item) => item[2] as Record<string, unknown>), name);
}

async function downloadBatch(page: Page, source: string) {
  const section = page.locator("section").filter({has: page.getByRole("heading", {name: "Batch conversion beta", exact: true})}).last();
  await section.locator("textarea").fill(source);
  const pending = page.waitForEvent("download");
  await section.getByRole("button", {name: "Generate ZIP", exact: true}).click();
  const download = await pending;
  return JSZip.loadAsync(await readFile((await download.path())!));
}

test("delayed tag consumes first-visit and early tool events once, without source or referrer queries", async ({page}) => {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {release = resolve;});
  await page.route(/https:\/\/www\.googletagmanager\.com\/gtag\/js/, async (route) => {
    await ready;
    await route.fulfill({contentType: "application/javascript", body: `window.__received = (window.dataLayer || []).map(x => Array.from(x)); window.__tagLoaded = true;`});
  });
  await page.goto("/en/mermaid-to-drawio?source=PRIVATE_QUERY&utm_source=bing&utm_medium=cpc#source=flowchart%20LR%0AA%20--%3E%20PRIVATE_FRAGMENT", {referer: "https://www.bing.com/search?q=PRIVATE_REFERRER", waitUntil: "domcontentloaded"});
  await expect.poll(async () => (await events(page, "tool_open")).length).toBe(1);
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(1);
  release();
  await page.waitForFunction(() => (window as Window & {__tagLoaded?: boolean}).__tagLoaded);
  const queue = await page.evaluate(() => (window as Window & {__received?: unknown[]}).__received);
  expect(JSON.stringify(queue)).not.toMatch(/PRIVATE_QUERY|PRIVATE_FRAGMENT|PRIVATE_REFERRER/);
  expect((await events(page, "page_view"))[0]).toMatchObject({page_location: "http://127.0.0.1:3100/en/mermaid-to-drawio?utm_source=bing&utm_medium=cpc", page_referrer: "https://www.bing.com/search"});
  expect((queue as unknown[][]).filter((item) => item[0] === "config")).toHaveLength(1);
  expect(await events(page, "page_view")).toHaveLength(1);
});

test("SPA navigation and Back count views; source-only query and fragment changes do not", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await expect(page.getByText(/Detected flowchart: 4 nodes/)).toBeVisible();
  await page.evaluate(() => {history.pushState(null, "", "?source=PRIVATE_QUERY#source=PRIVATE_FRAGMENT");});
  await page.getByRole("link", {name: "Load this example", exact: true}).first().click();
  await expect.poll(async () => (await events(page, "tool_entry_click")).length).toBe(1);
  expect(await events(page, "page_view")).toHaveLength(1);
  await page.locator('[data-handoff-target="drawio-preview"] a').click();
  await expect(page).toHaveURL(/\/en\/drawio-preview/);
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(2);
  await page.goBack();
  await expect(page).toHaveURL(/\/en\/mermaid-to-drawio/);
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(3);
  const views = await events(page, "page_view");
  expect(views.map((item) => item.page_path)).toEqual(["/en/mermaid-to-drawio", "/en/drawio-preview", "/en/mermaid-to-drawio"]);
  expect(views[1].page_referrer).toBe("http://127.0.0.1:3100/en/mermaid-to-drawio");
  expect(views[2].page_referrer).toBe("http://127.0.0.1:3100/en/drawio-preview");
  expect(JSON.stringify(await page.evaluate(() => (window.dataLayer || []).map((item) => Array.from(item as ArrayLike<unknown>))))).not.toMatch(/PRIVATE_QUERY|PRIVATE_FRAGMENT|#source|\?source/);
  expect((await events(page, "tool_next_step_click"))[0].entry_surface).toBe("workspace_next_step");
});

test("all-failed batch downloads its failure report without any success event", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  const zip = await downloadBatch(page, "not a diagram\n---\nsequenceDiagram\ninvalid syntax");
  expect(Object.keys(zip.files).sort()).toEqual(["README.md", "failures.json"]);
  expect(JSON.parse(await zip.file("failures.json")!.async("string"))).toHaveLength(2);
  expect(await events(page, "tool_conversion_success")).toHaveLength(0);
  expect(await events(page, "tool_export_success")).toHaveLength(0);
  expect((await events(page, "batch_conversion_complete"))[0]).toMatchObject({success: false, success_count: 0, failure_count: 2, render_origin: "user_edit"});
});

test("mixed batch reports actual counts only after a ZIP download is initiated", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  const zip = await downloadBatch(page, "flowchart LR\nA --> B\n---\nnot a diagram");
  expect(zip.file(/\.drawio$/)).toHaveLength(1);
  expect((await events(page, "tool_conversion_success"))[0]).toMatchObject({success: true, success_count: 1, failure_count: 1, item_count: 2});
  expect((await events(page, "tool_export_success"))[0]).toMatchObject({artifact_type: "zip", export_stage: "download_initiated"});
});

test("ZIP creation failure does not count as successful export and allows retry", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await page.evaluate(() => {URL.createObjectURL = () => {throw new Error("blocked blob");};});
  const section = page.locator("section").filter({has: page.getByRole("heading", {name: "Batch conversion beta", exact: true})}).last();
  await section.locator("textarea").fill("flowchart LR\nA --> B");
  await section.getByRole("button", {name: "Generate ZIP", exact: true}).click();
  await expect(section.getByRole("alert")).toBeVisible();
  await expect(section.getByRole("button", {name: "Generate ZIP", exact: true})).toBeEnabled();
  expect(await events(page, "tool_export_success")).toHaveLength(0);
  expect(await events(page, "tool_conversion_success")).toHaveLength(0);
  expect(await events(page, "batch_conversion_error")).toHaveLength(1);
});

test("print invocation and copy failure are separate from successful downloads", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await expect(page.getByText(/Detected flowchart: 4 nodes/)).toBeVisible();
  await page.evaluate(() => {window.print = () => {}; Object.defineProperty(navigator, "clipboard", {value: {writeText: async () => {throw new Error("denied");}}, configurable: true});});
  await page.getByRole("button", {name: "PDF", exact: true}).click();
  await page.getByRole("button", {name: "Copy code", exact: true}).click();
  await expect.poll(async () => (await events(page, "tool_copy_code")).length).toBe(1);
  expect((await events(page, "tool_export_pdf"))[0]).toMatchObject({success: true, export_stage: "print_invoked"});
  expect((await events(page, "tool_copy_code"))[0].success).toBe(false);
  expect(await events(page, "tool_export_success")).toHaveLength(0);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download file", exact: true}).click();
  expect((await pending).suggestedFilename()).toMatch(/\.drawio$/);
  expect((await events(page, "tool_export_success"))[0]).toMatchObject({artifact_type: "drawio", render_origin: "default_sample", export_stage: "download_initiated"});
});

test("AI local fallback is distinguished, default samples excluded, and source downloads are not conversions", async ({page}) => {
  await page.route("**/api/ai/generate-diagram", (route) => route.fulfill({json: {code: "flowchart LR\nStart --> PRIVATE_AI_CONTENT", provider: "local"}}));
  await page.goto("/en/text-to-mermaid");
  await expect(page.getByRole("button", {name: "Generate diagram", exact: true})).toBeVisible();
  expect(await events(page, "tool_render_qualified")).toHaveLength(0);
  await page.locator("textarea").first().fill("PRIVATE_PROMPT");
  await page.getByRole("button", {name: "Generate diagram", exact: true}).click();
  await expect.poll(async () => (await events(page, "ai_generate_success")).length).toBe(1);
  await expect.poll(async () => (await events(page, "tool_render_qualified")).length).toBe(1);
  expect((await events(page, "tool_render_qualified"))[0]).toMatchObject({provider: "local", render_origin: "ai_generated"});
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download file", exact: true}).click();
  expect((await readFile((await (await pending).path())!)).toString()).toContain("PRIVATE_AI_CONTENT");
  expect(await events(page, "tool_conversion_success")).toHaveLength(0);
  expect((await events(page, "tool_export_success"))[0]).toMatchObject({artifact_type: "mermaid", render_origin: "ai_generated", provider: "local"});
  expect(JSON.stringify(await page.evaluate(() => (window.dataLayer || []).map((item) => Array.from(item as ArrayLike<unknown>))))).not.toMatch(/PRIVATE_AI_CONTENT|PRIVATE_PROMPT/);
});


test("AI draft quota failure emits no saved event and stale image exports remain disabled", async ({page}) => {
  await page.addInitScript(() => {Storage.prototype.setItem = () => {throw new DOMException("full", "QuotaExceededError");};});
  await page.route("**/api/ai/generate-diagram", (route) => route.fulfill({json: {code: "flowchart LR\nA --> B", provider: "deepseek"}}));
  await page.goto("/en/text-to-mermaid");
  await page.getByRole("button", {name: "Generate diagram", exact: true}).click();
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeEnabled();
  await page.getByRole("textbox", {name: "Generated Mermaid code", exact: true}).fill("flowchart LR\nA[broken");
  await expect(page.getByRole("button", {name: "SVG", exact: true})).toBeDisabled();
  await expect(page.getByRole("button", {name: "PNG", exact: true})).toBeDisabled();
  // This event proves the edit/render has been processed; wait beyond the draft debounce.
  await expect.poll(async () => (await events(page, "tool_render_error")).length).toBeGreaterThan(0);
  await page.waitForTimeout(800);
  expect(await events(page, "workspace_draft_saved")).toHaveLength(0);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download file", exact: true}).click();
  expect((await readFile((await (await pending).path())!)).toString()).toBe("flowchart LR\nA[broken");
  expect((await events(page, "tool_export_success"))[0]).toMatchObject({render_origin: "user_edit", provider: "none", artifact_type: "mermaid"});
});
