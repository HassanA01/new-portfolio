"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { projectTitle, type Project } from "@/components/ProjectCard";
import TechMarks from "@/components/TechMarks";
import ProjectPreview from "@/components/ProjectPreview";

/**
 * The featured-project template. Every card gets the same five slots in the
 * same places: media, title, blurb, stack, links. Slot heights are reserved
 * in CSS, so a short blurb or a two-word title never shifts anything below
 * it. Override a slot through props; add to the card through `children`.
 */
export default function FeaturedProject({
  project,
  blurb = project.description.replace(/<[^>]*>/g, ""),
  maxTech = 6,
  children,
  className,
}: {
  project: Project;
  /** Plain-text replacement for the catalogue description. */
  blurb?: string;
  /** How many technology marks to show. */
  maxTech?: number;
  /** Extra content rendered between the stack and the links. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article className={["featured", className].filter(Boolean).join(" ")}>
      <ProjectPreview
        src={project.image}
        title={project.title}
        sizes="(max-width: 600px) 90vw, 440px"
        className="featured-media"
        eager
      />
      <div className="featured-body">
        <h3
          className={`featured-title ${projectTitle.className}`}
          style={projectTitle.style}
        >
          {project.title}
        </h3>
        <p className="featured-blurb">{blurb}</p>
        <TechMarks
          tech={project.tech}
          max={maxTech}
          label={`${project.title} technologies`}
        />
        {children}
        <div className="featured-links">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code (opens in a new tab)`}
            >
              <Github size={16} aria-hidden="true" />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live site (opens in a new tab)`}
            >
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
