"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import experienceData from "@/data/experience.json";
import clsx from "clsx";

const ExperienceWeb = () => {
  const sortedExperiences = useMemo(() => {
    return experienceData.experience.sort((a, b) => {
      const dateA = new Date(a.duration.split("–")[0]);
      const dateB = new Date(b.duration.split("–")[0]);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  const [selectedExp, setSelectedExp] = useState(sortedExperiences[0]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section id="experience-web" className="min-h-screen w-full py-30">
      <div className="mx-auto flex max-w-[1000px] flex-col px-4">
        <h1 className="text-2xl font-bold text-teal-400">/experience</h1>

        <div className="relative mt-16">
          <div className="absolute left-0 h-0.5 w-full bg-zinc-800">
            <div
              className="absolute h-full bg-teal-400/50"
              style={{
                width: `${
                  ((sortedExperiences.indexOf(selectedExp) + 1) * 100) /
                  sortedExperiences.length
                }%`,
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>

          <div className="relative flex justify-between">
            {sortedExperiences.map((exp) => (
              <button
                key={exp.company}
                onClick={() => setSelectedExp(exp)}
                className={clsx(
                  "group flex flex-col items-center",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                )}
              >
                <div
                  className={clsx(
                    "relative -mt-2.5 h-5 w-5 rounded-full transition-colors",
                    selectedExp.company === exp.company
                      ? "bg-teal-400"
                      : "bg-zinc-800 hover:bg-zinc-700",
                  )}
                >
                  <div
                    className={clsx(
                      "absolute inset-0 rounded-full transition-transform",
                      selectedExp.company === exp.company && "animate-ping",
                    )}
                  />
                </div>
                <span
                  className={clsx(
                    "mt-2 text-sm whitespace-nowrap transition-colors",
                    selectedExp.company === exp.company
                      ? "text-teal-400"
                      : "text-zinc-400 group-hover:text-zinc-300",
                  )}
                >
                  {formatDate(exp.duration.split("–")[0])}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <motion.div
            key={selectedExp.company}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold">
                <span className="text-zinc-400">{selectedExp.title}</span>{" "}
                <span className="text-teal-400">@ {selectedExp.company}</span>
              </h3>
              <p className="text-sm font-normal text-zinc-400">
                {selectedExp.duration}
              </p>
            </div>

            <ul className="ml-4 list-disc space-y-2 text-sm text-zinc-300">
              {selectedExp.highlights.map((highlight, i) => (
                <li key={i} className="leading-relaxed">
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium text-zinc-200">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExp.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300 transition-all duration-200 hover:scale-110 hover:bg-teal-400/10 hover:text-teal-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceWeb;
