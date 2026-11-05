"use client";

import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import ProjectsPart from "@/components/chat/parts/projects";
import ProfilePart from "@/components/chat/parts/profile";
import ResumePart from "@/components/chat/parts/resume";

/** Exhaustively dispatch known tool names; model output never supplies markup. */
export default function ToolResult({
  part,
  onResume,
}: {
  part: PortfolioMessage["parts"][number];
  onResume: () => void;
}) {
  if (!("state" in part)) return null;
  // Quick replies render beside the composer, not inside the message.
  if (part.type === "tool-offerChoices") return null;
  if (part.state === "output-error")
    return (
      <p className="agent-tool-note agent-tool-part" role="alert">
        couldn’t load that. try asking again.
      </p>
    );
  // Progress shows in the message's activity rail; output renders once ready.
  if (part.state !== "output-available") return null;
  const content = (() => {
    switch (part.type) {
      case "tool-showProjects":
        return <ProjectsPart output={part.output} />;
      case "tool-showProfile":
        return <ProfilePart output={part.output} />;
      case "tool-showResume":
        return <ResumePart onOpen={onResume} />;
      default:
        return null;
    }
  })();
  if (!content) return null;
  // Mounted only once output exists, so the entrance plays as the card lands.
  return <div className="agent-tool-part">{content}</div>;
}
