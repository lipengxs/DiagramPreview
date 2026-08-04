import {NextResponse} from "next/server";

type WaitlistPayload = {
  email?: unknown;
  useCase?: unknown;
  teamSize?: unknown;
  source?: unknown;
  toolSlug?: unknown;
  intent?: unknown;
};

const allowedSources = new Set(["tool", "workflow", "plugin", "home"]);
const allowedIntents = new Set(["ai_review", "batch_conversion", "advanced_export", "plugin_pro", "team_workspace"]);

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ok: false, error: "invalid_json"}, {status: 400});
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const useCase = typeof payload.useCase === "string" ? payload.useCase.trim().slice(0, 600) : "";
  const teamSize = typeof payload.teamSize === "string" ? payload.teamSize.trim().slice(0, 20) : "";
  const source = typeof payload.source === "string" && allowedSources.has(payload.source) ? payload.source : "tool";
  const toolSlug = typeof payload.toolSlug === "string" ? payload.toolSlug.trim().slice(0, 120) : "";
  const intent = typeof payload.intent === "string" && allowedIntents.has(payload.intent) ? payload.intent : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ok: false, error: "invalid_email"}, {status: 400});
  }

  console.info("diagram_waitlist_signup", {
    email,
    useCase,
    teamSize,
    source,
    toolSlug,
    intent,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ok: true, source, intent});
}
