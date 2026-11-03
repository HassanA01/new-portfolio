"use client";

import { useId, useRef, type CSSProperties } from "react";

export default function InlineMention({
  name,
  description,
  href,
  className = "",
  colors,
  popupWidth = 280,
  centered = false,
  fitContent = false,
}: {
  name: string;
  description?: string;
  href?: string;
  className?: string;
  colors?: [string, string];
  popupWidth?: number;
  centered?: boolean;
  fitContent?: boolean;
}) {
  const id = useId();
  const popup = useRef<HTMLSpanElement>(null);
  const position = (button: HTMLButtonElement) => {
    const card = popup.current;
    if (!card) return;
    const bounds = button.getBoundingClientRect();
    const desktop = window.matchMedia("(min-width: 601px)").matches;
    const width = Math.min(desktop ? popupWidth : 280, window.innerWidth - 32);
    const left =
      centered && desktop
        ? bounds.left + bounds.width / 2 - width / 2
        : bounds.left;
    card.style.width = fitContent ? "max-content" : `${width}px`;
    card.style.maxWidth = `${width}px`;
    card.style.left = `${Math.max(16, Math.min(left, window.innerWidth - width - 16))}px`;
    const above = bounds.bottom + 130 > window.innerHeight;
    card.style.top = `${above ? bounds.top - 8 : bounds.bottom + 8}px`;
    card.style.transform = above ? "translateY(-100%)" : "none";
  };
  const style = colors
    ? ({ "--tool-from": colors[0], "--tool-to": colors[1] } as CSSProperties)
    : undefined;
  const mentionClass = `inline-mention ${className}`;
  if (href)
    return (
      <a
        className={mentionClass}
        style={style}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {name}
      </a>
    );
  return (
    <>
      <button
        type="button"
        className={mentionClass}
        style={style}
        popoverTarget={id}
        aria-describedby={id}
        onClick={(event) => position(event.currentTarget)}
        onMouseEnter={(event) => {
          position(event.currentTarget);
          popup.current?.showPopover();
        }}
        onMouseLeave={() => popup.current?.hidePopover()}
        onFocus={(event) => {
          position(event.currentTarget);
        }}
      >
        {name}
      </button>
      <span
        ref={popup}
        id={id}
        popover="auto"
        role="tooltip"
        className="inline-mention-popover"
      >
        <span className="inline-mention-description">{description}</span>
      </span>
    </>
  );
}
