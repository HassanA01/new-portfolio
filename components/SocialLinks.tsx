"use client";

import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import { motion, useReducedMotion } from "framer-motion";
import { FileUser } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { disclosureSpring } from "@/components/ui/accordion";

const profiles = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/hassana01",
    Icon: SiLinkedin,
  },
  { name: "GitHub", href: "https://github.com/hassana01", Icon: SiGithub },
  { name: "X (Twitter)", href: "https://x.com/HassanAneeq01", Icon: SiX },
  { name: "Résumé · US$5", href: "/resume", Icon: FileUser },
];

export default function SocialLinks() {
  const reduced = useReducedMotion();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <>
      <div className="social-links" aria-label="Social profiles">
        {profiles.map(({ name, href, Icon }) => (
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
                <Icon size={href === "/resume" ? 23 : 20} aria-hidden="true" />
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
