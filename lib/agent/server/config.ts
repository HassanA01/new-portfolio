import "server-only";
import { z } from "zod";

const optionalSetting = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);
const settings = z.object({
  AI_MODEL: optionalSetting,
  AI_GATEWAY_API_KEY: optionalSetting,
  VERCEL_OIDC_TOKEN: optionalSetting,
});

export function getAgentConfig(environment: NodeJS.ProcessEnv = process.env) {
  const parsed = settings.parse({
    AI_MODEL: environment.AI_MODEL,
    AI_GATEWAY_API_KEY: environment.AI_GATEWAY_API_KEY,
    VERCEL_OIDC_TOKEN: environment.VERCEL_OIDC_TOKEN,
  });
  return {
    model: parsed.AI_MODEL ?? "openai/gpt-5.4-mini",
    hasCredentials: Boolean(
      parsed.AI_GATEWAY_API_KEY || parsed.VERCEL_OIDC_TOKEN,
    ),
  };
}
