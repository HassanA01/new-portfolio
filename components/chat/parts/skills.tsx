"use client";
import type { ProfileToolOutput } from "@/lib/agent/shared/messages";
import TechMarks from "@/components/TechMarks";

type SkillsOutput = Extract<ProfileToolOutput, { topic: "skills" }>;

/** Languages, frameworks and tooling as the same marks the project cards use. */
export default function SkillsPart({ output }: { output: SkillsOutput }) {
  return (
    <section className="agent-skills" aria-label={output.title}>
      {output.groups.map((group) => (
        <div key={group.label} className="agent-skills-group">
          <h4>{group.label}</h4>
          <TechMarks
            tech={group.items}
            max={group.items.length}
            label={`${group.label} Aneeq works with`}
          />
        </div>
      ))}
    </section>
  );
}
