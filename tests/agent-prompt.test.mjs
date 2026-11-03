import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { loadTsFile } from "./helpers/load-ts.mjs";

const { loadSystemPrompt } = loadTsFile(
  "lib/agent/server/prompts/load-system-prompt.ts",
);
const prompt = loadSystemPrompt({ currentDate: "2026-11-03" });

// These are prompt integration contracts, not claims about live model behavior.
test("prompt keeps instructions, tool policies, examples and dynamic context distinct", () => {
  for (const section of [
    "identity",
    "voice",
    "grounding",
    "tool_workflow",
    "project_policy",
    "resume_policy",
    "response_contract",
    "trust_boundaries",
    "examples",
    "runtime_context",
  ]) {
    assert.ok(prompt.includes(`<${section}>`), `missing ${section}`);
    assert.ok(prompt.includes(`</${section}>`), `unclosed ${section}`);
  }
  assert.match(prompt, /2026-11-03/);
  assert.doesNotMatch(prompt, /\{\{current_date\}\}/);
});

test("prompt examples use actual tools and inputs accepted by their schemas", async () => {
  const { portfolioTools } = loadTsFile("lib/agent/server/tools/index.ts");
  const examples = [...prompt.matchAll(/<tool_call>([\s\S]*?)<\/tool_call>/g)];
  assert.ok(examples.length >= 5, "cover varied tool and follow-up cases");
  for (const [, raw] of examples) {
    const call = JSON.parse(raw);
    assert.ok(portfolioTools[call.name], `unknown example tool ${call.name}`);
    assert.equal(
      portfolioTools[call.name].inputSchema.safeParse(call.input).success,
      true,
      raw,
    );
  }
});

test("example replies model lowercase prose without em dashes or invented markup", () => {
  const replies = [
    ...prompt.matchAll(/<assistant_reply>([\s\S]*?)<\/assistant_reply>/g),
  ];
  assert.ok(replies.length >= 6);
  for (const [, raw] of replies) {
    const text = raw.trim();
    assert.equal(text, text.toLowerCase());
    assert.ok(!text.includes("—"));
    assert.doesNotMatch(text, /```|<[^>]+>/);
  }
});

test("behavior evaluation cases cover follow-ups, unknown facts and unsolicited UI actions", () => {
  const scenarios = JSON.parse(
    fs.readFileSync(
      new URL("../evals/agent/scenarios.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(
    scenarios.some(
      (s) =>
        s.history?.length &&
        s.input.year === 2025 &&
        s.input.query === "python",
    ),
  );
  assert.ok(scenarios.some((s) => s.forbiddenText?.length));
  assert.ok(
    scenarios.some(
      (s) => s.tool === null && s.forbiddenTools?.includes("showResume"),
    ),
  );
});
