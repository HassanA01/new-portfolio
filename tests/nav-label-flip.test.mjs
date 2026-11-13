import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("both nav label faces have local transforms so Firefox can hide their backfaces", () => {
  const faces = css.match(/\.sidebar-label-flip > span\s*\{([^}]+)\}/)?.[1];
  const front = css.match(
    /\.sidebar-label-flip > span:first-child\s*\{([^}]+)\}/,
  )?.[1];
  const back = css.match(
    /\.sidebar-label-back\s*\{([^}]*transform:[^}]+)\}/,
  )?.[1];

  assert.match(faces ?? "", /backface-visibility:\s*hidden;/);
  assert.match(front ?? "", /transform:\s*rotateX\(0deg\);/);
  assert.match(back ?? "", /transform:\s*rotateX\(180deg\);/);
});
