# Direct model providers

Goal: route `AI_MODEL=provider/model-id` directly to Anthropic or OpenAI with that provider's server-only API key. Preserve Anike's prompt, tools and streaming UI.

- [ ] Test config parsing, selected-provider credentials, unknown providers, and provider HTTP transport using synthetic keys and fixture responses.
- [ ] Add server-only llm modules: a typed provider registry and one adapter per provider using the current AI SDK packages. Construct explicit model objects, never Gateway model strings.
- [ ] Validate configuration without returning secrets; reject missing selected-provider keys before opening a stream. Preserve SDK mock-model injection for deterministic agent tests.
- [ ] Load `.env` and `.env.local` in Compose, document canonical model syntax, examples and restarts. Remove Gateway authentication requirements and update affected tests/docs.
- [ ] Verify provider headers/endpoints and streamed tool execution without external calls, then run full Docker checks and confirm local API readiness. Live inference requires a valid provider key; do not reuse a Gateway credential as a provider key.

Keep this to routing/configuration; no model weights, custom inference engine, provider-specific agent forks, automatic paid failover, or model whitelist.
