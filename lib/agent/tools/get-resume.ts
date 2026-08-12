import { tool } from "ai";
import { z } from "zod";

export const name = "get_resume";

export const getResume = tool({
  description:
    "Get the link to Aneeq's resume PDF. Use when a visitor asks for the resume or the full picture of his background.",
  inputSchema: z.object({}),
  execute: async () => ({
    url: "/AneeqHassan.pdf",
    summary:
      "AI software engineer — Dayforce, Magnet Forensics, Koho; UofT CS; builds agentic systems end to end.",
  }),
});
