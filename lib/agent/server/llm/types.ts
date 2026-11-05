import type { LanguageModel } from "ai";

export type ProviderModelOptions = {
  apiKey: string;
  fetch?: typeof globalThis.fetch;
};

export type ModelProviderAdapter = {
  keyEnvironmentVariable: string;
  createModel: (
    modelId: string,
    options: ProviderModelOptions,
  ) => Exclude<LanguageModel, string>;
};
