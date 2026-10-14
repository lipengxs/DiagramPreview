import {expect, test} from "@playwright/test";

const pages = [
  {
    path: "/en",
    title: "Diagram Preview Tools - Mermaid, PlantUML, Markdown, Graphviz Online",
    h1: "Diagram Preview Tools for Developers"
  },
  {
    path: "/en/mermaid-to-drawio",
    title: "Mermaid to Draw.io Converter - Export Editable diagrams.net XML",
    h1: "Mermaid to Draw.io"
  },
  {
    path: "/en/plantuml-preview",
    title: "PlantUML Preview Online - PlantUML Editor and Viewer",
    h1: "PlantUML Preview"
  }
];

for (const pageCase of pages) {
  test(`${pageCase.path} keeps frozen SEO metadata`, async ({page}) => {
    await page.goto(pageCase.path);
    await expect(page).toHaveTitle(pageCase.title);
    await expect(page.locator("h1")).toHaveText(pageCase.h1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://diagrampreview.com${pageCase.path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
  });
}

test("Mermaid conversion exposes conversion evidence", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await expect(page.getByText(/Detected flowchart: 4 nodes, 3 relationships/)).toBeVisible();
});

test("qualified rendering excludes the default sample and fires once after editing", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  await expect(page.getByText(/Detected flowchart: 4 nodes, 3 relationships/)).toBeVisible();

  const countEvents = () => page.evaluate(() =>
    ((window as Window & {dataLayer?: unknown[]}).dataLayer || []).filter((entry: unknown) => Array.from(entry as ArrayLike<unknown>)[1] === "tool_render_qualified").length
  );

  expect(await countEvents()).toBe(0);
  await page.locator("textarea").first().fill("flowchart LR\n  Browser --> API\n  API --> DB");
  await expect(page.getByText(/Detected flowchart: 3 nodes, 2 relationships/)).toBeVisible();
  await expect.poll(countEvents).toBe(1);
});

test("manual page views remove diagram source", async ({page}) => {
  await page.goto("/en/mermaid-preview?source=private-query&utm_source=qa#source=private-fragment");
  const pageView = await page.waitForFunction(() => {
    const entry = ((window as Window & {dataLayer?: unknown[]}).dataLayer || []).find((item: unknown) => Array.from(item as ArrayLike<unknown>)[1] === "page_view");
    return entry ? Array.from(entry as ArrayLike<unknown>) : undefined;
  });
  const values = await pageView.jsonValue() as unknown[];
  const params = values[2] as {page_location: string};

  expect(params.page_location).toBe("http://127.0.0.1:3100/en/mermaid-preview?utm_source=qa");
  expect(JSON.stringify(values)).not.toContain("private-query");
  expect(JSON.stringify(values)).not.toContain("private-fragment");
});

test("core pages do not overflow at 390px", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  for (const pageCase of pages) {
    await page.goto(pageCase.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, pageCase.path).toBeLessThanOrEqual(1);
  }
});
