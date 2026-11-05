import Link from "next/link";
import PortraitVideo from "@/components/PortraitVideo";
import TypingGreeting from "@/components/TypingGreeting";
import CurrentRole from "@/components/CurrentRole";
import ChatView from "@/components/chat/chat-view";
import { executeProjectSearch } from "@/lib/agent/server/tools/show-projects";
import type { PortfolioMessage } from "@/lib/agent/shared/messages";
import SocialLinks from "@/components/SocialLinks";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ explore?: string }>;
}) {
  const initialProjects = (await searchParams).explore === "projects";
  // Arriving from About's "want to see more?" reads as a real exchange: the
  // visitor's ask, then anike's answer with the browser already open.
  const initialMessages: PortfolioMessage[] = initialProjects
    ? [
        {
          id: "project-entry-ask",
          role: "user",
          parts: [{ type: "text", text: "Show me Aneeq's projects" }],
        },
        {
          id: "project-entry",
          role: "assistant",
          parts: [
            {
              type: "tool-showProjects",
              toolCallId: "project-entry",
              state: "output-available",
              input: { category: "All" },
              output: await executeProjectSearch({ category: "All" }),
            },
            {
              type: "text",
              text: "here's everything i've built. tap any card for a closer look.",
            },
          ],
        },
      ]
    : [];
  return (
    <main
      id="main-content"
      className="page-content home-page"
      data-project-entry={initialProjects || undefined}
    >
      <div className="introduction">
        <div className="greeting-row">
          <TypingGreeting />
          <span className="portrait-hint-wrap">
            <PortraitVideo />
            {/* Tiny nudge: a hand-drawn arrow into the portrait, "press" on touch. */}
            <span className="portrait-hint" aria-hidden="true">
              <svg viewBox="0 0 48 30" width="48" height="30" fill="none">
                <path
                  d="M46 24 C39 26 36 14 30 13 C23 12 28 23 22 21 C15 18 13 12 5 15"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 11 L4.5 15 L10 19"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="portrait-hint-word">
                <span className="portrait-hint-click">click</span>
                <span className="portrait-hint-press">press</span>
              </span>
            </span>
          </span>
        </div>
        <p>I&apos;m Aneeq.</p>
        <p>I like sports, travelling and doomscrolling at night.</p>
        <p>Here’s my socials, happy to connect :)</p>
        <SocialLinks />
        <CurrentRole />
        <Link className="career-link" href="/about#career-journey">
          <span className="career-link-label">See more of my career</span>
        </Link>
      </div>
      <ChatView initialMessages={initialMessages} />
    </main>
  );
}
