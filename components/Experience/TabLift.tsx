// components/TabLift.tsx
"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import experienceData from "@/data/experience.json";

const tabs = experienceData.experience.map((exp) => exp.company);

const TabLift = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTab = (tab: string) => {
    const container = tabsRef.current;
    const activeTabElement = container?.querySelector(`[data-value="${tab}"]`);

    if (container && activeTabElement) {
      const containerWidth = container.offsetWidth;
      const tabWidth = (activeTabElement as HTMLElement).offsetWidth;
      const tabLeft = (activeTabElement as HTMLElement).offsetLeft;

      const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    scrollToTab(value);
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl">
      <Tabs.Root
        defaultValue={tabs[0]}
        onValueChange={handleTabChange}
        className="rounded-lg"
      >
        <div className="relative border-b border-zinc-800">
          <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l to-transparent" />
          <div className="from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r to-transparent" />

          <div
            ref={tabsRef}
            className="scrollbar-hide overflow-x-auto scroll-smooth"
          >
            <Tabs.List className="flex min-w-full p-1 whitespace-nowrap">
              {tabs.map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  data-value={tab}
                  className={clsx(
                    "relative rounded-md px-4 py-2 text-sm font-medium transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    activeTab === tab
                      ? "border-2 border-teal-400/20 text-teal-400"
                      : "text-zinc-400 hover:text-zinc-100",
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-md bg-zinc-800/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>
        </div>

        <div className="px-1 pt-6">
          {experienceData.experience.map((experience) => (
            <Tabs.Content
              key={experience.company}
              value={experience.company}
              className="text-zinc-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7 }}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-teal-400">
                      {experience.title}
                    </h3>
                    <p className="text-sm font-normal text-zinc-400">
                      {experience.duration}
                    </p>
                  </div>

                  <ul className="ml-4 list-disc space-y-2 text-sm text-zinc-300">
                    {experience.highlights.map((highlight, index) => (
                      <li key={index} className="leading-relaxed">
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-200">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>
    </div>
  );
};

export default TabLift;
