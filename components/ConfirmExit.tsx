"use client";

import {
  type AnimationEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { disclosureSpring } from "@/components/ui/accordion";

const SHAKE_CLASS = "is-shaking";

/**
 * "You sure you wanna leave?" prompt shared by the chat and the résumé checkout.
 *
 * Renders a top-layer <dialog>, so it works on its own (chat) or nested inside
 * another modal (checkout). Copy, labels, which button is emphasised and the
 * class names are all the caller's, so each use keeps its own look: pass a
 * `className` for the dialog surface and `stayClassName` / `exitClassName`
 * for the two buttons.
 *
 * Escape and a backdrop click call `onStay` when `dismissible` (the default).
 * With `dismissible={false}` they shake the prompt instead, so the only ways
 * out are the two buttons. Only the exit button ever calls `onExit`.
 */
export default function ConfirmExit({
  open,
  onStay,
  onExit,
  title,
  message,
  stayLabel = "Stay",
  exitLabel = "Leave",
  emphasis = "stay",
  dismissible = true,
  className,
  stayClassName = "confirm-exit-stay",
  exitClassName = "confirm-exit-leave",
}: {
  open: boolean;
  onStay: () => void;
  onExit: () => void;
  title?: ReactNode;
  message: ReactNode;
  stayLabel?: ReactNode;
  exitLabel?: ReactNode;
  /** Which action sits last and carries the primary styling. */
  emphasis?: "stay" | "exit";
  /** false: Escape and outside clicks nudge (shake) instead of closing. */
  dismissible?: boolean;
  className?: string;
  stayClassName?: string;
  exitClassName?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const stayButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const id = useId();
  const titleId = `${id}-title`;
  const messageId = `${id}-message`;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      delete element.dataset.reopened;
      element.showModal();
      stayButton.current?.focus();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  /**
   * The "not so fast" response: a short shake, then focus back on Stay. The
   * shake runs on the inner wrapper, never the dialog, so the dialog's own
   * entrance animation is left alone and can't replay when the shake ends.
   */
  const nudge = () => {
    const element = body.current;
    if (element && !reduced) {
      element.classList.remove(SHAKE_CLASS);
      void element.offsetWidth; // restart the animation if it's already running
      element.classList.add(SHAKE_CLASS);
    }
    stayButton.current?.focus();
  };
  const dismiss = dismissible ? onStay : nudge;

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    // Handle Escape ourselves so it never reaches a parent dialog as a close request.
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    dismiss();
  };

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget)
      event.currentTarget.classList.remove(SHAKE_CLASS);
  };

  const stay = (
    <motion.button
      key="stay"
      ref={stayButton}
      type="button"
      className={stayClassName}
      onClick={onStay}
      whileTap={reduced ? undefined : { scale: 0.92 }}
      transition={disclosureSpring}
    >
      {stayLabel}
    </motion.button>
  );
  const exit = (
    <motion.button
      key="exit"
      type="button"
      className={exitClassName}
      onClick={onExit}
      whileTap={reduced ? undefined : { scale: 0.92 }}
      transition={disclosureSpring}
    >
      {exitLabel}
    </motion.button>
  );

  return (
    <dialog
      ref={dialog}
      className={["confirm-exit", className].filter(Boolean).join(" ")}
      aria-labelledby={title ? titleId : messageId}
      aria-describedby={title ? messageId : undefined}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        // React re-dispatches dialog cancel/close to ancestor dialogs' handlers
        // (they don't bubble natively); stop that so a host modal never reacts.
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }}
      onClose={(event) => {
        event.stopPropagation();
        // Closed by the browser rather than by us (e.g. a forced Escape).
        if (!open) return;
        if (dismissible) {
          onStay();
          return;
        }
        // Reopen in the same tick without replaying the entrance, then nudge.
        event.currentTarget.dataset.reopened = "true";
        event.currentTarget.showModal();
        nudge();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={body}
        className="confirm-exit-body"
        onAnimationEnd={onAnimationEnd}
      >
        {title && <h2 id={titleId}>{title}</h2>}
        <p id={messageId}>{message}</p>
        <div className="confirm-exit-actions">
          {emphasis === "stay" ? [exit, stay] : [stay, exit]}
        </div>
      </div>
    </dialog>
  );
}
