"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "switch";
}) {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-label="Dark mode"
      aria-checked={isDark}
      className={cn(
        variant === "switch" ? "theme-pill-switch" : "theme-icon-toggle",
        className,
      )}
      data-dark={isDark}
      onClick={() => {
        const theme = isDark ? "light" : "dark";
        document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
        document.documentElement.dataset.theme = theme;
        setIsDark(!isDark);
        try {
          localStorage.setItem("theme", theme);
        } catch {
          /* Theme still works without storage. */
        }
      }}
    >
      {variant === "switch" ? (
        <span className="theme-switch-track" aria-hidden="true">
          <span className="theme-switch-thumb" />
          <Moon size={15} strokeWidth={1.7} />
          <Sun size={15} strokeWidth={1.7} />
        </span>
      ) : (
        <span className="theme-icon-stage" aria-hidden="true">
          <Moon
            className="theme-glyph theme-glyph-moon"
            size={18}
            strokeWidth={1.8}
          />
          <Sun
            className="theme-glyph theme-glyph-sun"
            size={18}
            strokeWidth={1.8}
          />
        </span>
      )}
    </button>
  );
}
