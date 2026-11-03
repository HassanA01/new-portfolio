import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const source = new URL("../components/TypingGreeting.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(
  createRequire(source),
  loaded,
  loaded.exports,
);
const { greetingInkViewport } = loaded.exports;
test("handwriting viewport centers the ink including both stroke edges", () => {
  assert.deepEqual(greetingInkViewport({ x: 25, width: 172 }, 2), {
    viewBox: "23 0 176 120",
    aspect: 176 / 120,
  });
});
test("native-script viewport includes negative bearings without extra left whitespace", () => {
  assert.deepEqual(greetingInkViewport({ x: -8, width: 180 }, 0), {
    viewBox: "-8 0 180 120",
    aspect: 1.5,
  });
});
