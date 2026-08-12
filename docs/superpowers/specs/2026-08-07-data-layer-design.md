# Data Layer — Phase 2 Design Spec

**Date:** 2026-08-07
**Status:** Approved pending user review
**Scope:** Phase 2 of 4 — Postgres content, migrations, seed, admin editing
**Depends on:** Phase 1 (complete on this branch; PR #13 held unmerged — user
directive: nothing merges to main until the whole revamp is done)

## Goal

Move projects and experience content from `data/*.json` into Postgres behind
the existing `lib/content.ts` contract, with versioned migrations, a
re-runnable seed, and a hidden GitHub-authenticated `/admin` for editing.
The public site's appearance and performance do not change.

## Decisions (from brainstorming)

- **Database:** Neon Postgres via Vercel Marketplace (prod/preview);
  `postgres:17-alpine` in docker-compose for dev. Neon supports pgvector, so
  phase 3 embeddings share this database — no separate vector store.
- **ORM:** Drizzle (`drizzle-orm`, `drizzle-kit`), TypeScript schema,
  versioned SQL migrations committed to git. Drizzle Studio for local
  inspection.
- **Admin auth:** GitHub OAuth via Auth.js v5, allowlisted to GitHub user
  `HassanA01` only. JWT session cookie; no DB session table.
- **Images:** stay path/URL strings (no uploads; Blob deferred to phase 4).
- **Blog:** deferred to phase 4 (its own migration + admin editor then).
- **Tests:** NONE. Phase 2 ships no new tests (user directive). Test files
  that exercise the JSON content path (`tests/content.test.ts`,
  `tests/landing.test.tsx`, `tests/landing-lower.test.tsx`,
  `tests/pages.test.tsx`) are deleted with the swap, not rewritten. UI-only
  tests (`theme`, `primitives`, `nav`, `smoke`) remain. CI gates: lint,
  typecheck, remaining tests, build, docker build.

## Schema (`db/schema.ts`)

```
projects:    id serial PK · title text unique not null · description text not null
             · tech text[] not null · image text not null · github text not null
             · live text not null default '' · featured boolean not null default false
             · sort_order integer not null
experience:  id serial PK · title text not null · company text not null
             · duration text not null · impact text not null
             · tech_stack text[] not null · highlights text[] not null
             · sort_order integer not null
```

Ordering becomes explicit via `sort_order` (ascending). No blog table, no
vector columns (phases 4 and 3 respectively).

## Migrations & Seed

- `drizzle-kit generate` → versioned SQL in `db/migrations/`, committed.
  Applied by `npm run db:migrate` (drizzle-kit migrate). Never manual DDL.
- `db/seed.ts` reads the existing `data/*.json` files and upserts by natural
  key (projects: `title`; experience: `company+title`), assigning
  `sort_order` from array position. Idempotent — safe to re-run. Run via
  `npm run db:seed`.
- After the swap ships, `data/*.json` and their import-time validation are
  deleted; the DB is the single source of truth.

## Read Path

- `lib/content.ts` keeps its exact contract — `getProjects()`,
  `getFeaturedProjects()`, `getExperience()` returning the same `Project` /
  `Experience` shapes — but the functions become `async` and query Drizzle,
  ordered by `sort_order`. Callers (5 server components/pages) add `await`.
  No client component changes.
- **Client:** lazy `getDb()` init (`drizzle-orm/neon-http` +
  `@neondatabase/serverless` when `DATABASE_URL` is a Neon URL;
  `drizzle-orm/node-postgres` + `pg` for local/CI Postgres). No JS `Proxy`
  wrappers. Module-level lazy `let`.
- **Caching:** queries wrapped with Next cache tagging (tags
  `content:projects`, `content:experience`); pages remain statically
  rendered. Admin mutations call `revalidateTag` — edits go live in seconds
  without redeploys; visitors always get static HTML.
- **Failure mode:** unreachable DB or empty required tables throw at
  build/revalidate time with a contextual error. Never render a blank
  portfolio.

## Admin

- **Routes:** `/admin` (lists of projects and experience with edit links,
  "New project" / "New role"), `/admin/projects/[id]`,
  `/admin/projects/new`, `/admin/experience/[id]`, `/admin/experience/new`,
  plus a sign-in page. All noindex, linked nowhere publicly.
- **Auth:** Auth.js v5 (`next-auth@beta`), GitHub provider. `signIn`
  callback rejects any GitHub login whose username ≠ `HassanA01`.
  `middleware.ts` guards `/admin/*` (redirect to sign-in). Env:
  `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`.
- **Forms:** plain forms in the phase-1 design system (Surface, GlassButton,
  MonoDetail; no new visual language). Array fields (tech, highlights) are
  one-item-per-line textareas. `sort_order` is a number input. Image is a
  text field (path or URL).
- **Mutations:** server actions only (no API routes): create / update /
  delete per entity. Zod validation at the action boundary (mirrors the DB
  constraints); delete requires a confirm step. Every successful mutation
  calls `revalidateTag` for the affected tag.

## Infrastructure

- **docker-compose:** add `db` service (`postgres:17-alpine`, healthcheck,
  named volume, port 5432); `web` gets `DATABASE_URL` pointing at it and
  `depends_on: db: condition: service_healthy`.
- **CI:** build/test jobs gain a Postgres service container; workflow runs
  `db:migrate` + `db:seed` before build so `next build` (static generation)
  has real data. The docker job needs the same: `next build` inside the
  image prerenders pages that query the DB, so the job runs a Postgres
  service (migrated + seeded) and builds with `--network host` passing
  `DATABASE_URL` as a build arg. On Vercel, builds always have the Neon env.
- **Vercel:** `vercel integration add neon` provisions `DATABASE_URL` for
  production/preview. Auth env vars added via `vercel env`. GitHub OAuth app
  created by Aneeq (callback `https://aneeqhassan.com/api/auth/callback/github`
  + localhost variant); agent cannot do this step.
- **`.env.example`:** documents `DATABASE_URL`, `AUTH_GITHUB_ID`,
  `AUTH_GITHUB_SECRET`, `AUTH_SECRET`.

## Rollout Order (site stays live at every step)

1. Infra: compose db service, Drizzle setup, schema, migrations, seed —
   nothing user-visible.
2. Provision Neon; migrate + seed production.
3. Swap `lib/content.ts` internals; delete JSON + JSON-path test files;
   deploy — site renders identically from the DB.
4. Admin: auth + pages + server actions; deploy.

## Workflow

- Work continues on the current branch; PR #13 is the single long-running
  revamp PR (accumulates phases; merged only when the user declares the
  revamp done). Conventional commits referencing new phase-2 issues
  (epic + ~4 issues) created under HassanA01's gh account.
- README gains a Database section (migrate / seed / studio commands);
  project CLAUDE.md updated (content is DB-backed; JSON gone).

## Out of Scope

- Blog table, `/writing` content, markdown rendering (phase 4)
- Embeddings, pgvector columns, RAG (phase 3)
- Image uploads / Vercel Blob (phase 4)
- Drag-to-reorder UI, audit history, multi-user roles
- Any new tests
