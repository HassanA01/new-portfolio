import "server-only";
import { tool } from "ai";
import { z } from "zod";

export const showResume = tool({
  description:
    "Request the existing resume checkout modal over a blurred page. Use when the visitor directly asks to see, get, download, or reopen Aneeq’s resume or CV, including when they ask to skip payment; the checkout requirement remains unchanged. The result contains the UI action and current displayed price, which the application uses to open checkout. It does not charge a card, verify a purchase, complete a download, or provide a private file URL; do not call it as an unsolicited upsell.",
  inputSchema: z.object({}),
  execute: async () => ({
    action: "open-resume-checkout" as const,
    price: "US$5",
  }),
});
