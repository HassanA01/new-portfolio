import { embed } from "ai";
import { cosineDistance, desc, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { knowledgeChunks } from "@/db/schema";

export type KnowledgeHit = { content: string; source: string; sourceKey: string };

export async function searchKnowledge(query: string, k = 5): Promise<KnowledgeHit[]> {
  const { embedding } = await embed({ model: "openai/text-embedding-3-small", value: query });
  const similarity = sql<number>`1 - (${cosineDistance(knowledgeChunks.embedding, embedding)})`;
  return getDb()
    .select({ content: knowledgeChunks.content, source: knowledgeChunks.source, sourceKey: knowledgeChunks.sourceKey })
    .from(knowledgeChunks)
    .orderBy(desc(similarity))
    .limit(k);
}
