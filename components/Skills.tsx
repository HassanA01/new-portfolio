"use client";
import {
  SiPython,
  SiJavascript,
  SiDocker,
  SiTypescript,
  SiC,
  SiMongodb,
  SiGo,
  SiAngular,
  SiNextdotjs,
  SiCplusplus,
  SiReact,
  SiFirebase,
  SiPostgresql,
  SiTailwindcss,
  SiGrafana,
} from "react-icons/si";
import { FaJira, FaAws, FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";
import { ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const skillsData = [
  { name: "Python", Icon: SiPython },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "Docker", Icon: SiDocker },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "C", Icon: SiC },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Go", Icon: SiGo },
  { name: "Angular", Icon: SiAngular },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "C++", Icon: SiCplusplus },
  { name: "React", Icon: SiReact },
  { name: "Firebase", Icon: SiFirebase },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "Tailwind", Icon: SiTailwindcss },
  { name: "Java", Icon: FaJava },
  { name: "AWS", Icon: FaAws },
  { name: "Jira", Icon: FaJira },
  { name: "C#", Icon: TbBrandCSharp },
  { name: "Grafana", Icon: SiGrafana },
];

const Skills = () => {
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;

    const total = skillsData.length;
    const radius = 250;

    skillsData.forEach((_, index) => {
      const angle = (index / total) * 2 * Math.PI;
      const element = orbit.children[index] as HTMLElement;

      if (element) {
        element.style.transform = `rotateY(${angle}rad) translateZ(${radius}px)`;
      }
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.3,
      },
    },
  };

  return (
    <section id="skills" className="min-h-screen w-full py-30">
      <motion.div
        className="mx-auto flex max-w-[1000px] flex-col px-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        <motion.div variants={slideUp} className="relative">
          <h1 className="font-mono text-2xl font-bold text-teal-400">
            / skills
          </h1>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-teal-400/40 to-transparent"></div>
        </motion.div>

        <motion.p variants={slideUp} className="mt-4 text-zinc-400">
          A collection of technologies I've worked with across various projects
          and roles. <br /> Each icon represents a tool that has shaped my
          development journey.
        </motion.p>

        <motion.div variants={slideUp}>
          <div className="relative mx-auto h-[300px] w-full overflow-hidden sm:h-[300px]">
            {/* 3D space for skills orbit */}
            <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2">
              <div
                ref={orbitRef}
                className="skills-orbit relative transition-transform duration-200 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {skillsData.map((skill, index) => {
                  const IconComponent = skill.Icon;
                  return (
                    <div
                      key={skill.name}
                      className="group absolute top-1/2 left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-300 hover:border-teal-400/50 hover:shadow-[0_0_25px_5px_rgba(20,184,166,0.15)]"
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        boxShadow: "0 0 15px 2px rgba(20,184,166,0.1)",
                      }}
                    >
                      <IconComponent className="h-10 w-10 text-zinc-400 transition-colors duration-300 group-hover:text-teal-400" />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm opacity-0 transition-opacity group-hover:opacity-100">
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* radial gradient overlay for depth effect */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 40%, var(--background) 90%)`,
              }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          variants={slideUp}
          className="mx-auto mt-16 max-w-[1000px] px-4"
        >
          <h2 className="text-xl font-semibold text-teal-400">
            Beyond The Core Stack
          </h2>
          <div className="mt-6 grid gap-6 text-zinc-400 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium tracking-wider text-zinc-300 uppercase">
                Frameworks & Libraries
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    FastAPI & Flask for rapid API development
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Data Science: Pandas, NumPy, Matplotlib
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Spring Boot for Java enterprise applications
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Real-time communications with Socket.io
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium tracking-wider text-zinc-300 uppercase">
                Design & Documentation
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    System design with Excalidraw
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Documentation with Notion & Confluence
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Wireframing with Figma
                  </span>
                </li>
                <li className="group flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-teal-400/60 transition-all duration-300 group-hover:text-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span className="transition-colors duration-300 group-hover:text-zinc-200">
                    Technical writing for knowledge sharing
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* keyframes animations */}
      <style jsx>{`
        .skills-orbit {
          animation: orbit 20s linear infinite;
        }

        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotateY(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotateY(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default Skills;
