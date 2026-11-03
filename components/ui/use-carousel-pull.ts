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
  } | null>(null);
  const suppressClick = useRef(false);
  const spring = useRef<ReturnType<typeof animate> | null>(null);
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
    const wasDragging = gesture.current?.dragging;
    gesture.current = null;
    if (track && wasDragging) {
      track.style.scrollSnapType = "";
    }
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
        if (
          event.button !== 0 ||
          (event.target as HTMLElement).closest("a,button")
        )
          return;
        spring.current?.stop();
        suppressClick.current = false;
        gesture.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          scroll: event.currentTarget.scrollLeft,
          dragging: false,
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
        track.scrollLeft = next.scroll;
        x.set(reduced ? 0 : next.pull);
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
