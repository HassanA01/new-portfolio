import { boolean, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

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
