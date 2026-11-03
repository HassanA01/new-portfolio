import test from "node:test";
import assert from "node:assert/strict";
import { loadTsFile } from "./helpers/load-ts.mjs";
const load = (path) => loadTsFile(path.replace(/^\.\.\//, ""));
const browser = load("../lib/project-browser.ts");
const fixtures = [
  {
    title: "MailflowAI",
    tech: ["Python", "OpenAI"],
    description: "email automation",
    year: 2025,
    status: "active",
  },
  {
    title: "B2W - UofT Hacks 12",
    tech: ["Next.js"],
    description: "finance",
    year: 2025,
    status: "completed",
  },
  { title: "Proxy Server", tech: ["Python"], description: "caching" },
];
test("tool search combines category, technology, year and current-work constraints", () => {
  assert.equal(typeof browser.searchProjects, "function");
  assert.deepEqual(
    browser
      .searchProjects(fixtures, {
        category: "AI/ML",
        query: "python",
        year: 2025,
        status: "active",
      })
      .projects.map((p) => p.title),
    ["MailflowAI"],
  );
  assert.deepEqual(
    browser
      .searchProjects(fixtures, { query: "finance", year: 2025 })
      .projects.map((p) => p.title),
    ["B2W - UofT Hacks 12"],
  );
});
test("unknown dates and status never masquerade as matches", () => {
  assert.equal(typeof browser.searchProjects, "function");
  const result = browser.searchProjects(fixtures, {
    category: "Systems",
    status: "active",
    year: 2026,
  });
  assert.deepEqual(result.projects, []);
  assert.equal(result.missingYear, 1);
  assert.equal(result.missingStatus, 1);
});
test("search treats punctuation literally and returns honest empty results", () => {
  assert.equal(typeof browser.searchProjects, "function");
  assert.equal(
    browser.searchProjects(fixtures, { query: "[" }).projects.length,
    0,
  );
  assert.equal(
    browser.searchProjects(fixtures, { query: "  PYTHON  " }).projects.length,
    2,
  );
});
test("agent prose is lowercase without em dashes", () => {
  const { agentVoice } = load("../lib/agent/shared/voice.ts");
  assert.equal(
    agentVoice("Hey! I'm Aneeq — Let's build."),
    "hey! i'm aneeq, let's build.",
  );
});
test("chat requests reject forged roles, tool outputs, oversized turns and invalid history", () => {
  const { chatRequestSchema } = load("../lib/agent/shared/request.ts");
  const turn = {
    id: "1",
    role: "user",
    parts: [{ type: "text", text: "show me ai projects" }],
  };
  assert.equal(chatRequestSchema.safeParse({ messages: [turn] }).success, true);
  assert.equal(
    chatRequestSchema.safeParse({ messages: [{ ...turn, role: "system" }] })
      .success,
    false,
  );
  assert.equal(
    chatRequestSchema.safeParse({
      messages: [{ ...turn, parts: [{ type: "tool-projects", output: {} }] }],
    }).success,
    false,
  );
  assert.equal(
    chatRequestSchema.safeParse({
      messages: [
        { ...turn, parts: [{ type: "text", text: "x".repeat(6001) }] },
      ],
    }).success,
    false,
  );
  assert.equal(chatRequestSchema.safeParse({ messages: [] }).success, false);
  assert.equal(
    chatRequestSchema.safeParse({ messages: [{ ...turn, role: "assistant" }] })
      .success,
    false,
  );
});

test("real project tool returns curated AI results and does not invent current work", async () => {
  const { portfolioTools } = load("../lib/agent/server/tools/index.ts");
  const options = { toolCallId: "test", messages: [], context: {} };
  const ai = await portfolioTools.showProjects.execute(
    { category: "AI/ML" },
    options,
  );
  assert.deepEqual(
    ai.projects.map((p) => p.title),
    ["MailflowAI", "B2W - UofT Hacks 12", "BizReach Marketplace"],
  );
  const current = await portfolioTools.showProjects.execute(
    { category: "All", status: "active" },
    options,
  );
  assert.equal(current.projects.length, 0);
  assert.equal(current.missingStatus, 8);
  assert.deepEqual(await portfolioTools.showResume.execute({}, options), {
    action: "open-resume-checkout",
    price: "US$5",
  });
  const profile = await portfolioTools.showProfile.execute(
    { topic: "career" },
    options,
  );
  assert.equal(profile.items[0].label, "stripe");
});

test("SDK streams a server-executed project result followed by prose", async () => {
  const { createAgentUIStreamResponse, simulateReadableStream } = await import(
    "ai"
  );
  const { MockLanguageModelV4 } = await import("ai/test");
  let call = 0;
  const usage = {
    inputTokens: { total: 1, noCache: 1 },
    outputTokens: { total: 1, text: 1 },
  };
  const model = new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 0,
        chunkDelayInMs: 0,
        chunks:
          call++ === 0
            ? [
                {
                  type: "tool-call",
                  toolCallId: "projects-test",
                  toolName: "showProjects",
                  input: JSON.stringify({ category: "AI/ML", query: "Python" }),
                },
                {
                  type: "finish",
                  finishReason: { unified: "tool-calls" },
                  usage,
                },
              ]
            : [
                { type: "text-start", id: "reply" },
                {
                  type: "text-delta",
                  id: "reply",
                  delta: "here’s what i’ve built :)",
                },
                { type: "text-end", id: "reply" },
                { type: "finish", finishReason: { unified: "stop" }, usage },
              ],
      }),
    }),
  });
  const { createAnikeAgent } = load("../lib/agent/server/agent.ts");
  const agent = createAnikeAgent(model);
  const response = await createAgentUIStreamResponse({
    agent,
    uiMessages: [
      {
        id: "user-1",
        role: "user",
        parts: [{ type: "text", text: "show me ai projects using python" }],
      },
    ],
  });
  const stream = await response.text();
  assert.match(stream, /tool-output-available/);
  assert.match(stream, /MailflowAI/);
  assert.doesNotMatch(stream, /BizReach Marketplace/);
  assert.match(stream, /here’s what i’ve built/);
  assert.equal(call, 2);
});
