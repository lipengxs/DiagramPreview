import DOMPurify from "dompurify";
import {PLANTUML_MAX_SOURCE_BYTES, PLANTUML_MAX_SVG_BYTES, PLANTUML_TIMEOUT_MS, validatePlantUmlSource} from "../plantuml-limits";

export class PlantUmlClientError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "PlantUmlClientError";
  }
}

export async function renderPlantUml(source: string, signal?: AbortSignal) {
  try {validatePlantUmlSource(source);} catch (error) {
    throw new PlantUmlClientError(new TextEncoder().encode(source).byteLength > PLANTUML_MAX_SOURCE_BYTES ? "INPUT_TOO_LARGE" : "INVALID_SOURCE", (error as Error).message);
  }
  const body = JSON.stringify({source});
  if (new TextEncoder().encode(body).byteLength > PLANTUML_MAX_SOURCE_BYTES) {
    throw new PlantUmlClientError("INPUT_TOO_LARGE", "The PlantUML request exceeds the 64 KiB limit. Split the diagram and try again.");
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, {once: true});
  let timedOut = false;
  const timer = setTimeout(() => {timedOut = true; controller.abort();}, PLANTUML_TIMEOUT_MS + 2_000);
  try {
    const response = await fetch("/api/tools/plantuml", {
      method: "POST", headers: {"content-type": "application/json"},
      body, cache: "no-store", signal: controller.signal
    });
    const data = await response.json().catch(() => null) as {svg?: unknown; error?: unknown; code?: unknown} | null;
    if (!response.ok) {
      throw new PlantUmlClientError(typeof data?.code === "string" ? data.code : "UPSTREAM_FAILURE", typeof data?.error === "string" ? data.error : "PlantUML rendering failed. Try again.");
    }
    if (typeof data?.svg !== "string") throw new PlantUmlClientError("INVALID_RESPONSE", "The renderer did not return an SVG image.");
    return sanitizePlantUmlSvg(data.svg);
  } catch (error) {
    if (timedOut) throw new PlantUmlClientError("RENDER_TIMEOUT", "PlantUML rendering timed out. Try again or use a smaller diagram.");
    if (signal?.aborted) throw error;
    if (error instanceof PlantUmlClientError) throw error;
    throw new PlantUmlClientError("UPSTREAM_FAILURE", "Unable to reach the PlantUML renderer. Try again.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

/** Standalone SVGs must not execute code or fetch external resources when previewed/exported. */
export function sanitizePlantUmlSvg(svg: string) {
  const invalid = () => new PlantUmlClientError("INVALID_RESPONSE", "The renderer returned an invalid or unsupported SVG image.");
  if (new TextEncoder().encode(svg).byteLength > PLANTUML_MAX_SVG_BYTES || /<!DOCTYPE|<!ENTITY/i.test(svg)) throw invalid();
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (parsed.querySelector("parsererror") || parsed.documentElement.localName !== "svg" || parsed.documentElement.namespaceURI !== "http://www.w3.org/2000/svg") throw invalid();
  const clean = DOMPurify.sanitize(svg, {
    USE_PROFILES: {svg: true, svgFilters: true},
    FORBID_TAGS: ["style", "foreignObject", "image", "a", "use", "feImage", "animate", "animateMotion", "animateTransform", "set"],
    ADD_ATTR: ["textLength", "lengthAdjust"]
  });
  const document = new DOMParser().parseFromString(clean, "image/svg+xml");
  if (document.querySelector("parsererror") || document.documentElement.localName !== "svg") throw invalid();
  for (const element of document.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase() === "xml:base" ||
          (resourceAttributes.has(attribute.name) && /\\/.test(attribute.value)) ||
          (/(?:^|:)href$/i.test(attribute.name) && !/^#[\w:.-]+$/.test(attribute.value)) ||
          (/url\s*\(/i.test(attribute.value) && attribute.name !== "style" && !/^url\(\s*["']?#[\w:.-]+["']?\s*\)$/i.test(attribute.value))) {
        element.removeAttributeNode(attribute);
      }
    }
    if (element.hasAttribute("style")) {
      const style = document.createElementNS("http://www.w3.org/2000/svg", "g").style;
      style.cssText = element.getAttribute("style") || "";
      const safe = document.createElementNS("http://www.w3.org/2000/svg", "g").style;
      for (const property of safeStyleProperties) {
        const value = style.getPropertyValue(property);
        if (value && !/url|expression|@|\\/i.test(value)) safe.setProperty(property, value);
      }
      if (safe.cssText) element.setAttribute("style", safe.cssText);
      else element.removeAttribute("style");
    }
  }
  if (!document.querySelector("path,rect,line,polygon,polyline,circle,ellipse,text")) throw invalid();
  return new XMLSerializer().serializeToString(document.documentElement);
}

const safeStyleProperties = [
  "fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
  "opacity", "font-family", "font-size", "font-weight", "font-style", "text-anchor", "dominant-baseline", "background", "background-color", "color", "white-space"
];
const resourceAttributes = new Set(["fill", "stroke", "filter", "clip-path", "mask", "marker-start", "marker-mid", "marker-end", "cursor"]);
