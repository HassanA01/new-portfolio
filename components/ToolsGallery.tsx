"use client";

import type { ReactNode } from "react";
import type {
  PortfolioMessage,
  ProfileToolOutput,
  ProjectToolOutput,
} from "@/lib/agent/shared/messages";
import Message from "@/components/chat/message";
import Composer from "@/components/chat/composer";
import Thinking from "@/components/chat/thinking";

type Part = PortfolioMessage["parts"][number];

const noop = () => {};
let counter = 0;
const message = (parts: Part[]): PortfolioMessage => ({
  id: `gallery-${counter++}`,
  role: "assistant",
  parts,
});
const text = (value: string): Part => ({ type: "text", text: value });
const thought = (value: string, streaming = false): Part => ({
  type: "reasoning",
  text: value,
  state: streaming ? "streaming" : "done",
});
const done = <T extends Part>(part: T) => part;

function Sample({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="tools-sample">
      <h2 className="tools-caption">{caption}</h2>
      <div className="chat-messages">{children}</div>
    </section>
  );
}

export default function ToolsGallery({
  outputs,
}: {
  outputs: {
    all: ProjectToolOutput;
    ai: ProjectToolOutput;
    active: ProjectToolOutput;
    career: ProfileToolOutput;
    about: ProfileToolOutput;
    contact: ProfileToolOutput;
    resume: { action: "open-resume-checkout" };
    choices: { choices: string[] };
  };
}) {
  const projects = (output: ProjectToolOutput, id: string) =>
    done({
      type: "tool-showProjects",
      toolCallId: id,
      state: "output-available",
      input: output.search,
      output,
    } as Part);
  const profile = (output: ProfileToolOutput, topic: string) =>
    done({
      type: "tool-showProfile",
      toolCallId: `profile-${topic}`,
      state: "output-available",
      input: { topic },
      output,
    } as Part);

  return (
    <div className="tools-gallery">
      <header className="tools-intro">
        <h1>Tools</h1>
        <p>
          Everything Anike can put on screen, rendered from live tool output.
          Temporary page for judging each piece against the rest of the site.
        </p>
      </header>

      <Sample caption="waiting · before the first token">
        <Thinking />
      </Sample>

      <Sample caption="activity rail · live, tool running">
        <Message
          live
          onResume={noop}
          message={message([
            thought(
              "the visitor wants the ai work specifically, so i'll filter the projects by the ai/ml category.",
            ),
            {
              type: "tool-showProjects",
              toolCallId: "running",
              state: "input-available",
              input: { category: "AI/ML" },
            } as Part,
          ])}
        />
      </Sample>

      <Sample caption="showProjects · category AI/ML, settled rail + prose">
        <Message
          onResume={noop}
          message={message([
            thought(
              "the visitor wants the ai work specifically, so i'll filter the projects by the ai/ml category.",
            ),
            projects(outputs.ai, "ai"),
            text(
              "here's the ai side of what i've built. tap a project to take a closer look.",
            ),
          ])}
        />
      </Sample>

      <Sample caption="showProjects · category All">
        <Message
          onResume={noop}
          message={message([
            projects(outputs.all, "all"),
            text(
              "here's everything in the portfolio. tap any card for a closer look.",
            ),
          ])}
        />
      </Sample>

      <Sample caption="showProjects · active filter, nothing active (all completed)">
        <Message
          onResume={noop}
          message={message([
            projects(outputs.active, "active"),
            text(
              "nothing's marked active rn, everything in the portfolio is wrapped up. want to see the finished ones?",
            ),
          ])}
        />
      </Sample>

      <Sample caption="showProfile · career">
        <Message
          onResume={noop}
          message={message([
            profile(outputs.career, "career"),
            text(
              "i'm on the compartments and accounts platform team at stripe.",
            ),
          ])}
        />
      </Sample>

      <Sample caption="showProfile · about">
        <Message
          onResume={noop}
          message={message([
            profile(outputs.about, "about"),
            text("a little about me, beyond the code."),
          ])}
        />
      </Sample>

      <Sample caption="showProfile · contact">
        <Message
          onResume={noop}
          message={message([
            profile(outputs.contact, "contact"),
            text("here's where you can find me."),
          ])}
        />
      </Sample>

      <Sample caption="showResume · opens the checkout modal">
        <Message
          onResume={noop}
          message={message([
            {
              type: "tool-showResume",
              toolCallId: "resume",
              state: "output-available",
              input: {},
              output: outputs.resume,
            } as Part,
            text("here's my résumé, the link's right above :)"),
          ])}
        />
      </Sample>

      <Sample caption="offerChoices · quick replies above the composer (click or press 1 / 2)">
        <Message
          onResume={noop}
          message={message([
            profile(outputs.about, "about-choices"),
            {
              type: "tool-offerChoices",
              toolCallId: "choices",
              state: "output-available",
              input: outputs.choices,
              output: outputs.choices,
            } as Part,
            text(
              "i don't have my spoken languages listed here. if you meant programming languages, i can pull up my projects and show you what they're built with.",
            ),
          ])}
        />
        <div className="tools-composer">
          <Composer
            active
            waiting={false}
            choices={outputs.choices.choices}
            onSubmit={noop}
          />
        </div>
      </Sample>

      <Sample caption="tool failure · rail marks the step, message falls back">
        <Message
          onResume={noop}
          message={message([
            {
              type: "tool-showProjects",
              toolCallId: "failed",
              state: "output-error",
              input: { category: "Web" },
              errorText: "upstream timeout",
            } as Part,
            text("couldn't pull those up just now. try again in a sec?"),
          ])}
        />
      </Sample>

      <Sample caption="reply failed · random line from the error pool">
        <div className="composer-feedback">
          <div className="agent-error" role="alert">
            <p>my brain glitched for a sec. hit try again?</p>
            <button type="button" onClick={noop}>
              try again
            </button>
          </div>
        </div>
      </Sample>
    </div>
  );
}
