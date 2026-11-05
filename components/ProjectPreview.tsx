"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Commits a state change inside a view transition when the browser has one. */
function withTransition(update: () => void): Promise<void> {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => {
      finished: Promise<void>;
    };
  };
  if (
    !doc.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return Promise.resolve();
  }
  return doc
    .startViewTransition(() => flushSync(update))
    .finished.catch(() => undefined);
}

/** Project image that morphs into a centred full-size lightbox when clicked. */
export default function ProjectPreview({
  src,
  title,
  sizes,
}: {
  src: string;
  title: string;
  sizes: string;
}) {
  const [open, setOpen] = useState(false);
  // Only the thumbnail that is opening or closing carries a transition name;
  // naming every card would lift the carousel's clipped neighbours into view.
  const [named, setNamed] = useState(false);
  const [ratio, setRatio] = useState(1.6);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const name = `project-image-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  function show() {
    const thumb = trigger.current?.querySelector("img");
    flushSync(() => {
      setNamed(true);
      if (thumb?.naturalWidth && thumb.naturalHeight)
        setRatio(thumb.naturalWidth / thumb.naturalHeight);
    });
    void withTransition(() => setOpen(true));
  }
  function hide() {
    void withTransition(() => setOpen(false)).then(() => setNamed(false));
  }
  useIsoLayoutEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const button = trigger.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (element?.open) element.close();
      document.body.style.overflow = overflow;
      button?.focus({ preventScroll: true });
    };
  }, [open]);
  const alt = `${title} project preview`;
  const shared = { viewTransitionClass: "project-image" };
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="project-preview project-preview-open"
        aria-label={`Expand ${title} preview`}
        aria-haspopup="dialog"
        onClick={show}
        style={
          {
            ...shared,
            viewTransitionName: named && !open ? name : undefined,
          } as CSSProperties
        }
      >
        <Image src={src} alt={alt} fill sizes={sizes} />
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="project-image-modal"
          aria-label={`${title} preview, expanded`}
          onCancel={(event) => {
            event.preventDefault();
            hide();
          }}
          onClose={() => setOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) hide();
          }}
        >
          <div
            className="project-image-shell"
            style={{ "--ratio": ratio } as CSSProperties}
          >
            <button
              type="button"
              className="checkout-close project-image-close"
              aria-label="Close expanded preview"
              onClick={hide}
            >
              <X size={17} aria-hidden="true" />
            </button>
            <div
              className="project-image-frame"
              style={{ ...shared, viewTransitionName: name } as CSSProperties}
            >
              <Image src={src} alt={alt} fill sizes="100vw" />
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
