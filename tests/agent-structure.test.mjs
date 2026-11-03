import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadTsFile } from "./helpers/load-ts.mjs";

test("system prompt loads from its Markdown source with fresh request context", () => {
  const { loadSystemPrompt } = loadTsFile(
    "lib/agent/server/prompts/load-system-prompt.ts",
  );
  const { createAgentContext } = loadTsFile("lib/agent/server/context.ts");
  const source = fs.readFileSync(
    new URL("../lib/agent/server/prompts/system.MD", import.meta.url),
    "utf8",
  );
  const first = loadSystemPrompt(
    createAgentContext(new Date("2026-11-03T12:00:00Z")),
  );
  const next = loadSystemPrompt(
    createAgentContext(new Date("2026-11-04T12:00:00Z")),
  );
  assert.equal(first, source.replaceAll("{{current_date}}", "2026-11-03"));
  assert.match(next, /2026-11-04/);
  assert.doesNotMatch(first, /\{\{current_date\}\}/);
  for (const tool of ["showProjects", "showResume", "showProfile"])
    assert.ok(first.includes(tool));
});

test("agent configuration validates only its own settings and keeps secrets out of the result", () => {
  const { getAgentConfig } = loadTsFile("lib/agent/server/config.ts");
  assert.deepEqual(getAgentConfig({}), {
    model: "openai/gpt-5.4-mini",
    hasCredentials: false,
  });
  assert.deepEqual(
    getAgentConfig({
      AI_MODEL: "  anthropic/test-model  ",
      AI_GATEWAY_API_KEY: "test-key",
    }),
    { model: "anthropic/test-model", hasCredentials: true },
  );
  assert.equal(
    getAgentConfig({ VERCEL_OIDC_TOKEN: "test-token" }).hasCredentials,
    true,
  );
  assert.equal(
    getAgentConfig({ AI_GATEWAY_API_KEY: "   " }).hasCredentials,
    false,
  );
  assert.throws(() => getAgentConfig({ AI_MODEL: 42 }));
});

test("shared history retains project constraints without forwarding executable tool payloads", () => {
  const { prepareChatMessages } = loadTsFile("lib/agent/shared/messages.ts");
  const { chatRequestSchema } = loadTsFile("lib/agent/shared/request.ts");
  const result = prepareChatMessages([
    {
      id: "projects",
      role: "assistant",
      parts: [
        {
          type: "tool-showProjects",
          state: "output-available",
          toolCallId: "p",
          output: {
            search: { category: "AI/ML", year: 2025 },
            projects: [{ title: "MailflowAI" }],
          },
        },
      ],
    },
    {
      id: "question",
      role: "user",
      parts: [{ type: "text", text: "only the python ones" }],
    },
  ]);
  assert.equal(chatRequestSchema.safeParse({ messages: result }).success, true);
  assert.match(result[0].parts[0].text, /2025/);
  assert.match(result[0].parts[0].text, /MailflowAI/);
  assert.equal(result[0].parts[0].type, "text");
  const history = prepareChatMessages(
    Array.from({ length: 35 }, (_, i) => ({
      id: `${i}`,
      role: "user",
      parts: [{ type: "text", text: `${i}` }],
    })),
  );
  assert.equal(history.length, 30);
  assert.equal(history.at(-1).id, "34");
});
