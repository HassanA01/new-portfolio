"use client";

import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionChevron,
} from "@/components/ui/accordion";
import GlassDropCap from "@/components/GlassDropCap";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";
import Image from "next/image";
import InlineMention from "@/components/InlineMention";

const dropCap = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-drop-cap",
  display: "swap",
});

export default function EducationJourney() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div className={`education-reading ${dropCap.variable}`}>
      <p className="education-intro story-opening">
        <GlassDropCap>I</GlassDropCap> grew up in Brampton, where I went to
        elementary, middle, and high school, discovered hockey, and made a lot
        of the memories that shaped my childhood.
      </p>
      <div className="career-roles education-university-accordion">
        <Accordion
          bounce="mobile"
          className="career-role"
          data-company="university-of-toronto"
        >
          <div className="career-role-heading">
            <Image
              className="career-role-logo"
              src="/company-logos/university-of-toronto.png"
              alt=""
              width={22}
              height={22}
            />
            <AccordionTrigger className="career-role-trigger">
              <span className="career-role-label">
                Honours BSc @ <strong>University of Toronto</strong>
              </span>
              <span className="career-role-dates">2019–2025</span>
              <AccordionChevron />
            </AccordionTrigger>
          </div>
          <AccordionContent>
            <div className="career-role-title">
              <ul className="career-highlights">
                <li>
                  Specialized in Computer Science (most of my courses were CS
                  ones)
                </li>
                <li>
                  was in high distinction until I took{" "}
                  <InlineMention
                    name="STA256"
                    fitContent
                    description="the most cooked stats course"
                  />{" "}
                  <Image
                    className="education-emote"
                    src="/emotes/copege.png"
                    alt="Copege"
                    width={22}
                    height={22}
                  />{" "}
                  (we don’t talk about GPA after that)
                </li>
              </ul>
            </div>
          </AccordionContent>
        </Accordion>
      </div>
      <div hidden>
        <button
          type="button"
          className="education-earlier-trigger"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <span>
            Earlier school years
            <small>Hockey, school stories, and a few fun facts</small>
          </span>
          <ChevronDown
            className="accordion-chevron"
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
        <motion.div
          id={id}
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
          inert={!open}
          aria-hidden={!open}
        >
          <div className="education-earlier-copy">
            <h4>Elementary</h4>
            <div className="education-school-names">
              <span>Aloma Crescent Public School</span>
              <span className="education-school-separator" aria-hidden="true">
                |
              </span>
              <span>Birchbank Public School</span>
            </div>
            <ul className="career-highlights">
              <li>
                Was never the straight{" "}
                <InlineMention
                  name="A student"
                  description="Fun fact: I only had 1 A- from Grade 1–4. The rest were B’s and C’s."
                />
                .
              </li>
              <li>Was introduced to hockey and fell in love with it.</li>
              <li>🚌 monitor in grade 5</li>
              <li>Won soccer intramurals in grade 5</li>
            </ul>
            <div className="education-school-stage">
              <h4>Middle school</h4>
              <div className="education-school-names">
                <span>Balmoral Drive Senior Public School</span>
              </div>
            </div>
            <div className="education-school-stage">
              <h4>High school</h4>
              <div className="education-school-names">
                <span>Bramalea Secondary School</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
