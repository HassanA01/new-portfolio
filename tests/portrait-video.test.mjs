import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
const source = new URL("../components/PortraitVideo.tsx", import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
function harness() {
  const state = [];
  let cursor = 0,
    plays = 0,
    pauses = 0;
  const media = {
    currentTime: 2,
    play: () => {
      plays++;
      return Promise.resolve();
    },
    pause: () => {
      pauses++;
    },
  };
  const loaded = { exports: {} };
  const require = createRequire(source);
  new Function("require", "module", "exports", compiled)(
    (name) => {
      if (name === "react")
        return {
          ...React,
          useRef: () => ({ current: media }),
          useState: (initial) => {
            const i = cursor++;
            if (!(i in state)) state[i] = initial;
            return [
              state[i],
              (v) => {
                state[i] = v;
              },
            ];
          },
        };
      if (name === "framer-motion")
        return { motion: { span: "span" }, useReducedMotion: () => false };
      if (name === "@/components/ui/spotlight-card") return { GlowCard: "div" };
      return require(name);
    },
    loaded,
    loaded.exports,
  );
  const render = () => {
    cursor = 0;
    const root = loaded.exports.default();
    const button = root.props.children[0];
    const flipper = button.props.children;
    return {
      button,
      flipper,
      sound: root.props.children[1],
      video: flipper.props.children[1].props.children,
    };
  };
  return { render, media, counts: () => ({ plays, pauses }) };
}
test("portrait starts audible playback from the tap, returns on end, and can replay", () => {
  const h = harness();
  let ui = h.render();
  assert.equal(ui.button.props["aria-pressed"], false);
  ui.button.props.onClick();
  ui = h.render();
  assert.equal(ui.flipper.props.animate.rotateY, 180);
  assert.equal(h.counts().plays, 1);
  assert.equal(h.media.muted, false);
  assert.equal(h.media.currentTime, 0);
  assert.equal(h.counts().plays, 1);
  ui.video.props.onEnded();
  ui = h.render();
  assert.equal(ui.button.props["aria-pressed"], false);
  assert.equal(ui.flipper.props.animate.rotateY, 0);
  ui.button.props.onClick();
  ui = h.render();
  assert.equal(h.counts().plays, 2);
});
test("clicking during playback pauses and flips back", () => {
  const h = harness();
  h.render().button.props.onClick();
  let ui = h.render();
  ui.button.props.onClick();
  ui = h.render();
  assert.equal(ui.button.props["aria-pressed"], false);
  assert.equal(h.counts().pauses, 1);
});

test("sound button toggles mute without closing the portrait", () => {
  const h = harness();
  h.render().button.props.onClick();
  let ui = h.render();
  ui.sound.props.onClick();
  ui = h.render();
  assert.equal(h.media.muted, true);
  assert.equal(ui.sound.props["aria-label"], "Unmute portrait video");
  assert.equal(ui.button.props["aria-pressed"], true);
  ui.sound.props.onClick();
  assert.equal(h.media.muted, false);
});
