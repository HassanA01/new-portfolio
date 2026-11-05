"use client";

import { useId, useRef, type CSSProperties } from "react";
import Image from "next/image";

export default function InlineMention({
  name,
  description,
  href,
  className = "",
  colors,
  popupWidth = 280,
  centered = false,
  fitContent = false,
  image,
}: {
  name: string;
  description?: string;
  href?: string;
  className?: string;
  colors?: [string, string];
  popupWidth?: number;
  centered?: boolean;
  fitContent?: boolean;
  /** A photo to show in the popover, sized to `popupWidth`. */
  image?: { src: string; alt: string; width: number; height: number };
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
    // Photos are tall; flip above the word when they would run off the bottom.
    const estimatedHeight = image
      ? (width * image.height) / image.width + 24
      : 130;
    const above = bounds.bottom + estimatedHeight > window.innerHeight;
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
        data-image={image ? "true" : undefined}
      >
        {image && (
          <Image
            className="inline-mention-photo"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={`${popupWidth}px`}
          />
        )}
        {description && (
          <span className="inline-mention-description">{description}</span>
        )}
      </span>
    </>
  );
}
