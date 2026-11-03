# Anike structure refactor

Goal: keep the existing portfolio agent behavior while making prompts, tools, runtime, shared contracts, and UI independently maintainable.

Research: Vercel's chatbot repository uses individual lib/ai/tools modules and shared message types. Anthropic recommends simple composable patterns and clearly documented tools. These inform this project's structure, not a claim about private company repositories.

- [x] Add regression coverage for prompt loading/context, validated configuration, shared history conversion and existing tool behavior.
- [x] Put server runtime in lib/agent/server: agent factory, config, context, HTTP handler, logging, prompts/system.MD plus loader, tools/ (one per tool), and data/profile.ts. Use server-only boundaries. Trace system.MD explicitly into standalone deployments.
- [x] Put browser-safe contracts, request validation, history preparation and voice formatting in lib/agent/shared. Keep inferred tool types via type-only imports.
- [x] Split components/chat into chat-view, composer, message-list/message and parts for each tool. Put streaming/session/checkout behavior in hooks/use-portfolio-chat.ts. Preserve styles, events, checkout and project entry.
- [x] Update imports, tests, lint/format coverage and architecture documentation. Verify in Docker: targeted/full tests, lint, types, build, dev health, production artifact includes the real prompt.

No new approval, persistence, provider, or multi-agent layers: the current agent does not need them. Existing uncommitted work stays intact. No model calls or credentials required for deterministic regression tests.
