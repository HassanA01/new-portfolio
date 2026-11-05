import "server-only";
import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "projects.json");

/**
 * When the project catalogue last changed: the last commit that touched it,
 * or the file's modified time when it has uncommitted edits or no git
 * history is available (as on a hosted build).
 */
export function projectsUpdatedAt(): Date {
  try {
    const dirty = execSync(`git status --porcelain -- "${file}"`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (!dirty) {
      const iso = execSync(`git log -1 --format=%cI -- "${file}"`, {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
      if (iso) return new Date(iso);
    }
  } catch {
    // No git here; fall through to the file time.
  }
  return statSync(file).mtime;
}

/** "November 4, 2026" in Toronto time, formatted once on the server. */
export function projectsUpdatedLabel(date = projectsUpdatedAt()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Toronto",
  }).format(date);
}
