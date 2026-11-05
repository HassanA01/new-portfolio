import test from "node:test";
import assert from "node:assert/strict";
import { generateText } from "ai";
import { loadTsFile } from "./helpers/load-ts.mjs";

const { getAgentConfig } = loadTsFile("lib/agent/server/config.ts");

test("model prefix selects only that provider's credentials and keeps secrets out of config", () => {
  const env = {
    AI_MODEL: " anthropic/claude-sonnet-5-5 ",
    ANTHROPIC_API_KEY: " anthropic-test-secret ",
    OPENAI_API_KEY: "openai-test-secret",
    AI_GATEWAY_API_KEY: "gateway-test-secret",
  };
  const config = getAgentConfig(env);
  assert.equal(config.provider, "anthropic");
  assert.equal(config.modelId, "claude-sonnet-5-5");
  assert.equal(config.keyEnvironmentVariable, "ANTHROPIC_API_KEY");
  assert.equal(config.hasCredentials, true);
  assert.ok(!JSON.stringify(config).includes("test-secret"));
  assert.equal(
    getAgentConfig({
      AI_MODEL: "anthropic/claude-sonnet-5-5",
      OPENAI_API_KEY: "wrong-provider",
    }).hasCredentials,
    false,
  );
  assert.equal(
    getAgentConfig({
      AI_GATEWAY_API_KEY: "old-key",
      VERCEL_OIDC_TOKEN: "old-token",
    }).hasCredentials,
    false,
  );
});

test("unsupported, malformed and unqualified models fail before any API call", () => {
  for (const model of [
    "google/gemini",
    "gpt-5.4-mini",
    "anthropic/",
    "openai/has spaces",
    "openai/model/extra",
    "__proto__/model",
  ]) {
    assert.throws(() => getAgentConfig({ AI_MODEL: model }), /AI_MODEL/);
  }
});

test("new provider model IDs need no hard-coded model catalogue", () => {
  const config = getAgentConfig({
    AI_MODEL: "openai/future-frontier-model",
    OPENAI_API_KEY: "test",
  });
  assert.equal(config.modelId, "future-frontier-model");
  assert.equal(config.provider, "openai");
});

for (const provider of ["openai", "anthropic"]) {
  test(`${provider} adapter sends the selected model directly with its own authentication`, async () => {
    const { resolveModel } = loadTsFile(
      "lib/agent/server/llm/resolve-model.ts",
    );
    const env = {
      AI_MODEL: `${provider}/test-frontier-model`,
      OPENAI_API_KEY: " openai-test-secret ",
      ANTHROPIC_API_KEY: " anthropic-test-secret ",
    };
    const requests = [];
    const model = resolveModel(getAgentConfig(env), {
      environment: env,
      fetch: async (url, init) => {
        requests.push({
          url: String(url),
          headers: new Headers(init.headers),
          body: JSON.parse(init.body),
        });
        return Response.json(
          provider === "openai"
            ? {
                id: "resp-test",
                object: "response",
                created_at: 0,
                status: "completed",
                model: "test-frontier-model",
                output: [
                  {
                    type: "message",
                    id: "msg-test",
                    role: "assistant",
                    status: "completed",
                    content: [
                      { type: "output_text", text: "hello", annotations: [] },
                    ],
                  },
                ],
                usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
              }
            : {
                id: "msg-test",
                type: "message",
                role: "assistant",
                model: "test-frontier-model",
                content: [{ type: "text", text: "hello" }],
                stop_reason: "end_turn",
                stop_sequence: null,
                usage: { input_tokens: 1, output_tokens: 1 },
              },
        );
      },
    });
    const response = await generateText({
      model,
      prompt: "say hello",
      maxOutputTokens: 32,
      maxRetries: 0,
    });
    assert.equal(response.text, "hello");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].body.model, "test-frontier-model");
    assert.equal(
      requests[0].url,
      provider === "openai"
        ? "https://api.openai.com/v1/responses"
        : "https://api.anthropic.com/v1/messages",
    );
    assert.equal(
      requests[0].headers.get(
        provider === "openai" ? "authorization" : "x-api-key",
      ),
      provider === "openai"
        ? "Bearer openai-test-secret"
        : "anthropic-test-secret",
    );
    assert.equal(
      requests[0].headers.has(
        provider === "openai" ? "x-api-key" : "authorization",
      ),
      false,
    );
    assert.ok(!JSON.stringify(requests[0].body).includes("test-secret"));
  });
}

test("missing selected key fails locally instead of falling back to Gateway or another provider", () => {
  const { resolveModel } = loadTsFile("lib/agent/server/llm/resolve-model.ts");
  const env = { AI_MODEL: "anthropic/test-model", OPENAI_API_KEY: "other-key" };
  assert.throws(
    () => resolveModel(getAgentConfig(env), { environment: env }),
    /ANTHROPIC_API_KEY/,
  );
});

for (const provider of ["anthropic", "openai"]) {
  test(`${provider} streams through the real agent, executes a project tool, and receives its results`, async () => {
    const { createAgentUIStreamResponse } = await import("ai");
    const { providerStream } = await import("./helpers/provider-streams.mjs");
    const { resolveModel } = loadTsFile(
      "lib/agent/server/llm/resolve-model.ts",
    );
    const { createAnikeAgent } = loadTsFile("lib/agent/server/agent.ts");
    const env = {
      AI_MODEL: `${provider}/test-model`,
      OPENAI_API_KEY: "openai-test",
      ANTHROPIC_API_KEY: "anthropic-test",
    };
    const requests = [];
    const model = resolveModel(getAgentConfig(env), {
      environment: env,
      fetch: async (_url, init) => {
        requests.push(JSON.parse(init.body));
        return providerStream(provider, requests.length === 1);
      },
    });
    const response = await createAgentUIStreamResponse({
      agent: createAnikeAgent(model),
      uiMessages: [
        {
          id: "user",
          role: "user",
          parts: [{ type: "text", text: "show me ai projects" }],
        },
      ],
    });
    const stream = await response.text();
    assert.doesNotMatch(stream, /"type":"error"/);
    assert.match(stream, /tool-output-available/);
    assert.match(stream, /MailflowAI/);
    assert.match(stream, /here are my ai projects/);
    assert.equal(requests.length, 2);
    assert.match(JSON.stringify(requests[1]), /MailflowAI/);
    assert.match(JSON.stringify(requests[0].tools), /showProjects/);
  });
}
