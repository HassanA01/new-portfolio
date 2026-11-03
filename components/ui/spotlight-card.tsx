"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}
const hues = { blue: 220, purple: 280, green: 120, red: 0, orange: 30 };
const sizes = { sm: "w-48 h-64", md: "w-64 h-80", lg: "w-80 h-96" };

export function GlowCard({
  children,
  className,
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
}: GlowCardProps) {
  const card = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={card}
      className={cn("spotlight-card", !customSize && sizes[size], className)}
      style={
        { width, height, "--spotlight-hue": hues[glowColor] } as CSSProperties
      }
      onPointerMove={(event) => {
        if (event.pointerType === "touch" || !card.current) return;
        const bounds = card.current.getBoundingClientRect();
        card.current.style.setProperty(
          "--spotlight-x",
          `${event.clientX - bounds.left}px`,
        );
        card.current.style.setProperty(
          "--spotlight-y",
          `${event.clientY - bounds.top}px`,
        );
        card.current.style.setProperty(
          "--spotlight-hue",
          String(
            hues[glowColor] +
              ((event.clientX - bounds.left) / bounds.width) * 60,
          ),
        );
      }}
    >
      {children}
    </div>
  );
}
