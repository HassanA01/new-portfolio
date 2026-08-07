import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { GlassButton } from "@/components/ui/GlassButton";

const NUMBERS = [
  { value: "8", label: "teams shipped with" },
  { value: "2,000+", label: "students taught" },
  { value: "$2M", label: "processed in one quarter" },
] as const;

export function AboutStrip() {
  return (
    <Section id="about" index="03" title="About">
      <Reveal>
        <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
          Toronto-based, University of Toronto CS. I like small teams, hard
          problems, and software that quietly does the work of ten people.
        </p>
      </Reveal>
      <div className="mt-10 grid grid-cols-3 gap-6">
        {NUMBERS.map((n, i) => (
          <Reveal key={n.label} delay={i * 0.06}>
            <div>
              <p className="text-3xl font-medium tracking-tight text-ink">{n.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{n.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <GlassButton variant="ghost" href="/about">
          More about me →
        </GlassButton>
      </div>
    </Section>
  );
}
