#!/usr/bin/env bash
# Fast local dev: Postgres+pgvector in Docker (kept warm), Next.js native + Turbopack.
# No image rebuilds. Run: npm run dev:local  (or pnpm dev:local)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▸ ensuring database is up…"
docker compose up -d db >/dev/null
until docker compose exec -T db pg_isready -U postgres -d portfolio >/dev/null 2>&1; do
  sleep 0.5
done
echo "  database ready (localhost:5434)"

# Refresh the Vercel OIDC token so the AI Gateway auth never goes stale mid-session.
# Skipped when a static AI_GATEWAY_API_KEY is already set, or when offline.
ENV_ARGS=(-e .env.local)
if grep -qsE '^AI_GATEWAY_API_KEY=.' .env.local; then
  echo "▸ using static AI_GATEWAY_API_KEY (no OIDC refresh needed)"
elif command -v vercel >/dev/null 2>&1 && vercel env pull .env.vercel.local --yes >/dev/null 2>&1; then
  echo "▸ refreshed Vercel OIDC token"
  ENV_ARGS+=(-e .env.vercel.local)
elif [ -f .env.vercel.local ]; then
  echo "▸ ⚠ couldn't refresh OIDC (offline?) — reusing existing token"
  ENV_ARGS+=(-e .env.vercel.local)
else
  echo "▸ ⚠ no gateway credentials found — the agent will return 503 until AI_GATEWAY_API_KEY or OIDC is present"
fi

echo "▸ starting Next.js (turbopack) → http://localhost:3000"
exec npx dotenv "${ENV_ARGS[@]}" -- next dev --turbopack
