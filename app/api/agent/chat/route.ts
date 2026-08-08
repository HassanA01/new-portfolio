import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { buildPortfolioAgent } from "@/lib/agent/agent";
import { checkRateLimit } from "@/lib/agent/rate-limit";

export const maxDuration = 60;

function configured(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL,
  );
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // curl/dev tools; rate limits still apply
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
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
    checkRateLimit("chat-min", ip, 10, 60),
    checkRateLimit("chat-day", ip, 60, 86400),
  ]);
  if (!minuteOk || !dayOk) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const trimmed = messages.slice(-12);
  const lastText = trimmed
    .at(-1)
    ?.parts?.filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("");
  if (lastText && lastText.length > 1000) {
    return Response.json({ error: "message_too_long" }, { status: 413 });
  }

  return createAgentUIStreamResponse({
    agent: buildPortfolioAgent({ ip }),
    uiMessages: trimmed,
  });
}
