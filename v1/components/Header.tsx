"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const Header = () => {
  const [activeSection, setActiveSection] = useState("");
  const [isNameVisible, setIsNameVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    const handleScroll = () => {
      if (isMobile) {
        const shouldHideName =
          window.scrollY > 100 || window.location.hash === "#about";
        setIsNameVisible(!shouldHideName);
      } else {
        setIsNameVisible(true); // Always show on desktop
      }
    };

    const handleHashChange = () => {
      setActiveSection(window.location.hash || "#home");
      handleScroll();
    };

    checkMobile();
    handleHashChange();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [isMobile]);

  return (
    <header className="bg-background fixed top-0 z-50 w-full">
      <nav className="mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div
            className={`flex flex-col items-start transition-opacity duration-300 ${
              isNameVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="font-sans text-lg leading-none font-bold">
              Aneeq
            </span>
            <span className="font-sans text-lg leading-none font-bold">
              Hassan
            </span>
          </div>

          <div className="hidden space-x-4 md:flex">
            <a
              href="#home"
              className={`text-gray-300 hover:text-teal-500 ${
                activeSection === "#home"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              Home
            </a>
            <a
              href="#about"
              className={`text-gray-300 hover:text-teal-500 ${
                activeSection === "#about"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              About
            </a>
            {/* this experience section for mobile view and the one beneath is for web */}
            <a
              href="#experience"
              className={`text-gray-300 hover:text-teal-500 sm:hidden ${
                activeSection === "#experience"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              Experience
            </a>
            <a
              href="#experience-web"
              className={`text-gray-300 hover:text-teal-500 ${
                activeSection === "#experience"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              Experience
            </a>
            <a
              href="#projects"
              className={`text-gray-300 hover:text-teal-500 ${
                activeSection === "#projects"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              Projects
            </a>
            <a
              href="#skills"
              className={`text-gray-300 hover:text-teal-500 ${
                activeSection === "#skills"
                  ? "underline decoration-teal-500 decoration-2 underline-offset-8"
                  : "decoration-transparent"
              }`}
            >
              Skills
            </a>
          </div>

          {/* Icons for GitHub, LinkedIn, and Mail on the right */}
          <div className="flex space-x-4">
            <a
              href="https://github.com/hassana01"
              target="_blank"
              aria-label="GitHub"
              className="group"
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="invert transition-all duration-200 group-hover:[filter:invert(49%)_sepia(61%)_saturate(901%)_hue-rotate(127deg)_brightness(96%)_contrast(101%)]"
              />
            </a>
            <a
              href="https://linkedin.com/in/hassana01"
              target="_blank"
              aria-label="LinkedIn"
              className="group"
            >
              <Image
                src="/linkedin.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                className="invert transition-all duration-200 group-hover:[filter:invert(49%)_sepia(61%)_saturate(901%)_hue-rotate(127deg)_brightness(96%)_contrast(101%)]"
              />
            </a>
            <a
              href="mailto:hassan.aneeq01@gmail.com"
              aria-label="Mail"
              className="group"
            >
              <Image
                src="/mail.svg"
                alt="Mail"
                width={24}
                height={24}
                className="invert transition-all duration-200 group-hover:[filter:invert(49%)_sepia(61%)_saturate(901%)_hue-rotate(127deg)_brightness(96%)_contrast(101%)]"
              />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
