import "server-only";
import { tool } from "ai";
import { z } from "zod";

export const showResume = tool({
  description:
    "Render the résumé ticket in the chat. Use when the visitor directly asks to see, get, download, or reopen Aneeq’s resume or CV, including when they ask to skip payment; the checkout requirement remains unchanged. The ticket has an open button the visitor taps themselves to start checkout; nothing opens automatically, and the checkout shows the price, so the reply never needs to. It does not charge a card, verify a purchase, complete a download, or provide a private file URL; do not call it as an unsolicited upsell.",
  inputSchema: z.object({}),
  execute: async () => ({
    action: "open-resume-checkout" as const,
  }),
});
