import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AgentContext } from "@/lib/agent/server/context";

export function loadSystemPrompt(context: AgentContext) {
  // Explicitly traced in next.config.ts for standalone and serverless builds.
  // Read on each request so prompt edits also work without restarting dev.
  const source = readFileSync(
    join(process.cwd(), "lib/agent/server/prompts/system.MD"),
    "utf8",
  );
  return source.replaceAll("{{current_date}}", context.currentDate);
}
