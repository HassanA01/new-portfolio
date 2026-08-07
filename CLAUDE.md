# CLAUDE.md

Personal portfolio (aneeqhassan.com), phase 1 of 4 — see
`docs/superpowers/specs/2026-08-07-portfolio-redesign-design.md` and `STYLE_GUIDE.md`
(binding: banned-styles list, tokens, fonts).

## Commands

- `docker compose up` — dev (hot reload)
- `docker compose exec web npm test` / `npm run lint` / `npm run typecheck`
- `docker compose exec web npm run build` — build for production

## Architecture

- Content: `data/*.json` read ONLY via `lib/content.ts` (validates, throws at build).
  Phase 2 swaps its internals for Postgres — never import JSON elsewhere.
- `components/ui` = primitives (tokens only, no raw hex); `components/sections` = page blocks.
- Theme: `data-theme` attr set pre-paint by `THEME_INIT_SCRIPT` (lib/theme.ts); CSS vars in globals.css.
- ⌘K palette (`CommandPalette`) is the future agent entry point — phase 3 mounts chat inside it.

## Rules

- Semantic tokens only; accent = hover/focus/presence-dot exclusively.
- Every PR: tests for changed code, CI green, conventional commits `feat(#N): …`.
