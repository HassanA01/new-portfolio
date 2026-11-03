"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const greetings = [
  {
    label: "Hello",
    path: "M25 91 C39 76 62 24 54 22 C42 18 25 106 34 91 L52 53 C62 33 68 26 66 39 C64 54 49 91 56 94 C63 98 73 84 79 75 C100 55 98 48 88 53 C73 61 73 92 88 93 C99 94 113 75 123 51 C145 0 118 20 109 65 C101 101 115 103 133 77 C161 33 160 14 149 24 C136 38 123 99 141 94 L155 81 C164 59 186 53 183 71 C180 89 161 102 156 86 C153 75 165 60 177 63 C188 66 186 84 197 79",
  },
  {
    label: "Salut",
    path: "M77 31 C70 16 38 23 37 40 C36 55 76 58 70 77 C63 100 26 101 23 86 M80 77 C98 48 112 60 101 82 C88 106 77 91 86 74 C92 61 105 57 105 67 L99 89 C98 101 114 87 125 65 C152 9 127 15 120 60 C113 101 125 102 141 72 L138 86 C136 105 153 90 162 68 L155 90 C156 100 170 88 179 71 L192 36 L176 86 C170 108 186 91 198 79 M170 58 L203 54",
  },
  { label: "مرحبا" },
  {
    label: "Ciao",
    path: "M102 35 C107 14 72 20 54 44 C25 82 44 111 78 87 L96 70 M107 65 L99 88 C96 103 113 89 124 75 M111 48 L112 46 M119 79 C133 51 152 56 140 80 C128 104 115 94 123 76 C132 59 148 57 144 70 L138 91 C141 101 153 88 165 75 C184 49 204 62 190 83 C177 105 160 96 167 78 C174 60 192 61 194 70 C195 81 203 85 214 75",
  },
  { label: "こんにちは" },
  { label: "你好" },
];

export function greetingInkViewport(
  bounds: { x: number; width: number },
  edge: number,
) {
  const width = bounds.width + edge * 2;
  return { viewBox: `${bounds.x - edge} 0 ${width} 120`, aspect: width / 120 };
}

export default function TypingGreeting() {
  const artworkRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const restart = () => {
      clearInterval(timer);
      setIndex(0);
      if (!preference.matches)
        timer = setInterval(
          () => setIndex((value) => (value + 1) % greetings.length),
          5400,
        );
    };
    restart();
    preference.addEventListener("change", restart);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", restart);
    };
  }, []);
  useLayoutEffect(() => {
    const align = () => {
      const artwork = artworkRef.current;
      const lettering = artwork?.querySelector<SVGGraphicsElement>(
        ".glass-handwriting, .glass-native-writing",
      );
      if (!artwork || !lettering) return;
      const bounds = lettering.getBBox();
      // Include the two-unit stroke edge for paths; text has its own ink bounds.
      const edge = lettering.tagName === "path" ? 2 : 0;
      const viewport = greetingInkViewport(bounds, edge);
      artwork.setAttribute("viewBox", viewport.viewBox);
      artwork.style.setProperty("--greeting-aspect", String(viewport.aspect));
      artwork.dataset.aligned = "true";
    };
    // Paths have fixed ink bounds; native scripts must wait for their font.
    if (greetings[index].path) align();
    let active = true;
    document.fonts.ready.then(() => {
      if (active) align();
    });
    return () => {
      active = false;
    };
  }, [index]);
  const greeting = greetings[index];
  return (
    <h1 className="glass-greeting" aria-label="Hello">
      <svg
        key={index}
        ref={artworkRef}
        viewBox="0 0 240 120"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="glass-greeting-art"
      >
        <defs>
          <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0.35">
            <stop stopColor="var(--greeting-ink-1)" />
            <stop offset=".4" stopColor="var(--greeting-ink-2)" />
            <stop offset=".48" stopColor="var(--greeting-highlight)" />
            <stop offset=".58" stopColor="var(--greeting-ink-2)" />
            <stop offset="1" stopColor="var(--greeting-ink-3)" />
          </linearGradient>
        </defs>
        {greeting.path ? (
          <path
            className="glass-handwriting"
            d={greeting.path}
            pathLength="1"
            fill="none"
            stroke={`url(#${id}-ink)`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <text
            className="glass-native-writing"
            x="25"
            y="84"
            textAnchor="start"
            fill={`url(#${id}-ink)`}
            fontSize={index === 4 ? "40" : "57"}
            lang={index === 2 ? "ar" : index === 4 ? "ja" : "zh"}
          >
            {greeting.label}
          </text>
        )}
      </svg>
    </h1>
  );
}
