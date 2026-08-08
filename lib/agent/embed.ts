import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { embedMany } from "ai";
import { asc, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { experience, knowledgeChunks, projects } from "@/db/schema";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

type ChunkInput = { source: string; sourceKey: string; chunkIndex: number; content: string };

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

function projectToText(p: typeof projects.$inferSelect): string {
  return [
    `Project: ${p.title}`,
    p.description,
    `Tech: ${p.tech.join(", ")}`,
    p.github && `GitHub: ${p.github}`,
    p.live && `Live: ${p.live}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function experienceToText(e: typeof experience.$inferSelect): string {
  return [
    `Role: ${e.title} at ${e.company} (${e.duration})`,
    e.impact,
    ...e.highlights.map((h) => `- ${h}`),
    `Tech: ${e.techStack.join(", ")}`,
  ].join("\n");
}

function splitMarkdownSections(md: string): string[] {
  return md
    .split(/^## /m)
    .map((s, i) => (i === 0 ? s : `## ${s}`).trim())
    .filter((s) => s.length > 40);
}

function splitResumeText(text: string, maxChars = 2000): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if (current && current.length + p.length > maxChars) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function extractResumeText(): Promise<string> {
  // pdf-parse v2 uses a class-based API — PDFParse({ data: buffer }).getText()
  const { PDFParse } = await import("pdf-parse");
  const buffer = await readFile(path.join(process.cwd(), "public", "AneeqHassan.pdf"));
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

async function desiredChunks(): Promise<ChunkInput[]> {
  const db = getDb();
  const projectRows = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  const experienceRows = await db.select().from(experience).orderBy(asc(experience.sortOrder));
  const aboutMd = await readFile(path.join(process.cwd(), "content", "about.md"), "utf8");
  const resumeText = await extractResumeText();

  return [
    ...projectRows.map((p) => ({ source: "project", sourceKey: p.title, chunkIndex: 0, content: projectToText(p) })),
    ...experienceRows.map((e) => ({
      source: "experience",
      sourceKey: `${e.company} — ${e.title}`,
      chunkIndex: 0,
      content: experienceToText(e),
    })),
    ...splitMarkdownSections(aboutMd).map((content, i) => ({ source: "about", sourceKey: "about.md", chunkIndex: i, content })),
    ...splitResumeText(resumeText).map((content, i) => ({ source: "resume", sourceKey: "AneeqHassan.pdf", chunkIndex: i, content })),
  ];
}

async function syncChunks(desired: ChunkInput[], opts?: { pruneScope?: { source: string; sourceKey: string } }) {
  const db = getDb();
  const existing = await db
    .select({
      id: knowledgeChunks.id,
      source: knowledgeChunks.source,
      sourceKey: knowledgeChunks.sourceKey,
      chunkIndex: knowledgeChunks.chunkIndex,
      contentHash: knowledgeChunks.contentHash,
    })
    .from(knowledgeChunks);
  const existingByIdentity = new Map(existing.map((c) => [`${c.source}|${c.sourceKey}|${c.chunkIndex}`, c.contentHash]));

  const toEmbed = desired.filter((c) => existingByIdentity.get(`${c.source}|${c.sourceKey}|${c.chunkIndex}`) !== hash(c.content));
  if (toEmbed.length > 0) {
    const { embeddings } = await embedMany({ model: EMBEDDING_MODEL, values: toEmbed.map((c) => c.content) });
    for (let i = 0; i < toEmbed.length; i++) {
      const c = toEmbed[i];
      await db
        .insert(knowledgeChunks)
        .values({ ...c, contentHash: hash(c.content), embedding: embeddings[i], updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [knowledgeChunks.source, knowledgeChunks.sourceKey, knowledgeChunks.chunkIndex],
          set: { content: c.content, contentHash: hash(c.content), embedding: embeddings[i], updatedAt: new Date() },
        });
    }
  }

  // prune stale chunks (deleted rows / shrunk documents) — single bulk DELETE
  const scope = opts?.pruneScope;
  const inScope = (c: { source: string; sourceKey: string }) =>
    !scope || (c.source === scope.source && c.sourceKey === scope.sourceKey);
  const desiredIdentities = new Set(desired.map((c) => `${c.source}|${c.sourceKey}|${c.chunkIndex}`));
  const staleIds = existing
    .filter((c) => inScope(c) && !desiredIdentities.has(`${c.source}|${c.sourceKey}|${c.chunkIndex}`))
    .map((c) => c.id);
  if (staleIds.length > 0) {
    await db.delete(knowledgeChunks).where(inArray(knowledgeChunks.id, staleIds));
  }
  return { embedded: toEmbed.length, skipped: desired.length - toEmbed.length, deleted: staleIds.length };
}

export async function reembedAll() {
  return syncChunks(await desiredChunks());
}

export async function reembedSource(source: "project" | "experience", sourceKey: string): Promise<void> {
  await syncChunks(await desiredChunks(), { pruneScope: { source, sourceKey } });
}
