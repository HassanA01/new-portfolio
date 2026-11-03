"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  prepareChatMessages,
  type PortfolioMessage,
} from "@/lib/agent/shared/messages";

/** Owns the streaming session and one-time checkout actions, independent of layout. */
export function usePortfolioChat(initialMessages: PortfolioMessage[]) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<PortfolioMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: prepareChatMessages(messages) },
        }),
      }),
    [],
  );
  const {
    messages,
    sendMessage,
    status,
    error,
    clearError,
    setMessages,
    stop,
    regenerate,
  } = useChat<PortfolioMessage>({ transport, messages: initialMessages });
  const waiting = status === "submitted" || status === "streaming";
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const openedCheckouts = useRef(new Set<string>());
  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (
          part.type === "tool-showResume" &&
          part.state === "output-available" &&
          !openedCheckouts.current.has(part.toolCallId)
        ) {
          openedCheckouts.current.add(part.toolCallId);
          openCheckout();
        }
      }
    }
  }, [messages, openCheckout]);

  useEffect(() => {
    const reset = () => {
      void stop();
      openedCheckouts.current.clear();
      closeCheckout();
      setMessages([]);
      clearError();
      setResetCount((count) => count + 1);
    };
    window.addEventListener("portfolio-reset", reset);
    return () => window.removeEventListener("portfolio-reset", reset);
  }, [clearError, closeCheckout, setMessages, stop]);

  function submit(question: string) {
    if (!question.trim() || waiting) return;
    clearError();
    void sendMessage({ text: question.trim() });
  }
  function retry() {
    clearError();
    void regenerate();
  }
  return {
    messages,
    waiting,
    error,
    submit,
    retry,
    stop,
    checkoutOpen,
    openCheckout,
    closeCheckout,
    resetCount,
  };
}
