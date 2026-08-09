"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";

type PaletteMode = "nav" | "chat";

type PaletteContextValue = {
  open: boolean;
  mode: PaletteMode;
  openNav: () => void;
  openChat: (seed?: string) => void;
  close: () => void;
  toggle: () => void;
  toNavMode: () => void;
  agentOnline: boolean;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);
const ChatContext = createContext<ReturnType<typeof useChat> | null>(null);

export function useAgentPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("useAgentPalette outside AgentChatProvider");
  return ctx;
}

export function useAgentChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useAgentChat outside AgentChatProvider");
  return ctx;
}

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PaletteMode>("nav");
  const [agentOnline, setAgentOnline] = useState(false);
  const closeRef = useRef<() => void>(() => {});
  // Stable ref to sendMessage — updated every render so callbacks never go stale
  // without adding chat to PaletteContext's useMemo deps (which would re-render
  // NavPill and other consumers on every streamed token).
  const sendMessageRef = useRef<ReturnType<typeof useChat>["sendMessage"]>(
    () => Promise.resolve(),
  );

  const chat = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "navigate_site") {
        const { path } = toolCall.input as { path: string };
        router.push(path);
        closeRef.current();
        chat.addToolOutput({ tool: "navigate_site", toolCallId: toolCall.toolCallId, output: { navigated: path } });
      }
    },
  });

  // Keep the ref in sync with the latest sendMessage identity every render
  sendMessageRef.current = chat.sendMessage;

  useEffect(() => {
    fetch("/api/agent/chat", { method: "GET" })
      .then((r) => setAgentOnline(r.ok))
      .catch(() => setAgentOnline(false));
  }, []);

  const close = useCallback(() => setOpen(false), []);
  closeRef.current = close;

  const toNavMode = useCallback(() => setMode("nav"), []);

  // PaletteContext intentionally excludes `chat` from deps — ChatView consumes
  // ChatContext directly and re-renders with every token; NavPill (and other
  // PaletteContext consumers) should only re-render when palette state changes.
  const value = useMemo<PaletteContextValue>(
    () => ({
      open,
      mode,
      agentOnline,
      toNavMode,
      openNav: () => {
        setMode("nav");
        setOpen(true);
      },
      openChat: (seed?: string) => {
        setMode("chat");
        setOpen(true);
        if (seed && seed.trim()) {
          // Read through the ref so this closure is always current
          sendMessageRef.current({ text: seed.trim().slice(0, 1000) });
        }
      },
      close,
      // Fresh opens always start in nav mode
      toggle: () =>
        setOpen((o) => {
          if (!o) setMode("nav");
          return !o;
        }),
    }),
    [open, mode, agentOnline, close, toNavMode],
  );

  return (
    <PaletteContext.Provider value={value}>
      <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
    </PaletteContext.Provider>
  );
}
