"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

export const disclosureSpring = {
  type: "spring",
  stiffness: 400,
  damping: 14,
} as const;
/** Hover eases up and holds; only the press gets the spring. Shared by every pressable card. */
export const hoverLift = {
  scale: 1.03,
  transition: { type: "tween", duration: 0.18, ease: "easeOut" },
} as const;
export const pressSpring = {
  scale: 0.95,
  transition: disclosureSpring,
} as const;
import { ChevronDown } from "lucide-react";

type AccordionState = {
  open: boolean;
  toggle: () => void;
  press: () => void;
  release: () => void;
  triggerId: string;
  contentId: string;
};
const Context = createContext<AccordionState | null>(null);
function useAccordion() {
  const state = useContext(Context);
  if (!state) throw new Error("Accordion parts must be inside an Accordion");
  return state;
}

type AccordionProps = Omit<HTMLMotionProps<"div">, "children" | "onChange"> & {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  as?: "div" | "section" | "li";
  bounceScale?: number;
  bounce?: boolean | "mobile";
};

/** Controlled or standalone disclosure, with shared motion and accessible IDs. */
export function Accordion({
  children,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  as = "div",
  bounceScale = 0.97,
  bounce = true,
  ...props
}: AccordionProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlled ?? localOpen;
  const id = useId();
  const root = useRef<HTMLElement | null>(null);
  const animation = useRef<{ stop: () => void } | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => () => animation.current?.stop(), []);
  const toggle = () => {
    const next = !open;
    if (controlled === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };
  const press = () => {
    const enabled =
      bounce === "mobile"
        ? window.matchMedia("(max-width: 600px)").matches
        : bounce;
    if (!enabled || reduced || !root.current) return;
    animation.current?.stop();
    animation.current = animate(
      root.current,
      { scale: bounceScale },
      disclosureSpring,
    );
  };
  const release = () => {
    if (!animation.current || !root.current) return;
    animation.current.stop();
    animation.current = animate(root.current, { scale: 1 }, disclosureSpring);
  };
  const Root = (
    as === "section" ? motion.section : as === "li" ? motion.li : motion.div
  ) as typeof motion.div;
  return (
    <Context.Provider
      value={{
        open,
        toggle,
        press,
        release,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
      }}
    >
      <Root
        {...props}
        ref={(node: HTMLElement | null) => {
          root.current = node;
        }}
        data-open={open}
      >
        {children}
      </Root>
    </Context.Provider>
  );
}

export function AccordionTrigger({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, toggle, press, release, triggerId, contentId } = useAccordion();
  return (
    <button
      {...props}
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        if (event.button === 0 && !event.defaultPrevented) {
          event.currentTarget.setPointerCapture(event.pointerId);
          press();
        }
      }}
      onPointerUp={(event) => {
        props.onPointerUp?.(event);
        release();
      }}
      onPointerCancel={(event) => {
        props.onPointerCancel?.(event);
        release();
      }}
      onLostPointerCapture={release}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          !event.repeat &&
          (event.key === "Enter" || event.key === " ")
        )
          press();
      }}
      onKeyUp={(event) => {
        props.onKeyUp?.(event);
        release();
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        release();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
    >
      {children}
    </button>
  );
}

export function AccordionChevron({ size = 16 }: { size?: number }) {
  return (
    <ChevronDown
      className="accordion-chevron"
      size={size}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

export function AccordionContent({
  children,
  overflowVisible = false,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  overflowVisible?: boolean;
}) {
  const { open, triggerId, contentId } = useAccordion();
  const reduced = useReducedMotion();
  return (
    <motion.div
      {...props}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...props.style,
        overflow: open && overflowVisible ? "visible" : "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}
