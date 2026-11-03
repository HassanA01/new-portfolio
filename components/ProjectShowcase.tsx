"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import projects from "@/data/projects.json";
import { useCarouselPull } from "@/components/ui/use-carousel-pull";
import FeaturedProjectCard from "@/components/FeaturedProjectCard";
import Link from "next/link";
import { disclosureSpring } from "@/components/ui/accordion";
import { ArrowUpRight, Bot } from "lucide-react";
export { ProjectCard } from "@/components/ProjectCard";
const featured = [projects[0], projects[3], projects[1]];

export default function ProjectShowcase() {
  const features = useRef<HTMLUListElement>(null);
  const featurePull = useCarouselPull(features);
  const [featureIndex, setFeatureIndex] = useState(0);
  function showFeature(index: number) {
    const target = features.current;
    if (target)
      target.scrollTo({
        left: index * target.clientWidth,
        behavior: reduced ? "instant" : "smooth",
      });
  }
  const reduced = useReducedMotion();
  return (
    <div className="project-showcase">
      <p className="project-intro">
        Here are some projects I’ve built or am currently building.
      </p>
      <motion.div
        className="project-feature-carousel"
        style={{ x: featurePull.x }}
      >
        <ul
          {...featurePull.events}
          style={{ touchAction: "pan-y", userSelect: "none" }}
          ref={features}
          className="project-feature-track"
          aria-label="Featured projects"
          onScroll={() => {
            const track = features.current;
            if (track)
              setFeatureIndex(Math.round(track.scrollLeft / track.clientWidth));
          }}
        >
          {featured.map((project) => (
            <li key={project.title}>
              <FeaturedProjectCard project={project} />
            </li>
          ))}
        </ul>
      </motion.div>
      <div
        className="project-pagination project-feature-pagination"
        aria-label="Choose a featured project"
      >
        {featured.map((project, index) => (
          <button
            key={project.title}
            type="button"
            aria-label={`Feature ${project.title}`}
            aria-current={featureIndex === index ? "true" : undefined}
            onClick={() => showFeature(index)}
          />
        ))}
      </div>
      <motion.div
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={disclosureSpring}
      >
        <Link
          href="/?explore=projects"
          className="project-explore-banner"
          scroll={false}
        >
          <span className="project-explore-icon">
            <Bot size={22} aria-hidden="true" />
          </span>
          <span>
            <strong>Want to see more of my projects?</strong>
            <span>Explore with Anike</span>
          </span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
