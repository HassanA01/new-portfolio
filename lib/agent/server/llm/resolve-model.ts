import "server-only";
import {
  AgentConfigurationError,
  getAgentConfig,
  type AgentConfig,
} from "@/lib/agent/server/config";
import { modelProviders } from "@/lib/agent/server/llm/providers/index";

/** Explicit provider instances prevent model strings from using AI Gateway. */
export function resolveModel(
  config: AgentConfig = getAgentConfig(),
  options: {
    environment?: NodeJS.ProcessEnv;
    fetch?: typeof globalThis.fetch;
  } = {},
) {
  const environment = options.environment ?? process.env;
  const apiKey = environment[config.keyEnvironmentVariable]?.trim();
  if (!apiKey)
    throw new AgentConfigurationError(
      config.keyEnvironmentVariable,
      `Set ${config.keyEnvironmentVariable} for the selected model.`,
    );
  return modelProviders[config.provider].createModel(config.modelId, {
    apiKey,
    fetch: options.fetch,
  });
}
