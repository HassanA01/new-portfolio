"use client";

import { useEffect, useId, useRef, useState } from "react";
import FeaturedProject from "@/components/FeaturedProject";
import type { Project } from "@/components/ProjectCard";

/**
 * Phone version of the featured card. The pointed outline is drawn in real
 * pixels for the card's measured size, so the four points and the corners
 * are the same size on a tall phone card as the desktop card's are on a wide
 * one. Inside sits the FeaturedProject template, stacked.
 */
const INSET = 18;
const RADIUS = 30;
const POINT_DEPTH = 16;
const TOP_HALF_WIDTH = 60;
const TOP_CONTROL = 18;
const SIDE_HALF_HEIGHT = 54;
const SIDE_CONTROL = 20;
const FALLBACK = { w: 342, h: 520 };

function outlinePath(w: number, h: number) {
  const i = INSET;
  const r = RADIUS;
  const cx = w / 2;
  const cy = h / 2;
  return [
    `M${i + r} ${i}`,
    `H${cx - TOP_HALF_WIDTH}`,
    `Q${cx - TOP_CONTROL} ${i} ${cx} ${i - POINT_DEPTH}`,
    `Q${cx + TOP_CONTROL} ${i} ${cx + TOP_HALF_WIDTH} ${i}`,
    `H${w - i - r}`,
    `Q${w - i} ${i} ${w - i} ${i + r}`,
    `V${cy - SIDE_HALF_HEIGHT}`,
    `Q${w - i} ${cy - SIDE_CONTROL} ${w - i + POINT_DEPTH} ${cy}`,
    `Q${w - i} ${cy + SIDE_CONTROL} ${w - i} ${cy + SIDE_HALF_HEIGHT}`,
    `V${h - i - r}`,
    `Q${w - i} ${h - i} ${w - i - r} ${h - i}`,
    `H${cx + TOP_HALF_WIDTH}`,
    `Q${cx + TOP_CONTROL} ${h - i} ${cx} ${h - i + POINT_DEPTH}`,
    `Q${cx - TOP_CONTROL} ${h - i} ${cx - TOP_HALF_WIDTH} ${h - i}`,
    `H${i + r}`,
    `Q${i} ${h - i} ${i} ${h - i - r}`,
    `V${cy + SIDE_HALF_HEIGHT}`,
    `Q${i} ${cy + SIDE_CONTROL} ${i - POINT_DEPTH} ${cy}`,
    `Q${i} ${cy - SIDE_CONTROL} ${i} ${cy - SIDE_HALF_HEIGHT}`,
    `V${i + r}`,
    `Q${i} ${i} ${i + r} ${i}`,
    "Z",
  ].join(" ");
}

export default function FeaturedProjectMobile({
  project,
}: {
  project: Project;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const shell = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const element = shell.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height)
        setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const box = size ?? FALLBACK;
  return (
    <div ref={shell} className="project-pointed-shell featured-mobile-frame">
      <svg
        className="project-pointed-outline"
        viewBox={`0 0 ${box.w} ${box.h}`}
        preserveAspectRatio={size ? "xMidYMid meet" : "none"}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-border`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="rgb(var(--signature-1))" />
            <stop offset="1" stopColor="rgb(var(--signature-3))" />
          </linearGradient>
        </defs>
        <path
          d={outlinePath(box.w, box.h)}
          fill="none"
          stroke={`url(#${id}-border)`}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <FeaturedProject project={project} />
    </div>
  );
}
