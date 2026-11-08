"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Gamepad2,
  Plane,
  Drumstick,
  Dumbbell,
  Globe,
  Medal,
} from "lucide-react";

const About = () => {
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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: "spring",
        bounce: 0.3,
      },
    },
  };

  const hobbiesContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.6,
      },
    },
  };

  const hobbyItem = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <section id="about" className="min-h-screen w-full py-30">
      <motion.div
        className="mx-auto flex max-w-[1000px] flex-col px-4"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="relative">
          <h1 className="font-mono text-2xl font-bold text-teal-400">
            / about
          </h1>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-teal-400/40 to-transparent" />
        </motion.div>

        <div className="mt-16 space-y-6 text-gray-300">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4 sm:w-2/3"
            >
              <motion.p variants={item} className="font-robot leading-relaxed">
                I&apos;m a recent graduate from{" "}
                <span className="font-medium text-teal-400 transition-colors hover:text-teal-300">
                  University of Toronto
                </span>{" "}
                where I specialized in{" "}
                <span className="font-medium text-gray-200">
                  computer science
                </span>
                .
              </motion.p>

              <motion.p variants={item} className="leading-relaxed">
                Over the course of my journey, I&apos;ve been privileged to gain
                over 3 years of industry experience. I focus on building{" "}
                <span className="font-medium text-gray-200">AI solutions</span>{" "}
                and{" "}
                <span className="font-medium text-gray-200">
                  scalable systems
                </span>
                .
              </motion.p>

              <motion.p variants={item} className="leading-relaxed">
                I&apos;m passionate about teaching and sharing knowledge. When
                not coding, you&apos;ll find me exploring new restaurants and
                experiencing different cuisines.
              </motion.p>
            </motion.div>

            <motion.div
              variants={item}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="hidden sm:block sm:w-1/3"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800">
                <Image
                  src="/aneeq.jpg"
                  alt="About Me"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={hobbiesContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="pt-6"
          >
            <motion.p
              variants={hobbyItem}
              className="mb-4 text-sm tracking-wider text-teal-400 uppercase"
            >
              Things I enjoy
            </motion.p>
            <motion.div
              variants={hobbiesContainer}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Medal className="h-5 w-5 text-teal-400" />
                <span>Futbol</span>
              </motion.div>

              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Gamepad2 className="h-5 w-5 text-teal-400" />
                <span>Gaming</span>
              </motion.div>

              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Plane className="h-5 w-5 text-teal-400" />
                <span>Travel</span>
              </motion.div>

              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Dumbbell className="h-5 w-5 text-teal-400" />
                <span>Gym</span>
              </motion.div>

              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Drumstick className="h-5 w-5 text-teal-400" />
                <span>Foodie</span>
              </motion.div>

              <motion.div
                variants={hobbyItem}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
              >
                <Globe className="h-5 w-5 text-teal-400" />
                <span>Doomscrolling</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
