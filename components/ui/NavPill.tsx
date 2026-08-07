"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;

export function NavPill() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Records the timestamp when Radix last dismissed the palette via its own
  // dismissable-layer (e.g. outside click). A chip click that races this event
  // would re-open the palette immediately; the 250 ms guard swallows it instead.
  const dismissedAt = useRef(0);
  const [mode, setMode] = useState<"bar" | "pill-visible" | "pill-hidden">("bar");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setMode("bar");
    else setMode(y < prev ? "pill-visible" : "pill-hidden");
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inner = (pill: boolean) => (
    <>
      <Link href="/" className="font-semibold tracking-tight text-ink">
        {pill ? "AH" : (<><span className="hidden sm:inline">Aneeq Hassan</span><span className="sm:hidden">AH</span></>)}
      </Link>
      <div className="flex items-center gap-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
        <button
          type="button"
          aria-label="Open command menu"
          onClick={() => {
            if (Date.now() - dismissedAt.current < 250) return;
            setPaletteOpen((o) => !o);
          }}
          className="mx-1 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
        >
          ⌘K
        </button>
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <>
      {/* Resting top bar */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-opacity duration-200",
          mode === "bar" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          {inner(false)}
        </div>
      </header>

      {/* Floating pill */}
      <AnimatePresence>
        {mode === "pill-visible" && (
          <motion.nav
            key="pill"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface-raised/80 py-1.5 pl-4 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
          >
            {inner(true)}
          </motion.nav>
        )}
      </AnimatePresence>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={(open) => {
          if (!open) dismissedAt.current = Date.now();
          setPaletteOpen(open);
        }}
      />
    </>
  );
}
