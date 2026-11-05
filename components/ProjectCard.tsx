import type { MouseEvent } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import TechMarks from "@/components/TechMarks";
import ProjectPreview from "@/components/ProjectPreview";
import { Cormorant_Garamond } from "next/font/google";
import projects from "@/data/projects.json";
export const projectTitle = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
});

export type Project = (typeof projects)[number];
const summaries: Record<string, string> = {
  MailflowAI:
    "AI-powered customer support for e-commerce, connecting store data and email to help answer customers around the clock.",
  "B2W - UofT Hacks 12":
    "A financial dashboard with spending predictions, expense tracking, and personalized recommendations.",
  "BizReach Marketplace":
    "A marketplace connecting mobile businesses with clients, with real-time chat and AI-assisted gig descriptions.",
  "Portfolio Website":
    "The place you’re in right now. A personal corner of the internet, built one detail at a time.",
  "Proxy Server":
    "A Python proxy server with socket-based networking and caching for frequently requested content.",
};
export function ProjectCard({
  project,
  feature = false,
  detail = false,
  onOpen,
}: {
  project: Project;
  feature?: boolean;
  detail?: boolean;
  onOpen?: () => void;
}) {
  const row = !feature && !detail && Boolean(onOpen);
  // The card body sits above the invisible open button so its text stays
  // selectable; clicks on the body (not links, not an in-progress text
  // selection) still open the details.
  const openFromBody = row
    ? (event: MouseEvent<HTMLElement>) => {
        const target = event.target as Element;
        if (target.closest("a, button, dialog")) return;
        if (window.getSelection()?.toString()) return;
        onOpen?.();
      }
    : undefined;
  return (
    <article
      className={
        detail
          ? "project-detail-card"
          : feature
            ? "project-glass project-feature"
            : "project-glass project-slide-card"
      }
      onClick={openFromBody}
    >
      {!feature && !detail && onOpen && (
        <button
          type="button"
          className="project-row-open"
          aria-label={`View ${project.title} details`}
          aria-haspopup="dialog"
          onClick={onOpen}
        />
      )}
      <ProjectPreview
        src={project.image}
        title={project.title}
        sizes={
          feature
            ? "(max-width: 600px) 90vw, 440px"
            : "(max-width: 600px) 80vw, 300px"
        }
      />
      <div className="project-copy">
        <h3 className={projectTitle.className} style={projectTitle.style}>
          {project.title}
        </h3>
        <p>
          {detail
            ? project.description.replace(/<[^>]*>/g, "")
            : (summaries[project.title] ??
              project.description.replace(/<[^>]*>/g, ""))}
        </p>
        {feature && (
          <TechMarks
            tech={project.tech}
            label={`${project.title} technologies`}
          />
        )}
        {detail && (
          <TechMarks
            tech={project.tech}
            max={project.tech.length}
            label={`${project.title} technologies`}
          />
        )}
        <div className="project-links">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code (opens in a new tab)`}
            >
              <Github size={16} /> <span>Code</span>
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live site (opens in a new tab)`}
            >
              <span>Visit</span>
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
