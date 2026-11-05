export const projectFilters = ["All", "Web", "AI/ML", "Systems"] as const;
export type ProjectFilter = (typeof projectFilters)[number];
const categoryTitles: Record<Exclude<ProjectFilter, "All">, string[]> = {
  Web: [
    "B2W - UofT Hacks 12",
    "BizReach Marketplace",
    "Portfolio Website",
    "flwst8",
    "Sawt",
    "Hilal",
  ],
  "AI/ML": [
    "MailflowAI",
    "B2W - UofT Hacks 12",
    "BizReach Marketplace",
    "flwst8",
    "Sawt",
    "Hilal",
  ],
  Systems: [
    "Proxy Server",
  ],
};
export function filterProjects<T extends { title: string }>(
  projects: T[],
  filter: ProjectFilter,
): T[] {
  return filter === "All"
    ? projects
    : projects.filter((project) =>
        categoryTitles[filter].includes(project.title),
      );
}
export function projectIntent(question: string): ProjectFilter | null {
  if (!/\bprojects?\b|\bportfolio\b|\bwhat.*built\b/i.test(question))
    return null;
  if (/\bai\b|\bml\b|machine learning/i.test(question)) return "AI/ML";
  if (/\bsystems?\b|\bbackend\b|\biot\b/i.test(question)) return "Systems";
  if (/\bweb\b|\bwebsites?\b|\bfrontend\b/i.test(question)) return "Web";
  return "All";
}

export type ProjectSearch = {
  category?: ProjectFilter;
  query?: string;
  year?: number;
  status?: "active" | "completed";
};

type SearchableProject = {
  title: string;
  description: string;
  tech: string[];
  year?: number;
  status?: string;
};

export function searchProjects<T extends SearchableProject>(
  projects: T[],
  search: ProjectSearch,
) {
  const query = search.query?.trim().toLowerCase();
  const candidates = filterProjects(projects, search.category ?? "All").filter(
    (project) =>
      !query ||
      [
        project.title,
        project.description.replace(/<[^>]*>/g, ""),
        ...project.tech,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
  );
  return {
    search,
    projects: candidates.filter(
      (project) =>
        (search.year === undefined || project.year === search.year) &&
        (search.status === undefined || project.status === search.status),
    ),
    missingYear:
      search.year === undefined
        ? 0
        : candidates.filter((project) => project.year === undefined).length,
    missingStatus:
      search.status === undefined
        ? 0
        : candidates.filter((project) => project.status === undefined).length,
  };
}
