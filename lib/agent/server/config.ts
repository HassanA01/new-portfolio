import "server-only";
import { z } from "zod";
import {
  isModelProvider,
  modelProviders,
} from "@/lib/agent/server/llm/providers/index";

const optionalSetting = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);
const settings = z.object({ AI_MODEL: optionalSetting });

export class AgentConfigurationError extends Error {
  readonly name = "AgentConfigurationError";
  constructor(
    readonly setting: string,
    message: string,
  ) {
    super(message);
  }
}

/** Return routing metadata and readiness, never API keys. */
export function getAgentConfig(environment: NodeJS.ProcessEnv = process.env) {
  const parsed = settings.parse({ AI_MODEL: environment.AI_MODEL });
  const model = parsed.AI_MODEL ?? "openai/gpt-5.4-mini";
  const [provider, modelId, ...extra] = model.split("/");
  if (
    !isModelProvider(provider) ||
    !modelId ||
    /\s/.test(modelId) ||
    extra.length
  ) {
    throw new AgentConfigurationError(
      "AI_MODEL",
      "AI_MODEL must use a supported provider/model-id, such as openai/gpt-5.4-mini or anthropic/claude-sonnet-5-5.",
    );
  }
  const keyEnvironmentVariable =
    modelProviders[provider].keyEnvironmentVariable;
  const apiKey = optionalSetting.parse(environment[keyEnvironmentVariable]);
  return {
    model,
    provider,
    modelId,
    keyEnvironmentVariable,
    hasCredentials: Boolean(apiKey),
  };
}

export type AgentConfig = ReturnType<typeof getAgentConfig>;
