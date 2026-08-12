# Backlog

Future ideas not yet scheduled into a phase. Each gets its own spec → plan →
build cycle when picked up. Phases 1–3 are done (redesign, data layer, agent);
phase 4 is blog + analytics.

---

## Voice narration — "listen in Aneeq's voice" (ElevenLabs TTS)

**The idea:** a small play/pause control on prose sections (about page, project
descriptions, experience highlights) that reads the text aloud in Aneeq's own
**cloned voice** via ElevenLabs — like the read-aloud button ChatGPT/Claude
put on document/canvas content. Turns the portfolio from "read about me" into
"hear it from me," which pairs naturally with the agent as another
personal-presence touch.

**Why it's compelling:** distinctive, on-brand for an AI engineer, and low
friction for the visitor. Genuinely memorable in a way text isn't.

**Scope sketch (v1):**
- A `<PlayAloud text=… />` primitive in the design system: idle → loading →
  playing → paused, rendered in the existing token/glass language (no new
  visual vocabulary). Progress affordance while playing; respects
  reduced-motion.
- Mount it on: about-page narrative, each project description, maybe the hero
  tagline. Not on nav/mono micro-text.
- Audio source: ElevenLabs TTS with a **cloned voice model of Aneeq**
  (one-time voice setup + consent — his own voice, his own account).

**Tech notes / decisions to make at spec time:**
- **Pre-generate vs on-demand.** Portfolio prose is small and mostly static —
  strongly favor **pre-generating** audio at build/embed time (a script like
  `db:embed`, keyed by content hash so unchanged text isn't re-synthesized)
  and serving cached MP3s. This makes playback instant, costs pennies once,
  and avoids per-visit API spend / rate-abuse. On-demand streaming only if we
  later want the agent's *chat replies* voiced (that's a bigger, separate
  feature).
- **Storage:** generated audio in Vercel Blob (or `public/` if fully static),
  URL + content-hash tracked in Postgres alongside the content it narrates —
  mirrors how phase 3 keys knowledge chunks by content hash, and lets admin
  edits trigger re-synthesis the same way they trigger re-embedding.
- **Provider:** ElevenLabs (voice cloning is their strength). API key as a
  Vercel env var; keep synthesis server-side (build script or a server route)
  so the key never ships to the client. Could later ride a marketplace
  integration if one exists.
- **Admin tie-in:** when Aneeq edits about.md / a project in `/admin`, mark its
  narration stale and re-synthesize on the next embed run — reuse the phase-3
  content-hash + re-embed-hook pattern.
- **Cost guard:** since audio is pre-generated and cached, spend is bounded to
  actual content changes, not visitor traffic. No per-play API calls in v1.

**Open questions for the spec:**
- Voice-clone setup: which ElevenLabs plan, how much source audio, consent
  copy.
- Does narration cover only the curated prose, or also DB-backed project rows
  (which change more often → more re-synthesis)?
- Where the control lives on mobile.
- Later extension: voice the *agent's* streamed chat answers (real-time TTS) —
  bigger scope, separate decision, not v1.

**Relationship to other phases:** independent of phase 4 (blog/analytics);
could slot in as phase 5, or fold into phase 4 if we want writing posts voiced
too. Reuses the content-hash/caching machinery already built in phase 3.
