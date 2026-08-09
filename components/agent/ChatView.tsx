"use client";

import { useEffect, useRef, useState } from "react";
import { isToolUIPart, getToolName, type UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { useAgentChat } from "./AgentChatProvider";
import { MonoDetail } from "@/components/ui/MonoDetail";

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

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-line bg-surface-raised px-4 py-2.5 text-sm leading-relaxed text-ink">
        {text}
      </div>
    </div>
  );
}

function AssistantParts({ message }: { message: UIMessage }) {
  return (
    <div className="max-w-[95%] space-y-2">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <Streamdown
              key={i}
              className="space-y-3 text-sm leading-relaxed text-ink-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-line [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-ink/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5"
            >
              {part.text}
            </Streamdown>
          );
        }
        if (isToolUIPart(part)) {
          const toolName = getToolName(part);
          const stateKey = `${toolName}:${part.state}`;
          const label =
            TOOL_LABELS[stateKey] ??
            TOOL_LABELS[toolName] ??
            (part.state === "output-available" ? `${toolName} — done` : `${toolName}…`);
          const isResumeDone =
            getToolName(part) === "get_resume" && part.state === "output-available";
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
  );
}

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
      <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
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
        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble
              key={m.id}
              text={m.parts
                .filter((p) => p.type === "text")
                .map((p) => (p as { text: string }).text)
                .join("\n")}
            />
          ) : (
            <AssistantParts key={m.id} message={m} />
          ),
        )}
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
        className="flex items-center gap-2 border-t border-line px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // Stop cmdk (the parent Command component) from swallowing Enter/arrow
          // keys so the form submits and the caret moves normally in chat mode.
          onKeyDown={(e) => e.stopPropagation()}
          maxLength={1000}
          placeholder="Ask about Aneeq…"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!input.trim() || status !== "ready"}
          className="shrink-0 rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:border-ink/25 hover:text-ink disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 11l5-5 5 5" />
            <path d="M12 6v13" />
          </svg>
        </button>
      </form>
    </div>
  );
}
