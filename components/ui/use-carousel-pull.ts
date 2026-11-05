"use client";

import { useEffect, useRef, type RefObject, type PointerEvent } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { carouselPull } from "@/lib/carousel-pull";

export function useCarouselPull(ref: RefObject<HTMLUListElement | null>) {
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const gesture = useRef<{
    id: number;
    startX: number;
    startY: number;
    scroll: number;
    dragging: boolean;
    /** The press landed mid-glide, so the release must still settle. */
    interrupted: boolean;
    lastScroll: number;
    lastTime: number;
    /** Smoothed scroll velocity in px/ms; positive heads to the next card. */
    velocity: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const spring = useRef<ReturnType<typeof animate> | null>(null);
  /** Cancels a pending snap restore without restoring it. */
  const glide = useRef<(() => void) | null>(null);
  /**
   * Glide to a card the way a trackpad swipe would: a flick or a drag past a
   * fifth of the width moves one card in that direction, anything less eases
   * back. Snapping is only switched on again once the glide has settled, so
   * the browser never yanks the track mid-flight.
   */
  function settle(
    track: HTMLUListElement,
    state: NonNullable<typeof gesture.current>,
  ) {
    const width = track.clientWidth || 1;
    const from = state.scroll / width;
    const moved = track.scrollLeft / width - from;
    const direction =
      Math.abs(state.velocity) > 0.4
        ? Math.sign(state.velocity)
        : Math.abs(moved) > 0.2
          ? Math.sign(moved)
          : 0;
    const last = Math.max(
      0,
      Math.round((track.scrollWidth - track.clientWidth) / width),
    );
    const target = Math.min(last, Math.max(0, Math.round(from) + direction));
    track.scrollTo({
      left: target * width,
      behavior: reduced ? "instant" : "smooth",
    });
    glide.current?.();
    const finish = () => {
      glide.current?.();
      track.style.scrollSnapType = "";
    };
    const timer = setTimeout(finish, reduced ? 0 : 700);
    if ("onscrollend" in track) track.addEventListener("scrollend", finish);
    glide.current = () => {
      clearTimeout(timer);
      if ("onscrollend" in track)
        track.removeEventListener("scrollend", finish);
      glide.current = null;
    };
  }
  function release() {
    spring.current?.stop();
    spring.current = animate(
      x,
      0,
      reduced
        ? { duration: 0 }
        : { type: "spring", stiffness: 340, damping: 25, mass: 0.75 },
    );
    const track = ref.current;
    const state = gesture.current;
    gesture.current = null;
    if (track && state && (state.dragging || state.interrupted))
      settle(track, state);
  }
  function finishPointer() {
    if (!gesture.current) return;
    release();
  }
  useEffect(
    () => () => {
      spring.current?.stop();
    },
    [],
  );

  return {
    x,
    events: {
      onPointerDown(event: PointerEvent<HTMLUListElement>) {
        if (event.button !== 0) return;
        spring.current?.stop();
        suppressClick.current = false;
        const track = event.currentTarget;
        // Catching the track mid-glide: freeze it where it is and keep
        // snapping off until this press settles it again.
        const interrupted = glide.current !== null;
        if (interrupted) {
          glide.current?.();
          track.scrollLeft = track.scrollLeft;
        }
        gesture.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          scroll: track.scrollLeft,
          dragging: false,
          interrupted,
          lastScroll: track.scrollLeft,
          lastTime: event.timeStamp,
          velocity: 0,
        };
      },
      onPointerMove(event: PointerEvent<HTMLUListElement>) {
        const state = gesture.current;
        if (!state || state.id !== event.pointerId) return;
        const dx = event.clientX - state.startX;
        if (!state.dragging) {
          if (Math.abs(event.clientY - state.startY) > Math.abs(dx)) {
            gesture.current = null;
            return;
          }
          if (Math.abs(dx) < 6) return;
          state.dragging = true;
          suppressClick.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.style.scrollSnapType = "none";
        }
        event.preventDefault();
        const track = event.currentTarget;
        const next = carouselPull(
          state.scroll - dx,
          track.scrollWidth - track.clientWidth,
        );
        const elapsed = event.timeStamp - state.lastTime;
        if (elapsed > 0) {
          const instant = (next.scroll - state.lastScroll) / elapsed;
          state.velocity = state.velocity * 0.6 + instant * 0.4;
          state.lastScroll = next.scroll;
          state.lastTime = event.timeStamp;
        }
        track.scrollLeft = next.scroll;
        x.set(reduced ? 0 : next.pull);
      },
      onMouseDown(event: React.MouseEvent<HTMLUListElement>) {
        // Double and triple clicks still select a word or paragraph; a single
        // press must not start a selection, or the browser auto-scrolls the
        // track to follow it and fights the pull. Links and buttons still get
        // their click because a click is only swallowed after a real drag.
        if (event.detail > 1) {
          gesture.current = null;
          return;
        }
        event.preventDefault();
      },
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
      onLostPointerCapture: finishPointer,
      onClickCapture(event: React.MouseEvent<HTMLUListElement>) {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onDragStartCapture(event: React.DragEvent<HTMLUListElement>) {
        event.preventDefault();
      },
    },
  };
}
