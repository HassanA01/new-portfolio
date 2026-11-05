import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { loadTsFile } from "./helpers/load-ts.mjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const source = new URL("../components/ProjectShowcase.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
const loaded = { exports: {} };
const require = createRequire(source);
const projects = JSON.parse(
  fs.readFileSync(new URL("../data/projects.json", import.meta.url), "utf8"),
);
const modules = new Map();
function loadComponent(name) {
  if (modules.has(name)) return modules.get(name);
  const file = new URL(`../components/${name}.tsx`, import.meta.url);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const result = { exports: {} };
  new Function("require", "module", "exports", code)(
    mockRequire,
    result,
    result.exports,
  );
  modules.set(name, result.exports);
  return result.exports;
}
function mockRequire(name) {
  if (name.startsWith("@/lib/agent/shared/"))
    return loadTsFile(`${name.slice(2)}.ts`);
  if (name === "next/link")
    return function TestLink({ children, ...props }) {
      return React.createElement(
        "a",
        { ...props, scroll: undefined },
        children,
      );
    };
  if (name === "@/components/ui/accordion")
    return {
      disclosureSpring: { type: "spring", stiffness: 400, damping: 14 },
    };
  if (name === "next/font/google")
    return {
      Cormorant_Garamond: () => ({
        className: "project-title",
        style: { fontFamily: "Cormorant Garamond" },
      }),
    };
  if (name === "@/lib/project-stack" || name === "@/lib/project-browser") {
    const code = ts.transpileModule(
      fs.readFileSync(
        new URL(`../lib/${name.split("/").at(-1)}.ts`, import.meta.url),
        "utf8",
      ),
      { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText;
    const result = { exports: {} };
    new Function("module", "exports", code)(result, result.exports);
    return result.exports;
  }
  if (name === "@/data/projects.json") return projects;
  if (name === "@/components/ui/use-carousel-pull")
    return { useCarouselPull: () => ({ x: 0, events: {} }) };
  if (name.startsWith("@/components/"))
    return loadComponent(name.slice("@/components/".length));
  if (name.endsWith(".module.css")) return { frame: "featured-frame" };
  return require(name);
}
new Function("require", "module", "exports", compiled)(
  mockRequire,
  loaded,
  loaded.exports,
);

test("showcase features the first project once and exposes all other projects with carousel controls", () => {
  const html = renderToStaticMarkup(
    React.createElement(loaded.exports.default),
  );
  // Each featured slot carries a desktop card and a phone card; CSS shows one.
  assert.equal((html.match(/<article/g) || []).length, 6);
  assert.equal((html.match(/featured-desktop/g) || []).length, 3);
  assert.equal((html.match(/featured-mobile"/g) || []).length, 3);
  assert.match(html, /aria-label="Featured projects"/);
  assert.match(html, /href="\/\?explore=projects"/);
  assert.match(
    html,
    /Explore with <span class="project-explore-anike">Anike<\/span>/,
  );
  assert.doesNotMatch(html, /More things I’ve built|Filter projects/);
  assert.doesNotMatch(html, /font-semibold/);
});
test("project card omits unavailable destinations and keeps external links labeled", () => {
  const html = renderToStaticMarkup(
    React.createElement(loaded.exports.ProjectCard, { project: projects[0] }),
  );
  assert.match(html, /source code \(opens in a new tab\)/);
  assert.doesNotMatch(html, /live site|href=""/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("featured cards own their frame and unique SVG gradient IDs", () => {
  const Featured = loadComponent("FeaturedProjectCard").default;
  const html = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(Featured, { project: projects[0] }),
      React.createElement(Featured, { project: projects[1] }),
    ),
  );
  assert.equal((html.match(/featured-frame/g) || []).length, 2);
  const ids = [...html.matchAll(/linearGradient id="([^"]+)"/g)].map(
    (match) => match[1],
  );
  // Frame gradients plus one per tech mark; every id must still be unique.
  assert.ok(ids.length >= 2);
  assert.equal(new Set(ids).size, ids.length);
});

test("project rows open details and keep technology pills inside the detail view", () => {
  let opened = false;
  const row = loaded.exports.ProjectCard({
    project: projects[2],
    onOpen: () => {
      opened = true;
    },
  });
  const html = renderToStaticMarkup(row);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /View BizReach Marketplace details/);
  assert.doesNotMatch(html, /class="project-stack"/);
  row.props.children[0].props.onClick();
  assert.equal(opened, true);
  const details = renderToStaticMarkup(
    React.createElement(loaded.exports.ProjectCard, {
      project: projects[2],
      detail: true,
    }),
  );
  assert.match(details, /class="tech-marks"/);
  for (const tech of projects[2].tech) assert.ok(details.includes(tech));
  assert.doesNotMatch(details, /font-semibold/);
});

test("project explorer renders all cards and shares the filter pills", () => {
  const Explorer = loadComponent("ProjectExplorer").default;
  const html = renderToStaticMarkup(React.createElement(Explorer));
  assert.equal((html.match(/<article/g) || []).length, projects.length);
  assert.match(html, /aria-label="Filter projects"/);
  assert.match(html, /class="filter-pill" aria-pressed="true"/);
});

test("tool project UI preserves search scope and explains missing metadata", () => {
  const ToolResult = loadComponent("chat/parts/tool-result").default;
  const html = renderToStaticMarkup(
    React.createElement(ToolResult, {
      part: {
        type: "tool-showProjects",
        state: "output-available",
        toolCallId: "search",
        input: { category: "AI/ML", query: "Python" },
        output: {
          search: { category: "AI/ML", query: "Python" },
          projects: [projects[0]],
          missingYear: 0,
          missingStatus: 0,
        },
      },
      onResume() {},
    }),
  );
  assert.match(html, /MailflowAI/);
  assert.doesNotMatch(html, /BizReach Marketplace|B2W - UofT Hacks 12/);
  assert.match(html, /matching “python”/);
  const empty = renderToStaticMarkup(
    React.createElement(ToolResult, {
      part: {
        type: "tool-showProjects",
        state: "output-available",
        toolCallId: "empty",
        input: { category: "All", status: "active" },
        output: {
          search: { status: "active" },
          projects: [],
          missingYear: 0,
          missingStatus: 8,
        },
      },
      onResume() {},
    }),
  );
  assert.match(empty, /haven’t recorded current project status/);
  assert.match(empty, /no matches with those filters/);
});

test("resume tool result reopens checkout without navigating away", () => {
  const ToolResult = loadComponent("chat/parts/resume").default;
  const html = renderToStaticMarkup(
    React.createElement(ToolResult, { onOpen() {} }),
  );
  assert.match(html, /<button[^>]*class="agent-resume-open"[^>]*type="button"/);
  assert.doesNotMatch(html, /<a[^>]*href=/);
  assert.match(html, /aria-label="Open my résumé checkout"/);
});

test("chat message rendering preserves project layout and formats only agent prose", () => {
  const Message = loadComponent("chat/message").default;
  const html = renderToStaticMarkup(
    React.createElement(Message, {
      message: {
        id: "project-message",
        role: "assistant",
        parts: [
          { type: "text", text: "Hey — Here are my projects." },
          {
            type: "tool-showProjects",
            state: "output-available",
            toolCallId: "projects",
            input: { category: "All" },
            output: {
              search: { category: "All" },
              projects: [projects[0]],
              missingYear: 0,
              missingStatus: 0,
            },
          },
        ],
      },
      onResume() {},
    }),
  );
  assert.match(
    html,
    /class="chat-message chat-message-agent chat-message-projects"/,
  );
  assert.match(html.replace(/<[^>]*>/g, ""), /hey, here are my projects\./);
  const user = renderToStaticMarkup(
    React.createElement(Message, {
      message: {
        id: "user",
        role: "user",
        parts: [{ type: "text", text: "Hi Aneeq — AI projects please" }],
      },
      onResume() {},
    }),
  );
  assert.match(user, /Hi Aneeq — AI projects please/);
});
