"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { pickErrorCopy } from "@/lib/agent/shared/error-copy";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import { usePortfolioChat } from "@/hooks/use-portfolio-chat";
import CheckoutModal from "@/components/CheckoutModal";
import Composer from "@/components/chat/composer";
import MessageList from "@/components/chat/message-list";
import AnikeMark from "@/components/chat/anike-mark";

/** Choices the agent attached to its latest finished reply, if any. */
function quickReplies(last: PortfolioMessage | undefined, waiting: boolean) {
  if (waiting || last?.role !== "assistant") return undefined;
  let choices: readonly string[] | undefined;
  for (const part of last.parts)
    if (part.type === "tool-offerChoices" && part.state === "output-available")
      choices = part.output.choices;
  return choices;
}

export default function ChatView({
  initialMessages = [],
}: {
  initialMessages?: PortfolioMessage[];
}) {
  const chat = usePortfolioChat(initialMessages);
  const active = chat.messages.length > 0;
  const choices = quickReplies(chat.messages.at(-1), chat.waiting);
  // One random line per error, kept stable across re-renders of the same error.
  const [errorLine, setErrorLine] = useState<string>();
  const [seenError, setSeenError] = useState(chat.error);
  if (chat.error !== seenError) {
    setSeenError(chat.error);
    if (chat.error) setErrorLine(pickErrorCopy(chat.error.message, errorLine));
  }

  useEffect(() => {
    document.documentElement.dataset.chat = active ? "true" : "false";
    const introduction = document.querySelector<HTMLElement>(
      ".home-page .introduction",
    );
    if (introduction) introduction.inert = active;
    return () => {
      delete document.documentElement.dataset.chat;
      if (introduction) introduction.inert = false;
    };
  }, [active]);

  return (
    <section
      className={["agent-composer", active && "chat-session"]
        .filter(Boolean)
        .join(" ")}
      aria-label="Ask about Aneeq"
    >
      {active && (
        <>
          <div className="chat-heading">
            <AnikeMark />
            <button
              type="button"
              className="desktop-leave-chat"
              aria-label="Leave chat"
              onClick={() =>
                window.dispatchEvent(new Event("portfolio-request-leave"))
              }
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <MessageList
            messages={chat.messages}
            waiting={chat.waiting}
            onResume={chat.openCheckout}
          />
        </>
      )}
      <Composer
        key={chat.resetCount}
        active={active}
        waiting={chat.waiting}
        choices={choices}
        onSubmit={chat.submit}
      />
      <div className="composer-feedback">
        {chat.error && (
          <div className="agent-error" role="alert">
            <p>{errorLine}</p>
            <button type="button" onClick={chat.retry}>
              try again
            </button>
          </div>
        )}
        {chat.waiting && (
          <button
            type="button"
            className="agent-stop"
            onClick={() => void chat.stop()}
          >
            stop reply
          </button>
        )}
      </div>
      <CheckoutModal open={chat.checkoutOpen} onClose={chat.closeCheckout} />
    </section>
  );
}
