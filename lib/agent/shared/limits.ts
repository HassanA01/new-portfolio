/** Non-secret limits shared by the runtime, HTTP boundary, and chat client. */
export const agentLimits = {
  // Fact tool, quick replies, reply text, plus one spare step for a re-search.
  maxSteps: 5,
  outputTokens: 900,
  timeoutMs: 55_000,
  requestCharacters: 64_000,
  historyMessages: 30,
  requestMessages: 40,
  messageCharacters: 6_000,
  inputCharacters: 2_000,
  /** Messages one client may send per window; see lib/rate-limit.ts. */
  perMinute: 10,
  perHour: 60,
} as const;
