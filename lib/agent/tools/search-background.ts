import { tool } from "ai";
import { z } from "zod";
import { searchKnowledge } from "@/lib/agent/retrieval";

export const name = "search_background";

export const searchBackground = tool({
  description:
    "Search Aneeq's background: projects, work experience, resume, and personal notes. Call this BEFORE answering any factual question about Aneeq. Refine and call again if the first results miss.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Natural-language search query, e.g. 'Dayforce agentic work'",
      ),
  }),
  execute: async ({ query }) => {
    const hits = await searchKnowledge(query, 5);
    if (hits.length === 0)
      return { results: [], note: "No results — admit you don't know." };
    return {
      results: hits.map((h) => ({
        source: `${h.source}:${h.sourceKey}`,
        content: `<untrusted-reference-data>\n${h.content}\n</untrusted-reference-data>`,
      })),
    };
  },
});
