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
  const initialMessages: PortfolioMessage[] = initialProjects
    ? [
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
          <PortraitVideo />
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
