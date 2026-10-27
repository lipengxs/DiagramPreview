import {NextResponse} from "next/server";
import {PLANTUML_MAX_SOURCE_BYTES} from "@/lib/plantuml-limits";
import {fetchPlantUmlSvg, PlantUmlError, readBoundedText} from "@/lib/plantuml-server";

export const runtime = "nodejs";

const headers = {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"};

export async function POST(request: Request) {
  try {
    const maxRequestBytes = PLANTUML_MAX_SOURCE_BYTES;
    const tooLarge = new PlantUmlError("INPUT_TOO_LARGE", "The PlantUML request exceeds the 64 KiB limit. Split the diagram and try again.", 413);
    if (Number(request.headers.get("content-length")) > maxRequestBytes) {
      await request.body?.cancel();
      throw tooLarge;
    }
    const text = await readBoundedText(request.body, maxRequestBytes, tooLarge);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new PlantUmlError("INVALID_REQUEST", "Send a JSON body containing PlantUML source.", 400);
    }
    if (!body || typeof body !== "object" || !("source" in body) || typeof body.source !== "string") {
      throw new PlantUmlError("INVALID_REQUEST", "Send a JSON body containing PlantUML source.", 400);
    }
    const svg = await fetchPlantUmlSvg(body.source, {signal: request.signal});
    return NextResponse.json({svg}, {headers});
  } catch (error) {
    const failure = error instanceof PlantUmlError ? error : new PlantUmlError("INVALID_REQUEST", "Unable to read the PlantUML request. Try again.", 400);
    return NextResponse.json({error: failure.message, code: failure.code}, {status: failure.status, headers});
  }
}
