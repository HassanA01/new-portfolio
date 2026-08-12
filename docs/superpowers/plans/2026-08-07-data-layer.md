# Data Layer (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move projects/experience content into Postgres (Neon prod, Docker dev) behind the unchanged `lib/content.ts` contract, with Drizzle migrations, an idempotent seed, and a GitHub-authenticated `/admin` editor.

**Architecture:** Drizzle schema in `db/`, one `pg` (node-postgres) driver everywhere — Neon is wire-compatible, so no dual-driver complexity (refines the spec's neon-http mention; use Neon's **pooled** connection string on Vercel). Public reads go through `unstable_cache` with tags; admin server actions mutate and `revalidateTag`. Pages stay statically rendered.

**Tech Stack:** Next.js 15, Drizzle ORM + drizzle-kit, pg, postgres:17-alpine (dev/CI), Neon (prod), Auth.js v5 (next-auth@beta) GitHub provider, Zod, tsx.

**Spec:** `docs/superpowers/specs/2026-08-07-data-layer-design.md` — read before starting.

## Global Constraints

- **NO TESTS.** Do not write, modify, or scaffold any test. Delete only the four files named in Task 3. Never touch `tests/theme.test.ts`, `tests/primitives.test.tsx`, `tests/nav.test.tsx`, `tests/smoke.test.ts`, or `tests/setup.ts`.
- Work on the CURRENT branch (the long-running revamp branch; PR #13). Never create branches, never merge, never push until the final task says so.
- Public content contract is frozen: `getProjects()`, `getFeaturedProjects()`, `getExperience()` return `Project[]` / `Experience[]` with exactly the phase-1 field shapes (no `id`, no `sortOrder`). They become `async`.
- Admin UI uses ONLY existing primitives (`Surface`, `GlassButton`, `MonoDetail`, `Section`) and semantic tokens — no raw hex, no new visual language. Accent only in hover/focus.
- Allowlist: GitHub username `HassanA01` is the only permitted admin login.
- Cache tags exactly: `content:projects`, `content:experience`.
- Local/CI `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/portfolio` (host) / `postgresql://postgres:postgres@db:5432/portfolio` (inside compose).
- Conventional commits referencing the phase-2 issue numbers created in Task 1 (recorded in `.context/issues-phase2.md`).
- Gate for every task: `npm run lint && npm run typecheck && npm test && npm run build` (existing tests only; after Task 3 the suite is the 4 surviving UI test files).
- User-interactive steps are marked **CHECKPOINT** — stop and ask the user, do not work around.

---

### Task 1: Phase-2 GitHub epic + issues

**Files:** create `.context/issues-phase2.md` (gitignored, do not commit)

**Interfaces:**
- Produces: issue numbers for chunks `db-foundation`, `read-path`, `auth`, `admin`. Later commit messages use them.

- [ ] **Step 1: Create the epic and issues** (gh is authenticated as HassanA01)

```bash
gh issue create --title "Epic: Phase 2 — Data layer (Postgres + admin)" --label epic,mvp-critical --body "Postgres content behind lib/content.ts, Drizzle migrations, seed, GitHub-authed /admin. Spec: docs/superpowers/specs/2026-08-07-data-layer-design.md"
gh issue create --title "DB foundation: Drizzle schema, migrations, seed, Docker/CI Postgres" --label feature,mvp-critical,size:M --body $'Acceptance:\n- projects/experience tables per spec, versioned migration committed\n- Idempotent seed (insert-if-missing) from db/seed-data fixtures\n- compose db service + CI postgres services; all gates green'
gh issue create --title "Read path: swap lib/content.ts to Drizzle with cache tags" --label feature,mvp-critical,size:M --body $'Acceptance:\n- Same contract, async, unstable_cache tags content:projects/content:experience\n- data/*.json and 4 JSON-path test files deleted\n- Site renders identically from DB'
gh issue create --title "Auth: GitHub OAuth allowlisted to HassanA01" --label feature,mvp-critical,size:S --body $'Acceptance:\n- Auth.js v5, GitHub provider, signIn allowlist, middleware guards /admin\n- Custom sign-in page in design system'
gh issue create --title "Admin: CRUD pages + server actions + revalidation, docs" --label feature,mvp-critical,size:M --body $'Acceptance:\n- /admin lists + edit/new forms for projects & experience\n- Server actions with Zod validation, revalidateTag, confirm on delete\n- README/CLAUDE.md updated'
```

- [ ] **Step 2: Record mapping** in `.context/issues-phase2.md`: `epic → #N`, `db-foundation → #N`, `read-path → #N`, `auth → #N`, `admin → #N`.

---

### Task 2: DB foundation — schema, migrations, seed, Docker/CI Postgres

**Files:**
- Create: `db/schema.ts`, `db/client.ts`, `db/seed.ts`, `db/seed-data/projects.json`, `db/seed-data/experience.json`, `drizzle.config.ts`, `db/migrations/*` (generated)
- Modify: `docker-compose.yml`, `Dockerfile`, `.github/workflows/ci.yml`, `.env.example`, `package.json`

**Interfaces:**
- Produces: `getDb(): Db` (drizzle node-postgres instance with `schema`); tables `projects`, `experience` (schema below); scripts `db:generate`, `db:migrate`, `db:seed`, `db:studio`.

- [ ] **Step 1: Install deps**

```bash
npm i drizzle-orm pg zod
npm i -D drizzle-kit @types/pg tsx
```

- [ ] **Step 2: Schema — `db/schema.ts`**

```ts
import { boolean, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  tech: text("tech").array().notNull(),
  image: text("image").notNull(),
  github: text("github").notNull(),
  live: text("live").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const experience = pgTable(
  "experience",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    duration: text("duration").notNull(),
    impact: text("impact").notNull(),
    techStack: text("tech_stack").array().notNull(),
    highlights: text("highlights").array().notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (t) => [uniqueIndex("experience_company_title_idx").on(t.company, t.title)],
);
```

- [ ] **Step 3: Client — `db/client.ts`** (lazy, no Proxy)

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("db: DATABASE_URL is not set");
  return drizzle(new Pool({ connectionString: url, max: 3 }), { schema });
}

let _db: ReturnType<typeof create> | null = null;

export function getDb() {
  if (!_db) _db = create();
  return _db;
}

export type Db = ReturnType<typeof getDb>;
```

- [ ] **Step 4: Drizzle config — `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 5: Seed fixtures** — `git mv data/projects.json db/seed-data/projects.json && git mv data/experience.json db/seed-data/experience.json`. They are seed fixtures now (CI seeds every run, so they outlive phase 2); public code stops importing them in Task 3. Leave `lib/content.ts` imports pointing at the moved paths temporarily — update the two import paths in `lib/content.ts` and `tests/content.test.ts`... simpler and correct: update the import specifiers in `lib/content.ts` from `@/data/...` to `@/db/seed-data/...` (2 lines) so everything still compiles; nothing else changes in that file in this task.

- [ ] **Step 6: Seed — `db/seed.ts`** (insert-if-missing; NEVER updates — re-running against prod cannot clobber admin edits)

```ts
import { getDb } from "./client";
import { experience, projects } from "./schema";
import projectsJson from "./seed-data/projects.json";
import experienceJson from "./seed-data/experience.json";

type ProjectSeed = {
  title: string; description: string; tech: string[];
  image: string; github: string; live: string; featured: boolean;
};
type ExperienceSeed = {
  title: string; company: string; duration: string; impact: string;
  techStack: string[]; highlights: string[];
};

async function main() {
  const db = getDb();
  const projectRows = (projectsJson as ProjectSeed[]).map((p, i) => ({ ...p, sortOrder: i }));
  await db.insert(projects).values(projectRows).onConflictDoNothing();
  const expRows = (experienceJson as { experience: ExperienceSeed[] }).experience.map(
    (e, i) => ({ ...e, sortOrder: i }),
  );
  await db.insert(experience).values(expRows).onConflictDoNothing();
  console.log(`seed: ${projectRows.length} projects, ${expRows.length} roles (existing rows untouched)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 7: Scripts** — add to `package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx db/seed.ts",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 8: Compose — `docker-compose.yml`** becomes:

```yaml
services:
  web:
    build:
      context: .
      target: dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/portfolio
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: portfolio
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d portfolio"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  pgdata:
```

- [ ] **Step 9: Dockerfile** — in the `builder` stage add (before `RUN npm run build`):

```dockerfile
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
```

- [ ] **Step 10: CI — `.github/workflows/ci.yml`** becomes:

```yaml
name: CI
on:
  push:
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/portfolio

jobs:
  checks:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: portfolio
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s
          --health-timeout 3s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run db:seed
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
  docker:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: portfolio
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres" --health-interval 5s
          --health-timeout 3s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run db:seed
      - run: docker build --network host --build-arg DATABASE_URL=$DATABASE_URL --target prod .
```

(Note: the docker job's migrate/seed only matter after Task 3 makes the build query the DB; adding them now keeps one workflow shape.)

- [ ] **Step 11: `.env.example`** becomes:

```
# Local dev (docker compose provides this to the web container automatically;
# set it in .env.local for host-side drizzle commands)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio

# Auth.js — GitHub OAuth app (Settings → Developer settings → OAuth Apps)
# Dev callback: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
# Generate: openssl rand -base64 32
AUTH_SECRET=
```

Also write a local `.env.local` (NOT committed — verify it's gitignored by the existing `.env*` rule) containing just the `DATABASE_URL` line above.

- [ ] **Step 12: Generate + apply migration, seed, verify**

```bash
docker compose up -d db
npx dotenv -e .env.local -- npm run db:generate    # writes db/migrations/0000_*.sql
npx dotenv -e .env.local -- npm run db:migrate
npx dotenv -e .env.local -- npm run db:seed        # expect: seed: 8 projects, 8 roles
npx dotenv -e .env.local -- npm run db:seed        # re-run: same message, no errors (idempotent)
```

(If `dotenv` isn't available, `npm i -D dotenv-cli` — it's the documented way to feed env to drizzle-kit/tsx.)

- [ ] **Step 13: Gate + commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build` → green (site still reads moved JSON).

```bash
git add -A
git commit -m "feat(#<db-foundation-issue>): add drizzle schema, migrations, seed, postgres in docker/ci"
```

---

### Task 3: Read path — swap `lib/content.ts` to Drizzle

**Files:**
- Modify: `lib/content.ts` (replace), `components/sections/SelectedWork.tsx`, `components/sections/ExperienceTimeline.tsx`, `app/work/page.tsx`
- Delete: `tests/content.test.ts`, `tests/landing.test.tsx`, `tests/landing-lower.test.tsx`, `tests/pages.test.tsx`

**Interfaces:**
- Consumes: `getDb()`, `projects`, `experience` (Task 2).
- Produces: `getProjects(): Promise<Project[]>`, `getFeaturedProjects(): Promise<Project[]>`, `getExperience(): Promise<Experience[]>` — same field shapes as phase 1.

- [ ] **Step 1: Replace `lib/content.ts`**

```ts
import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";

export type Project = {
  title: string;
  description: string;
  tech: string[];
  image: string;
  github: string;
  live: string;
  featured: boolean;
};

export type Experience = {
  title: string;
  company: string;
  duration: string;
  impact: string;
  techStack: string[];
  highlights: string[];
};

const loadProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const rows = await getDb().select().from(projects).orderBy(asc(projects.sortOrder));
    if (rows.length === 0) throw new Error("content: projects table is empty — run db:seed");
    return rows.map(({ id: _id, sortOrder: _s, ...p }) => p);
  },
  ["content-projects"],
  { tags: ["content:projects"] },
);

const loadExperience = unstable_cache(
  async (): Promise<Experience[]> => {
    const rows = await getDb().select().from(experience).orderBy(asc(experience.sortOrder));
    if (rows.length === 0) throw new Error("content: experience table is empty — run db:seed");
    return rows.map(({ id: _id, sortOrder: _s, ...e }) => e);
  },
  ["content-experience"],
  { tags: ["content:experience"] },
);

export function getProjects(): Promise<Project[]> {
  return loadProjects();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await loadProjects()).filter((p) => p.featured);
}

export function getExperience(): Promise<Experience[]> {
  return loadExperience();
}
```

- [ ] **Step 2: Await at the call sites** (the only ripple)

- `components/sections/SelectedWork.tsx`: `export async function SelectedWork() {` and `const projects = await getFeaturedProjects();`
- `components/sections/ExperienceTimeline.tsx`: `export async function ExperienceTimeline({ compact = false }: { compact?: boolean }) {` and `const experience = await getExperience();`
- `app/work/page.tsx`: `export default async function WorkPage() {` and `const projects = await getProjects();`

(`app/page.tsx` and `app/about/page.tsx` just render these components — no changes.)

- [ ] **Step 3: Delete the JSON-path test files** (NO rewrites — user directive)

```bash
git rm tests/content.test.ts tests/landing.test.tsx tests/landing-lower.test.tsx tests/pages.test.tsx
```

- [ ] **Step 4: Verify against the local DB**

```bash
docker compose up -d db
npm run lint && npm run typecheck && npm test        # 4 remaining UI test files pass
npx dotenv -e .env.local -- npm run build            # prerender queries local DB — must succeed
docker compose up -d && sleep 20 && curl -sf http://localhost:3000 | grep -o "MailflowAI" | head -1
```

Expected: build green; curl prints `MailflowAI` (content served from Postgres). `docker compose down` after.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(#<read-path-issue>): serve content from postgres behind lib/content.ts"
```

---

### Task 4: CHECKPOINT — provision Neon + Vercel env (user required)

**Files:** none committed (env state on Vercel + `.env*.local` locally)

This task is interactive. Present each command to the user, wait for confirmation/output before continuing. The Vercel CLI is not installed yet.

- [ ] **Step 1 (user):** `npm i -g vercel && vercel login` (their Vercel account), then `vercel link` in the repo (link to the existing `new-portfolio` project).
- [ ] **Step 2 (user):** `vercel integration add neon` — approve in the browser if prompted (Marketplace install; may hand off to a claim/dashboard step — have the user complete it). This provisions `DATABASE_URL` on the Vercel project (all environments).
- [ ] **Step 3:** `vercel env pull .env.vercel.production.local --environment=production --yes` then migrate+seed production:

```bash
npx dotenv -e .env.vercel.production.local -- npm run db:migrate
npx dotenv -e .env.vercel.production.local -- npm run db:seed
```

Expected: `seed: 8 projects, 8 roles`. (Insert-if-missing: rerunning later never overwrites admin edits.)

- [ ] **Step 4:** `vercel env add AUTH_SECRET` for production + preview with a value from `openssl rand -base64 32` (do not echo it into the chat/log).
- [ ] **Step 5:** Confirm preview builds will succeed: `vercel env ls` shows `DATABASE_URL` (all envs) and `AUTH_SECRET` (production, preview). No commit; append what was provisioned to the SDD ledger.

---

### Task 5: Auth — GitHub OAuth allowlisted to HassanA01

**Files:**
- Create: `auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/admin/sign-in/page.tsx`
- Modify: `package.json` (dep)

**Interfaces:**
- Consumes: `GlassButton`, `MonoDetail` primitives.
- Produces: `auth()` (session getter for server components/actions), `signIn`, `signOut` from `@/auth`; `/admin/*` guarded by middleware; sign-in page at `/admin/sign-in`.

- [ ] **Step 1: CHECKPOINT (user):** create the dev GitHub OAuth app — GitHub → Settings → Developer settings → OAuth Apps → New: homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`. User adds to `.env.local`: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, plus `AUTH_SECRET` (`openssl rand -base64 32`). A production OAuth app (callback `https://aneeqhassan.com/api/auth/callback/github`) + `vercel env add` of its creds happens at revamp-merge time — note it in the ledger, don't block on it.

- [ ] **Step 2:** `npm i next-auth@beta`

- [ ] **Step 3: `auth.ts`** (repo root)

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  trustHost: true,
  pages: { signIn: "/admin/sign-in" },
  callbacks: {
    signIn({ profile }) {
      return (profile as { login?: string } | undefined)?.login === "HassanA01";
    },
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin") && !path.startsWith("/admin/sign-in")) {
        return !!session?.user;
      }
      return true;
    },
  },
});
```

- [ ] **Step 4: `app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: `middleware.ts`** (repo root)

```ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 6: `app/admin/sign-in/page.tsx`**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";

export const metadata: Metadata = { title: "Sign in — Admin", robots: { index: false } };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-start justify-center px-6">
      <MonoDetail>Admin</MonoDetail>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-ink">
        Owner only.<span className="text-ink-faint"> Everyone else, enjoy the site.</span>
      </h1>
      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
      >
        <GlassButton>Continue with GitHub</GlassButton>
      </form>
    </main>
  );
}
```

Note: `GlassButton` renders `<button type="button">` — form actions need submit. Check `components/ui/GlassButton.tsx`: if `type` is hardcoded to `"button"`, add an optional `type?: "button" | "submit"` prop (default `"button"`) and pass `type="submit"` here. That is the only permitted primitive change.

- [ ] **Step 7: Verify locally**

```bash
docker compose up -d
```

Visit http://localhost:3000/admin → redirected to `/admin/sign-in`; "Continue with GitHub" → GitHub consent → back at `/admin` (404 for now — the page arrives in Task 6; the redirect + session are what you're verifying). Ask the user to try a different GitHub account if handy: it must be rejected.

- [ ] **Step 8: Gate + commit**

`npm run lint && npm run typecheck && npm test` and `npx dotenv -e .env.local -- npm run build` → green.

```bash
git add -A
git commit -m "feat(#<auth-issue>): add github oauth gated to owner for /admin"
```

---

### Task 6: Admin — pages, server actions, revalidation

**Files:**
- Create: `lib/admin/validation.ts`, `app/admin/actions.ts`, `app/admin/page.tsx`, `app/admin/layout.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/experience/[id]/page.tsx`, `app/admin/experience/new/page.tsx`, `components/admin/ProjectForm.tsx`, `components/admin/ExperienceForm.tsx`, `components/admin/DeleteButton.tsx`

**Interfaces:**
- Consumes: `getDb()`, `projects`, `experience`, `auth()`, primitives.
- Produces: user-facing admin; no exports consumed elsewhere.

- [ ] **Step 1: `lib/admin/validation.ts`**

```ts
import { z } from "zod";

const lines = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

export const projectInput = z.object({
  title: z.string().trim().min(1, "title required"),
  description: z.string().trim().min(1, "description required"),
  tech: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one tech")),
  image: z.string().trim().refine((s) => s.startsWith("/") || s.startsWith("http"), "path or URL"),
  github: z.string().trim().url("github must be a URL"),
  live: z.string().trim().default(""),
  featured: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0),
});

export const experienceInput = z.object({
  title: z.string().trim().min(1, "title required"),
  company: z.string().trim().min(1, "company required"),
  duration: z.string().trim().min(1, "duration required"),
  impact: z.string().trim().min(1, "impact required"),
  techStack: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one tech")),
  highlights: z.string().transform(lines).pipe(z.array(z.string()).min(1, "at least one highlight")),
  sortOrder: z.coerce.number().int().min(0),
});

export type ProjectInput = z.infer<typeof projectInput>;
export type ExperienceInput = z.infer<typeof experienceInput>;
```

- [ ] **Step 2: `app/admin/actions.ts`** — every action re-checks the session (defense in depth; middleware is the first gate)

```ts
"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";
import { experienceInput, projectInput } from "@/lib/admin/validation";

async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new Error("admin: unauthorized");
}

function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, (formData.get(k) ?? "").toString()]));
}

export async function saveProject(id: number | null, formData: FormData) {
  await requireOwner();
  const parsed = projectInput.parse(
    formValues(formData, ["title", "description", "tech", "image", "github", "live", "featured", "sortOrder"]),
  );
  const db = getDb();
  if (id === null) {
    await db.insert(projects).values(parsed);
  } else {
    await db.update(projects).set(parsed).where(eq(projects.id, id));
  }
  revalidateTag("content:projects");
  redirect("/admin");
}

export async function deleteProject(id: number) {
  await requireOwner();
  await getDb().delete(projects).where(eq(projects.id, id));
  revalidateTag("content:projects");
  redirect("/admin");
}

export async function saveExperience(id: number | null, formData: FormData) {
  await requireOwner();
  const parsed = experienceInput.parse(
    formValues(formData, ["title", "company", "duration", "impact", "techStack", "highlights", "sortOrder"]),
  );
  const db = getDb();
  if (id === null) {
    await db.insert(experience).values(parsed);
  } else {
    await db.update(experience).set(parsed).where(eq(experience.id, id));
  }
  revalidateTag("content:experience");
  redirect("/admin");
}

export async function deleteExperience(id: number) {
  await requireOwner();
  await getDb().delete(experience).where(eq(experience.id, id));
  revalidateTag("content:experience");
  redirect("/admin");
}
```

(Zod `.parse` throwing on bad input surfaces Next's error page — acceptable for a single-owner admin; no friendly error states in scope.)

- [ ] **Step 3: `app/admin/layout.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Aneeq Hassan", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-36">{children}</main>;
}
```

- [ ] **Step 4: `app/admin/page.tsx`** (dynamic — always fresh rows)

```tsx
import Link from "next/link";
import { asc } from "drizzle-orm";
import { signOut } from "@/auth";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Surface } from "@/components/ui/Surface";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const db = getDb();
  const projectRows = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  const experienceRows = await db.select().from(experience).orderBy(asc(experience.sortOrder));
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl font-medium tracking-[-0.035em] text-ink">
          Admin.<span className="text-ink-faint"> Content lives here.</span>
        </h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <GlassButton variant="ghost" type="submit">Sign out →</GlassButton>
        </form>
      </div>

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-ink">Projects</h2>
          <GlassButton variant="ghost" href="/admin/projects/new">New project →</GlassButton>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {projectRows.map((p) => (
            <Surface as="li" interactive key={p.id} className="p-4">
              <Link href={`/admin/projects/${p.id}`} className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink">{p.title}</span>
                <MonoDetail>{p.featured ? "featured · " : ""}#{p.sortOrder}</MonoDetail>
              </Link>
            </Surface>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-ink">Experience</h2>
          <GlassButton variant="ghost" href="/admin/experience/new">New role →</GlassButton>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {experienceRows.map((e) => (
            <Surface as="li" interactive key={e.id} className="p-4">
              <Link href={`/admin/experience/${e.id}`} className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink">
                  {e.company} <span className="text-ink-muted">— {e.title}</span>
                </span>
                <MonoDetail>#{e.sortOrder}</MonoDetail>
              </Link>
            </Surface>
          ))}
        </ul>
      </section>
    </>
  );
}
```

Note: `GlassButton` needs the `type` prop from Task 5 and accepts `href` — both already exist.

- [ ] **Step 5: `components/admin/ProjectForm.tsx`** (server component — plain form + server action)

```tsx
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { saveProject } from "@/app/admin/actions";
import type { projects } from "@/db/schema";

type Row = typeof projects.$inferSelect;

const field =
  "mt-1 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus-visible:border-ink/30";

export function ProjectForm({ row }: { row: Row | null }) {
  const action = saveProject.bind(null, row?.id ?? null);
  return (
    <form action={action} className="mt-10 grid max-w-xl gap-5">
      <label className="block">
        <MonoDetail>Title</MonoDetail>
        <input name="title" defaultValue={row?.title ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Description</MonoDetail>
        <textarea name="description" rows={3} defaultValue={row?.description ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Tech — one per line</MonoDetail>
        <textarea name="tech" rows={4} defaultValue={row?.tech.join("\n") ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Image path or URL</MonoDetail>
        <input name="image" defaultValue={row?.image ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>GitHub URL</MonoDetail>
        <input name="github" defaultValue={row?.github ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Live URL — optional</MonoDetail>
        <input name="live" defaultValue={row?.live ?? ""} className={field} />
      </label>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" value="true" defaultChecked={row?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <MonoDetail>Order</MonoDetail>
          <input type="number" name="sortOrder" defaultValue={row?.sortOrder ?? 0} className={`${field} mt-0 w-24`} required />
        </label>
      </div>
      <div>
        <GlassButton type="submit">Save</GlassButton>
      </div>
    </form>
  );
}
```

- [ ] **Step 6: `components/admin/ExperienceForm.tsx`** — same pattern, fields: title, company, duration, impact (input), techStack (textarea one-per-line), highlights (textarea one-per-line), sortOrder; action `saveExperience.bind(null, row?.id ?? null)`; `Row = typeof experience.$inferSelect`.

```tsx
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { saveExperience } from "@/app/admin/actions";
import type { experience } from "@/db/schema";

type Row = typeof experience.$inferSelect;

const field =
  "mt-1 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus-visible:border-ink/30";

export function ExperienceForm({ row }: { row: Row | null }) {
  const action = saveExperience.bind(null, row?.id ?? null);
  return (
    <form action={action} className="mt-10 grid max-w-xl gap-5">
      <label className="block">
        <MonoDetail>Company</MonoDetail>
        <input name="company" defaultValue={row?.company ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Title</MonoDetail>
        <input name="title" defaultValue={row?.title ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Duration</MonoDetail>
        <input name="duration" defaultValue={row?.duration ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Impact one-liner</MonoDetail>
        <input name="impact" defaultValue={row?.impact ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Tech stack — one per line</MonoDetail>
        <textarea name="techStack" rows={4} defaultValue={row?.techStack.join("\n") ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Highlights — one per line</MonoDetail>
        <textarea name="highlights" rows={5} defaultValue={row?.highlights.join("\n") ?? ""} className={field} required />
      </label>
      <label className="flex items-center gap-2">
        <MonoDetail>Order</MonoDetail>
        <input type="number" name="sortOrder" defaultValue={row?.sortOrder ?? 0} className={`${field} mt-0 w-24`} required />
      </label>
      <div>
        <GlassButton type="submit">Save</GlassButton>
      </div>
    </form>
  );
}
```

- [ ] **Step 7: `components/admin/DeleteButton.tsx`** (client confirm)

```tsx
"use client";

export function DeleteButton({ label, action }: { label: string; action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink">
        Delete
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Edit/new pages** — all four are thin async wrappers:

`app/admin/projects/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import { deleteProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = (await getDb().select().from(projects).where(eq(projects.id, Number(id))))[0];
  if (!row) notFound();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-ink">Edit: {row.title}</h1>
        <DeleteButton label={row.title} action={deleteProject.bind(null, row.id)} />
      </div>
      <ProjectForm row={row} />
    </>
  );
}
```

`app/admin/projects/new/page.tsx`:
```tsx
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <h1 className="text-2xl font-medium tracking-tight text-ink">New project</h1>
      <ProjectForm row={null} />
    </>
  );
}
```

`app/admin/experience/[id]/page.tsx` — mirror of the project edit page with `experience`, `deleteExperience`, `ExperienceForm`, label `${row.company} — ${row.title}`. `app/admin/experience/new/page.tsx` — mirror of the project new page with `ExperienceForm`.

- [ ] **Step 9: Manual verify (docker compose up, signed in):** edit a project title → save → `/admin` shows it → homepage shows the new title within a few seconds (revalidateTag worked, no redeploy). Create + delete a dummy project (confirm dialog appears). Repeat one edit for experience.

- [ ] **Step 10: Gate + commit**

`npm run lint && npm run typecheck && npm test` and `npx dotenv -e .env.local -- npm run build` → green.

```bash
git add -A
git commit -m "feat(#<admin-issue>): add owner admin with crud, validation, revalidation"
```

---

### Task 7: Docs + final gate + push

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: README** — in Stack add `Drizzle · Neon Postgres · Auth.js`; replace the Run section with:

```markdown
## Run

```bash
docker compose up                        # dev + postgres → http://localhost:3000
docker compose exec web npm run lint     # lint
npx dotenv -e .env.local -- npm run db:migrate   # apply migrations (host)
npx dotenv -e .env.local -- npm run db:seed      # seed (insert-if-missing)
npx dotenv -e .env.local -- npm run db:studio    # browse the DB
```
```

And update the mermaid architecture diagram's content source:

```mermaid
graph LR
  N[(Postgres<br/>Neon prod · Docker dev)] --> C[lib/content.ts<br/>cached + tagged]
  A["/admin (GitHub OAuth,<br/>owner only)"] -->|server actions +<br/>revalidateTag| N
  C --> S[components/sections]
  U[components/ui] --> S
  S --> P["app/ routes"]
```

- [ ] **Step 2: CLAUDE.md** — replace the Architecture content bullet with:

```markdown
- Content: Postgres via Drizzle (`db/schema.ts`), read ONLY through `lib/content.ts`
  (async, `unstable_cache` tags `content:projects` / `content:experience`).
  Admin mutations revalidate those tags. Seed fixtures in `db/seed-data/` are
  insert-if-missing only — the DB is the source of truth, never the fixtures.
- Admin: `/admin` behind Auth.js GitHub OAuth allowlisted to HassanA01
  (`auth.ts` signIn callback + middleware).
```

And add to Commands: `npx dotenv -e .env.local -- npm run db:migrate` / `db:seed` / `db:studio`.

- [ ] **Step 3: Final gate** — `npm run lint && npm run typecheck && npm test && npx dotenv -e .env.local -- npm run build && docker compose build` → all green.

- [ ] **Step 4: Commit + push + PR update**

```bash
git add README.md CLAUDE.md
git commit -m "docs(#<admin-issue>): document database, admin, and env setup"
git push
gh pr comment 13 --body "Phase 2 (data layer) is on this branch: Postgres content behind lib/content.ts (Drizzle + Neon/pgvector-ready), idempotent seed, owner-only /admin via GitHub OAuth with instant revalidation. Spec: docs/superpowers/specs/2026-08-07-data-layer-design.md"
gh pr edit 13 --title "Portfolio revamp: phases 1-2 — redesign + data layer"
```

Do NOT merge — the PR accumulates phases until the user declares the revamp done. Verify the Vercel preview build succeeds after push (it has Neon `DATABASE_URL` + `AUTH_SECRET`; `/admin` sign-in on previews is expected NOT to work until the prod OAuth app exists — public pages are the check).

---

## Plan Self-Review Notes

- Spec coverage: schema/migrations/seed ✓ (T2), compose/CI Postgres ✓ (T2), read-path swap + tags + deletions ✓ (T3), Neon provisioning + prod seed ✓ (T4), auth + allowlist + middleware ✓ (T5), admin CRUD + revalidate + confirm delete ✓ (T6), docs ✓ (T7), no-tests directive ✓ (global constraint; only deletions).
- Deviations from spec, both intentional: (1) single `pg` driver instead of neon-http + pg dual driver — Neon is wire-compatible and this halves the client complexity; use Neon's pooled URL. (2) Seed fixtures move to `db/seed-data/` instead of being deleted outright — CI seeds every run, so the fixtures must outlive the JSON deletion; insert-if-missing semantics protect prod admin edits.
- Type consistency check: `getDb`/`projects`/`experience` names match across T2→T6; `saveProject(id, formData)` bind signature matches `ProjectForm`; `GlassButton` `type` prop added once (T5) and used in T5/T6.
