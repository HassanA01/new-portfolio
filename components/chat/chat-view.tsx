"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import { usePortfolioChat } from "@/hooks/use-portfolio-chat";
import CheckoutModal from "@/components/CheckoutModal";
import Composer from "@/components/chat/composer";
import MessageList from "@/components/chat/message-list";

export default function ChatView({
  initialMessages = [],
}: {
  initialMessages?: PortfolioMessage[];
}) {
  const chat = usePortfolioChat(initialMessages);
  const active = chat.messages.length > 0;

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
            <span>anike</span>
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
        onSubmit={chat.submit}
      />
      <div className="composer-feedback">
        {chat.error && (
          <div className="agent-error" role="alert">
            <p>
              {chat.error.message.includes("connected yet")
                ? "i’m not connected yet. try again soon :)"
                : "couldn’t finish that reply. give it another go?"}
            </p>
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
