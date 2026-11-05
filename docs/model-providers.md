# Model providers

`AI_MODEL=provider/model-id` is Anike's routing contract. The server validates the
prefix, requires that provider's own API key, strips the prefix and constructs an
explicit SDK model instance. It does not pass a model string to the default
Gateway provider. Unknown providers and malformed model identifiers fail locally.

| Prefix       | Credential          | Direct API         |
| ------------ | ------------------- | ------------------ |
| `anthropic/` | `ANTHROPIC_API_KEY` | Anthropic Messages |
| `openai/`    | `OPENAI_API_KEY`    | OpenAI Responses   |

Model IDs are not hard-coded into a catalogue. Use an ID available to your provider
account. Supporting a new text/tool-capable model from either provider requires
only changing `AI_MODEL`. Provider access, availability, and billing remain with
the selected account. A model not supporting tool calls cannot supply Anike's
interactive project and résumé behavior.

## Ownership and extension

- `config.ts`: validate the selected prefix/model, identify its key variable, and
  return non-secret routing metadata. Old Gateway/OIDC variables cannot satisfy
  direct-provider readiness.
- `llm/types.ts`: the shared adapter contract.
- `llm/providers/anthropic.ts` and `openai.ts`: construct their own SDK clients with
  an explicit API key, model ID and optional injected fetch transport.
- `llm/providers/index.ts`: the registry of supported providers and key names.
- `llm/resolve-model.ts`: resolve the selected adapter and verify its key before
  model execution. It reads keys only on the server and never returns them in
  configuration metadata.
- `agent.ts`: consume the resolved model, keeping prompt, tools, limits and streaming
  behavior provider-independent. Tests can inject a mock model object.

To add a provider, install its compatible SDK package in Docker, implement the
adapter contract, and register the adapter. Add transport and streamed tool-loop
tests. No changes to the chat UI, tools, or system prompt are required merely to
change providers.

No automatic fallback changes the requested provider, billing account or model.
There is no custom inference engine or local model-weight hosting in this router.

## Environment files

Put the selected model and key in `.env`, as shown in the README. Compose loads
`.env` followed by `.env.local`; the latter takes precedence. Next.js supports
both in development. Container environment variables take precedence over files,
so recreate the web container after changing them:

```sh
docker compose up -d --force-recreate web
```

Environment files are ignored by Git and excluded from Docker build contexts.
Never use `NEXT_PUBLIC_` for provider keys. Vercel deployments use the same
`AI_MODEL` and selected provider key as server-side project environment variables.

## Verification

The tests execute real SDK adapters against synthetic HTTP/SSE responses and
check direct endpoint URLs, authentication isolation, model IDs, streaming,
server-side tool execution and the tool results sent back to the provider. No
real keys or external inference calls are needed for these checks. The optional
live evaluation command in the README requires the actual selected provider key.

Sources: [OpenAI authentication](https://developers.openai.com/api/reference/overview),
[AI SDK OpenAI adapter](https://ai-sdk.dev/providers/ai-sdk-providers/openai), and
[AI SDK Anthropic adapter](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic).
