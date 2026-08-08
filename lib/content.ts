import projectsJson from "@/db/seed-data/projects.json";
import experienceJson from "@/db/seed-data/experience.json";

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

function fail(context: string, detail: string): never {
  throw new Error(`content: invalid ${context} — ${detail}`);
}

function validateProject(raw: unknown, index: number): Project {
  const p = raw as Partial<Project>;
  if (!p.title) fail(`project[${index}]`, "missing title");
  if (!p.description || /<[^>]+>/.test(p.description))
    fail(`project "${p.title}"`, "description missing or contains HTML");
  if (!p.image?.startsWith("/")) fail(`project "${p.title}"`, "image must be a /public path");
  if (!Array.isArray(p.tech) || p.tech.length === 0) fail(`project "${p.title}"`, "tech must be non-empty");
  if (typeof p.featured !== "boolean") fail(`project "${p.title}"`, "featured flag missing");
  // Empty string is a valid "no URL" sentinel; only fail if not a string
  if (typeof p.github !== "string") fail(`project "${p.title}"`, "github must be a string");
  if (typeof p.live !== "string") fail(`project "${p.title}"`, "live must be a string");
  return p as Project;
}

function validateExperience(raw: unknown, index: number): Experience {
  const e = raw as Partial<Experience>;
  if (!e.company || !e.title) fail(`experience[${index}]`, "missing company or title");
  if (!e.impact) fail(`experience "${e.company}"`, "missing impact one-liner");
  if (!Array.isArray(e.highlights) || e.highlights.length === 0)
    fail(`experience "${e.company}"`, "highlights must be non-empty");
  if (!Array.isArray(e.techStack) || e.techStack.length === 0)
    fail(`experience "${e.company}"`, "techStack must be non-empty");
  if (!e.duration) fail(`experience "${e.company}"`, "missing duration");
  return e as Experience;
}

const projects: Project[] = (projectsJson as unknown[]).map(validateProject);
const experience: Experience[] = (
  (experienceJson as { experience: unknown[] }).experience
).map(validateExperience);

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getExperience(): Experience[] {
  return experience;
}
