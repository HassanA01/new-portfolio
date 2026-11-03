"use client";

import { useId } from "react";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import styles from "./FeaturedProjectCard.module.css";

const outline =
  "M60 28 H438 Q482 28 500 3 Q518 28 562 28 H940 Q972 28 972 60 V292 Q972 330 997 350 Q972 370 972 408 V640 Q972 672 940 672 H562 Q518 672 500 697 Q482 672 438 672 H60 Q28 672 28 640 V408 Q28 370 3 350 Q28 330 28 292 V60 Q28 28 60 28 Z";

export default function FeaturedProjectCard({ project }: { project: Project }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className={`project-pointed-shell ${styles.frame}`}>
      <svg
        className="project-pointed-outline"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-border`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="rgb(var(--signature-1))" />
            <stop offset="1" stopColor="rgb(var(--signature-3))" />
          </linearGradient>
        </defs>
        <path
          d={outline}
          fill="none"
          stroke={`url(#${id}-border)`}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ProjectCard project={project} feature />
    </div>
  );
}
