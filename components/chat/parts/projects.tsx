"use client";
import ProjectExplorer from "@/components/ProjectExplorer";
import type { ProjectToolOutput } from "@/lib/agent/shared/messages";

export default function ProjectsPart({
  output,
}: {
  output: ProjectToolOutput;
}) {
  const { search, projects, missingYear, missingStatus } = output;
  const note = [
    search.query && `matching “${search.query.toLowerCase()}”`,
    search.year && `from ${search.year}`,
    search.status === "active" && "currently active",
    search.status === "completed" && "completed",
  ]
    .filter(Boolean)
    .join(" · ");
  const missing = [
    missingYear > 0 && "project years",
    missingStatus > 0 && "current project status",
  ]
    .filter(Boolean)
    .join(" and ");
  return (
    <ProjectExplorer
      initialFilter={search.category ?? "All"}
      results={projects}
      note={[
        note,
        missing &&
          `i haven’t recorded ${missing} for some of these yet, so i can’t confirm those matches.`,
      ]
        .filter(Boolean)
        .join(". ")}
    />
  );
}
