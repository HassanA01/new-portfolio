"use client";

import { Fragment } from "react";

/**
 * Prose that arrives word by word. Each word is its own span keyed by its
 * position, so a word already on screen never re-mounts while new ones fade
 * in behind the stream. Once the reply settles the fade class comes off and
 * the spans just sit there.
 */
export default function StreamedText({
  text,
  live,
}: {
  text: string;
  live: boolean;
}) {
  const tokens = text.split(/(\s+)/);
  return (
    <>
      {tokens.map((token, index) =>
        /^\s+$/.test(token) || token === "" ? (
          <Fragment key={index}>{token}</Fragment>
        ) : (
          <span key={index} className={live ? "streamed-word" : undefined}>
            {token}
          </span>
        ),
      )}
    </>
  );
}
