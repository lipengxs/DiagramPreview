import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const [gscPerformancePath, bingPerformancePath, gscCoveragePath] = process.argv.slice(2);
if (!gscPerformancePath || !bingPerformancePath) {
  console.error("Usage: npm run seo:report -- <gsc-performance.zip> <bing-performance.csv> [gsc-coverage.zip]");
  process.exit(1);
}

const gsc = await readGscPerformance(gscPerformancePath);
const bing = await readBingPerformance(bingPerformancePath);
const coverage = gscCoveragePath ? await readGscCoverage(gscCoveragePath) : undefined;
const reportDate = latestDate([...gsc.chart, ...bing.chart]);
const outputPath = path.resolve("reports", "seo", `${reportDate}.md`);

const gscLast7 = aggregate(gsc.chart.slice(-7));
const gscPrior7 = aggregate(gsc.chart.slice(-14, -7));
const gscLast28 = aggregate(gsc.chart.slice(-28));
const gscPrior28 = aggregate(gsc.chart.slice(-56, -28));
const bingLast7 = aggregate(bing.chart.slice(-7));
const bingPrior7 = aggregate(bing.chart.slice(-14, -7));
const bingLast28 = aggregate(bing.chart.slice(-28));
const bingPrior28 = aggregate(bing.chart.slice(-56, -28));
const pageImpressions = gsc.pages.reduce((sum, row) => sum + number(row.Impressions), 0);
const homeImpressions = gsc.pages.filter((row) => /^https:\/\/diagrampreview\.com\/(?:en)?\/?$/.test(row["Top pages"])).reduce((sum, row) => sum + number(row.Impressions), 0);
const opportunities = gsc.pages
  .filter((row) => isIndexableReportUrl(row["Top pages"]) && number(row.Position) >= 4 && number(row.Position) <= 20)
  .sort((a, b) => number(b.Impressions) - number(a.Impressions));
const historicalNoindexPages = gsc.pages.filter((row) => isHistoricalNoindexUrl(row["Top pages"]));
const zeroClickPages = gsc.pages
  .filter((row) => number(row.Clicks) === 0 && number(row.Impressions) > 0)
  .sort((a, b) => number(b.Impressions) - number(a.Impressions));

const lines = [
  `# DiagramPreview SEO 周报 ${reportDate}`,
  "",
  `数据范围：Google ${gsc.chart[0]?.date ?? "N/A"} 至 ${gsc.chart.at(-1)?.date ?? "N/A"}；Bing ${bing.chart[0]?.date ?? "N/A"} 至 ${bing.chart.at(-1)?.date ?? "N/A"}。`,
  "",
  "## 搜索表现",
  "",
  "| 搜索引擎 | 周期 | 点击 | 曝光 | CTR | 点击环比 | 曝光环比 |",
  "| --- | --- | ---: | ---: | ---: | ---: | ---: |",
  metricRow("Google", "最近 7 天", gscLast7, gscPrior7),
  metricRow("Google", "最近 28 天", gscLast28, gscPrior28),
  metricRow("Bing", "最近 7 天", bingLast7, bingPrior7),
  metricRow("Bing", "最近 28 天", bingLast28, bingPrior28),
  "",
  "## 页面分布",
  "",
  `- 首页曝光占页面报表的 ${percent(homeImpressions, pageImpressions)}；非首页占 ${percent(pageImpressions - homeImpressions, pageImpressions)}。`,
  `- Google 有曝光无点击页面：${zeroClickPages.length} 个。`,
  `- Google 平均排名 4–20 的机会页面：${opportunities.length} 个。`,
  `- 历史 noindex 小语种仍有曝光：${historicalNoindexPages.length} 个页面；仅监控，不据此开放整个语言目录。`,
  "",
  "### 排名机会页",
  "",
  "| URL | 范围 | 点击 | 曝光 | CTR | 平均排名 |",
  "| --- | --- | ---: | ---: | ---: | ---: |",
  ...tableRows(opportunities.slice(0, 15)),
  "",
  "### 高曝光无点击页",
  "",
  "| URL | 曝光 | 平均排名 |",
  "| --- | ---: | ---: |",
  ...zeroClickPages.slice(0, 15).map((row) => `| ${row["Top pages"]} | ${row.Impressions} | ${row.Position} |`)
];

if (coverage) {
  lines.push(
    "",
    "## Google 索引覆盖",
    "",
    `- 最新快照：已索引 ${coverage.latest.Indexed || 0}，未索引 ${coverage.latest["Not indexed"] || 0}。`,
    ...coverage.issues.map((row) => `- ${row.Reason}：${row.Pages} 页；验证状态：${row.Validation}。`)
  );
}

lines.push(
  "",
  "## 本周动作",
  "",
  "1. 先处理核心白名单中有曝光、排名 4–20 或已抓取未索引的页面。",
  "2. 每批只请求索引 5–10 个已经完成内容和内链检查的 URL。",
  "3. 不因单次曝光开放整个小语种目录。",
  "4. 保持 title、description、H1 和 canonical 冻结，直到满足标题实验阈值。",
  ""
);

await fs.mkdir(path.dirname(outputPath), {recursive: true});
await fs.writeFile(outputPath, lines.join("\n"), "utf8");
console.log(outputPath);

async function readGscPerformance(filePath) {
  const zip = await JSZip.loadAsync(await fs.readFile(filePath));
  return {
    chart: normalizeChart(parseCsv(await readZipEntry(zip, "Chart.csv"))),
    pages: parseCsv(await readZipEntry(zip, "Pages.csv")),
    queries: parseCsv(await readZipEntry(zip, "Queries.csv"))
  };
}

async function readGscCoverage(filePath) {
  const zip = await JSZip.loadAsync(await fs.readFile(filePath));
  const chart = parseCsv(await readZipEntry(zip, "Chart.csv"));
  return {latest: chart.at(-1) || {}, issues: parseCsv(await readZipEntry(zip, "Critical issues.csv"))};
}

async function readBingPerformance(filePath) {
  const rows = parseCsv((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, ""));
  return {chart: normalizeChart(rows)};
}

async function readZipEntry(zip, name) {
  const entry = zip.file(name);
  if (!entry) throw new Error(`${name} is missing from the archive`);
  return (await entry.async("string")).replace(/^\uFEFF/, "");
}

function normalizeChart(rows) {
  return rows.map((row) => ({
    date: normalizeDate(row.Date),
    clicks: number(row.Clicks),
    impressions: number(row.Impressions)
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function aggregate(rows) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return {clicks, impressions, ctr: impressions ? clicks / impressions : 0};
}

function metricRow(engine, period, current, prior) {
  return `| ${engine} | ${period} | ${current.clicks} | ${current.impressions} | ${(current.ctr * 100).toFixed(2)}% | ${change(current.clicks, prior.clicks)} | ${change(current.impressions, prior.impressions)} |`;
}

function tableRows(rows) {
  return rows.length
    ? rows.map((row) => `| ${row["Top pages"]} | ${isCoreOpportunity(row["Top pages"]) ? "核心" : "非核心监控"} | ${row.Clicks} | ${row.Impressions} | ${row.CTR} | ${row.Position} |`)
    : ["| 暂无 | - | 0 | 0 | 0% | - |"]; 
}

function change(current, prior) {
  if (!prior) return current ? "新增" : "0.0%";
  const value = ((current - prior) / prior) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function percent(value, total) {
  return total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
}

function latestDate(rows) {
  return rows.map((row) => row.date).filter(Boolean).sort().at(-1) || new Date().toISOString().slice(0, 10);
}

function number(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[% ,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  const input = String(value || "");
  const isoMatch = input.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  const usMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : date.toISOString().slice(0, 10);
}

function isIndexableReportUrl(value) {
  const pathname = new URL(value).pathname;
  return /^\/(en|zh-CN|es|de|fr)(\/|$)/.test(pathname);
}

function isHistoricalNoindexUrl(value) {
  const pathname = new URL(value).pathname;
  return /^\/(pt|ru|ja|ko|zh-TW)(\/|$)/.test(pathname);
}

function isCoreOpportunity(value) {
  const pathname = new URL(value).pathname;
  return pathname === "/en/text-to-mermaid" || pathname === "/es/protobuf-schema-visualizer" || pathname === "/fr/openapi-to-sequence" || pathname === "/de/drawio-preview" || pathname === "/zh-CN/drawio-preview";
}

function parseCsv(text) {
  const records = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value !== "")) records.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    records.push(row);
  }
  const [headers = [], ...values] = records;
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}
