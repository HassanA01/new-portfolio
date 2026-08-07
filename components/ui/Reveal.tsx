"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "li";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Comp = as;
    return <Comp className={className}>{children}</Comp>;
  }
  const MotionComp = as === "li" ? motion.li : motion.div;
  return (
    <MotionComp
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </MotionComp>
  );
}
