"use client";

import { motion, useReducedMotion } from "framer-motion";
import { disclosureSpring } from "@/components/ui/accordion";
import type { ReactNode } from "react";

export default function FilterPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      className="filter-pill"
      aria-pressed={selected}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      transition={disclosureSpring}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
