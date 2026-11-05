"use client";
import Image from "next/image";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";

type CareerOutput = Extract<ProfileToolOutput, { topic: "career" }>;

/**
 * The About page's career rows, condensed. Each row sits on its company's
 * gradient; the link below the list is the only way out to the full journey.
 */
export default function CareerPart({ output }: { output: CareerOutput }) {
  return (
    <section className="agent-career" aria-label={output.title}>
      <ol className="agent-career-list">
        {output.items.map((role) => (
          <li
            key={role.slug}
            className="agent-career-item"
            data-company={role.slug}
            data-current={role.current ? "true" : undefined}
          >
            <Image
              className="agent-career-logo"
              src={role.logo}
              alt=""
              width={22}
              height={22}
            />
            <span className="agent-career-main">
              <span className="agent-career-role">
                {role.role} @ <strong>{role.company}</strong>
              </span>
              {role.team && (
                <span className="agent-career-team">{role.team}</span>
              )}
            </span>
            <span className="agent-career-dates">
              {role.current && (
                <span className="agent-career-now" aria-hidden="true" />
              )}
              {role.dates}
            </span>
          </li>
        ))}
      </ol>
      <a className="agent-part-more" href={output.href}>
        the full journey ↗
      </a>
    </section>
  );
}
