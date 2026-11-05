"use client";

import GlassDropCap from "@/components/GlassDropCap";

import { useEffect, useLayoutEffect, useRef, useState, useId } from "react";
import HospitalMap from "@/components/HospitalMap";
import InlineMention from "@/components/InlineMention";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Cormorant_Garamond } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { X, Expand } from "lucide-react";

const dropCap = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-drop-cap",
});

export default function BackgroundStory() {
  const dialog = useRef<HTMLDialogElement>(null);
  const flightDialog = useRef<HTMLDialogElement>(null);
  const flightTrigger = useRef<HTMLButtonElement>(null);
  const flightAnimation = useRef<Animation | null>(null);
  const flightClosing = useRef(false);
  const [flightOpen, setFlightOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open && !flightOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, flightOpen]);

  function flightTransform() {
    const source = flightTrigger.current?.getBoundingClientRect();
    const target = flightDialog.current?.getBoundingClientRect();
    if (!source || !target) return "none";
    return `translate(${source.left - target.left}px, ${source.top - target.top}px) scale(${source.width / target.width}, ${source.height / target.height})`;
  }

  useLayoutEffect(() => {
    if (!flightOpen || reducedMotion || !flightDialog.current) return;
    flightAnimation.current = flightDialog.current.animate(
      [
        { transform: flightTransform(), opacity: 0.6 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 500, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    return () => flightAnimation.current?.cancel();
  }, [flightOpen, reducedMotion]);

  async function closeFlight() {
    if (flightClosing.current) return;
    flightClosing.current = true;
    const element = flightDialog.current;
    if (element && !reducedMotion) {
      flightAnimation.current?.cancel();
      const animation = element.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: flightTransform(), opacity: 0 },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(.4, 0, .2, 1)",
          fill: "forwards",
        },
      );
      await animation.finished;
      element.close();
      animation.cancel();
    } else element?.close();
    flightClosing.current = false;
  }

  function showMemory() {
    dialog.current?.showModal();
    setOpen(true);
  }

  return (
    <div className="background-story">
      <motion.figure
        className="story-memory"
        initial={reducedMotion ? false : { opacity: 0, y: 48, rotate: 2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 1,
          delay: reducedMotion ? 0 : 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="memory-preview live-map-preview">
          <HospitalMap />
          <button
            className="map-expand-button"
            type="button"
            onClick={showMemory}
            aria-label="Open interactive map of Ashfaq Memorial Hospital"
            aria-haspopup="dialog"
          >
            <Expand size={15} aria-hidden="true" />
            <span>Explore map</span>
          </button>
        </div>
      </motion.figure>
      <motion.div
        className="story-copy"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={`story-opening ${dropCap.variable}`}>
          <GlassDropCap>I</GlassDropCap>t all started{" "}
          <strong>October 19, 2001</strong> in Karachi, Pakistan where I spawned
          on this planet. Tbh I don&apos;t remember anything at the time but my
          shoutout to my parents for capturing the{" "}
          <InlineMention
            name="memories"
            colors={["#8a6a3c", "#5e4a2b"]}
            description="more to come soon."
            fitContent
          />
          .
        </p>
        <p className="story-paragraph">
          As soon as I came out the womb, I started working on{" "}
          <InlineMention
            name="Claude Code’s harness"
            colors={["#b45b3b", "#ce7858"]}
            description="The tools and runtime around Claude Code that let it work with files, run commands, and carry out coding tasks."
          />{" "}
          and solving the{" "}
          <InlineMention
            name="P vs NP"
            popupWidth={380}
            centered
            colors={["#357a83", "#7367b0"]}
            description="If a computer can quickly check that an answer is correct, can it also quickly find that answer?"
          />{" "}
          problem. I worked on both for about two years - the time I spent in
          Pakistan (in reality I was snoozing and{" "}
          <InlineMention
            name="vibing with the goats"
            colors={["#9a6a2a", "#6f4a1c"]}
            popupWidth={220}
            centered
            image={{
              src: "/goats.webp",
              alt: "Toddler me standing next to a resting white goat in Karachi",
              width: 640,
              height: 1040,
            }}
          />
          ).
        </p>
      </motion.div>

      <motion.div
        className="story-migration"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="story-paragraph">
          In 2003, my parents took the biggest decision to leave home and bring
          me and my brother across the world. The rest is history.
        </p>
        <motion.div
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
        >
          <GlowCard className="journey-map" customSize>
            <button
              type="button"
              ref={flightTrigger}
              className="flight-expand"
              aria-label="Expand flight map"
              onClick={() => {
                flightDialog.current?.showModal();
                setFlightOpen(true);
              }}
            >
              <FlightMap />
            </button>
          </GlowCard>
        </motion.div>
      </motion.div>
      <dialog
        ref={flightDialog}
        className="flight-dialog"
        tabIndex={-1}
        aria-label="Karachi to Toronto flight map"
        onClose={() => setFlightOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          void closeFlight();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) void closeFlight();
        }}
      >
        {flightOpen && (
          <div className="journey-map">
            <FlightMap />
          </div>
        )}
      </dialog>
      <dialog
        ref={dialog}
        className="memory-dialog hospital-map-dialog"
        aria-label="Map of Ashfaq Memorial Hospital, Karachi"
        onClose={() => setOpen(false)}
      >
        <button
          className="memory-close"
          type="button"
          aria-label="Close memory"
          onClick={() => dialog.current?.close()}
          autoFocus
        >
          <X size={20} aria-hidden="true" />
        </button>
        {open && <HospitalMap expanded />}
      </dialog>
    </div>
  );
}

function FlightMap() {
  const reducedMotion = useReducedMotion();
  const routeId = useId();
  return (
    <svg viewBox="0 0 800 320" role="img" aria-label="Karachi to Toronto, 2003">
      <desc>
        A world map with pins in Karachi, Pakistan and Toronto, Canada. A plane
        travels along a dotted route from KHI to YYZ.
      </desc>
      <defs>
        <linearGradient
          id={`${routeId}-color`}
          gradientUnits="userSpaceOnUse"
          x1="549"
          y1="116"
          x2="224"
          y2="116"
        >
          <stop offset="0%" stopColor="#22a66b" />
          <stop offset="40%" stopColor="#22a66b" />
          <stop offset="60%" stopColor="#e55353" />
          <stop offset="100%" stopColor="#e55353" />
        </linearGradient>
      </defs>
      <image href="/world-map.svg" width="800" height="320" />
      <path
        id={routeId}
        d="M549 116 Q390 -25 224 82"
        fill="none"
        stroke={`url(#${routeId}-color)`}
        strokeWidth="1.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
        opacity=".75"
      />
      <g className="journey-pin journey-pin-khi">
        <circle cx="549" cy="116" r="11" opacity=".1" />
        <circle cx="549" cy="116" r="4" />
        <text x="565" y="121">
          KHI
        </text>
      </g>
      <g className="journey-pin journey-pin-yyz">
        <circle cx="224" cy="82" r="11" opacity=".1" />
        <circle cx="224" cy="82" r="4" />
        <text x="180" y="101">
          YYZ
        </text>
      </g>
      <g
        className="journey-plane"
        transform={reducedMotion ? "translate(385 35) rotate(185)" : undefined}
      >
        <path
          fill="#22a66b"
          d="M-11 -2 L-3 -2 L1 -10 L4 -10 L2 -2 L11 0 L2 2 L4 10 L1 10 L-3 2 L-11 2 L-13 6 L-15 6 L-14 0 L-15 -6 L-13 -6 Z"
        >
          {!reducedMotion && (
            <animate
              attributeName="fill"
              values="#22a66b;#22a66b;#e55353;#e55353"
              keyTimes="0;0.4;0.6;1"
              dur="7s"
              repeatCount="indefinite"
            />
          )}
        </path>
        {!reducedMotion && (
          <animateMotion
            dur="7s"
            repeatCount="indefinite"
            rotate="auto"
            calcMode="spline"
            keyTimes="0;1"
            keySplines=".4 0 .2 1"
          >
            <mpath href={`#${routeId}`} />
          </animateMotion>
        )}
      </g>
    </svg>
  );
}
