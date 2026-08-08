import { z } from "zod";

const lines = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

export const projectInput = z.object({
  title: z.string().trim().min(1, "title required"),
  description: z.string().trim().min(1, "description required"),
  tech: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one tech")),
  image: z.string().trim().refine((s) => s.startsWith("/") || s.startsWith("http"), "path or URL"),
  github: z.string().trim().url("github must be a URL"),
  live: z.string().trim().default(""),
  featured: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0),
});

export const experienceInput = z.object({
  title: z.string().trim().min(1, "title required"),
  company: z.string().trim().min(1, "company required"),
  duration: z.string().trim().min(1, "duration required"),
  impact: z.string().trim().min(1, "impact required"),
  techStack: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one tech")),
  highlights: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one highlight")),
  sortOrder: z.coerce.number().int().min(0),
});

export type ProjectInput = z.infer<typeof projectInput>;
export type ExperienceInput = z.infer<typeof experienceInput>;
