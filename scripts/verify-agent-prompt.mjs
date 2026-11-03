import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const relativePath = "lib/agent/server/prompts/system.MD";
assert.equal(
  readFileSync(`.next/standalone/${relativePath}`, "utf8"),
  readFileSync(relativePath, "utf8"),
  "standalone deployment must include the current system.MD",
);
console.log("agent system.MD verified in the standalone build");
