import type { InferAgentUIMessage } from "ai";
import type { createAnikeAgent } from "@/lib/agent/server/agent";
import { agentLimits } from "@/lib/agent/shared/limits";

/** Type-only inference keeps tool results typed without shipping server modules. */
export type PortfolioMessage = InferAgentUIMessage<
  ReturnType<typeof createAnikeAgent>
>;

/** Retain conversational context; the server re-fetches facts through its tools. */
export function prepareChatMessages(messages: PortfolioMessage[]) {
  return messages.slice(-agentLimits.historyMessages).map((message) => ({
    id: message.id,
    role: message.role,
    parts: [
      {
        type: "text" as const,
        text:
          message.parts
            .map((part) => {
              if (part.type === "text") return part.text;
              if (
                part.type === "tool-showProjects" &&
                part.state === "output-available"
              ) {
                return `project browser shown with filters ${JSON.stringify(part.output.search)}; titles: ${part.output.projects.map((project) => project.title).join(", ")}`;
              }
              if (part.type === "tool-showResume")
                return "resume checkout requested";
              return "";
            })
            .filter(Boolean)
            .join("\n") || "[tool result displayed]",
      },
    ],
  }));
}

export type ProjectToolOutput = NonNullable<
  Extract<
    PortfolioMessage["parts"][number],
    { type: "tool-showProjects" }
  >["output"]
>;
export type ProfileToolOutput = NonNullable<
  Extract<
    PortfolioMessage["parts"][number],
    { type: "tool-showProfile" }
  >["output"]
>;
