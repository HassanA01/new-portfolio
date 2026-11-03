"use client";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";

export default function ProfilePart({ output }: { output: ProfileToolOutput }) {
  return (
    <section className="agent-profile-card" aria-label={output.title}>
      <h3>{output.title}</h3>
      <ol>
        {output.items.map((item) => (
          <li key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
            {"href" in item && typeof item.href === "string" && (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                say hey
                <span className="sr-only">
                  {" "}
                  on {item.label} (opens in a new tab)
                </span>{" "}
                ↗
              </a>
            )}
          </li>
        ))}
      </ol>
      <a className="agent-profile-more" href={output.href}>
        more about me ↗
      </a>
    </section>
  );
}
