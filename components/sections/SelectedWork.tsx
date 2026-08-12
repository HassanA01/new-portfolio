import { Section } from "@/components/ui/Section";
import { Surface } from "@/components/ui/Surface";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";
import { GlassButton } from "@/components/ui/GlassButton";
import { getFeaturedProjects } from "@/lib/content";

export async function SelectedWork() {
  const projects = await getFeaturedProjects();
  return (
    <Section id="work" index="01" title="Selected work">
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} as="li" delay={i * 0.06}>
            <Surface interactive className="flex h-full flex-col">
              <h3 className="text-base font-medium text-ink">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                {p.tech.slice(0, 4).map((t) => (
                  <MonoDetail key={t}>{t}</MonoDetail>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <a
                  href={p.github}
                  aria-label={`GitHub — ${p.title}`}
                  className="text-ink-muted transition-colors hover:text-ink"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub →
                </a>
                {p.live && (
                  <a
                    href={p.live}
                    aria-label={`Live site — ${p.title}`}
                    className="text-ink-muted transition-colors hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live →
                  </a>
                )}
              </div>
            </Surface>
          </Reveal>
        ))}
      </ul>
      <div className="mt-8">
        <GlassButton variant="ghost" href="/work">
          All work →
        </GlassButton>
      </div>
    </Section>
  );
}
