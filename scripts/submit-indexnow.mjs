const indexNowKey = process.env.INDEXNOW_KEY || "ff1111e644870356fea144c36ac4ee7d";
const siteUrl = normalizeSiteUrl(process.env.SITE_URL || "https://diagrampreview.com");
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://www.bing.com/indexnow";
const dryRun = process.argv.includes("--dry-run");
const explicitUrls = process.argv.slice(2).filter((value) => value.startsWith("http"));

const urlList = explicitUrls.length ? explicitUrls : await loadSitemapUrls(`${siteUrl}/sitemap.xml`);

if (!urlList.length) {
  throw new Error("No URLs found to submit to IndexNow.");
}

for (const batch of chunk(urlList, 10000)) {
  if (dryRun) {
    console.log(`Dry run: would submit ${batch.length} URL(s) to ${endpoint}`);
    console.log(JSON.stringify(batch.slice(0, 10), null, 2));
    continue;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json; charset=utf-8"},
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key: indexNowKey,
      keyLocation: `${siteUrl}/${indexNowKey}.txt`,
      urlList: batch
    })
  });

  if (!response.ok && response.status !== 202) {
    const body = await response.text();
    throw new Error(`IndexNow submission failed: ${response.status} ${body}`);
  }

  console.log(`Submitted ${batch.length} URL(s) to ${endpoint}: ${response.status}`);
}

async function loadSitemapUrls(sitemapUrl) {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Unable to load sitemap: ${response.status} ${sitemapUrl}`);
  }

  const xml = await response.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function normalizeSiteUrl(value) {
  return value.replace(/\/$/, "");
}

function chunk(values, size) {
  const batches = [];
  for (let index = 0; index < values.length; index += size) {
    batches.push(values.slice(index, index + size));
  }
  return batches;
}
