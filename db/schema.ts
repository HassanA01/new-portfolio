import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex, vector } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  tech: text("tech").array().notNull(),
  image: text("image").notNull(),
  github: text("github").notNull(),
  live: text("live").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const experience = pgTable(
  "experience",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    duration: text("duration").notNull(),
    impact: text("impact").notNull(),
    techStack: text("tech_stack").array().notNull(),
    highlights: text("highlights").array().notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (t) => [uniqueIndex("experience_company_title_idx").on(t.company, t.title)],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(), // 'project' | 'experience' | 'resume' | 'about'
    sourceKey: text("source_key").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("knowledge_chunks_identity_idx").on(t.source, t.sourceKey, t.chunkIndex),
    index("knowledge_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromName: text("from_name"),
  fromEmail: text("from_email").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), // scope:hashedIp:windowStartEpoch
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});
