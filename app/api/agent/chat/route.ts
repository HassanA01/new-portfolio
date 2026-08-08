import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { buildPortfolioAgent } from "@/lib/agent/agent";
import { checkRateLimit } from "@/lib/agent/rate-limit";

export const maxDuration = 60;

const RATE_LIMIT_MESSAGE =
  "The agent is popular today — email hassan.aneeq01@gmail.com to reach Aneeq directly.";

function configured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function sameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // No Origin and no Referer — reject
  return false;
}

export async function GET() {
  return configured()
    ? Response.json({ ok: true })
    : Response.json({ ok: false }, { status: 503 });
}

export async function POST(req: Request) {
  if (!configured()) {
    return Response.json({ error: "agent_offline" }, { status: 503 });
  }
  if (!sameOrigin(req)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = clientIp(req);
  const [minuteOk, dayOk] = await Promise.all([
    checkRateLimit("chat", ip, 10, 60),
    checkRateLimit("chat-day", ip, 60, 86400),
  ]);
  if (!minuteOk || !dayOk) {
    return Response.json(
      { error: "rate_limited", message: RATE_LIMIT_MESSAGE },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>).messages)
  ) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const messages = (body as { messages: UIMessage[] }).messages;
  if (messages.length === 0) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const trimmed = messages.slice(-12);

  const last = trimmed.at(-1);
  const lastText = last?.parts
    ?.filter((p) => p.type === "text")
    .map((p) => ("text" in p ? (p.text as string) : ""))
    .join("");

  if (!last || last.role !== "user" || !lastText || lastText.trim() === "") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (lastText.length > 1000) {
    return Response.json({ error: "message_too_long" }, { status: 413 });
  }

  return createAgentUIStreamResponse({
    agent: buildPortfolioAgent({ ip }),
    uiMessages: trimmed,
  });
}
