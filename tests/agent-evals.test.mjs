import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";

const scenarios = JSON.parse(
  fs.readFileSync(
    new URL("../evals/agent/scenarios.json", import.meta.url),
    "utf8",
  ),
);

async function runEval(changeEvent = (event) => event) {
  const requests = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    const parsed = JSON.parse(body);
    requests.push(parsed);
    const prompt = parsed.messages.at(-1).parts[0].text;
    const scenario = scenarios.find((item) => item.prompt === prompt);
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    for (const event of [
      ...(scenario.tool
        ? [
            {
              type: "tool-input-available",
              toolName: scenario.tool,
              toolCallId: "test",
              input: scenario.input,
            },
            { type: "tool-output-available", toolCallId: "test", output: {} },
          ]
        : []),
      ...(scenario.requiredTools ?? []).flatMap((toolName, index) => [
        {
          type: "tool-input-available",
          toolName,
          toolCallId: `required-${index}`,
          input: {},
        },
        {
          type: "tool-output-available",
          toolCallId: `required-${index}`,
          output: {},
        },
      ]),
      { type: "text-delta", id: "text", delta: "here you go :)" },
    ])
      response.write(
        `data: ${JSON.stringify(changeEvent(event, scenario))}\n\n`,
      );
    response.end("data: [DONE]\n\n");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const child = spawn(process.execPath, ["scripts/eval-agent.mjs"], {
      env: {
        ...process.env,
        EVAL_BASE_URL: `http://127.0.0.1:${server.address().port}`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const code = await new Promise((resolve, reject) => {
      child.on("close", resolve);
      child.on("error", reject);
    });
    return { code, output, requests };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("live evaluation runner accepts completed tool calls and the expected voice", async () => {
  const result = await runEval();
  assert.equal(result.code, 0, result.output);
  assert.equal(result.output.match(/PASS /g)?.length, scenarios.length);
  const followup = result.requests.find(
    (request) =>
      request.messages.at(-1).parts[0].text === "only the python ones",
  );
  assert.ok(followup);
  assert.match(followup.messages[0].parts[0].text, /2025/);
  assert.equal(followup.messages.at(-1).parts[0].text, "only the python ones");
});

test("live evaluation runner fails when the model drops a year constraint", async () => {
  const result = await runEval((event, scenario) =>
    event.type === "tool-input-available" && scenario.input.year
      ? { ...event, input: { ...event.input, year: 2024 } }
      : event,
  );
  assert.equal(result.code, 1);
  assert.match(result.output, /wrong year/);
});

test("live evaluation runner fails when replies violate the agent voice", async () => {
  const result = await runEval((event) =>
    event.type === "text-delta" ? { ...event, delta: "Hi — hello" } : event,
  );
  assert.equal(result.code, 1);
  assert.match(result.output, /reply must be lowercase/);
});

test("live evaluation runner rejects unsolicited checkout calls", async () => {
  const result = await runEval((event, scenario) =>
    scenario.tool === null && event.type === "text-delta"
      ? {
          type: "tool-input-available",
          toolName: "showResume",
          toolCallId: "unsolicited",
          input: {},
        }
      : event,
  );
  assert.equal(result.code, 1);
  assert.match(result.output, /unexpected tool showResume/);
});

test("live evaluation runner rejects unsupported gpa claims", async () => {
  const result = await runEval((event) =>
    event.type === "text-delta"
      ? { ...event, delta: "my gpa was 3.9 out of 4" }
      : event,
  );
  assert.equal(result.code, 1);
  assert.match(result.output, /unsupported claim/);
});
