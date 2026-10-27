import {readFile} from "node:fs/promises";
import {expect, test} from "./fixtures";
import {evidenceFamilies, evidencePages} from "../../src/config/tool-evidence";

for (const entry of evidencePages) {
  test(`${entry.locale}/${entry.slug} loads all three evidence cases into the workspace`, async ({page}) => {
    const family = evidenceFamilies[entry.family];
    if (entry.family === "plantuml") await page.route("**/api/tools/plantuml", async (route) => {
      const source = route.request().postDataJSON().source;
      const example = evidenceFamilies.plantuml.cases.find((item) => item.source === source);
      if (example?.id === "failure") return route.fulfill({status:400,json:{code:"INVALID_SOURCE",error:"PlantUML could not render this source."}});
      const svg = await readFile(`public/examples/plantuml/${example?.id ?? "minimal"}.svg`, "utf8");
      return route.fulfill({json:{svg}});
    });
    await page.goto(`/${entry.locale}/${entry.slug}`);
    const evidence = page.locator("[data-tool-evidence]");
    await expect(evidence).toHaveCount(1);
    for (const example of family.cases) {
      const section = evidence.locator(`[data-evidence-case="${example.id}"]`);
      const load = section.locator('a[href*="#source="]');
      await load.click();
      await expect(page.locator("textarea").first()).toHaveValue(example.source);
      const svg = page.getByRole("button", {name:"SVG",exact:true});
      if (example.id === "failure") {
        await expect(svg).toBeDisabled();
        await expect(page.locator("[data-tool-workspace]")).toContainText(entry.family === "drawio" ? /unsupported|不支持|no compatibles/ : /Unsupported|不支持|could not render|PlantUML/);
        await expect(section.locator("img")).toHaveCount(0);
      } else {
        await expect(svg).toBeEnabled();
        await expect(section.locator("img")).toBeVisible();
        expect(await section.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
        for (const link of await section.locator("a[download]").all()) {
          const response = await page.request.get((await link.getAttribute("href"))!);
          expect(response.status()).toBe(200);
        }
      }
    }
  });
}

test("same-page examples and browser Back restore exact source without a reload", async ({page}) => {
  await page.goto("/en/mermaid-to-drawio");
  const input = page.locator("textarea").first();
  await page.locator('[data-evidence-case="minimal"] a[href*="#source="]').click();
  await expect(input).toHaveValue(evidenceFamilies.mermaid.cases[0].source);
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).get("source")).toBe(evidenceFamilies.mermaid.cases[0].source);
  await page.locator('[data-evidence-case="business"] a[href*="#source="]').click();
  await expect(input).toHaveValue(evidenceFamilies.mermaid.cases[1].source);
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).get("source")).toBe(evidenceFamilies.mermaid.cases[1].source);
  await page.goBack();
  await expect(input).toHaveValue(evidenceFamilies.mermaid.cases[0].source);
});

for (const locale of ["en", "zh-CN"]) {
  test(`${locale} homepage prioritizes three direct tasks and retains tool search`, async ({page}) => {
    await page.goto(`/${locale}`);
    const tasks = page.locator("[data-home-tasks]");
    const links = tasks.locator("div > a");
    expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")))).toEqual([`/${locale}/mermaid-to-drawio`,`/${locale}/drawio-preview`,`/${locale}/plantuml-preview`]);
    await expect(page.locator("input").first()).toBeVisible();
    if (locale === "zh-CN") await expect(tasks.locator('a[href="/zh-CN/d2-preview"]')).toBeVisible();
    await page.locator("input").first().fill("Graphviz");
    await expect(page.locator('a[href$="/graphviz-preview"]').first()).toBeVisible();
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("page-level hreflang points only to equivalent indexable pages and links back", async ({page}) => {
  for (const [path, languages] of [
    ["/en/workflows", ["en","x-default"]],
    ["/en/workflows/open-drawio-file-online", ["en","x-default"]],
    ["/en/templates", ["en","x-default"]],
    ["/en/blog", ["en","zh-CN","x-default"]],
    ["/en/blog/plantuml-to-drawio-editable-diagram", ["en","zh-CN","x-default"]],
    ["/en/blog/figma-specs-guide", ["en","zh-CN","x-default"]],
    ["/en/plantuml-preview", ["en","zh-CN","es","de","fr","x-default"]]
  ] as const) {
    await page.goto(path);
    const actual = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) => links.map((link) => [link.getAttribute("hreflang")!, link.getAttribute("href")!]));
    expect(actual.map(([language])=>language).sort(),path).toEqual([...languages].sort());
    for (const [language,href] of actual) {
      const alternate = await page.request.get(new URL(href).pathname);
      expect(alternate.status()).toBe(200);
      const html = await alternate.text();
      expect(html).toContain(`rel="canonical" href="${href}"`);
      expect(html).not.toContain('content="noindex, follow"');
      if (language !== "x-default") expect(html).toContain(`hrefLang="en" href="https://diagrampreview.com${path}"`);
    }
  }
  for (const path of ["/es/blog/figma-specs-guide", "/zh-CN/templates", "/fr/workflows/open-drawio-file-online", "/en/blog/jsonpath-tester-api-response-debugging"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  }
});

test("original PlantUML tutorial includes reproducible files, actual screenshot and failure boundaries", async ({page}) => {
  await page.goto("/en/blog/plantuml-to-drawio-editable-diagram");
  await expect(page.locator("h1")).toHaveText("How to convert PlantUML to editable draw.io diagrams");
  await expect(page.locator('[data-tool-evidence="plantuml-conversion"]')).toBeVisible();
  await expect(page.locator('img[src="/blog/demos/plantuml-conversion-verified.png"]')).toBeVisible();
  await expect(page.getByRole("heading", {name:"Inspect and edit in diagrams.net"})).toBeVisible();
  await expect(page.getByText(/Sequence timing, class members, themes/)).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
