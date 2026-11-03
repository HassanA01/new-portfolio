"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function GlassDropCap({ children }: { children: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="glass-drop-cap"
      initial={reduced ? false : { opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}
