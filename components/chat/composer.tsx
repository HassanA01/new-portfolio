"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Send } from "lucide-react";
import { disclosureSpring } from "@/components/ui/accordion";
import { agentLimits } from "@/lib/agent/shared/limits";

const suggestions = [
  "What languages can Aneeq speak",
  "Tell me about Aneeq's career",
  "How much aura does Aneeq have",
  "Show me Aneeq's résume",
];

export default function Composer({
  active,
  waiting,
  choices,
  onSubmit,
}: {
  active: boolean;
  waiting: boolean;
  /** Quick replies for the agent's last question; shown above the input. */
  choices?: readonly string[];
  onSubmit: (question: string) => void;
}) {
  const [input, setInput] = useState("");
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") setKeyboardFocus(true);
    };
    const onPointerDown = () => setKeyboardFocus(false);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Number keys pick a quick reply, unless the visitor is typing or a dialog is open.
  useEffect(() => {
    if (!choices?.length || waiting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const choice = choices[Number(event.key) - 1];
      if (!choice || document.querySelector("dialog[open]")) return;
      const target = event.target as HTMLElement | null;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (editing && !(target === inputRef.current && input === "")) return;
      event.preventDefault();
      onSubmit(choice);
      setInput("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choices, waiting, input, onSubmit]);

  useLayoutEffect(() => {
    const resize = () => {
      const field = inputRef.current;
      if (!field) return;
      field.style.height = "0px";
      const limit = Math.min(200, window.innerHeight * 0.3);
      const height = Math.min(field.scrollHeight, limit);
      field.style.height = `${height}px`;
      field.style.overflowY = field.scrollHeight > limit ? "auto" : "hidden";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [input, active]);

  const formRef = useRef<HTMLFormElement>(null);

  function moveGloss(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const surface = event.currentTarget;
    const bounds = surface.getBoundingClientRect();
    const direction = (event.clientX - bounds.left) / bounds.width - 0.5;
    surface.style.setProperty("--gloss-shift", `${direction * 36}%`);
    surface.style.setProperty("--gloss-angle", `${direction * 10}deg`);
    surface.dataset.glossActive = "true";
  }

  function leaveGloss(event: PointerEvent<HTMLElement>) {
    const surface = event.currentTarget;
    delete surface.dataset.glossActive;
    surface.style.setProperty("--gloss-shift", "0%");
    surface.style.setProperty("--gloss-angle", "0deg");
  }

  function submit(message: string) {
    const question = message.trim();
    if (!question || waiting) return;
    onSubmit(question);
    setInput("");
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(input);
  }
  return (
    <>
      {" "}
      <div
        className="prompt-suggestions"
        aria-label="Suggested questions"
        hidden={active}
      >
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion}
            type="button"
            onPointerMove={moveGloss}
            onPointerLeave={leaveGloss}
            onClick={() => submit(suggestion)}
            whileTap={reduced ? undefined : { scale: 0.94 }}
            transition={disclosureSpring}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
      {!!choices?.length && !waiting && (
        <div
          className="quick-replies"
          role="group"
          aria-label="Quick replies, or press the number key"
        >
          {choices.map((choice, index) => (
            <motion.button
              key={choice}
              type="button"
              onClick={() => submit(choice)}
              whileTap={reduced ? undefined : { scale: 0.92 }}
              transition={disclosureSpring}
            >
              <kbd aria-hidden="true">{index + 1}</kbd>
              {choice}
            </motion.button>
          ))}
        </div>
      )}
      <form
        ref={formRef}
        className="prompt-bar"
        data-keyboard-focus={keyboardFocus}
        onPointerMove={moveGloss}
        onPointerLeave={leaveGloss}
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="agent-question">
          Ask Anike
        </label>
        <textarea
          ref={inputRef}
          rows={1}
          id="agent-question"
          name="question"
          placeholder="Ask anything about me…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          autoComplete="off"
          maxLength={agentLimits.inputCharacters}
        />
        <button
          type="submit"
          className="send-prompt"
          aria-label="Send message"
          disabled={!input.trim() || waiting}
        >
          <Send size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </form>
    </>
  );
}
