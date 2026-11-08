"use client";

import { motion } from "framer-motion";
import TabLift from "./TabLift";

const ExperienceMobile = () => {
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
    <section id="experience" className="min-h-screen w-full py-30">
      <motion.div
        className="mx-auto flex max-w-[1000px] flex-col px-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        <motion.div variants={slideUp} className="relative">
          <h1 className="font-mono text-2xl font-bold text-teal-400">
            / experience
          </h1>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-teal-400/40 to-transparent"></div>
        </motion.div>

        <motion.div variants={slideUp} className="mt-16">
          <div id="jobs-container">
            <TabLift />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ExperienceMobile;
