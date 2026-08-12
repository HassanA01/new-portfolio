import { getDb } from "./client";
import { experience, projects } from "./schema";
import projectsJson from "./seed-data/projects.json";
import experienceJson from "./seed-data/experience.json";

type ProjectSeed = {
  title: string; description: string; tech: string[];
  image: string; github: string; live: string; featured: boolean;
};
type ExperienceSeed = {
  title: string; company: string; duration: string; impact: string;
  techStack: string[]; highlights: string[];
};

async function main() {
  const db = getDb();
  const projectRows = (projectsJson as ProjectSeed[]).map((p, i) => ({ ...p, sortOrder: i }));
  // conflict target: title (unique)
  await db.insert(projects).values(projectRows).onConflictDoNothing();
  const expRows = (experienceJson as { experience: ExperienceSeed[] }).experience.map(
    (e, i) => ({ ...e, sortOrder: i }),
  );
  // conflict target: (company, title) via experience_company_title_idx
  await db.insert(experience).values(expRows).onConflictDoNothing();
  console.log(`seed: ${projectRows.length} projects, ${expRows.length} roles (existing rows untouched)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
