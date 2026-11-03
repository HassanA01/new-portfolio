import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const file = new URL("../lib/carousel-pull.ts", import.meta.url);
const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
new Function("module", "exports", code)(loaded, loaded.exports);
const { carouselPull } = loaded.exports;
test("first and last boundaries resist outward pulls in opposite directions", () => {
  assert.ok(carouselPull(-100, 600).pull > 0);
  assert.ok(carouselPull(700, 600).pull < 0);
  assert.equal(carouselPull(-100, 600).scroll, 0);
  assert.equal(carouselPull(700, 600).scroll, 600);
});
test("normal scrolling has no elastic offset and large pulls stay bounded", () => {
  assert.deepEqual(carouselPull(250, 600), { scroll: 250, pull: 0 });
  assert.ok(Math.abs(carouselPull(-10000, 600).pull) <= 44);
  assert.ok(Math.abs(carouselPull(10600, 600).pull) <= 44);
});
