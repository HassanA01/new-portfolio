import { z } from "zod";
import { agentLimits } from "@/lib/agent/shared/limits";

// Only accept conversation text. Client tool outputs are never trusted as facts.
export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(
              z.object({
                type: z.literal("text"),
                text: z.string().max(agentLimits.messageCharacters),
              }),
            )
            .min(1)
            .max(8),
        }),
      )
      .min(1)
      .max(agentLimits.requestMessages),
  })
  .refine(
    ({ messages }) => messages.at(-1)?.role === "user",
    "last message must be from the user",
  );
