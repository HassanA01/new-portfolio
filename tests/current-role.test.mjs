import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const source = new URL("../components/CurrentRole.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(
  createRequire(source),
  loaded,
  loaded.exports,
);
test("current role is a static Stripe row without dropdown controls or hidden team content", () => {
  const html = renderToStaticMarkup(
    React.createElement(loaded.exports.default),
  );
  assert.match(html, /Currently @/);
  assert.match(html, /Stripe/);
  assert.match(decodeURIComponent(html), /company-logos\/stripe.png/);
  assert.doesNotMatch(html, /<button|aria-expanded|Compartments and Accounts/);
});
