import "server-only";
import { ToolLoopAgent, stepCountIs, type LanguageModel } from "ai";
import { portfolioTools } from "@/lib/agent/server/tools/index";
import { getAgentConfig } from "@/lib/agent/server/config";
import {
  createAgentContext,
  type AgentContext,
} from "@/lib/agent/server/context";
import { loadSystemPrompt } from "@/lib/agent/server/prompts/load-system-prompt";
import { agentLimits } from "@/lib/agent/shared/limits";

export function createAnikeAgent(
  model: LanguageModel = getAgentConfig().model,
  context: AgentContext = createAgentContext(),
) {
  return new ToolLoopAgent({
    model,
    instructions: loadSystemPrompt(context),
    tools: portfolioTools,
    stopWhen: stepCountIs(agentLimits.maxSteps),
    maxOutputTokens: agentLimits.outputTokens,
  });
}
