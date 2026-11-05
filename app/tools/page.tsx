import type { Metadata } from "next";
import type { Tool } from "ai";
import { portfolioTools } from "@/lib/agent/server/tools/index";
import ToolsGallery from "@/components/ToolsGallery";

export const metadata: Metadata = { title: "Tools" };

/** Run a tool the way the agent would, with the real portfolio data behind it. */
async function run<INPUT, OUTPUT>(tool: Tool<INPUT, OUTPUT>, input: INPUT) {
  if (!tool.execute) throw new Error("tool has no execute");
  const result = await tool.execute(input, {
    toolCallId: "gallery",
    messages: [],
    context: undefined,
  });
  if (result && typeof result === "object" && Symbol.asyncIterator in result)
    throw new Error("streaming tools are not shown in the gallery");
  return result as OUTPUT;
}

/**
 * Temporary review page: every piece of generative UI the agent can produce,
 * rendered with live tool output so its quality can be judged next to the
 * rest of the site. Remove once the parts are where they should be.
 */
export default async function Tools() {
  const { showProjects, showProfile, showResume, offerChoices } =
    portfolioTools;
  const [all, ai, active, career, about, contact, resume, choices] =
    await Promise.all([
      run(showProjects, { category: "All" }),
      run(showProjects, { category: "AI/ML" }),
      run(showProjects, { category: "All", status: "active" }),
      run(showProfile, { topic: "career" }),
      run(showProfile, { topic: "about" }),
      run(showProfile, { topic: "contact" }),
      run(showResume, {}),
      run(offerChoices, { choices: ["yes please", "no thanks"] }),
    ]);
  return (
    <main id="main-content" className="page-content tools-page">
      <ToolsGallery
        outputs={{ all, ai, active, career, about, contact, resume, choices }}
      />
    </main>
  );
}
