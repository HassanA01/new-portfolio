import "server-only";

export type AgentContext = { currentDate: string };

/** Build per request so long-lived server processes never retain yesterday. */
export function createAgentContext(now = new Date()): AgentContext {
  return { currentDate: now.toISOString().slice(0, 10) };
}
