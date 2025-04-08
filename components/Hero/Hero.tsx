"use client";
import { motion } from "framer-motion";
import ProfilePic from "../../public/profile_pic.png";
import Image from "next/image";
import GrainBackground from "../../public/grain.jpg";
import Link from "next/link";
import HeroOrbit from "./HeroOrbit";
import Greeting from "./Greeting";

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.05,
        when: "beforeChildren",
        ease: "easeOut",
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
        bounce: 0.2,
        damping: 7,
        stiffness: 50,
      },
    },
  };

  const buttonContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 1.2,
        when: "beforeChildren",
      },
    },
  };

  return (
    <div id="home" className="relative z-0 h-screen overflow-clip">
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_70%,transparent_100%)]">
        <div
          className="absolute inset-0 -z-50 opacity-5"
          style={{
            backgroundImage: `url(${GrainBackground.src})`,
          }}
        ></div>
        <div className="hero-ring size-[620px]"></div>
        <div className="hero-ring size-[820px]"></div>
        <div className="hero-ring size-[1020px]"></div>
        <div className="hero-ring size-[1220px]"></div>

        <HeroOrbit
          size={350}
          rotation={-115}
          opacity={20}
          shouldOrbit
          orbitDuration="30s"
          shouldSpin
          spinDuration="4s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-12 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>

        <HeroOrbit
          size={400}
          rotation={105}
          opacity={30}
          shouldOrbit
          orbitDuration="20s"
          shouldSpin
          spinDuration="5s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-8 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>

        <HeroOrbit
          size={540}
          rotation={35}
          opacity={100}
          shouldOrbit
          orbitDuration="30s"
          shouldSpin
          spinDuration="7s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-10 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>

        <HeroOrbit
          size={700}
          rotation={-105}
          opacity={20}
          shouldOrbit
          orbitDuration="35s"
          shouldSpin
          spinDuration="8s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-12 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>

        <HeroOrbit
          size={800}
          rotation={-45}
          opacity={80}
          shouldOrbit
          orbitDuration="50s"
          shouldSpin
          spinDuration="3s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-28 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>

        <HeroOrbit
          size={850}
          rotation={145}
          opacity={70}
          shouldOrbit
          orbitDuration="25s"
          shouldSpin
          spinDuration="5s"
        >
          <Image
            src="/star.svg"
            alt="Star"
            width={24}
            height={24}
            className="size-20 [filter:invert(65%)_sepia(74%)_saturate(401%)_hue-rotate(122deg)_brightness(90%)_contrast(87%)]"
          />
        </HeroOrbit>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex h-full max-w-[1000px] flex-col items-center pt-32 sm:justify-center sm:pt-0"
      >
        <motion.div variants={item}>
          <Image src={ProfilePic} alt="Me Coding" height={100} width={100} />
        </motion.div>

        <motion.div
          variants={item}
          className="my-2 inline-flex items-center gap-4 rounded-lg border border-gray-600 px-6 py-1.5"
        >
          <div className="relative size-2.5 gap-4 rounded-full bg-green-500">
            <div className="size-2.5 animate-ping gap-4 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-medium">Online</div>
        </motion.div>

        <motion.div
          variants={container}
          className="max-w-2xl px-4 text-center sm:flex sm:flex-col"
        >
          <motion.h1 variants={item} className="py-2 text-lg sm:text-2xl">
            <Greeting />
          </motion.h1>
          <motion.h1 variants={item} className="text-3xl sm:text-3xl">
            Software Engineer
          </motion.h1>
          <motion.p variants={item} className="mx-auto mt-2 max-w-xl">
            I&apos;m a software engineer based in Toronto, Canada. I specialize
            in developing scalable applications that deliver meaningful impact
            and drive real-world results.
          </motion.p>
        </motion.div>

        <motion.div
          variants={buttonContainer}
          className="flex flex-col gap-4 py-8 sm:flex-row"
        >
          <motion.button
            variants={item}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-8 py-4 text-lg font-semibold transition-colors hover:border-teal-500 hover:text-teal-500"
          >
            <Image
              src="/resume.svg"
              alt="Resume"
              width={20}
              height={20}
              className="invert"
            />
            My Resume
          </motion.button>

          <motion.div variants={item}>
            <Link href="https://linkedin.com/in/hassana01" target="_blank">
              <button className="rounded-lg border border-teal-500 bg-teal-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-teal-600 hover:bg-teal-600">
                Let&apos;s Connect!
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
