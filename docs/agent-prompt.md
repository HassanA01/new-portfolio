# Anike prompt design

`lib/agent/server/prompts/system.MD` is the runtime instruction source. It defines
Anike's job, voice, grounding, tool workflow, per-tool decisions, output contract,
trust boundaries, realistic examples, and the per-request date in separate XML
sections. Tool schemas remain authoritative for accepted arguments.

The prompt describes a useful outcome and why tools matter: the visitor should
get relevant facts and interactive UI with little friction. It specifies natural
lowercase prose, useful brevity, tone matching, and playful opinions without
invented biography. It differentiates unknown metadata, empty results, and tool
failures. Follow-ups preserve filters, while explicit replacements and resets
change them. Unsupported filters must not be presented as applied.

The examples demonstrate successful retrieval, constrained follow-ups, missing
metadata, résumé checkout, unknown languages, limited career details, banter,
identity, and tool failure. Their result summaries are explicitly illustrative;
current tool output takes precedence. The prompt does not encode a permanent
biography or pretend the application can perform unavailable actions.

## Guidance applied

- [Anthropic prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices):
  explicit role and output expectations, motivation, distinct XML sections, and
  diverse examples tied to the actual product.
- [Anthropic context engineering](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents):
  clear behavioral heuristics with enough detail to guide decisions, avoiding a
  huge catalogue of hard-coded replies or vague personality adjectives alone.
- [Anthropic tool definitions](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools):
  concrete descriptions of when each tool applies, input meanings, output
  semantics, and limitations. Parameter descriptions live with the Zod schemas.

These are general prompting principles. The configured Gateway model is unchanged;
Claude-specific performance claims do not establish quality on another model.

## Verification and limits

Normal Docker tests check that the real Markdown loads with fresh context, example
calls validate against actual tool schemas, and example replies honor the voice.
These checks protect integration and consistency; they cannot prove that a live
model will follow the instructions.

The opt-in `npm run eval:agent` sends the cases in `evals/agent/scenarios.json` to
the running application. It checks tool selection and argument constraints,
follow-up history, completed tool outputs, lowercase prose, em dashes, selected
unsupported claims, and unsolicited UI actions. The evaluator itself is tested
against local SSE fixtures that include deliberately wrong outputs.

String-based claim checks are smoke tests, not a complete factuality or safety
judge. Review live replies for tone, relevance, truthful uncertainty and whether
the prose complements the UI. Prompt strength is an evaluation question; do not
report improved model performance solely because the prompt grew or tests passed.
