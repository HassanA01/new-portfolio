import { createAgentUIStreamResponse } from "ai";
import "server-only";
import { chatRequestSchema } from "@/lib/agent/shared/request";
import { createAnikeAgent } from "@/lib/agent/server/agent";
import { getAgentConfig } from "@/lib/agent/server/config";
import { logAgentError } from "@/lib/agent/server/observability";
import { agentLimits } from "@/lib/agent/shared/limits";

export async function handleChatRequest(request: Request) {
  // Next's internal request URL can use 0.0.0.0 behind Docker/proxies.
  // The browser Origin must match the public Host header instead.
  const publicURL = new URL(request.url);
  publicURL.host = request.headers.get("host") || publicURL.host;
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== publicURL.origin
  ) {
    return Response.json(
      { error: "this request must come from the portfolio." },
      { status: 403 },
    );
  }
  const body = await request.text();
  if (body.length > agentLimits.requestCharacters)
    return Response.json(
      { error: "this conversation is too long. start a new chat." },
      { status: 413 },
    );
  let input;
  try {
    input = chatRequestSchema.safeParse(JSON.parse(body));
  } catch {
    return Response.json(
      { error: "send a valid conversation." },
      { status: 400 },
    );
  }
  if (!input.success)
    return Response.json(
      { error: "send a valid conversation." },
      { status: 400 },
    );
  try {
    const config = getAgentConfig();
    if (!config.hasCredentials)
      return Response.json(
        { error: "i’m not connected yet. try again soon :)" },
        { status: 503 },
      );
    return await createAgentUIStreamResponse({
      agent: createAnikeAgent(config.model),
      uiMessages: input.data.messages,
      abortSignal: request.signal,
      timeout: agentLimits.timeoutMs,
      onError: (error) => {
        logAgentError("portfolio_agent_stream_failed", error);
        return "couldn’t finish that reply. try again in a moment.";
      },
    });
  } catch (error) {
    logAgentError("portfolio_agent_request_failed", error);
    return Response.json(
      { error: "couldn’t connect rn. try again in a moment." },
      { status: 502 },
    );
  }
}
