"use client";

import { useEffect, useState } from "react";
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

/**
 * First render: the cards sit stacked like a deck on the top slot, each one
 * scaled back a touch, then drop into their rows one after another on a
 * spring. Later filter changes use the quieter slide.
 */
const deck = {
  stacked: (index: number) => ({
    y: `${-index * 100}%`,
    scale: 1 - Math.min(index, 5) * 0.025,
    opacity: index === 0 ? 1 : 0.92,
  }),
  settled: (index: number) => ({
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 230,
      damping: 24,
      mass: 0.9,
      delay: 0.07 * index,
    },
  }),
};
const DECK_SETTLE_MS = 1400;

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
  const [dealt, setDealt] = useState(!!reduced);
  useEffect(() => {
    if (dealt) return;
    const timer = window.setTimeout(() => setDealt(true), DECK_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [dealt]);
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
        <AnimatePresence initial={!reduced} mode="popLayout">
          {visible.map((project, index) => (
            <motion.li
              layout={reduced ? false : "position"}
              key={project.title}
              custom={index}
              variants={dealt ? undefined : deck}
              initial={dealt ? { opacity: 0, y: reduced ? 0 : 12 } : "stacked"}
              animate={dealt ? { opacity: 1, y: 0 } : "settled"}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
              transition={dealt ? { duration: reduced ? 0 : 0.25 } : undefined}
              style={{ zIndex: visible.length - index }}
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
