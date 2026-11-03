import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { getPublicProfile } from "@/lib/agent/server/data/profile";

export const showProfile = tool({
  description:
    "Retrieve curated public portfolio facts and render a profile or career card. Use career for employment and work history, about for background, education, interests or spoken-language questions, and contact for public social links. Only facts present in the result are documented; unknown fields and omitted details must not be guessed. This tool does not access private profiles, live activity, availability, or messaging capabilities.",
  inputSchema: z.object({
    topic: z
      .enum(["career", "about", "contact"])
      .describe(
        "Choose the public-profile topic that answers the visitor’s actual question.",
      ),
  }),
  execute: async ({ topic }) => getPublicProfile(topic),
});
