import { stepCountIs, ToolLoopAgent } from "ai";
import { SYSTEM_PROMPT } from "@/lib/agent/prompt";
import { buildAgentTools } from "@/lib/agent/tools";

export function buildPortfolioAgent(ctx: { ip: string }) {
  return new ToolLoopAgent({
    model: "anthropic/claude-sonnet-4-6",
    instructions: SYSTEM_PROMPT,
    tools: buildAgentTools(ctx),
    stopWhen: stepCountIs(6),
    maxOutputTokens: 1024,
  });
}
