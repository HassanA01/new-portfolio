import "server-only";
import { tool } from "ai";
import { z } from "zod";

export const offerChoices = tool({
  description:
    "Show the visitor tappable quick replies for a decision your reply is about to ask them to make, such as a yes or no question or picking one of a few options. Call it on its own, after any fact-finding tools and before you write the reply; then write the reply as plain text with no further tool call. Text written in the same response as a tool call is not shown to the visitor. Each choice is a short, bare lowercase answer the visitor could have typed themselves: 'yes' and 'no', not 'yes please' or 'no thanks'. It renders nothing inside the message: the application shows the choices beside the composer and sends the selected one back as the visitor's next message.",
  inputSchema: z.object({
    choices: z
      .array(z.string().min(1).max(32))
      .min(2)
      .max(4)
      .describe(
        "Two to four short answers matching the question you asked, in the order to display them.",
      ),
  }),
  execute: async ({ choices }) => ({
    choices: [
      ...new Set(choices.map((choice) => choice.trim().toLowerCase())),
    ].filter(Boolean),
  }),
});
