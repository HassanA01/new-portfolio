import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";
import projects from "@/data/projects.json";
const projectTitle = Cormorant_Garamond({
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
  "Myriad CRO Landing Page":
    "A responsive agency website with a guided process, expandable FAQs, and a focus on conversion.",
  "Portfolio Website":
    "The place you’re in right now. A personal corner of the internet, built one detail at a time.",
  "IoT Data Monitoring System":
    "A TimescaleDB-backed monitoring system for exploring more than a million sensor records.",
  "Proxy Server":
    "A Python proxy server with socket-based networking and caching for frequently requested content.",
  "Delivery Service App":
    "An event-driven delivery tracker that follows orders from creation through to completion.",
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
  return (
    <article
      className={
        detail
          ? "project-detail-card"
          : feature
            ? "project-glass project-feature"
            : "project-glass project-slide-card"
      }
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
      <div className="project-preview">
        <Image
          src={project.image}
          alt={`${project.title} project preview`}
          fill
          sizes={
            feature
              ? "(max-width: 600px) 90vw, 440px"
              : "(max-width: 600px) 80vw, 300px"
          }
        />
      </div>
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
        {(feature || detail) && (
          <ul
            className="project-stack"
            aria-label={`${project.title} technologies`}
          >
            {project.tech.slice(0, detail ? undefined : 4).map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
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
