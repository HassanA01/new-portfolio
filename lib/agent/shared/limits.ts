/** Non-secret limits shared by the runtime, HTTP boundary, and chat client. */
export const agentLimits = {
  maxSteps: 4,
  outputTokens: 900,
  timeoutMs: 55_000,
  requestCharacters: 64_000,
  historyMessages: 30,
  requestMessages: 40,
  messageCharacters: 6_000,
  inputCharacters: 2_000,
} as const;
