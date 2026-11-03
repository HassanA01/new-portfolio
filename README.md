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

The résumé costs US$5 through Stripe Checkout. Setup, required Vercel secrets,
webhooks, and testing are documented in [docs/stripe-resume.md](docs/stripe-resume.md).
Run the hot-reloading Docker environment with `docker compose up --build`.

## Anike portfolio agent

Chat uses the Vercel AI SDK and Vercel AI Gateway. Put `AI_GATEWAY_API_KEY`
in `.env.local` (server only), then run `docker compose up --build -d`.
Gateway OIDC authentication is also supported on Vercel. Set `AI_MODEL` to
override the default `openai/gpt-5.4-mini`. No AI credentials are sent to the browser.
Without credentials, chat shows an honest unavailable message; project exploration
from About still works.

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
running and a Gateway credential configured, run `docker compose exec -T web npm
run eval:agent`. This sends real model requests and incurs provider usage; normal
tests use a mocked model and do not require credentials.

Run verification inside Docker:

```sh
docker compose build
docker compose up -d
docker compose exec -T web npm run lint
docker compose exec -T web npm run build
docker compose exec -T web npm run typecheck
docker compose exec -T web npm test
```
