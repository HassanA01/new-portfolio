"use client";

import {
  visibleParts,
  type PortfolioMessage,
} from "@/lib/agent/shared/messages";
import { agentVoice } from "@/lib/agent/shared/voice";
import ToolResult from "@/components/chat/parts/tool-result";
import Activity, { isActivityPart } from "@/components/chat/parts/activity";
import StreamedText from "@/components/chat/streamed-text";

export default function Message({
  message,
  live = false,
  onResume,
}: {
  message: PortfolioMessage;
  /** This is the reply currently being produced. */
  live?: boolean;
  onResume: () => void;
}) {
  const assistant = message.role === "assistant";
  const parts = assistant ? visibleParts(message) : message.parts;
  const activity = assistant ? parts.filter(isActivityPart) : [];
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
      {assistant && <Activity parts={activity} live={live} />}
      {parts.map((part, index) => {
        if (part.type === "text")
          return (
            <div className="message-body" key={index}>
              {assistant ? (
                <StreamedText text={agentVoice(part.text)} live={live} />
              ) : (
                part.text
              )}
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
