"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

// مرحبا shaped with Noto Naskh Arabic. Fixed outlines avoid clipping in
// WebKit's SVG text renderer, including the descender and the dot below.
const marhabaOutline = `M20.02 75.16C18.33 75.16 16.82 74.93 15.48 74.48C14.13 74.02 13.05 73.37 12.23 72.53C11.4 71.68 10.93 70.68 10.8 69.51C10.67 68.25 10.53 66.89 10.37 65.41C10.22 63.94 10.06 62.27 9.89 60.41C9.72 58.55 9.53 56.41 9.33 54.01C9.14 51.61 8.93 48.85 8.72 45.76C8.5 42.66 8.24 39.14 7.94 35.2C8.54 34.59 9.22 33.97 9.95 33.34C10.69 32.72 11.49 32.12 12.36 31.56C12.49 34.94 12.56 38.27 12.59 41.57C12.61 44.86 12.65 48.33 12.71 51.99C12.78 55.66 12.9 59.72 13.07 64.18L13.27 68.53C14.26 69.09 15.34 69.52 16.48 69.8C17.63 70.08 18.81 70.22 20.02 70.22C20.37 70.22 20.55 70.39 20.55 70.74L20.55 74.64C20.55 74.99 20.37 75.16 20.02 75.16 Z
M29.97 88.54C28.06 87.11 26.51 85.71 25.29 84.32C26.42 83.19 27.35 82.24 28.09 81.46C28.82 80.68 29.41 80.05 29.84 79.58C30.53 80.31 31.24 81.04 31.95 81.75C32.67 82.47 33.39 83.15 34.13 83.8C33.65 84.49 33.06 85.24 32.34 86.04C31.63 86.84 30.84 87.68 29.97 88.54 Z
M19.44 75.16C19.09 75.16 18.92 74.99 18.92 74.64L18.92 70.74C18.92 70.39 19.09 70.22 19.44 70.22C22.6 70.22 24.86 69.62 26.2 68.4C26.59 68.05 27.09 67.36 27.69 66.32C28.3 65.28 29.19 63.66 30.36 61.45C30.57 61.1 30.86 60.83 31.2 60.64C31.55 60.44 31.94 60.34 32.37 60.34C32.89 60.34 33.43 60.52 34 60.87C33.52 61.99 33.02 63.14 32.5 64.31C31.98 65.48 31.42 66.63 30.81 67.75C32.33 68.66 33.7 69.3 34.94 69.67C36.17 70.04 37.53 70.22 39 70.22C39.35 70.22 39.52 70.39 39.52 70.74L39.52 74.64C39.52 74.99 39.35 75.16 39 75.16C34.97 75.16 31.55 73.88 28.73 71.33C28.56 71.59 28.39 71.84 28.21 72.07C28.04 72.31 27.84 72.54 27.63 72.76C27.2 73.32 26.17 73.86 24.54 74.38C22.92 74.9 21.22 75.16 19.44 75.16 Z
M38.41 75.16C38.06 75.16 37.89 74.99 37.89 74.64L37.89 70.74C37.89 70.39 38.06 70.22 38.41 70.22C41.62 70.22 44.47 70.08 46.96 69.8C49.45 69.52 51.6 69.09 53.42 68.53C56.32 67.54 58.48 66.81 59.89 66.36C61.3 65.9 62.52 65.59 63.56 65.41C62.74 64.98 61.9 64.49 61.06 63.95C60.21 63.41 59.38 62.81 58.55 62.16C56.82 60.78 55.4 59.83 54.3 59.3C53.19 58.79 52.08 58.53 50.95 58.53C49.61 58.53 48.48 58.7 47.57 59.04C46.66 59.39 45.41 60.06 43.8 61.06C43.5 60.71 43.27 60.33 43.12 59.92C42.97 59.51 42.9 59.04 42.9 58.53C42.9 56.88 43.61 55.56 45.04 54.56C46.47 53.56 48.35 53.07 50.69 53.07C52.08 53.07 53.48 53.36 54.88 53.94C56.29 54.53 57.93 55.51 59.79 56.9C62.09 58.55 64.02 59.79 65.61 60.64C67.19 61.48 68.78 62.08 70.38 62.42C71.2 62.6 72.21 62.74 73.4 62.85C74.6 62.95 75.97 63.01 77.53 63.01L75 67.75C74.3 67.67 73.51 67.59 72.62 67.52C71.74 67.46 70.79 67.43 69.8 67.43C68.8 67.43 67.86 67.51 66.97 67.69C66.08 67.86 65.04 68.21 63.85 68.73C62.66 69.25 61.09 70.01 59.14 71C57.54 71.82 56.05 72.51 54.69 73.05C53.32 73.59 51.9 74.01 50.4 74.32C48.91 74.62 47.21 74.83 45.3 74.96C43.39 75.1 41.1 75.16 38.41 75.16 Z
M86.95 88.42C86.26 88.42 85.38 88.22 84.32 87.83C83.26 87.44 82.18 86.97 81.1 86.4C80.02 85.84 79.13 85.3 78.44 84.78L79.28 82.63C80.49 82.85 81.61 83.02 82.63 83.15C83.65 83.28 84.59 83.35 85.45 83.35C88.7 83.35 91.49 82.37 93.8 80.42C96.12 78.47 97.89 75.66 99.1 71.98C98.8 71.28 98.48 70.6 98.16 69.93C97.83 69.26 97.48 68.58 97.09 67.88C96.22 66.32 95.48 64.95 94.88 63.76C94.27 62.56 93.79 61.51 93.45 60.6C93.01 59.48 92.8 58.46 92.8 57.55C92.8 56.42 93.12 55.53 93.77 54.85C94.42 54.18 95.35 53.56 96.57 53C96.74 53.56 96.92 54.18 97.12 54.85C97.31 55.53 97.56 56.23 97.86 56.96C98.56 58.74 99.13 60.29 99.59 61.61C100.04 62.93 100.38 64 100.59 64.83C100.86 65.65 101.06 66.4 101.21 67.07C101.36 67.74 101.46 68.36 101.51 68.92C102.98 69.79 104.67 70.22 106.57 70.22C106.92 70.22 107.09 70.39 107.09 70.74L107.09 74.64C107.09 74.99 106.92 75.16 106.57 75.16C104.54 75.16 102.76 74.64 101.24 73.6C100.77 76.59 99.86 79.2 98.52 81.43C97.17 83.66 95.5 85.38 93.51 86.6C91.52 87.81 89.33 88.42 86.95 88.42 Z
M129.25 75.16C127.52 75.16 125.7 75 123.8 74.67C121.89 74.35 120.05 73.89 118.27 73.31C116.5 72.72 114.94 72.04 113.6 71.26C112.6 72.65 111.49 73.64 110.28 74.25C109.07 74.86 107.64 75.16 105.99 75.16C105.64 75.16 105.47 74.99 105.47 74.64L105.47 70.74C105.47 70.39 105.64 70.22 105.99 70.22C107.64 70.22 109.02 69.82 110.15 69.02C111.28 68.22 112.25 67.02 113.07 65.41C113.85 63.98 114.47 62.8 114.93 61.87C115.38 60.94 115.8 60.11 116.19 59.37C116.58 58.63 117.08 57.88 117.69 57.1C118.77 55.67 119.88 54.64 121 54.01C122.13 53.38 123.32 53.07 124.58 53.07C125.83 53.07 127.09 53.85 128.34 55.41C129.6 56.96 130.62 58.96 131.4 61.38C132.18 63.77 132.57 66.11 132.57 68.4C132.57 69.74 132.33 70.96 131.85 72.04C131.38 73.12 130.51 74.16 129.25 75.16ZM127.83 70.22C127.78 68.23 127.48 66.27 126.91 64.34C126.35 62.41 125.72 60.95 125.03 59.95C124.55 59.22 124.06 58.85 123.54 58.85C121.93 58.85 120.44 59.83 119.05 61.77C118.71 62.29 118.28 62.98 117.79 63.82C117.29 64.67 116.74 65.72 116.13 66.97C117.65 67.79 119.38 68.48 121.33 69.02C123.28 69.56 125.44 69.96 127.83 70.22 Z`;

const greetings = [
  {
    label: "Hello",
    path: "M25 91 C39 76 62 24 54 22 C42 18 25 106 34 91 L52 53 C62 33 68 26 66 39 C64 54 49 91 56 94 C63 98 73 84 79 75 C100 55 98 48 88 53 C73 61 73 92 88 93 C99 94 113 75 123 51 C145 0 118 20 109 65 C101 101 115 103 133 77 C161 33 160 14 149 24 C136 38 123 99 141 94 L155 81 C164 59 186 53 183 71 C180 89 161 102 156 86 C153 75 165 60 177 63 C188 66 186 84 197 79",
  },
  {
    label: "Salut",
    path: "M77 31 C70 16 38 23 37 40 C36 55 76 58 70 77 C63 100 26 101 23 86 M80 77 C98 48 112 60 101 82 C88 106 77 91 86 74 C92 61 105 57 105 67 L99 89 C98 101 114 87 125 65 C152 9 127 15 120 60 C113 101 125 102 141 72 L138 86 C136 105 153 90 162 68 L155 90 C156 100 170 88 179 71 L192 36 L176 86 C170 108 186 91 198 79 M170 58 L203 54",
  },
  { label: "مرحبا", outline: marhabaOutline },
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
    if (greetings[index].outline) return;
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
        viewBox={greeting.outline ? "0 0 140 120" : "0 0 240 120"}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="glass-greeting-art"
        data-aligned={greeting.outline ? "true" : undefined}
        style={greeting.outline ? { aspectRatio: "140 / 120" } : undefined}
      >
        <defs>
          <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0.35">
            <stop stopColor="var(--greeting-ink-1)" />
            <stop offset=".4" stopColor="var(--greeting-ink-2)" />
            <stop offset=".48" stopColor="var(--greeting-highlight)" />
            <stop offset=".58" stopColor="var(--greeting-ink-2)" />
            <stop offset="1" stopColor="var(--greeting-ink-3)" />
          </linearGradient>
          {greeting.outline && (
            <clipPath id={`${id}-reveal`}>
              <rect width="140" height="120" className="glass-outline-reveal" />
            </clipPath>
          )}
        </defs>
        {greeting.outline ? (
          <path
            lang="ar"
            d={greeting.outline}
            fill={`url(#${id}-ink)`}
            clipPath={`url(#${id}-reveal)`}
          />
        ) : greeting.path ? (
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
            lang={index === 4 ? "ja" : "zh"}
          >
            {greeting.label}
          </text>
        )}
      </svg>
    </h1>
  );
}
