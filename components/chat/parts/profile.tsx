"use client";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";
import AboutPart from "@/components/chat/parts/about";
import CareerPart from "@/components/chat/parts/career";
import ContactPart from "@/components/chat/parts/contact";

/** One profile tool, three very different cards: pick by topic. */
export default function ProfilePart({ output }: { output: ProfileToolOutput }) {
  switch (output.topic) {
    case "career":
      return <CareerPart output={output} />;
    case "contact":
      return <ContactPart output={output} />;
    default:
      return <AboutPart output={output} />;
  }
}
