import { tool } from "ai";
import { z } from "zod";

export const name = "navigate_site";

export const navigateSite = tool({
  description:
    "Navigate the visitor to a page or section of this site. Use when showing beats telling — e.g. 'show me his work' or after recommending a project.",
  inputSchema: z.object({
    path: z
      .enum(["/", "/work", "/about", "/#experience", "/#contact"])
      .describe("Destination"),
  }),
  // no execute — the client performs the navigation and reports back
});
