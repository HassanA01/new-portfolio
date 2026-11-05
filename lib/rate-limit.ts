import "server-only";

/**
 * Per-client request limits for the public API routes.
 *
 * Sliding-window approximation: each rule keeps a counter per fixed window and
 * weights the previous window by how much of it still overlaps "now", so a
 * burst right at a window boundary can't get double the allowance.
 *
 * Counters live in memory by default. Vercel's Fluid Compute reuses instances,
 * so that holds up for a portfolio, but it is per instance and resets on cold
 * start. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (a free
 * Upstash database, no SDK needed) to share counters across instances.
 */
export type RateLimitRule = {
  /** Distinguishes rules of the same scope in the counter key. */
  name: string;
  limit: number;
  windowMs: number;
};

type Hit = { current: number; previous: number };

interface CounterStore {
  /** Increment `currentKey` (expiring after `ttlMs`) and read `previousKey`. */
  hit(currentKey: string, previousKey: string, ttlMs: number): Promise<Hit>;
}

type Entry = { count: number; expires: number };
const SWEEP_EVERY = 500;

class MemoryStore implements CounterStore {
  private readonly entries = new Map<string, Entry>();
  private hits = 0;

  async hit(currentKey: string, previousKey: string, ttlMs: number) {
    const now = Date.now();
    if (++this.hits % SWEEP_EVERY === 0) this.sweep(now);
    const current = this.entries.get(currentKey);
    const count =
      current && current.expires > now
        ? ++current.count
        : (this.entries.set(currentKey, { count: 1, expires: now + ttlMs }), 1);
    const previous = this.entries.get(previousKey);
    return {
      current: count,
      previous: previous && previous.expires > now ? previous.count : 0,
    };
  }

  private sweep(now: number) {
    for (const [key, entry] of this.entries)
      if (entry.expires <= now) this.entries.delete(key);
  }
}

class UpstashStore implements CounterStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  async hit(currentKey: string, previousKey: string, ttlMs: number) {
    const response = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", currentKey],
        ["PEXPIRE", currentKey, ttlMs, "NX"],
        ["GET", previousKey],
      ]),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
    const [incr, , get] = (await response.json()) as {
      result?: number | string | null;
      error?: string;
    }[];
    if (incr?.error || get?.error)
      throw new Error(incr?.error ?? get?.error ?? "Upstash pipeline failed");
    return {
      current: Number(incr?.result ?? 1),
      previous: Number(get?.result ?? 0),
    };
  }
}

const globalStore = globalThis as { __portfolioRateLimitStore?: CounterStore };

function counterStore(): CounterStore {
  // Cached on globalThis so dev hot reloads don't reset the counters.
  if (!globalStore.__portfolioRateLimitStore) {
    const url =
      process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token =
      process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    globalStore.__portfolioRateLimitStore =
      url && token
        ? new UpstashStore(url.replace(/\/$/, ""), token)
        : new MemoryStore();
  }
  return globalStore.__portfolioRateLimitStore;
}

/**
 * Caller address for the counter key.
 *
 * `x-real-ip` and `x-forwarded-for` are only believed when a proxy we control
 * sets them: Vercel always overwrites both, and a self-hosted reverse proxy is
 * declared with TRUST_PROXY=1. Anywhere else a client could type its own
 * header and dodge the limit, so every caller shares one bucket instead.
 */
export function clientAddress(request: Request, env = process.env) {
  if (!env.VERCEL && !env.TRUST_PROXY) return "shared";
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  // Behind a proxy that appends, the last hop is the one the proxy wrote.
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim();
  return forwarded || "shared";
}

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; rule: RateLimitRule; retryAfterSeconds: number };

/** Count one request against every rule; the first exceeded rule wins. */
export async function checkRateLimit(
  scope: string,
  client: string,
  rules: readonly RateLimitRule[],
  now = Date.now(),
): Promise<RateLimitDecision> {
  const store = counterStore();
  for (const rule of rules) {
    const window = Math.floor(now / rule.windowMs);
    const elapsed = (now % rule.windowMs) / rule.windowMs;
    const key = (slot: number) => `rl:${scope}:${rule.name}:${client}:${slot}`;
    let hit: Hit;
    try {
      // Keep the previous window alive for one more window so it can be weighed.
      hit = await store.hit(key(window), key(window - 1), rule.windowMs * 2);
    } catch (error) {
      // A counter outage must not take the site down: let the request through.
      console.error(
        JSON.stringify({
          event: "rate_limit_store_failed",
          scope,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return { allowed: true };
    }
    const weighted = hit.previous * (1 - elapsed) + hit.current;
    if (weighted > rule.limit) {
      console.warn(
        JSON.stringify({ event: "rate_limited", scope, rule: rule.name }),
      );
      return {
        allowed: false,
        rule,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((rule.windowMs - (now % rule.windowMs)) / 1000),
        ),
      };
    }
  }
  return { allowed: true };
}

/** 429 JSON response for a route, or null when the request may proceed. */
export async function rateLimitResponse(
  request: Request,
  scope: string,
  rules: readonly RateLimitRule[],
  message: string,
): Promise<Response | null> {
  const decision = await checkRateLimit(scope, clientAddress(request), rules);
  if (decision.allowed) return null;
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(decision.retryAfterSeconds),
        "Cache-Control": "private, no-store",
      },
    },
  );
}
