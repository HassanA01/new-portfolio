import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";
import { AskAgentButton } from "@/components/agent/AskAgentButton";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[92vh] w-full max-w-5xl flex-col justify-center px-6 py-24">
      <div>
        <Reveal>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.035em] text-ink sm:text-6xl">
            AI engineer.
            <br />
            <span className="text-ink-faint">I build systems that think.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
            Currently at Dayforce, building agentic applications. Previously Magnet
            Forensics, Koho, and five other teams.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex items-center gap-6">
            <AskAgentButton />
            <GlassButton variant="ghost" href="/work">
              View work →
            </GlassButton>
          </div>
        </Reveal>
      </div>
      <div className="absolute inset-x-6 bottom-8 flex justify-between">
        <MonoDetail>Toronto — 43.65°N</MonoDetail>
        <MonoDetail>EST</MonoDetail>
      </div>
    </section>
  );
}
