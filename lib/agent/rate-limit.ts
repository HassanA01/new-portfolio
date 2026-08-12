import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { rateLimits } from "@/db/schema";

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export async function checkRateLimit(
  scope: string,
  ip: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const windowStart = new Date(
    Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000,
  );
  const key = `${scope}:${hashIp(ip)}:${windowStart.getTime()}`;
  const db = getDb();
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });
  // opportunistic cleanup of long-expired windows (>2 days), cheap and rare
  if (Math.random() < 0.01) {
    await db
      .delete(rateLimits)
      .where(sql`${rateLimits.windowStart} < now() - interval '2 days'`);
  }
  return row.count <= limit;
}
