# CLAUDE.md

Personal portfolio (aneeqhassan.com), phase 1 of 4 — see
`docs/superpowers/specs/2026-08-07-portfolio-redesign-design.md` and `STYLE_GUIDE.md`
(binding: banned-styles list, tokens, fonts).

## Commands

- `docker compose up` — dev (hot reload)
- `docker compose exec web npm test` / `npm run lint` / `npm run typecheck`
- `docker compose exec web npm run build` — build for production
- `npx dotenv -e .env.local -- npm run db:migrate` — apply migrations (host)
- `npx dotenv -e .env.local -- npm run db:seed` — seed (insert-if-missing)
- `npx dotenv -e .env.local -- npm run db:embed` — embed knowledge base into pgvector
- `npx dotenv -e .env.local -- npm run db:studio` — browse the DB

## Architecture

- Content: Postgres via Drizzle (`db/schema.ts`), read ONLY through `lib/content.ts`
  (async, `unstable_cache` tags `content:projects` / `content:experience`).
  Admin mutations revalidate those tags. Seed fixtures in `db/seed-data/` are
  insert-if-missing only — the DB is the source of truth, never the fixtures.
- Admin: `/admin` behind Auth.js GitHub OAuth allowlisted to HassanA01
  (`auth.ts` signIn callback + middleware).
- `components/ui` = primitives (tokens only, no raw hex); `components/sections` = page blocks.
- Theme: `data-theme` attr set pre-paint by `THEME_INIT_SCRIPT` (lib/theme.ts); CSS vars in globals.css.
- Agent: cmd-k palette chat → /api/agent/chat (AI SDK ToolLoopAgent, gateway model anthropic/claude-sonnet-4-6). Tools are one-file modules in lib/agent/tools/ registered in tools/index.ts — add a tool = add a file + one line. Knowledge: pgvector knowledge_chunks, re-embedded by admin hooks + npm run db:embed. Rate limits in Postgres (lib/agent/rate-limit.ts).
- ⌘K palette (`CommandPalette`) — phase 3 shipped with nav + chat modes.

## Rules

- Semantic tokens only; accent = hover/focus/presence-dot exclusively.
- Every PR: tests for changed code, CI green, conventional commits `feat(#N): …`.
