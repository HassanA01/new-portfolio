import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const source = new URL("../components/ui/accordion.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
const compiledModule = { exports: {} };
new Function("require", "module", "exports", compiled)(
  createRequire(source),
  compiledModule,
  compiledModule.exports,
);
const { Accordion, AccordionTrigger, AccordionContent } = compiledModule.exports;
const h = React.createElement;
const render = (props) =>
  renderToStaticMarkup(
    h(
      Accordion,
      props,
      h(AccordionTrigger, null, "Role"),
      h(AccordionContent, null, "Details"),
    ),
  );

test("closed accordion wires trigger and panel and keeps hidden content inert", () => {
  const html = render({});
  const control = html.match(/aria-controls="([^"]+)"/)[1];
  const trigger = html.match(/<button[^>]*id="([^"]+)"/)[1];
  assert.ok(html.includes(`id="${control}"`));
  assert.ok(html.includes(`aria-labelledby="${trigger}"`));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('inert=""'));
});

test("default-open and controlled state render consistently", () => {
  assert.ok(render({ defaultOpen: true }).includes('aria-expanded="true"'));
  const closed = render({ defaultOpen: true, open: false });
  assert.ok(closed.includes('aria-expanded="false"'));
  const opened = render({ open: true });
  assert.ok(opened.includes('aria-hidden="false"'));
  assert.ok(!opened.includes('inert=""'));
});

test("nested accordions have independent state and unique panel IDs", () => {
  const html = renderToStaticMarkup(
    h(
      Accordion,
      { as: "section", open: true },
      h(AccordionTrigger, null, "Outer"),
      h(
        AccordionContent,
        null,
        h(
          Accordion,
          { as: "li" },
          h(AccordionTrigger, null, "Inner"),
          h(AccordionContent, null, "Nested"),
        ),
      ),
    ),
  );
  const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(ids).size, 2);
  assert.ok(html.startsWith("<section"));
  assert.ok(html.includes("<li"));
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-expanded="false"'));
});
