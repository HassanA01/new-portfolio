"use client";

import { useEffect, useRef } from "react";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import Message from "@/components/chat/message";
import Thinking from "@/components/chat/thinking";

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
  // Keep the waiting figure up through reasoning and tool calls; it only
  // steps aside once the reply's own words start streaming.
  const last = messages.at(-1);
  const replying =
    last?.role === "assistant" &&
    last.parts.some((part) => part.type === "text" && part.text.trim());
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
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            live={waiting && index === messages.length - 1}
            onResume={onResume}
          />
        ))}
        {waiting && !replying && <Thinking />}
      </div>
    </div>
  );
}
