import type { Metadata } from "next";
import Image from "next/image";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "About — Aneeq Hassan" };

const SKILLS = [
  { group: "Languages", items: ["Python", "TypeScript", "Go", "C#", "SQL"] },
  { group: "AI / ML", items: ["LangGraph", "RAG", "ChromaDB", "OpenAI APIs", "MCP", "scikit-learn"] },
  { group: "Frameworks", items: ["Next.js", "React", "FastAPI", ".NET", "Express", "Angular"] },
  { group: "Infra", items: ["GCP", "AWS", "Azure", "Docker", "PostgreSQL", "Redis", "Jenkins"] },
] as const;

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-36">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
        <Reveal className="flex-1">
          <h1 className="text-4xl font-medium tracking-[-0.035em] text-ink">
            About.<span className="text-ink-faint"> The longer story.</span>
          </h1>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-ink-muted">
            <p>
              I&apos;m Aneeq — an AI software engineer in Toronto, University of
              Toronto CS. I&apos;ve shipped with eight teams, from fintech to digital
              forensics, and taught 2,000+ students as a TA.
            </p>
            <p>
              These days I build agentic systems at Dayforce: RAG over 50K+
              tables, browser agents, tools that turn language into action. This
              site is becoming one of those systems.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Image
            src="/aneeq.jpg"
            alt="Aneeq Hassan"
            width={220}
            height={220}
            className="rounded-xl border border-line object-cover"
            priority
          />
        </Reveal>
      </div>

      <div className="mt-20 grid gap-8 sm:grid-cols-4">
        {SKILLS.map((s) => (
          <div key={s.group}>
            <h2 className="text-sm font-medium text-ink">{s.group}</h2>
            <div className="mt-3 flex flex-col gap-1.5">
              {s.items.map((i) => (
                <MonoDetail key={i}>{i}</MonoDetail>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ExperienceTimeline />
      </div>
    </main>
  );
}
