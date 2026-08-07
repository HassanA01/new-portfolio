# Portfolio Redesign — Phase 1 Design Spec

**Date:** 2026-08-07
**Status:** Approved pending user review
**Scope:** Phase 1 of 4 — visual redesign + site restructure + engineering foundations

## Vision & Phasing

The portfolio (aneeqhassan.com) becomes both a personal site and a live demo of
Aneeq's AI engineering: visitors eventually talk to an agent that answers
questions about his background (RAG over resume/projects, vector DB) and takes
actions on their behalf (email Aneeq, book a call) via tools. The work is
decomposed into four phases, each with its own spec → plan → build cycle:

1. **Redesign (this spec)** — new design system, all pages rebuilt, agent entry
   point reserved (⌘K palette), engineering workflow established.
2. **Data layer** — Postgres for projects/experience/blog content, migrations,
   seed from current JSON. Swaps in behind `lib/content.ts`.
3. **Agentic core** — vector DB + RAG, chat experience inside the ⌘K palette,
   first tools (email-on-visitor's-behalf, contact capture), MCP-style tool
   architecture designed for extension.
4. **Blog + analytics** — writing section, analytics wiring.

Phases 2–4 are out of scope here and get their own specs.

## Design Language

Reference lineage: Apple, Stripe, OpenAI, Anthropic, Linear. Futurism through
restraint: color nearly absent, typography and spacing do the work. Explicitly
banned: gradient text, glow effects, "AI badge" decorations, icon walls,
carousels, typing animations.

### Themes

Dual theme, one brand:

- **Obsidian (dark):** near-black surfaces (`#0a0a0b` family), ink `#ededf0`,
  hairline borders. Accent: muted terminal green.
- **Prism (light):** clean white/off-white surfaces, ink `#0f1115`. Accent:
  restrained violet.

Accents appear **only** in interaction states (link hover, focus rings) and the
agent presence dot. Never in static copy or decoration.

Implementation: CSS custom properties + Tailwind 4 semantic tokens — `surface`,
`surface-raised`, `ink`, `ink-muted`, `ink-faint`, `line`, `accent`. Default
follows system preference; a nav toggle overrides and persists to
localStorage. An inline script in `<head>` sets `data-theme` before first paint
(no flash).

### Typography

- **Switzer** (Fontshare, self-hosted via `next/font`, weights 300–700) — all
  UI and display type. Display sizes: large, tight tracking (−0.03em), medium
  weight. The "muted second line" pattern: headline continuation drops to
  `ink-faint`.
- **IBM Plex Mono** — micro-details only: section indices (`01`), timestamps,
  coordinates, tech tags. Never headlines, never labels shouting.

### Surfaces & buttons

- **Glass buttons** (Apple-style): translucent fill, hairline border, inner top
  highlight (`inset 0 1px 0` white at low alpha), `backdrop-blur`. Variants:
  glass (primary) and ghost (text + arrow).
- **Cards:** flat surfaces, hairline borders; hover = border brightens + slight
  translate. No drop-shadow stacks.

### Motion

Framer Motion only. Entrance fade-up staggers, scroll-triggered section
reveals, hover micro-interactions ≤200ms. All motion respects
`prefers-reduced-motion`.

### Copy voice

Minimal, declarative, numbers where they punch ("8 teams. 2,000 students
taught."). No paragraph walls.

## Site Structure

Hybrid model: condensed everything on `/`, deeper dives on routes.

### `/` — Landing

1. **Hero** — name, one declarative line ("AI engineer." + muted second line),
   glass **Ask my agent** CTA (until phase 3: disabled with "coming soon"
   tooltip) and "View work →" ghost link. Mono edge details: Toronto
   coordinates, local time.
2. **Selected work** — 3–4 flagship projects (MailflowAI, Fastrak, B2W,
   BizReach) as hairline cards; "All work →".
3. **Experience snapshot** — compact vertical timeline: company, role, one-line
   impact. No tabs/swiper.
4. **About strip** — two sentences + punch numbers.
5. **Contact** — one line + email, GitHub, LinkedIn, resume. Minimal footer.

### `/work`

Full project grid from content layer. Card: name, one-liner, mono tech tags,
GitHub/live links. No detail pages yet (deferred to phase 4); cards link out.

### `/about`

Photo, short narrative, full experience timeline with highlight bullets,
skills grouped by domain (text, not icon walls).

### `/writing`

Route scaffolded but hidden from nav until phase 4. No dead links.

### Navigation

Full-width top bar at rest; on scroll, collapses to a **floating glass pill**
(Aceternity floating-navbar pattern via
`npx shadcn@latest add @aceternity/floating-navbar-demo`, restyled to our
tokens; hides/reveals on scroll direction). Pill contents, left → right:
monogram · Work · About · Contact · **⌘K chip** · theme toggle. Mobile: same
bar with a sheet menu.

### ⌘K Command Palette

Built on `cmdk`, opened by the nav chip or the keyboard shortcut. Phase 1
commands: navigate to pages/sections, copy email, download resume, toggle
theme. This palette is the agent's front door in phase 3 — the chat experience
mounts inside it without redesign. This is why it ships now.

## Architecture

- **Stack (unchanged):** Next.js 15 App Router, React 19, Tailwind 4,
  TypeScript, Vercel hosting, PR preview deploys. All pages statically
  rendered in phase 1.
- **New deps:** `cmdk`; keep `framer-motion`, `lucide-react`, `clsx`,
  `tailwind-merge`.
- **Removed deps:** `swiper`, `react-type-animation`, `react-icons`,
  `@radix-ui/react-tabs` (Radix slot stays if shadcn components need it).
- **Component structure:**
  - `components/ui/` — primitives: `GlassButton`, `Surface`, `NavPill`,
    `CommandPalette`, `ThemeToggle`, `Section`, `MonoDetail`.
  - `components/sections/` — `Hero`, `SelectedWork`, `ExperienceTimeline`,
    `AboutStrip`, `ContactStrip`.
  - Pages compose sections. Old components (orbit hero, skills carousel,
    experience tabs) are deleted as replaced, not restyled.
- **Content layer:** `data/*.json` remains the source, read exclusively
  through a typed `lib/content.ts` (Zod-validated or hand-typed). Phase 2
  replaces its internals with DB queries; components never touch raw JSON.
  The embedded HTML `<span>` markup in `projects.json` descriptions is
  stripped — plain text only.
- **Theme resolution:** inline head script → `data-theme` attribute →
  CSS variables. System default, localStorage override.
- **UI tooling:** 21st.dev Magic MCP used during implementation — component
  inspiration before each major build, scaffolding via the component builder,
  then restyled to our tokens. Aceternity floating navbar pulled via shadcn
  registry.

## Engineering Workflow

- **GitHub:** create standard labels; one phase-1 epic decomposed into atomic
  issues, roughly: ① tokens + theme system → ② primitives (glass button,
  surface, nav pill, ⌘K palette) → ③ landing sections → ④ `/work` + `/about`
  pages → ⑤ polish pass (motion, responsive, a11y). Each issue carries
  acceptance criteria, size label, dependencies; created via `gh issue create`.
- **Docker:** multi-stage Dockerfile (dev target with hot-reload, minimal prod
  target) + `docker-compose.yml` with health check. All commands (dev, test,
  lint, build) run in the container. DB/vector services join compose in later
  phases.
- **CI (`.github/workflows/ci.yml`):** lint → typecheck → test → build →
  docker build; runs on every push and PR to main. Main stays deployable.
- **Testing:** Vitest + React Testing Library — `lib/content.ts`, theme
  resolution, primitive behavior (palette opens on ⌘K, toggle persists).
  Playwright smoke test: landing renders, nav works. Tests land with each
  issue's PR.
- **Per-issue flow:** `feat/<issue>-<desc>` → implement → tests → container
  verify → conventional commit (`feat(#N): …`) → PR with `Closes #N` → CI
  green → user approval to merge.
- **Docs:** README rewrite (run commands, architecture diagram), project
  `CLAUDE.md`, `STYLE_GUIDE.md` (committed alongside this spec),
  `.env.example`.

## Error Handling

Phase 1 is static, so surface area is small: `error.tsx` and `not-found.tsx`
in the new visual language; content layer throws at build time on malformed
JSON (fail the build, never render broken content).

## Out of Scope (Phase 1)

- Database, CMS, or admin editing (phase 2)
- Agent, RAG, vector DB, email tools (phase 3) — only the ⌘K entry point ships
- Blog content and `/writing` in nav, analytics (phase 4)
- `/work/[slug]` detail pages
