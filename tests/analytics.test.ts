import assert from "node:assert/strict";
import {test} from "node:test";
import {recordRecentTool} from "../src/lib/recent-tools";
import {trackEvent, trackPageView} from "../src/lib/analytics";
import {sanitizedAnalyticsLocation, sanitizedAnalyticsReferrer} from "../src/lib/analytics-location";

test("campaign order is stable and referrers exclude all query and fragment content", () => {
  assert.equal(sanitizedAnalyticsLocation("https://diagrampreview.com/en?utm_medium=cpc&utm_source=bing#source=private"), sanitizedAnalyticsLocation("https://diagrampreview.com/en?utm_source=bing&utm_medium=cpc"));
  assert.equal(sanitizedAnalyticsReferrer("https://google.com/search?q=private#source=private"), "https://google.com/search");
  assert.equal(sanitizedAnalyticsReferrer("not-a-url"), "");
  assert.equal(sanitizedAnalyticsReferrer("javascript:private"), "");
});

test("early events queue in order, retain route context, deduplicate views, and tolerate tag failure", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const browser = {location: {href: "https://diagrampreview.com/en?source=private&utm_source=bing#source=private"}} as Window;
  Object.defineProperty(globalThis, "window", {value: browser, configurable: true});
  Object.defineProperty(globalThis, "document", {value: {referrer: "https://www.bing.com/search?q=private", title: "DiagramPreview"}, configurable: true});
  try {
    trackEvent("tool_open", {tool_slug: "mermaid-preview", source: "private", prompt: "private", filename: "private", page_location: "private"});
    trackPageView();
    browser.location.href = "https://diagrampreview.com/en?source=another&utm_source=bing#source=another";
    trackPageView();
    browser.location.href = "https://diagrampreview.com/en/mermaid-preview#source=private";
    trackEvent("tool_export_success", {tool_slug: "mermaid-preview", artifact_type: "svg"});
    browser.location.href = "https://diagrampreview.com/en?utm_source=bing";
    trackPageView();
    const queue = browser.dataLayer!.map((entry) => Array.from(entry as ArrayLike<unknown>));
    assert.equal(queue.filter((entry) => entry[0] === "config").length, 1);
    assert.deepEqual(queue.filter((entry) => entry[0] === "event").map((entry) => entry[1]), ["page_view", "tool_open", "page_view", "tool_export_success", "page_view"]);
    const events = queue.filter((entry) => entry[0] === "event").map((entry) => entry[2] as Record<string, unknown>);
    assert.equal(events[1].page_location, "https://diagrampreview.com/en?utm_source=bing");
    assert.equal(events[2].page_referrer, "https://diagrampreview.com/en?utm_source=bing");
    assert.equal(events[4].page_referrer, "https://diagrampreview.com/en/mermaid-preview");
    assert.doesNotMatch(JSON.stringify(queue), /private|another/);
    browser.gtag = () => {throw new Error("blocked tag");};
    assert.doesNotThrow(() => trackEvent("tool_export_success", {tool_slug: "mermaid-preview"}));
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow); else Reflect.deleteProperty(globalThis, "window");
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});


test("full optional recent-history storage does not crash tool startup", () => {
  const storage = {getItem: () => null, setItem: () => {throw new Error("quota");}} as unknown as Storage;
  assert.doesNotThrow(() => recordRecentTool(storage, "text-to-mermaid"));
});
