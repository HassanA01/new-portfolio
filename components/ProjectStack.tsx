"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import { projectStackLayout } from "@/lib/project-stack";

export default function ProjectStack({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState<number[]>(projects.map(() => 150));
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const id = useId();
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const measure = () => {
      const next = Array.from(element.children).map(
        (child) => (child.firstElementChild as HTMLElement).offsetHeight,
      );
      setHeights((previous) =>
        previous.length === next.length &&
        previous.every((height, index) => height === next[index])
          ? previous
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    Array.from(element.children).forEach((child) =>
      observer.observe(child.firstElementChild!),
    );
    return () => observer.disconnect();
  }, [projects, expanded]);
  const layout = projectStackLayout(heights, expanded);
  return (
    <section className="project-stack-section">
      <button
        type="button"
        className="project-stack-toggle"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <span>More things I’ve built</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </motion.span>
      </button>
      <div className="project-stack-stage" data-expanded={expanded}>
        <motion.ul
          ref={list}
          id={id}
          className="project-stack-list"
          aria-label="More projects"
          aria-hidden={!expanded}
          inert={!expanded || undefined}
          initial={false}
          animate={{ height: layout.height }}
          transition={{
            duration: reduced ? 0 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {projects.map((project, index) => (
            <motion.li
              key={project.title}
              data-stack-back={!expanded && index > 0}
              initial={false}
              animate={{
                y: layout.positions[index],
                scale: expanded ? 1 : 1 - Math.min(index, 3) * 0.025,
                opacity: expanded || index < 4 ? 1 : 0,
              }}
              style={{
                height: !expanded && index > 0 ? heights[0] : undefined,
                zIndex: projects.length - index,
                transformOrigin: "center bottom",
              }}
              transition={{
                duration: reduced ? 0 : 0.5,
                delay: reduced ? 0 : expanded ? index * 0.035 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProjectCard project={project} onOpen={() => onOpen(project)} />
            </motion.li>
          ))}
        </motion.ul>
        {!expanded && (
          <button
            type="button"
            className="project-stack-open"
            aria-label={`Expand ${projects.length} more projects`}
            onClick={() => setExpanded(true)}
          />
        )}
      </div>
    </section>
  );
}
