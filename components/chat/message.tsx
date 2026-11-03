"use client";

import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import { agentVoice } from "@/lib/agent/shared/voice";
import ToolResult from "@/components/chat/parts/tool-result";

export default function Message({
  message,
  onResume,
}: {
  message: PortfolioMessage;
  onResume: () => void;
}) {
  const assistant = message.role === "assistant";
  const hasProjects = message.parts.some(
    (part) => part.type === "tool-showProjects",
  );
  return (
    <article
      className={[
        "chat-message",
        assistant ? "chat-message-agent" : "chat-message-user",
        hasProjects && "chat-message-projects",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={assistant ? "Anike" : "You"}
    >
      {assistant && <span className="agent-name">anike</span>}
      {message.parts.map((part, index) => {
        if (part.type === "text")
          return (
            <div className="message-body" key={index}>
              {assistant ? agentVoice(part.text) : part.text}
            </div>
          );
        if (part.type.startsWith("tool-"))
          return (
            <ToolResult
              key={"toolCallId" in part ? part.toolCallId : index}
              part={part}
              onResume={onResume}
            />
          );
        return null;
      })}
    </article>
  );
}
