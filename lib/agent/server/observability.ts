import "server-only";

/** Log error categories without copying prompts, credentials, or provider bodies. */
export function logAgentError(
  event: "portfolio_agent_stream_failed" | "portfolio_agent_request_failed",
  error: unknown,
) {
  console.error(
    JSON.stringify({
      event,
      error: error instanceof Error ? error.name : "unknown",
    }),
  );
}
