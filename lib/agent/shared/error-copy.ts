/**
 * What the chat says when a reply fails. One line is picked at random per
 * error so a flaky moment doesn't read like the same stuck sign every time.
 * House voice: lowercase, no em dashes, light touch.
 */
export const errorCopy = {
  offline: [
    "i’m not connected yet. try again soon 🔌",
    "still getting plugged in. check back in a bit 🛠️",
    "my wires aren’t hooked up yet. come back soon 🤖",
    "not online just yet. give me a minute ⏳",
    "aneeq hasn’t flipped my switch yet. try again later 😴",
  ],
  rateLimited: [
    "slow down a sec, that’s a lot of messages. try again in a minute.",
    "whoa, easy 😅 give me a minute to catch up.",
    "you’re quick! i need a breather. try again in a minute.",
    "too many messages too fast. wait a minute and i’m all yours.",
    "my inbox is overflowing rn. give it a minute?",
  ],
  failed: [
    "couldn’t finish that reply. give it another go?",
    "my brain glitched for a sec. hit try again?",
    "that one slipped through my fingers. one more time?",
    "hmm, lost the thread there. wanna run it back?",
    "that didn’t land on my end. try again?",
    "oops, dropped that reply somewhere. go again?",
    "server hiccup, nothing you did. try once more?",
    "i blanked rn, not gonna lie. send it again?",
    "that reply got stuck halfway. another shot?",
    "something tripped on my side. try again in a sec?",
    "brb, tripped over a cable. one more try?",
    "well that didn’t work. shall we pretend it never happened and retry?",
  ],
} as const;

export type ErrorKind = keyof typeof errorCopy;

/** Classify a transport error by the server's message, defaulting to failed. */
export function errorKind(message: string): ErrorKind {
  if (message.includes("connected yet")) return "offline";
  if (message.includes("slow down")) return "rateLimited";
  return "failed";
}

/** A random line for the error, avoiding the previous one when there is a choice. */
export function pickErrorCopy(message: string, previous?: string): string {
  const lines = errorCopy[errorKind(message)];
  const candidates =
    lines.length > 1 ? lines.filter((line) => line !== previous) : lines;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
