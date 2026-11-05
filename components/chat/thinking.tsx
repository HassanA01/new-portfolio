"use client";

import { useId } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Lissajous figure (x = sin 3t, y = sin 2t), sampled once at module load.
 * A point travels the curve with a comet tail in the signature gradient,
 * looping until the first token arrives.
 */
const WIDTH = 40;
const HEIGHT = 24;
const STEPS = 96;
const curve = Array.from({ length: STEPS + 1 }, (_, index) => {
  const t = (index / STEPS) * Math.PI * 2;
  const x = WIDTH / 2 + (WIDTH / 2 - 2) * Math.sin(3 * t + Math.PI / 2);
  const y = HEIGHT / 2 + (HEIGHT / 2 - 2) * Math.sin(2 * t);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
});
const path = `M${curve.join(" L")} Z`;

export default function Thinking() {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div
      className="agent-thinking"
      role="status"
      aria-label="Agent is thinking"
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`rgb(var(--signature-1))`} />
            <stop offset="50%" stopColor={`rgb(var(--signature-3))`} />
            <stop offset="100%" stopColor={`rgb(var(--signature-2))`} />
          </linearGradient>
        </defs>
        <path className="agent-thinking-ghost" d={path} pathLength={1} />
        <path
          className="agent-thinking-trace"
          d={path}
          pathLength={1}
          stroke={`url(#${id})`}
        />
        {!reduced && (
          <circle className="agent-thinking-point" r="2">
            <animateMotion
              dur="2.6s"
              repeatCount="indefinite"
              path={path}
              calcMode="linear"
            />
          </circle>
        )}
      </svg>
    </div>
  );
}
