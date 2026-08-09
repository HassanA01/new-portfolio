"use client";

import { useEffect, useRef, useState } from "react";
import { isToolUIPart, getToolName } from "ai";
import { useAgentChat } from "./AgentChatProvider";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's he building at Dayforce?",
  "Tell me about MailflowAI",
  "I'd like to get in touch",
];

// Per-state label overrides for tools that need custom wording at output-available.
// Key: `<toolName>:<state>` or `<toolName>` for the streaming/pending label.
const TOOL_LABELS: Record<string, string> = {
  "search_background": "searching background…",
  "send_message_to_aneeq": "sending message…",
  "navigate_site": "navigating…",
  "get_resume": "fetching resume…",
  // output-available overrides
  "search_background:output-available": "searching background — done",
  "send_message_to_aneeq:output-available": "message sent",
  "navigate_site:output-available": "navigating — done",
  "get_resume:output-available": "fetching resume — done",
};

export function ChatView() {
  const { messages, sendMessage, status, error } = useAgentChat();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const submit = (text: string) => {
    const trimmed = text.trim().slice(0, 1000);
    if (!trimmed || status !== "ready") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-start justify-end gap-2 pb-2">
            <MonoDetail>Ask about Aneeq — or leave him a message</MonoDetail>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("text-sm leading-relaxed", m.role === "user" ? "text-ink" : "text-ink-muted")}>
            {m.role === "user" && <MonoDetail className="mr-2">you</MonoDetail>}
            {m.parts.map((part, i) => {
              if (part.type === "text") return <span key={i} className="whitespace-pre-wrap">{part.text}</span>;
              if (isToolUIPart(part)) {
                const toolName = getToolName(part);
                const stateKey = `${toolName}:${part.state}`;
                const label =
                  TOOL_LABELS[stateKey] ??
                  TOOL_LABELS[toolName] ??
                  (part.state === "output-available" ? `${toolName} — done` : `${toolName}…`);
                const isResumeDone =
                  isToolUIPart(part) &&
                  getToolName(part) === "get_resume" &&
                  part.state === "output-available";
                return (
                  <div key={i} className="my-1">
                    <MonoDetail>{label}</MonoDetail>
                    {isResumeDone && (
                      <a
                        href={(part.output as { url: string }).url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-sm text-ink underline decoration-line underline-offset-4"
                      >
                        Open resume →
                      </a>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
        {status === "submitted" && (
          <span role="status">
            <MonoDetail>thinking…</MonoDetail>
          </span>
        )}
        {error && (
          <p className="text-sm text-ink-muted">
            The agent hit a snag — email{" "}
            <a href="mailto:hassan.aneeq01@gmail.com" className="underline decoration-line underline-offset-4">
              hassan.aneeq01@gmail.com
            </a>{" "}
            instead.
          </p>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="border-t border-line px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about Aneeq…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        />
      </form>
    </div>
  );
}
