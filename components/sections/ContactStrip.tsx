import { Section } from "@/components/ui/Section";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Reveal } from "@/components/ui/Reveal";

const LINKS = [
  { href: "https://github.com/HassanA01", label: "GitHub" },
  { href: "https://linkedin.com/in/hassana01", label: "LinkedIn" },
  { href: "/AneeqHassan.pdf", label: "Resume" },
] as const;

export function ContactStrip() {
  return (
    <Section id="contact" index="04" title="Contact">
      <Reveal>
        <p className="text-2xl font-medium tracking-tight text-ink">
          Building something interesting?
          <span className="text-ink-faint"> Talk to me.</span>
        </p>
        <a
          href="mailto:hassan.aneeq01@gmail.com"
          className="mt-4 inline-block text-lg text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          hassan.aneeq01@gmail.com
        </a>
      </Reveal>
      <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <MonoDetail>© {new Date().getFullYear()} Aneeq Hassan</MonoDetail>
        <div className="flex gap-5">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </Section>
  );
}
