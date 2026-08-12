# Style Guide — aneeqhassan.com

**App type:** Personal portfolio that doubles as a live AI-engineering demo.
**Audience:** Recruiters, hiring managers, fellow engineers.
**Three words:** Precise. Restrained. Futuristic.
**References:** Apple, Stripe, OpenAI, Anthropic, Linear.
**Theme:** Dual — dark ("Obsidian") and light ("Prism"), system default with toggle.

## Principles

Futurism through restraint. Color nearly absent; typography and spacing do the
work. If a choice feels decorative, remove it.

**Banned:** gradient text, glow effects, "AI badge" decorations, icon walls,
carousels, typing animations, drop-shadow stacks, paragraph walls.

## Color

Semantic tokens (CSS variables + Tailwind 4): `surface`, `surface-raised`,
`ink`, `ink-muted`, `ink-faint`, `line`, `accent`.

| Token | Obsidian (dark) | Prism (light) |
| --- | --- | --- |
| surface | `#0a0a0b` family | white / off-white |
| ink | `#ededf0` | `#0f1115` |
| line | hairline, low-alpha white | hairline, low-alpha black |
| accent | muted terminal green | restrained violet |

Accent appears **only** in interaction states (link hover, focus ring) and the
agent presence dot. Never static copy, never decoration.

## Typography

- **Switzer** (self-hosted, 300–700) — all display and UI type. Display:
  large, tight tracking (−0.03em), medium weight. Headline continuations drop
  to `ink-faint` (the muted second line).
- **IBM Plex Mono** — micro-details only: section indices, timestamps,
  coordinates, tech tags.

## Components

- **Glass buttons** (Apple-style): translucent fill, hairline border, inner
  top highlight, backdrop-blur. Variants: glass (primary), ghost (text + →).
- **Cards:** flat, hairline border; hover = border brightens + slight
  translate.
- **Nav:** top bar at rest → floating glass pill on scroll (monogram · links ·
  ⌘K chip · theme toggle).

## Motion

Framer Motion only. Fade-up entrance staggers, scroll-triggered reveals, hover
micro-interactions ≤200ms. Respect `prefers-reduced-motion` everywhere.

## Voice

Minimal, declarative, confident. Numbers where they punch. Short lines.
