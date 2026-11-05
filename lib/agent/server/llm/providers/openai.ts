import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import type { ModelProviderAdapter } from "@/lib/agent/server/llm/types";

export const openaiProvider = {
  keyEnvironmentVariable: "OPENAI_API_KEY",
  createModel: (modelId, options) => createOpenAI(options).responses(modelId),
} satisfies ModelProviderAdapter;
