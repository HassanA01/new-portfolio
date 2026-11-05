# Anike code structure

Anike is one tool-using portfolio agent. The Next.js route is an HTTP entrypoint;
the runtime, instructions, tools, public facts, and UI have separate owners.

```text
app/api/chat/route.ts                  HTTP export and platform duration
lib/agent/
  server/                             server-only runtime
    agent.ts                          ToolLoopAgent factory and execution limits
    config.ts                         validated provider/model settings
    context.ts                        fresh context for each request
    handle-chat.ts                    origin/rate-limit/size/schema checks and SSE response
    observability.ts                  structured errors without prompt/secret data
    prompts/
      system.MD                       authoritative system prompt
      load-system-prompt.ts           load Markdown and insert runtime context
    tools/
      index.ts                        explicit registry of stable tool names
      show-projects.ts                schema, description and execution
      show-profile.ts                 schema, description and execution
      show-resume.ts                  schema, description and checkout action
      offer-choices.ts                quick replies rendered beside the composer
    llm/
      resolve-model.ts                construct a direct model from validated config
      types.ts                        common provider adapter contract
      providers/
        index.ts                      provider registry
        anthropic.ts                  Anthropic Messages adapter
        openai.ts                     OpenAI Responses adapter
    data/profile.ts                   curated public facts
  shared/                             browser-safe modules
    messages.ts                       inferred message/result types and history conversion
    request.ts                        accepted HTTP conversation schema
    limits.ts                         non-secret execution, input and per-client rate limits
    voice.ts                          lowercase/no-em-dash prose formatting
hooks/use-portfolio-chat.ts            streaming, retries, reset, one-time checkout opening
lib/rate-limit.ts                      sliding-window limiter shared with the checkout route
components/chat/
  chat-view.tsx                       compose the chat and checkout
  composer.tsx                        input, suggestions, quick replies (click or 1-9), keyboard/glass interactions
  message-list.tsx                    transcript, scrolling and waiting state
  message.tsx                         prose, activity rail and tool parts for one message
  parts/
    activity.tsx                      collapsible tool-call rail per reply (reasoning stays server-side)
    tool-result.tsx                   tool-name and state dispatch
    projects.tsx                      project tool rendering
    profile.tsx                       profile tool dispatch by topic
    career.tsx                        linked role rows mirroring About's career journey
    about.tsx                         portrait, lede and facts
    contact.tsx                       public links as pills
    resume.tsx                        ticket that opens the existing checkout
data/projects.json                   project catalogue shared with the portfolio
evals/agent/scenarios.json            opt-in behavioral evaluation cases
```

## Boundaries

`server/` modules use `import "server-only"`. Client components import runtime
helpers only from `shared/`. Shared message types infer the actual tool results
through type-only imports, which disappear from the browser bundle. There is no
second hand-maintained set of tool result interfaces.

`system.MD` is the sole instruction source. Edit it directly; `{{current_date}}`
is inserted from per-request context. The loader reads it for each agent creation,
so a server kept running overnight does not retain an old date and prompt edits
work in development without restarting. Next's tracing configuration includes the
Markdown in `/api/chat` deployments. The postbuild script compares the packaged
file with its source so a missing or stale prompt fails the build.

Each tool owns its description, Zod input schema, and execution function. The
registry owns which tools the agent can call. The profile tool reads public facts
from `data/profile.ts`; the project tool queries the existing shared catalogue.
The resume tool renders a ticket and never executes a payment or opens anything
by itself; checkout opens only when the visitor taps the ticket's open button.

Conversation state remains in browser memory for the current page session.
History conversion preserves existing project constraints as text and strips
executable tool payloads. The server accepts bounded user/assistant text, rejects
client system roles/tool parts, and gets facts through its own tools. Credentials
remain server-only and are not returned by the config reader.

## Adding or changing behavior

1. Edit `prompts/system.MD` for voice, scope, or tool-selection instructions.
2. Add a tool file in `server/tools/`, then register it in `tools/index.ts`.
3. Add its renderer in `components/chat/parts/` and dispatch it in `tool-result.tsx`.
4. Add deterministic tool/rendering tests and a real-model evaluation scenario.
5. Run the Docker checks in the README. For model behavior, explicitly run
   `docker compose exec -T web npm run eval:agent` against a configured running app.

Normal tests exercise real tool execution and the real agent factory with a mock
model, plus HTTP boundaries and UI rendering. Live evals check model tool selection,
filter extraction, successful tool output, lowercase text, and absence of em dashes.
They are opt-in because they need provider credentials and incur model usage. They do not
open or pay through Stripe: the resume tool returns only the UI action.

The current runtime needs no separate database memory, handoff framework, approval
engine, or external integration layer. Add those modules when actual behavior
requires them, keeping their server boundary explicit.

## Research and rationale

There is no single standard folder tree, and these public examples do not reveal
how companies organize their private products. This layout adapts concrete patterns:

- [Vercel's chatbot tool module](https://github.com/vercel/chatbot/blob/main/lib/ai/tools/update-document.ts)
  keeps a tool's schema and execution together, with shared message types.
- [AI SDK agent documentation](https://ai-sdk.dev/docs/agents/building-agents)
  separates instructions, tools and execution settings in a typed agent definition.
- [Anthropic's Building effective agents](https://www.anthropic.com/research/building-effective-agents)
  recommends simple composable patterns and careful tool definitions.
- [Anthropic's context engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  treats the system prompt, tools and runtime context as distinct inputs worth maintaining carefully.

The prompt's behavior design, Anthropic references, and evaluation limits are
explained in [agent-prompt.md](agent-prompt.md).

Direct provider setup, extension steps and routing guarantees are documented in
[model-providers.md](model-providers.md).
