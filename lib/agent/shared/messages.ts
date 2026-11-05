import type { InferAgentUIMessage } from "ai";
import type { createAnikeAgent } from "@/lib/agent/server/agent";
import { agentLimits } from "@/lib/agent/shared/limits";

/** Type-only inference keeps tool results typed without shipping server modules. */
export type PortfolioMessage = InferAgentUIMessage<
  ReturnType<typeof createAnikeAgent>
>;

/**
 * Parts to show for a message. When the model wrote a line, called
 * offerChoices, then wrote the reply again, only the text after that call is
 * the reply; anything before it was a draft the visitor shouldn't see twice.
 */
export function visibleParts(message: PortfolioMessage) {
  const parts = message.parts;
  let lastOffer = -1;
  parts.forEach((part, index) => {
    if (part.type === "tool-offerChoices") lastOffer = index;
  });
  if (lastOffer < 0) return parts;
  const replied = parts
    .slice(lastOffer + 1)
    .some((part) => part.type === "text" && part.text.trim());
  if (!replied) return parts;
  return parts.filter(
    (part, index) => part.type !== "text" || index > lastOffer,
  );
}

/** Retain conversational context; the server re-fetches facts through its tools. */
export function prepareChatMessages(messages: PortfolioMessage[]) {
  return messages.slice(-agentLimits.historyMessages).map((message) => ({
    id: message.id,
    role: message.role,
    parts: [
      {
        type: "text" as const,
        text:
          visibleParts(message)
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
              if (
                part.type === "tool-offerChoices" &&
                part.state === "output-available"
              )
                return `quick replies offered: ${part.output.choices.join(" / ")}`;
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
