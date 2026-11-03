"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import projects from "@/data/projects.json";
import FilterPill from "@/components/FilterPill";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import {
  filterProjects,
  projectFilters,
  type ProjectFilter,
} from "@/lib/project-browser";

export default function ProjectExplorer({
  initialFilter = "All",
  results,
  note,
}: {
  initialFilter?: ProjectFilter;
  results?: Project[];
  note?: string;
}) {
  const [filter, setFilter] = useState(initialFilter);
  const [selected, setSelected] = useState<Project | null>(null);
  const reduced = useReducedMotion();
  const visible = filterProjects(results ?? projects, filter);
  return (
    <section
      className="project-showcase project-explorer"
      aria-label="Interactive project browser"
    >
      <div
        className="project-filters"
        role="group"
        aria-label="Filter projects"
      >
        {projectFilters.map((category) => (
          <FilterPill
            key={category}
            selected={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </FilterPill>
        ))}
      </div>
      {note && <p className="agent-tool-note">{note}</p>}
      <p className="project-result-count" aria-live="polite">
        {visible.length} projects · select a card to explore
      </p>
      {visible.length === 0 && (
        <p className="agent-tool-empty">
          no matches with those filters. try another year, technology, or ask to
          see all my projects.
        </p>
      )}
      <motion.ul
        className="project-explorer-list"
        layout={reduced ? false : "position"}
        aria-label="Projects"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((project) => (
            <motion.li
              layout={reduced ? false : "position"}
              key={project.title}
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <ProjectCard
                project={project}
                onOpen={() => setSelected(project)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <ProjectDetailModal
        project={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
