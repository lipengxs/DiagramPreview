import fs from "node:fs/promises";

const submissionTargets = {
  en: [
    "text-to-mermaid",
    "mermaid-preview",
    "mermaid-to-drawio",
    "plantuml-to-drawio",
    "drawio-preview",
    "openapi-to-sequence",
    "api-error-flow-diagram",
    "json-schema-visualizer",
    "json-schema-form-preview",
    "protobuf-schema-visualizer"
  ],
  "zh-CN": ["text-to-mermaid", "mermaid-preview", "mermaid-to-drawio", "drawio-preview", "openapi-to-sequence", "json-schema-visualizer"],
  es: ["protobuf-schema-visualizer"],
  fr: ["openapi-to-sequence"],
  de: ["drawio-preview"]
};
const failures = [];

for (const [locale, slugs] of Object.entries(submissionTargets)) {
  const messages = JSON.parse(await fs.readFile(new URL(`../src/messages/${locale}.json`, import.meta.url), "utf8"));
  for (const slug of slugs) {
    const content = messages.tools?.[slug];
    if (!content) {
      failures.push(`${locale}/${slug}: missing tool messages`);
      continue;
    }
    checkCount(locale, slug, "samples", Object.keys(content.samples || {}).length, 3);
    checkCount(locale, slug, "faq", content.faq?.length || 0, 3);
    checkCount(locale, slug, "howToUse", content.howToUse?.length || 0, 3);
    checkCount(locale, slug, "seoBody", content.seoBody?.length || 0, 3);
    checkCount(locale, slug, "deepDives", content.deepDives?.length || 0, 1);
  }
}

if (failures.length) {
  console.error(`Core content audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Core content audit passed: every submitted tool has samples, FAQ, guidance, SEO body, and a tool-specific deep dive.");

function checkCount(locale, slug, field, actual, minimum) {
  if (actual < minimum) failures.push(`${locale}/${slug}: ${field} requires ${minimum}, found ${actual}`);
}
