# Backlog — future phase ideas

Loose, not-yet-specced ideas. Each becomes its own brainstorm → spec → plan →
build cycle when picked up. Ordered roughly by interest, not commitment.

---

## Voice narration — "listen in my voice" (ElevenLabs cloned-voice TTS)

**Idea:** A small play/pause control on prose sections (About page, project
descriptions, experience blurbs) that reads the text aloud in Aneeq's *own*
voice — an ElevenLabs voice clone. Same interaction pattern as ChatGPT's
"read aloud" on document/canvas pages: an unobtrusive speaker/play affordance
that streams audio and shows progress, pausable, with subtle active state.

**Why it's cool:** turns static copy into a personal, human moment — visitors
literally hear Aneeq introduce himself. Pairs naturally with the agent (phase
3): the agent's text answers could optionally be voiced in the same clone.

### Rough scope

- **Voice clone (one-time, owner):** create an ElevenLabs voice from Aneeq's
  recorded samples. Store the `voiceId` in env/config. Consent is trivially
  satisfied (it's his own voice) but the clone setup is a manual owner step,
  like the GitHub OAuth app or Neon provisioning were.
- **UI component (`components/ui/ReadAloud`):** speaker/play button →
  loading → playing (waveform or a simple progress line) → paused/ended.
  Design-system only: Surface/MonoDetail/tokens, glass affordance, no glow.
  Reduced-motion aware. Mounts next to `Prose`/section headings via a small
  wrapper so any block can opt in.
- **Audio generation:** ElevenLabs TTS API. Two viable models:
  - *Pre-generated (preferred for static prose):* generate audio at
    build/admin-save time for About + project/experience text, store the
    MP3 in **Vercel Blob**, save the URL alongside the content row (or a
    `content_audio` table keyed by source+hash). Playing = a plain `<audio>`
    fetch, near-zero latency, and **zero per-play cost**. Re-generate on
    content change via a hook (mirrors the phase-3 re-embed hook — admin edit
    → regenerate that block's audio).
  - *On-demand (for agent replies / dynamic text):* stream TTS through a
    `/api/tts` route with the same rate-limiting + hashed-IP guards as the
    chat route; cache by text hash in Blob to avoid re-paying for repeats.
- **Cost guard:** ElevenLabs bills per character. Pre-generation caps it to
  "generate once per content version." On-demand needs the rate limiter and a
  character cap per request. Add a spend note like the AI Gateway one.

### Open questions (resolve in brainstorm)

- Pre-generate everything vs. on-demand vs. hybrid (pre-gen static prose,
  on-demand for the agent)? Leaning hybrid.
- Where audio lives: Vercel Blob (matches the deferred Blob image-upload
  idea) vs. a bytea/URL column.
- Provider: stay ElevenLabs (best clone quality) or route via a gateway later
  for provider flexibility — likely direct ElevenLabs; no gateway equivalent.
- Should agent chat answers get an optional voiced playback in the same clone?
  (Nice stretch; keep phase-1 of this feature to static prose.)

### Dependencies / touch points

- Content is already DB-backed (phase 2) with admin mutation hooks — the
  re-generate-on-edit pattern slots in exactly where re-embed does.
- If Blob is chosen, this is the natural moment to also land the deferred
  **Blob image-upload** for project images (phase-4 backlog item).

---

## Already-noted backlog (from earlier phases)

- **Public MCP server endpoint** (`/api/mcp`) exposing the phase-3 tool
  registry so external clients (Claude Desktop, etc.) can use the portfolio's
  tools. Registry is already MCP-shaped — promotion, not rewrite.
- **More agent tools:** booking/scheduling (Cal.com), live GitHub stats.
- **Resend domain verification** for an `@aneeqhassan.com` sender (currently
  `onboarding@resend.dev`, owner-only delivery).
- **Blob image uploads** for project images in `/admin` (currently path/URL
  strings).
- **Prod GitHub OAuth app** wired at revamp-merge time.
- **Admin Messages** unread-count badge on the dashboard link.
