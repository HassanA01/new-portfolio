"use client";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";
import AboutPart from "@/components/chat/parts/about";
import CareerPart from "@/components/chat/parts/career";
import ContactPart from "@/components/chat/parts/contact";
import SkillsPart from "@/components/chat/parts/skills";

/** One profile tool, four very different cards: pick by topic. */
export default function ProfilePart({ output }: { output: ProfileToolOutput }) {
  switch (output.topic) {
    case "career":
      return <CareerPart output={output} />;
    case "contact":
      return <ContactPart output={output} />;
    case "skills":
      return <SkillsPart output={output} />;
    default:
      return <AboutPart output={output} />;
  }
}
