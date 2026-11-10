import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const source = new URL("../components/TypingGreeting.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const require = createRequire(source);
const react = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function loadGreeting(reactModule = react) {
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)(
    (name) => (name === "react" ? reactModule : require(name)),
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}
const { greetingInkViewport } = loadGreeting();
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

test("Arabic renders as pre-shaped ink in a fixed viewport", () => {
  const { default: TypingGreeting } = loadGreeting({
    ...react,
    // Render the third greeting without advancing the interval on the server.
    useState: () => [2, () => {}],
  });
  const html = renderToStaticMarkup(react.createElement(TypingGreeting));
  assert.match(html, /<svg[^>]*viewBox="0 0 140 120"[^>]*data-aligned="true"/);
  assert.match(html, /<path[^>]*lang="ar"[^>]*d="M/);
  assert.doesNotMatch(html, /<text/);
  const reveal = html.match(/<clipPath id="([^"]+)">/);
  assert.ok(reveal, "the outline has a dedicated writing reveal");
  assert.ok(html.includes(`clip-path="url(#${reveal[1]})"`));
  assert.match(
    html,
    /<rect width="140" height="120" class="glass-outline-reveal"/,
  );
});
