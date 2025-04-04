"use client";

import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-background fixed top-0 z-50 w-full">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Name on the left */}
          <div className="flex flex-col items-start">
            <span className="text-secondaryText text-lg leading-none font-bold">
              Aneeq
            </span>
            <span className="text-secondaryText text-lg leading-none font-bold">
              Hassan
            </span>
          </div>

          {/* Centered Navbar */}
          <div className="hidden space-x-4 md:flex">
            <Link
              href="/"
              className="text-secondaryText hover:text-accentLight"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-secondaryText hover:text-accentLight"
            >
              About
            </Link>
            <Link
              href="/experience"
              className="text-secondaryText hover:text-accentLight"
            >
              Experience
            </Link>
            <Link
              href="/projects"
              className="text-secondaryText hover:text-accentLight"
            >
              Projects
            </Link>
            <Link
              href="/skills"
              className="text-secondaryText hover:text-accentLight"
            >
              Skills
            </Link>
          </div>

          {/* Icons for GitHub, LinkedIn, and Mail on the right */}
          <div className="flex space-x-4">
            <Link
              href="https://github.com/hassana01"
              target="_blank"
              aria-label="GitHub"
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                style={{
                  filter:
                    "invert(88%) sepia(7%) saturate(374%) hue-rotate(37deg) brightness(96%) contrast(89%)",
                }}
              />
            </Link>
            <Link
              href="https://linkedin.com/in/hassana01"
              target="_blank"
              aria-label="LinkedIn"
            >
              <Image
                src="/linkedin.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                style={{
                  filter:
                    "invert(88%) sepia(7%) saturate(374%) hue-rotate(37deg) brightness(96%) contrast(89%)",
                }}
              />
            </Link>
            <Link href="mailto:hassan.aneeq01@gmail.com" aria-label="Mail">
              <Image
                src="/mail.svg"
                alt="Mail"
                width={24}
                height={24}
                style={{
                  filter:
                    "invert(88%) sepia(7%) saturate(374%) hue-rotate(37deg) brightness(96%) contrast(89%)",
                }}
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
