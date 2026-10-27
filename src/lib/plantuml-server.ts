import {PLANTUML_MAX_SOURCE_BYTES, PLANTUML_MAX_SVG_BYTES, PLANTUML_TIMEOUT_MS, validatePlantUmlSource} from "./plantuml-limits";
import {plantUmlSvgUrl} from "./renderers/plantuml";

export class PlantUmlError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = "PlantUmlError";
  }
}

/** Bound both JSON uploads and streamed upstream bodies before allocating their full contents. */
export async function readBoundedText(body: ReadableStream<Uint8Array> | null, maxBytes: number, tooLarge: PlantUmlError) {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", {fatal: true});
  let text = "";
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return text + decoder.decode();
      size += chunk.value.byteLength;
      if (size > maxBytes) {
        throw tooLarge;
      }
      text += decoder.decode(chunk.value, {stream: true});
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

type RenderOptions = {
  signal?: AbortSignal;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export async function fetchPlantUmlSvg(source: string, {signal, fetcher = fetch, timeoutMs = PLANTUML_TIMEOUT_MS}: RenderOptions = {}) {
  try {
    validatePlantUmlSource(source);
  } catch (error) {
    const tooLarge = new TextEncoder().encode(source).byteLength > PLANTUML_MAX_SOURCE_BYTES;
    throw new PlantUmlError(tooLarge ? "INPUT_TOO_LARGE" : "INVALID_SOURCE", (error as Error).message, tooLarge ? 413 : 400);
  }
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, {once: true});
  const timer = setTimeout(() => {timedOut = true; controller.abort();}, timeoutMs);
  try {
    const response = await fetcher(plantUmlSvgUrl(source), {
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
      headers: {accept: "image/svg+xml"}
    });
    // PlantUML exposes syntax errors in headers, including on some HTTP-200 responses.
    if (response.headers.has("x-plantuml-diagram-error") || response.headers.get("x-plantuml-diagram-description")?.trim() === "(Error)" || response.status === 400) {
      await response.body?.cancel();
      throw new PlantUmlError("INVALID_SOURCE", "PlantUML could not render this source. Check syntax, includes, and diagram type, then try again.", 400);
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new PlantUmlError("UPSTREAM_FAILURE", "The public PlantUML service is unavailable. Try rendering again.", 502);
    }
    if (!/^image\/svg\+xml(?:\s*;|\s*$)/i.test(response.headers.get("content-type") || "")) {
      await response.body?.cancel();
      throw new PlantUmlError("INVALID_RESPONSE", "The PlantUML service did not return an SVG image. Try again.", 502);
    }
    const tooLarge = new PlantUmlError("RESPONSE_TOO_LARGE", "The rendered diagram exceeds the 2 MiB limit. Split the source into smaller diagrams.", 502);
    if (Number(response.headers.get("content-length")) > PLANTUML_MAX_SVG_BYTES) {
      await response.body?.cancel();
      throw tooLarge;
    }
    const svg = await readBoundedText(response.body, PLANTUML_MAX_SVG_BYTES, tooLarge);
    if (!/<svg[\s>]/i.test(svg) || /<!DOCTYPE|<!ENTITY/i.test(svg)) {
      throw new PlantUmlError("INVALID_RESPONSE", "The PlantUML service returned an invalid SVG image. Try again.", 502);
    }
    return svg;
  } catch (error) {
    if (timedOut) throw new PlantUmlError("RENDER_TIMEOUT", "PlantUML rendering timed out. Try again or use a smaller diagram.", 504);
    if (signal?.aborted) throw new PlantUmlError("REQUEST_ABORTED", "The render request was cancelled.", 499);
    if (error instanceof PlantUmlError) throw error;
    throw new PlantUmlError("UPSTREAM_FAILURE", "Unable to reach the public PlantUML service. Try again.", 502);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
