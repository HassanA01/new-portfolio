import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const compile = (path) =>
  ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
const logic = { exports: {} };
new Function("module", "exports", compile("../lib/carousel-pull.ts"))(
  logic,
  logic.exports,
);
function setup() {
  let value = 0;
  const animations = [];
  const x = {
    get: () => value,
    set: (n) => {
      value = n;
    },
  };
  const loaded = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    compile("../components/ui/use-carousel-pull.ts"),
  )(
    (name) => {
      if (name === "react")
        return { useRef: (value) => ({ current: value }), useEffect: () => {} };
      if (name === "framer-motion")
        return {
          useMotionValue: () => x,
          useReducedMotion: () => false,
          animate: (_, target, options) => {
            animations.push({ target, options });
            return { stop() {} };
          },
        };
      return logic.exports;
    },
    loaded,
    loaded.exports,
  );
  const track = {
    scrollLeft: 0,
    clientWidth: 300,
    scrollWidth: 900,
    style: {},
    setPointerCapture() {},
    scrollTo() {},
  };
  return {
    track,
    animations,
    events: loaded.exports.useCarouselPull({ current: track }).events,
  };
}
test("pointer release starts spring immediately and lost capture does not restart it", () => {
  const h = setup();
  h.events.onPointerDown({
    button: 0,
    target: { closest: () => null },
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    currentTarget: h.track,
  });
  h.events.onPointerMove({
    pointerId: 1,
    clientX: 100,
    clientY: 0,
    currentTarget: h.track,
    preventDefault() {},
  });
  h.events.onPointerUp();
  assert.equal(h.animations.length, 1);
  h.events.onLostPointerCapture();
  assert.equal(h.animations.length, 1);
  assert.equal(h.animations[0].target, 0);
});
test("trackpad scrolling is left native so momentum cannot repeatedly restart the spring", () => {
  const h = setup();
  assert.equal(h.events.onWheel, undefined);
  assert.equal(h.animations.length, 0);
});
