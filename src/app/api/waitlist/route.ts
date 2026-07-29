import {NextResponse} from "next/server";

type WaitlistPayload = {
  email?: unknown;
  useCase?: unknown;
  teamSize?: unknown;
  source?: unknown;
  toolSlug?: unknown;
};

const allowedSources = new Set(["tool", "workflow", "plugin"]);

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ok: false, error: "invalid_email"}, {status: 400});
  }

  console.info("diagram_waitlist_signup", {
    email,
    useCase,
    teamSize,
    source,
    toolSlug,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ok: true, source});
}
