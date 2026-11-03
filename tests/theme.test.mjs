import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function initialize(saved, systemDark = false, blocked = false, cookie = "") {
  const root = { dataset: {} };
  vm.runInNewContext(readFileSync("public/theme.js", "utf8"), {
    document: { documentElement: root, cookie },
    localStorage: {
      getItem() {
        if (blocked) throw new Error("Storage blocked");
        return saved;
      },
    },
    matchMedia: () => ({ matches: systemDark }),
  });
  return root.dataset.theme;
}

test("saved light preference overrides dark system", () =>
  assert.equal(initialize("light", true), "light"));
test("saved dark preference overrides light system", () =>
  assert.equal(initialize("dark"), "dark"));
test("first visit follows the system theme", () => {
  assert.equal(initialize(null, true), "dark");
  assert.equal(initialize(null, false), "light");
});
test("invalid stored preference falls back to system", () =>
  assert.equal(initialize("invalid", true), "dark"));
test("blocked storage still follows system preference", () =>
  assert.equal(initialize(null, true, true), "dark"));

test("saved theme cookie wins over stale local storage", () => {
  assert.equal(initialize("dark", true, false, "theme=light"), "light");
  assert.equal(initialize("light", false, false, "theme=dark"), "dark");
});
