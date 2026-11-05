"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { disclosureSpring } from "@/components/ui/accordion";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import { agentVoice } from "@/lib/agent/shared/voice";

type Part = PortfolioMessage["parts"][number];
type ToolPart = Extract<Part, { type: `tool-${string}` }>;
type ReasoningPart = Extract<Part, { type: "reasoning" }>;

/** True for the parts that describe how the reply was made, not the reply itself. */
export function isActivityPart(part: Part): part is ToolPart | ReasoningPart {
  return part.type === "reasoning" || part.type.startsWith("tool-");
}

function inputSummary(input: unknown) {
  if (!input || typeof input !== "object") return [];
  return Object.entries(input as Record<string, unknown>)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${key}: ${value.join(" / ")}`
        : `${key}: ${String(value)}`,
    );
}

/** Lowercase, first-person labels so the rail reads in anike's voice. */
function toolLabel(part: ToolPart) {
  const running = part.state !== "output-available";
  const input = (part.input ?? {}) as Record<string, unknown>;
  switch (part.type) {
    case "tool-showProjects":
      return running ? "finding my projects" : "searched my projects";
    case "tool-showProfile": {
      const topic = typeof input.topic === "string" ? input.topic : "profile";
      return running ? `pulling up my ${topic}` : `checked my ${topic}`;
    }
    case "tool-showResume":
      return running ? "opening my résumé" : "opened résumé checkout";
    case "tool-offerChoices":
      return running ? "lining up quick replies" : "offered quick replies";
    default:
      return running ? "working on it" : "done";
  }
}

function currentLabel(parts: (ToolPart | ReasoningPart)[]) {
  const last = parts.at(-1);
  if (!last || last.type === "reasoning") return "thinking";
  return last.state === "output-available" ? "thinking" : toolLabel(last);
}

function settledSummary(parts: (ToolPart | ReasoningPart)[]) {
  const labels = parts
    .filter((part): part is ToolPart => part.type !== "reasoning")
    .map(toolLabel);
  const thought = parts.some(
    (part) => part.type === "reasoning" && part.text.trim(),
  );
  const pieces = [...(thought ? ["thought it through"] : []), ...labels];
  return pieces.length ? [...new Set(pieces)].join(" · ") : "replied directly";
}

/**
 * The agent's working: reasoning summaries and tool calls, collapsed into one
 * line that stays live while the reply is being produced and can be expanded
 * to see each step and the arguments it used.
 */
export default function Activity({
  parts,
  live,
}: {
  parts: (ToolPart | ReasoningPart)[];
  live: boolean;
}) {
  const [open, setOpen] = useState(live);
  const toggled = useRef(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    // Follow along while it works, then tuck away unless the visitor opened it.
    if (!toggled.current) setOpen(live);
  }, [live]);
  if (!parts.length) return null;
  const summary = live ? currentLabel(parts) : settledSummary(parts);
  return (
    <div className="agent-activity" data-live={live} data-open={open}>
      <motion.button
        type="button"
        className="agent-activity-summary"
        aria-expanded={open}
        onClick={() => {
          toggled.current = true;
          setOpen((value) => !value);
        }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        transition={disclosureSpring}
      >
        <ChevronRight size={13} strokeWidth={1.8} aria-hidden="true" />
        <span className="agent-activity-label">{summary}</span>
        {live && <span className="sr-only">, in progress</span>}
      </motion.button>
      <div className="agent-activity-steps" hidden={!open}>
        {parts.map((part, index) => {
          if (part.type === "reasoning") {
            const text = agentVoice(part.text.trim());
            return text ? (
              <p key={index} className="agent-activity-thought">
                {text}
              </p>
            ) : null;
          }
          const failed = part.state === "output-error";
          const args = inputSummary(part.input);
          return (
            <p
              key={part.toolCallId}
              className="agent-activity-tool"
              data-state={failed ? "error" : "done"}
            >
              <span>
                {toolLabel(part)}
                {failed && " (failed)"}
              </span>
              {args.length > 0 && (
                <span className="agent-activity-args">{args.join(" · ")}</span>
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
