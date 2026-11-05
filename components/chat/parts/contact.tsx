"use client";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { disclosureSpring } from "@/components/ui/accordion";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";
import { brandMarks } from "@/components/ui/brand-marks";

type ContactOutput = Extract<ProfileToolOutput, { topic: "contact" }>;

/** Same gradient-stroke idea as the nav icons, one pair per network. */
const tints = {
  github: ["#7cafff", "#c28bea"],
  linkedin: ["#29c6cb", "#6484ed"],
  x: ["#e48caa", "#a17be8"],
} as const;

/** Public links as pills, in the same family as the prompt suggestions. */
export default function ContactPart({ output }: { output: ContactOutput }) {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <section className="agent-contact" aria-label={output.title}>
      <ul className="agent-contact-list">
        {output.items.map((link) => (
          <li key={link.label}>
            <motion.a
              className="agent-contact-pill"
              data-network={link.icon}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={reduced ? undefined : { scale: 0.92 }}
              transition={disclosureSpring}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <linearGradient
                    id={`${id}-${link.icon}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={tints[link.icon][0]} />
                    <stop offset="100%" stopColor={tints[link.icon][1]} />
                  </linearGradient>
                </defs>
                <path
                  d={brandMarks[link.icon]}
                  fill={`url(#${id}-${link.icon})`}
                />
              </svg>
              <span>{link.handle}</span>
              <span className="agent-contact-arrow" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only">
                {" "}
                on {link.label} (opens in a new tab)
              </span>
            </motion.a>
          </li>
        ))}
      </ul>
    </section>
  );
}
