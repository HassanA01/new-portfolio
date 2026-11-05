import assert from "node:assert/strict";
import fs from "node:fs";

const scenarios = JSON.parse(
  fs.readFileSync(
    new URL("../evals/agent/scenarios.json", import.meta.url),
    "utf8",
  ),
);
const baseURL = process.env.EVAL_BASE_URL || "http://127.0.0.1:3000";
let failed = 0;
for (const [index, scenario] of scenarios.entries()) {
  try {
    const response = await fetch(new URL("/api/chat", baseURL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Each scenario gets its own rate-limit bucket on a local server. A
        // real proxy overwrites this header, so it grants nothing in production.
        "x-forwarded-for": `eval-${index}`,
      },
      body: JSON.stringify({
        messages: [
          ...(scenario.history ?? []).map((turn) => ({
            id: crypto.randomUUID(),
            role: turn.role,
            parts: [{ type: "text", text: turn.text }],
          })),
          {
            id: crypto.randomUUID(),
            role: "user",
            parts: [{ type: "text", text: scenario.prompt }],
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    // Fail fast if the local app or provider authentication is unavailable.
    if (!response.ok)
      throw new Error(
        `chat returned HTTP ${response.status}; check the running app and selected provider configuration`,
      );
    const events = (await response.text())
      .split("\n")
      .filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")
      .map((line) => JSON.parse(line.slice(6)));
    assert.equal(
      events.some((event) => event.type === "error"),
      false,
      "stream failed",
    );
    for (const name of scenario.forbiddenTools ?? []) {
      assert.equal(
        events.some(
          (event) =>
            event.type === "tool-input-available" && event.toolName === name,
        ),
        false,
        `unexpected tool ${name}`,
      );
    }
    for (const name of scenario.requiredTools ?? []) {
      const call = events.find(
        (event) =>
          event.type === "tool-input-available" && event.toolName === name,
      );
      assert.ok(call, `expected ${name}`);
      assert.ok(
        events.some(
          (event) =>
            event.type === "tool-output-available" &&
            event.toolCallId === call.toolCallId,
        ),
        `${name} did not complete`,
      );
    }
    if (scenario.tool) {
      const call = events.find(
        (event) =>
          event.type === "tool-input-available" &&
          event.toolName === scenario.tool,
      );
      assert.ok(call, `expected ${scenario.tool}`);
      for (const [key, expected] of Object.entries(scenario.input)) {
        const actual = call.input[key];
        assert.equal(
          typeof actual === "string" ? actual.toLowerCase() : actual,
          typeof expected === "string" ? expected.toLowerCase() : expected,
          `wrong ${key}`,
        );
      }
      assert.ok(
        events.some(
          (event) =>
            event.type === "tool-output-available" &&
            event.toolCallId === call.toolCallId,
        ),
        "tool did not complete",
      );
    }
    const prose = events
      .filter((event) => event.type === "text-delta")
      .map((event) => event.delta)
      .join("");
    assert.ok(prose.trim(), "reply is empty");
    for (const text of scenario.forbiddenText ?? []) {
      assert.ok(
        !prose.toLowerCase().includes(text.toLowerCase()),
        `unsupported claim: ${text}`,
      );
    }
    assert.equal(prose, prose.toLowerCase(), "reply must be lowercase");
    assert.ok(!prose.includes("—"), "reply contains an em dash");
    console.log(`PASS ${scenario.name}`);
  } catch (error) {
    console.error(`FAIL ${scenario.name}: ${error.message}`);
    failed++;
    if (!(error instanceof assert.AssertionError)) break;
  }
}
process.exitCode = failed ? 1 : 0;
