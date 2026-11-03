"use client";

import { useEffect, useRef } from "react";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import Message from "@/components/chat/message";

export default function MessageList({
  messages,
  waiting,
  onResume,
}: {
  messages: PortfolioMessage[];
  waiting: boolean;
  onResume: () => void;
}) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    const latest = transcript.querySelector(".chat-messages")?.lastElementChild;
    const top =
      messages
        .at(-1)
        ?.parts.some((part) => part.type === "tool-showProjects") && latest
        ? Math.max(
            0,
            latest.getBoundingClientRect().top -
              transcript.getBoundingClientRect().top +
              transcript.scrollTop -
              32,
          )
        : transcript.scrollHeight;
    transcript.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [messages, waiting]);
  return (
    <div
      className="chat-transcript"
      ref={transcriptRef}
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="chat-messages">
        {messages.map((message) => (
          <Message key={message.id} message={message} onResume={onResume} />
        ))}
        {waiting && (
          <div
            className="agent-thinking"
            role="status"
            aria-label="Agent is thinking"
          >
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
