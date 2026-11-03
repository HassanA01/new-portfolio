/** Enforce the house voice for prose without modifying tool data or URLs. */
export function agentVoice(text: string) {
  return text.toLowerCase().replace(/\s*—\s*/g, ", ");
}
