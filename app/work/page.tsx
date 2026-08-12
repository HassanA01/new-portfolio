import type { Metadata } from "next";
import { Surface } from "@/components/ui/Surface";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Work — Aneeq Hassan" };

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-36">
      <h1 className="text-4xl font-medium tracking-[-0.035em] text-ink">
        Work.<span className="text-ink-faint"> Everything I&apos;ve shipped.</span>
      </h1>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} as="li" delay={(i % 4) * 0.05}>
            <Surface interactive className="flex h-full flex-col">
              <h2 className="text-base font-medium text-ink">{p.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                {p.tech.map((t) => (
                  <MonoDetail key={t}>{t}</MonoDetail>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`GitHub — ${p.title}`}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  GitHub →
                </a>
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Live site — ${p.title}`}
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    Live →
                  </a>
                )}
              </div>
            </Surface>
          </Reveal>
        ))}
      </ul>
    </main>
  );
}
