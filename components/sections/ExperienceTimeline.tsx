import { Section } from "@/components/ui/Section";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";
import { getExperience } from "@/lib/content";

export function ExperienceTimeline({ compact = false }: { compact?: boolean }) {
  const experience = getExperience();
  return (
    <Section id="experience" index="02" title="Experience">
      <ol className="relative border-l border-line">
        {experience.map((e, i) => (
          <Reveal as="li" key={`${e.company}-${e.title}`} delay={i * 0.04} className="relative pb-10 pl-8 last:pb-0">
            <span aria-hidden className="absolute -left-[3px] top-2 h-1.5 w-1.5 rounded-full bg-ink-faint" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-base font-medium text-ink">
                {e.company}
                <span className="text-ink-muted"> — {e.title}</span>
              </p>
              <MonoDetail>{e.duration}</MonoDetail>
            </div>
            <p className="mt-1.5 text-sm text-ink-muted">{e.impact}</p>
            {!compact && (
              <>
                <ul aria-label="highlights" className="mt-3 space-y-1.5">
                  {e.highlights.map((h) => (
                    <li key={h} className="text-sm leading-relaxed text-ink-muted">
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {e.techStack.map((t) => (
                    <MonoDetail key={t}>{t}</MonoDetail>
                  ))}
                </div>
              </>
            )}
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
