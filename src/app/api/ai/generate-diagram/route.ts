import {NextResponse} from "next/server";
import {generateDiagramWithFallback} from "@/lib/ai/providers";
import type {AiDiagramMode} from "@/lib/ai/prompts";

const modes: AiDiagramMode[] = [
  "generate",
  "text-to-mermaid",
  "fix-mermaid",
  "architecture",
  "plantuml",
  "drawio",
  "grafana",
  "prometheus"
];

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: "Invalid JSON request body."}, {status: 400});
  }

  const input = parseBody(body);
  if (!input.ok) {
    return NextResponse.json({error: input.error}, {status: 400});
  }

  const {result, errors} = await generateDiagramWithFallback(input.value);

  if (!result) {
    return NextResponse.json(
      {
        error: "No AI provider could generate a diagram.",
        providers: errors
      },
      {status: 503}
    );
  }

  return NextResponse.json({
    provider: result.provider,
    code: result.code,
    fallbackErrors: errors
  });
}

function parseBody(body: unknown):
  | {
      ok: true;
      value: {
        mode: AiDiagramMode;
        diagramType: string;
        prompt: string;
        existingCode?: string;
        outputLanguage?: "mermaid" | "plantuml" | "drawio" | "json" | "yaml";
      };
    }
  | {ok: false; error: string} {
  if (!body || typeof body !== "object") {
    return {ok: false, error: "Request body must be an object."};
  }

  const value = body as Record<string, unknown>;
  const mode = typeof value.mode === "string" ? value.mode : "generate";
  const diagramType = typeof value.diagramType === "string" ? value.diagramType : "flowchart";
  const prompt = typeof value.prompt === "string" ? value.prompt.trim() : "";
  const existingCode = typeof value.existingCode === "string" ? value.existingCode : undefined;
  const outputLanguage =
    value.outputLanguage === "plantuml" ||
    value.outputLanguage === "drawio" ||
    value.outputLanguage === "json" ||
    value.outputLanguage === "yaml"
      ? value.outputLanguage
      : "mermaid";

  if (!modes.includes(mode as AiDiagramMode)) {
    return {ok: false, error: "Unsupported AI diagram mode."};
  }

  if (!prompt && mode !== "fix-mermaid") {
    return {ok: false, error: "Prompt is required."};
  }

  if (mode === "fix-mermaid" && !existingCode?.trim()) {
    return {ok: false, error: "Existing Mermaid code is required for fix mode."};
  }

  return {
    ok: true,
    value: {
      mode: mode as AiDiagramMode,
      diagramType,
      prompt,
      existingCode,
      outputLanguage
    }
  };
}
