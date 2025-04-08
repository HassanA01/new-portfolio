"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import { Github } from "lucide-react";
import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperClass } from "swiper/react";
import projectsData from "@/data/projects.json";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

interface Project {
  title: string;
  description: string;
  tech: string[];
  image: string;
  github: string;
  live: string;
}

const Projects = () => {
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLoopEnabled(window.innerWidth < 640); // 640px is the sm breakpoint
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const swiperClickHandler = (swiper: SwiperType, index: number) => {
    swiper.slideTo(index);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
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
    <Fragment>
      <style jsx global>{`
        .swiper-coverflow {
          position: relative;
        }

        @media (min-width: 640px) {
          .swiper-coverflow::before,
          .swiper-coverflow::after {
            content: "";
            position: absolute;
            top: 0;
            width: 25%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
          }

          .swiper-coverflow::before {
            left: 0;
            background: linear-gradient(to right, rgb(9 9 11 / 1), transparent);
          }

          .swiper-coverflow::after {
            right: 0;
            background: linear-gradient(to left, rgb(9 9 11 / 1), transparent);
          }
        }

        .swiper-pagination {
          position: relative !important;

          @media (min-width: 640px) {
            display: block;
            margin-top: 2rem !important;
          }
        }

        .swiper-pagination-bullet {
          width: 20px;
          height: 3px;
          border-radius: 1px;
          background: rgb(161 161 170);
          opacity: 0.5;
          transition: all 0.3s;
        }

        .swiper-pagination-bullet-active {
          width: 30px;
          background: rgb(45 212 191) !important;
          opacity: 1;
        }

        /* Mobile teal outline glow effect */
        @media (max-width: 639px) {
          .project-card {
            box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.4);
            border-color: rgba(20, 184, 166, 0.3) !important;
          }

          .project-card:hover {
            box-shadow: 0 0 15px 3px rgba(20, 184, 166, 0.5);
            border-color: rgba(20, 184, 166, 0.6) !important;
          }
        }
      `}</style>

      <section id="projects" className="min-h-screen w-full py-30">
        <motion.div
          className="mx-auto flex max-w-[1000px] flex-col px-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          <motion.div variants={slideUp} className="relative">
            <h1 className="font-mono text-2xl font-bold text-teal-400">
              / projects
            </h1>
            <div className="mt-2 h-px w-full bg-gradient-to-r from-teal-400/40 to-transparent"></div>
          </motion.div>

          <motion.div variants={slideUp} className="mt-16">
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              loop={isLoopEnabled}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              pagination={{
                clickable: true,
                bulletActiveClass:
                  "swiper-pagination-bullet-active !bg-teal-400",
              }}
              modules={[EffectCoverflow, Pagination]}
              className="swiper-coverflow w-full !pb-10 sm:!pb-0"
            >
              {projectsData.map((project: Project, index: number) => (
                <SwiperSlide
                  key={index}
                  className="!w-[380px] cursor-pointer !px-5 !py-8 sm:!w-[440px]"
                  onClick={(e) => {
                    const swiperEl = (e.target as HTMLElement).closest(
                      ".swiper",
                    ) as HTMLElement & { swiper?: SwiperClass };
                    const swiperInstance = swiperEl?.swiper;
                    if (swiperInstance) {
                      swiperClickHandler(swiperInstance, index);
                    }
                  }}
                >
                  <div className="project-card h-[520px] [transform-origin:center_center] [transform:perspective(1px)_translateZ(0)] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 [-webkit-font-smoothing:subpixel-antialiased] transition-all duration-300 hover:scale-[1.042] hover:border-teal-400/50 hover:shadow-[0_0_15px_2px_rgba(20,184,166,0.3)] sm:shadow-none">
                    <div className="relative h-48 w-full">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex h-[calc(100%-192px)] flex-col p-5">
                      <div>
                        <h3 className="font-roboto-mono text-lg font-semibold text-teal-400">
                          {project.title}
                        </h3>
                      </div>

                      <div className="scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 mt-3 h-32 overflow-y-auto pr-2">
                        <p
                          className="text-sm leading-relaxed text-zinc-400"
                          dangerouslySetInnerHTML={{
                            __html: project.description,
                          }}
                        />
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300 transition-all duration-300 hover:border-teal-400/50 hover:bg-zinc-800 hover:text-teal-400 hover:shadow-[0_0_15px_2px_rgba(20,184,166,0.15)]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-zinc-800 p-2.5 text-zinc-400 transition-colors hover:text-teal-400"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                          {/* <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-zinc-800 p-2.5 text-zinc-400 transition-colors hover:text-teal-400"
                          >
                            <Globe className="h-5 w-5" />
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </motion.div>
      </section>
    </Fragment>
  );
};

export default Projects;
