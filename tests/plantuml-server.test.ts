import assert from "node:assert/strict";
import test from "node:test";
import {POST} from "../src/app/api/tools/plantuml/route";
import {PLANTUML_MAX_SOURCE_BYTES, PLANTUML_MAX_SVG_BYTES} from "../src/lib/plantuml-limits";
import {fetchPlantUmlSvg, PlantUmlError, readBoundedText} from "../src/lib/plantuml-server";

const source = "@startuml\nAlice -> Bob: ping\n@enduml";
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80"/><text x="10" y="30">ping</text></svg>';
const svgResponse = () => new Response(svg, {headers: {"content-type": "image/svg+xml"}});
const rejectsWith = (code: string, status: number) => (error: unknown) => error instanceof PlantUmlError && error.code === code && error.status === status;

test("PlantUML uses only the fixed upstream, without caching or redirects", async () => {
  let calls = 0;
  const result = await fetchPlantUmlSvg(source, {fetcher: async (url, options) => {
    calls++;
    assert.match(String(url), /^https:\/\/www\.plantuml\.com\/plantuml\/svg\/[\w-]+$/);
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal instanceof AbortSignal);
    return svgResponse();
  }});
  assert.equal(calls, 1);
  assert.equal(result, svg);
});

test("invalid, multiple and oversized sources fail before contacting the renderer", async () => {
  const options = {fetcher: async () => {throw new Error("must not call upstream");}};
  await assert.rejects(fetchPlantUmlSvg("Alice -> Bob", options), rejectsWith("INVALID_SOURCE", 400));
  await assert.rejects(fetchPlantUmlSvg(source + "\n" + source, options), rejectsWith("INVALID_SOURCE", 400));
  await assert.rejects(fetchPlantUmlSvg("@startuml\n" + "中".repeat(PLANTUML_MAX_SOURCE_BYTES / 2) + "\n@enduml", options), rejectsWith("INPUT_TOO_LARGE", 413));
});

test("syntax error headers reject even HTTP-200 error images without reflecting upstream text", async () => {
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response(svg, {headers: {
    "content-type": "image/svg+xml", "x-plantuml-diagram-error": "private-source-snippet"
  }})}), (error: unknown) => rejectsWith("INVALID_SOURCE", 400)(error) && !(error as Error).message.includes("private-source-snippet"));
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response(svg, {status: 400})}), rejectsWith("INVALID_SOURCE", 400));
});

test("renderer failures and non-SVG responses return a controlled gateway error", async () => {
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response("secret error", {status: 503})}), rejectsWith("UPSTREAM_FAILURE", 502));
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response("<html>gateway</html>", {headers: {"content-type": "text/html"}})}), rejectsWith("INVALID_RESPONSE", 502));
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response("not SVG", {headers: {"content-type": "image/svg+xml"}})}), rejectsWith("INVALID_RESPONSE", 502));
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => {throw new Error("internal-host-or-source");}}), rejectsWith("UPSTREAM_FAILURE", 502));
});

test("renderer timeout and client cancellation abort the upstream request", async () => {
  const waitingFetch: typeof fetch = async (_url, options) => new Promise((_resolve, reject) => {
    if (options?.signal?.aborted) {reject(new DOMException("aborted", "AbortError")); return;}
    options?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), {once: true});
  });
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: waitingFetch, timeoutMs: 10}), rejectsWith("RENDER_TIMEOUT", 504));
  const controller = new AbortController();
  const pending = fetchPlantUmlSvg(source, {fetcher: waitingFetch, signal: controller.signal});
  controller.abort();
  await assert.rejects(pending, rejectsWith("REQUEST_ABORTED", 499));
});

test("timeout applies while reading the response body, not just until headers", async () => {
  await assert.rejects(fetchPlantUmlSvg(source, {timeoutMs: 10, fetcher: async (_url, options) => {
    return new Response(new ReadableStream({start(controller) {
      options?.signal?.addEventListener("abort", () => controller.error(new DOMException("aborted", "AbortError")), {once: true});
    }}), {headers: {"content-type": "image/svg+xml"}});
  }}), rejectsWith("RENDER_TIMEOUT", 504));
});

test("oversized declared and chunked upstream responses stop before returning SVG", async () => {
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response(svg, {headers: {
    "content-type": "image/svg+xml", "content-length": String(PLANTUML_MAX_SVG_BYTES + 1)
  }})}), rejectsWith("RESPONSE_TOO_LARGE", 502));
  let cancelled = false;
  const body = new ReadableStream({start(controller) {controller.enqueue(new Uint8Array(PLANTUML_MAX_SVG_BYTES + 1));}, cancel() {cancelled = true;}});
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response(body, {headers: {"content-type": "image/svg+xml"}})}), rejectsWith("RESPONSE_TOO_LARGE", 502));
  assert.equal(cancelled, true);
});

test("DOCTYPEs and entities are rejected before SVG reaches the browser", async () => {
  await assert.rejects(fetchPlantUmlSvg(source, {fetcher: async () => new Response('<!DOCTYPE svg [<!ENTITY remote SYSTEM "https://example.com">]>' + svg, {headers: {"content-type": "image/svg+xml"}})}), rejectsWith("INVALID_RESPONSE", 502));
});

test("bounded reading preserves split UTF-8 characters and enforces actual bytes", async () => {
  const bytes = new TextEncoder().encode("中A");
  const stream = new ReadableStream({start(controller) {controller.enqueue(bytes.slice(0, 1)); controller.enqueue(bytes.slice(1)); controller.close();}});
  assert.equal(await readBoundedText(stream, 4, new PlantUmlError("TOO_BIG", "too large", 413)), "中A");
});

test("HTTP endpoint rejects malformed JSON and invalid field types without caching", async () => {
  for (const body of ["{", "null", '"source"', '{}', '{"source":123}']) {
    const result = await POST(new Request("https://diagrampreview.com/api/tools/plantuml", {method: "POST", body}));
    assert.equal(result.status, 400);
    assert.equal(result.headers.get("cache-control"), "no-store");
    assert.equal((await result.json()).code, "INVALID_REQUEST");
  }
});

test("HTTP upload limit applies to undeclared streams as well as content-length", async () => {
  for (const declared of [false, true]) {
    const result = await POST(new Request("https://diagrampreview.com/api/tools/plantuml", {
      method: "POST", body: "x".repeat(PLANTUML_MAX_SOURCE_BYTES + 1),
      headers: declared ? {"content-length": String(PLANTUML_MAX_SOURCE_BYTES + 1)} : {}
    }));
    assert.equal(result.status, 413);
    assert.equal((await result.json()).code, "INPUT_TOO_LARGE");
  }
});

test("HTTP endpoint returns only SVG JSON and ignores arbitrary renderer URL fields", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: unknown) => {
    assert.ok(String(url).startsWith("https://www.plantuml.com/plantuml/svg/"));
    return svgResponse();
  });
  const response = await POST(new Request("https://diagrampreview.com/api/tools/plantuml", {
    method: "POST", body: JSON.stringify({source, rendererUrl: "http://127.0.0.1/private"})
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(await response.json(), {svg});
});
