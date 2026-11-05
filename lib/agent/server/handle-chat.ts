import { createAgentUIStreamResponse, smoothStream } from "ai";
import "server-only";
import { chatRequestSchema } from "@/lib/agent/shared/request";
import { createAnikeAgent } from "@/lib/agent/server/agent";
import {
  AgentConfigurationError,
  getAgentConfig,
} from "@/lib/agent/server/config";
import { resolveModel } from "@/lib/agent/server/llm/resolve-model";
import { logAgentError } from "@/lib/agent/server/observability";
import { agentLimits } from "@/lib/agent/shared/limits";
import { rateLimitResponse } from "@/lib/rate-limit";

const chatRateLimits = [
  { name: "minute", limit: agentLimits.perMinute, windowMs: 60_000 },
  { name: "hour", limit: agentLimits.perHour, windowMs: 3_600_000 },
] as const;

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
  const limited = await rateLimitResponse(
    request,
    "chat",
    chatRateLimits,
    "slow down a sec, that’s a lot of messages. try again in a minute.",
  );
  if (limited) return limited;
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
    if (!config.hasCredentials) {
      logAgentError(
        "portfolio_agent_request_failed",
        new AgentConfigurationError(
          config.keyEnvironmentVariable,
          "Selected provider key is missing.",
        ),
      );
      return Response.json(
        { error: "i’m not connected yet. try again soon :)" },
        { status: 503 },
      );
    }
    return await createAgentUIStreamResponse({
      agent: createAnikeAgent(resolveModel(config)),
      uiMessages: input.data.messages,
      abortSignal: request.signal,
      timeout: agentLimits.timeoutMs,
      // Reasoning summaries paraphrase the private instructions, so they stay
      // on the server; the activity rail only shows tool calls.
      sendReasoning: false,
      // Release prose one word at a time at a steady cadence instead of the
      // uneven bursts the provider sends, so the chat reads rather than flickers.
      experimental_transform: smoothStream({ delayInMs: 24, chunking: "word" }),
      onError: (error) => {
        logAgentError("portfolio_agent_stream_failed", error);
        return "couldn’t finish that reply. try again in a moment.";
      },
    });
  } catch (error) {
    logAgentError("portfolio_agent_request_failed", error);
    if (error instanceof AgentConfigurationError)
      return Response.json(
        { error: "i’m not connected yet. try again soon :)" },
        { status: 503 },
      );
    return Response.json(
      { error: "couldn’t connect rn. try again in a moment." },
      { status: 502 },
    );
  }
}
