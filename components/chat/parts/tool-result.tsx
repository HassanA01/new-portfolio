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
  if (part.state === "output-error")
    return (
      <p className="agent-tool-note" role="alert">
        couldn’t load that. try asking again.
      </p>
    );
  if (part.state !== "output-available")
    return (
      <div className="agent-tool-loading" role="status">
        <span />
        {part.type === "tool-showProjects"
          ? "finding my projects..."
          : part.type === "tool-showResume"
            ? "opening my résumé..."
            : "pulling that up..."}
      </div>
    );
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
}
