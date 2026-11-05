"use client";
import { FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { pressSpring } from "@/components/ui/accordion";

/** A compact ticket on the checkout's signature surface; only "open" is pressable. */
export default function ResumePart({ onOpen }: { onOpen: () => void }) {
  const reduced = useReducedMotion();
  return (
    <div className="agent-resume">
      <span className="agent-resume-icon" aria-hidden="true">
        <FileText size={18} strokeWidth={1.6} />
      </span>
      <motion.button
        className="agent-resume-open"
        type="button"
        aria-label="Open my résumé checkout"
        onClick={onOpen}
        whileTap={reduced ? undefined : pressSpring}
      >
        open ↗
      </motion.button>
    </div>
  );
}
