# Aneeq's portfolio

A simple personal website built with Next.js, TypeScript, and Tailwind CSS. One-screen introduction, Blog and Gallery routes, Manrope typography, and a light/dark toggle that remembers your choice.

## Development

```sh
docker compose up --build -d
```

Open http://localhost:3000. Blog and Gallery have empty states until content is added.

## Checks

```sh
docker compose exec -T web npm run lint
docker compose exec -T web npm run format:check
docker compose exec -T web npm run build
docker compose exec -T web npm run typecheck
docker compose exec -T web npm test
```

Build before tests: route tests start a production server on port 3100. Theme tests cover saved preferences, device defaults, invalid values, and blocked browser storage.

`app/` contains routes and global styles. `components/Header.tsx` contains navigation and theme interaction. `public/theme.js` selects the theme before first paint. Read `STYLE_GUIDE.md` before changing the design.

## Live map

The About page uses MapLibre GL JS with OpenFreeMap's Positron/Dark hosted styles. No API key is required. The map library and tiles load as the map approaches the viewport; the mobile inline preview stays hidden, but the “memories” link opens the interactive map. The expanded view zooms to Ashfaq Memorial Hospital at 24.90882° N, 67.08408° E. Scroll-wheel zoom is disabled, and attribution stays visible.

`npm ci` runs `scripts/sync-map-worker.mjs` to serve the matching MapLibre worker from `/maplibre-worker.js`. This generated file is ignored by Git. Map loading requires a network connection and WebGL; if unavailable, an OpenStreetMap link and retry control appear.

## Paid résumé download

The résumé costs CA$5 through Stripe Checkout. Setup, required Vercel secrets,
webhooks, and testing are documented in [docs/stripe-resume.md](docs/stripe-resume.md).
Run the hot-reloading Docker environment with `docker compose up --build`.

## Anike portfolio agent

Anike uses a small in-repo router with direct Anthropic and OpenAI adapters,
built on the AI SDK. Set the model and the matching provider key in `.env`:

```dotenv
AI_MODEL=anthropic/claude-sonnet-5-5
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Or select OpenAI:

```dotenv
AI_MODEL=openai/gpt-5.4-mini
OPENAI_API_KEY=your-openai-api-key
```

Run `docker compose up --build -d` after editing environment files. Use
`docker compose up -d --force-recreate web` to reload changed keys without a
build. A plain restart keeps the container's previous environment.

The model prefix chooses the provider. Only its key is required; you can keep
both keys configured and switch `AI_MODEL`. New model IDs from those providers
require no code change. `.env.local` is also supported and overrides `.env`;
avoid defining conflicting AI settings in both. Keys remain server-only.

Both `/api/chat` and `/api/resume/checkout` are rate limited per client IP
(chat: 10 messages a minute and 60 an hour; checkout: 5 and 20). The client IP
is read from proxy headers only on Vercel or when `TRUST_PROXY=1` declares your
own reverse proxy; otherwise those headers could be forged, so every caller
shares one limit. Counters are kept in memory per server instance by default. To share them across instances,
set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from a free Upstash
Redis database; no SDK is installed, the limiter talks to its REST API directly.
The limiter fails open if that store is unreachable.

No Vercel Gateway account, key, or OIDC token is used for chat. Existing Gateway
variables are ignored. Models still run on the selected provider's API. With no
`AI_MODEL`, the default remains `openai/gpt-5.4-mini`. If the selected provider's
key is missing, chat returns an unavailable response before model execution.

The code layout, tool-extension steps, prompt editing, and research references are
in [docs/agent-architecture.md](docs/agent-architecture.md). The system prompt is
`lib/agent/server/prompts/system.MD`; it is loaded on each request and verified in
the standalone build. Server modules are marked `server-only`; browser-safe
contracts live under `lib/agent/shared`.

Projects can optionally record `year` (number) and `status` (`active` or `completed`)
in `data/projects.json`. Those fields are currently absent, so year/current-work
requests explain that metadata is missing instead of guessing. Public profile
facts are curated in `lib/agent/server/data/profile.ts`.

Opt-in model evaluations live in `evals/agent/scenarios.json`. With the dev app
running and the selected provider key configured, run `docker compose exec -T web npm
run eval:agent` (or `npm run eval:agent` against a local `next dev`; set
`EVAL_BASE_URL` for another host). Each case checks the tools called, their
arguments, forbidden tools and claims, and the house voice. This sends real model
requests and incurs provider usage; normal tests use a mocked model and do not
require credentials.

Run verification inside Docker:

```sh
docker compose build
docker compose up -d
docker compose exec -T web npm run lint
docker compose exec -T web npm run build
docker compose exec -T web npm run typecheck
docker compose exec -T web npm test
```
