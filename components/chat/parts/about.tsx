"use client";
import Image from "next/image";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";

type AboutOutput = Extract<ProfileToolOutput, { topic: "about" }>;

/** The homepage introduction in miniature, on the "Currently @" card's surface. */
export default function AboutPart({ output }: { output: AboutOutput }) {
  return (
    <section className="agent-about" aria-label={output.title}>
      <div className="agent-about-head">
        <span className="agent-about-ring" aria-hidden="true">
          <Image
            className="agent-about-portrait"
            src={output.portrait}
            alt=""
            width={44}
            height={44}
          />
        </span>
        <p className="agent-about-lede">
          <strong>{output.greeting}</strong>
        </p>
      </div>
      <dl className="agent-about-facts">
        {output.facts.map((fact) => {
          const value = (
            <>
              {fact.value && `${fact.value} `}
              {fact.emphasis && (
                <em
                  className="agent-about-emphasis"
                  data-company={fact.company}
                >
                  {fact.emphasis}
                </em>
              )}
            </>
          );
          return (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
