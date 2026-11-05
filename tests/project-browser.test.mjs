import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const code = ts.transpileModule(
  fs.readFileSync(
    new URL("../lib/project-browser.ts", import.meta.url),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const loaded = { exports: {} };
new Function("module", "exports", code)(loaded, loaded.exports);
const { projectIntent, filterProjects } = loaded.exports;
const projects = JSON.parse(
  fs.readFileSync(new URL("../data/projects.json", import.meta.url), "utf8"),
);
test("project requests select the appropriate browser filter", () => {
  assert.equal(projectIntent("show me your AI projects"), "AI/ML");
  assert.equal(projectIntent("what web projects have you built"), "Web");
  assert.equal(projectIntent("systems projects"), "Systems");
  assert.equal(projectIntent("show me your projects"), "All");
  assert.equal(projectIntent("tell me about your career"), null);
});
test("filters preserve order and return the curated project categories", () => {
  assert.equal(filterProjects(projects, "All").length, 8);
  assert.deepEqual(
    filterProjects(projects, "AI/ML").map((p) => p.title),
    [
      "MailflowAI",
      "B2W - UofT Hacks 12",
      "BizReach Marketplace",
      "flwst8",
      "Sawt",
      "Hilal",
    ],
  );
  assert.equal(filterProjects(projects, "Systems").length, 1);
  assert.equal(filterProjects(projects, "Web").length, 6);
});
