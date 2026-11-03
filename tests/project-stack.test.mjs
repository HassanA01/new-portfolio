import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const code = ts.transpileModule(
  fs.readFileSync(new URL("../lib/project-stack.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const loaded = { exports: {} };
new Function("module", "exports", code)(loaded, loaded.exports);
const { projectStackLayout } = loaded.exports;
test("closed stack exposes offset edges while reserving only the first card height", () => {
  assert.deepEqual(projectStackLayout([100, 150, 120, 90, 140], false), {
    positions: [0, 10, 20, 30, 30],
    height: 130,
  });
});
test("expanded stack lays out variable-height cards with even spacing", () => {
  assert.deepEqual(projectStackLayout([100, 150, 120], true), {
    positions: [0, 112, 274],
    height: 394,
  });
});
test("empty stacks do not reserve extra space", () => {
  assert.deepEqual(projectStackLayout([], false), { positions: [], height: 0 });
  assert.deepEqual(projectStackLayout([], true), { positions: [], height: 0 });
});
