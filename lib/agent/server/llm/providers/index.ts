import "server-only";
import { openaiProvider } from "@/lib/agent/server/llm/providers/openai";
import { anthropicProvider } from "@/lib/agent/server/llm/providers/anthropic";
import type { ModelProviderAdapter } from "@/lib/agent/server/llm/types";

export const modelProviders = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
} satisfies Record<string, ModelProviderAdapter>;

export type ModelProvider = keyof typeof modelProviders;

export function isModelProvider(value: string): value is ModelProvider {
  return Object.hasOwn(modelProviders, value);
}
