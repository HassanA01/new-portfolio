"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const Header = () => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash || "#home");
    };

    // Set the initial active section
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <header className="bg-background fixed top-0 z-50 w-full">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Name on the left */}
          <div className="flex flex-col items-start">
            <span className="font-sans text-lg leading-none font-bold">
              Aneeq
            </span>
            <span className="font-sans text-lg leading-none font-bold">
              Hassan
            </span>
          </div>

          {/* Centered Navbar */}
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
            <a
              href="#experience"
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
