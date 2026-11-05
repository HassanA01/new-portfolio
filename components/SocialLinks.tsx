"use client";

import { useId, useState, type ComponentType } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import { motion, useReducedMotion } from "framer-motion";
import { FileUser } from "lucide-react";
import { brandMarks, type BrandMarkName } from "@/components/ui/brand-marks";
import { disclosureSpring } from "@/components/ui/accordion";

/** Same gradient pairs as the contact marks in the chat; shown only on hover. */
const tints: Record<BrandMarkName, readonly [string, string]> = {
  linkedin: ["#29c6cb", "#6484ed"],
  github: ["#7cafff", "#c28bea"],
  x: ["#e48caa", "#a17be8"],
};

/** A brand mark that rests in muted ink and crossfades to its gradient on hover. */
function BrandMark({
  mark,
  size = 20,
}: {
  mark: BrandMarkName;
  size?: number;
}) {
  const id = useId();
  const [from, to] = tints[mark];
  const path = brandMarks[mark];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="social-mark"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path className="social-mark-base" d={path} fill="currentColor" />
      <path className="social-mark-tint" d={path} fill={`url(#${id})`} />
    </svg>
  );
}

type Profile = {
  name: string;
  href: string;
  mark?: BrandMarkName;
  Icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" }>;
};
const profiles: Profile[] = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/hassana01",
    mark: "linkedin",
  },
  { name: "GitHub", href: "https://github.com/hassana01", mark: "github" },
  { name: "X (Twitter)", href: "https://x.com/HassanAneeq01", mark: "x" },
  { name: "Résumé · CA$5", href: "/resume", Icon: FileUser },
];

export default function SocialLinks() {
  const reduced = useReducedMotion();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <>
      <div className="social-links" aria-label="Social profiles">
        {profiles.map(({ name, href, mark, Icon }) => (
          <motion.a
            key={name}
            href={href}
            onClick={
              href === "/resume"
                ? (event) => {
                    event.preventDefault();
                    setCheckoutOpen(true);
                  }
                : undefined
            }
            target={href.startsWith("/") ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={
              href.startsWith("/") ? name : `${name} (opens in a new tab)`
            }
            whileTap={reduced ? undefined : "pressed"}
            initial="rest"
            animate="rest"
          >
            <motion.span
              style={{ display: "inline-flex" }}
              variants={{ rest: { scale: 1 }, pressed: { scale: 0.8 } }}
              transition={disclosureSpring}
            >
              <span
                className={href === "/resume" ? "resume-icon-nudge" : undefined}
              >
                {mark ? (
                  <BrandMark mark={mark} />
                ) : (
                  Icon && (
                    <Icon
                      size={href === "/resume" ? 23 : 20}
                      aria-hidden="true"
                    />
                  )
                )}
              </span>
            </motion.span>
          </motion.a>
        ))}
      </div>
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
