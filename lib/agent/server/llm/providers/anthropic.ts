import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { ModelProviderAdapter } from "@/lib/agent/server/llm/types";

export const anthropicProvider = {
  keyEnvironmentVariable: "ANTHROPIC_API_KEY",
  createModel: (modelId, options) => createAnthropic(options)(modelId),
} satisfies ModelProviderAdapter;
