import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";

export type Project = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  github: string;
  live: string;
  featured: boolean;
};

export type Experience = {
  title: string;
  company: string;
  duration: string;
  impact: string;
  techStack: string[];
  highlights: string[];
};

const loadProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const rows = await getDb().select().from(projects).orderBy(asc(projects.sortOrder));
    if (rows.length === 0) throw new Error("content: projects table is empty — run db:seed");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return rows.map(({ id: _id, sortOrder: _s, ...p }) => p);
  },
  ["content-projects"],
  { tags: ["content:projects"] },
);

const loadExperience = unstable_cache(
  async (): Promise<Experience[]> => {
    const rows = await getDb().select().from(experience).orderBy(asc(experience.sortOrder));
    if (rows.length === 0) throw new Error("content: experience table is empty — run db:seed");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return rows.map(({ id: _id, sortOrder: _s, ...e }) => e);
  },
  ["content-experience"],
  { tags: ["content:experience"] },
);

export function getProjects(): Promise<Project[]> {
  return loadProjects();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await loadProjects()).filter((p) => p.featured);
}

export function getExperience(): Promise<Experience[]> {
  return loadExperience();
}
