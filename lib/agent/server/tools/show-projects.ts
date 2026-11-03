import "server-only";
import { tool } from "ai";
import { z } from "zod";
import projects from "@/data/projects.json";
import {
  projectFilters,
  searchProjects,
  type ProjectSearch,
} from "@/lib/project-browser";

export const executeProjectSearch = async (input: ProjectSearch) =>
  searchProjects(projects, input);

export const showProjects = tool({
  description:
    "Search the public project catalogue and render the matching interactive project cards. Use for project browsing, named-project questions, comparisons, recommendations, and follow-ups; omit unrelated profile and resume requests. Category, literal substring query, exact year, and active/completed status are combined, so preserve every requested constraint. Results include the applied search, matching projects, and missingYear/missingStatus counts for otherwise-relevant entries whose metadata cannot confirm the filters. A missing metadata count is uncertainty, not proof that no such projects exist; the catalogue is not live GitHub activity.",
  inputSchema: z.object({
    category: z
      .enum(projectFilters)
      .default("All")
      .describe(
        "Requested project category; All means no category restriction.",
      ),
    query: z
      .string()
      .max(120)
      .optional()
      .describe(
        "Literal project name, technology, or short substring. Not the full visitor question or a boolean/semantic expression.",
      ),
    year: z
      .number()
      .int()
      .min(1990)
      .max(2100)
      .optional()
      .describe(
        "One exact documented project year. Undated entries do not match; never infer their years.",
      ),
    status: z
      .enum(["active", "completed"])
      .optional()
      .describe(
        "Use active for current/ongoing work and completed for finished work. Omit for general browsing; entries with unknown status do not match.",
      ),
  }),
  execute: executeProjectSearch,
});
