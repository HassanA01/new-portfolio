# Anike agent implementation plan

Goal: replace simulated replies with a streaming, tool-driven portfolio agent using Vercel AI Gateway.

Keep the existing warm neutral surfaces, Manrope, compact project rows, real thumbnails, and restrained motion. Project results come from server tools, scoped by category, text, year and status. Unknown dates/status stay unknown. Resume requests open the existing checkout modal, including its blurred backdrop. Agent prose is informal, lowercase, and has no em dashes.

1. Add failing tests for combined project filters, unknown metadata, voice formatting, request validation, and tool execution.
2. Implement typed portfolio tools and a bounded ToolLoopAgent using public portfolio facts.
3. Add validated streaming API and connect the existing composer with typed useChat tool parts, loading/errors, cancellation, and checkout opening once per tool call.
4. Verify filtering, streaming/tool UI and checkout behavior; run Docker build, lint, typecheck and full tests. Document configuration and limitations.

Provider: Vercel AI Gateway, selected by user. Model configurable through AI_MODEL. No credentials committed. Existing uncommitted project work must be preserved.
