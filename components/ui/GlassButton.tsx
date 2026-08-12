import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "glass" | "ghost";
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  disabledHint?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium";

// Even glass bevel: a soft top light + matching bottom shade reads symmetric on a
// pill (the old single top-inset made the border look heavier up top). Premium hover:
// a subtle lift, brighter border/fill, and a light sweep across the surface.
const glassIdle =
  "px-5 py-2.5 bg-ink/[0.06] border border-ink/12 backdrop-blur-md " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.14)] " +
  "transition-[border-color,background-color] duration-200 ease-out " +
  "motion-reduce:transition-none";

const glassInteractive = "hover:border-ink/25 hover:bg-ink/[0.10]";

const ghost =
  "px-1 py-2 text-ink-muted transition-colors duration-150 hover:text-ink";

function Sheen() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
    />
  );
}

export function GlassButton({
  variant = "glass",
  href,
  type = "button",
  disabled,
  disabledHint,
  onClick,
  className,
  children,
}: Props) {
  const isGlass = variant === "glass";
  const classes = cn(
    base,
    isGlass ? cn(glassIdle, !disabled && glassInteractive) : ghost,
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );

  const inner = (
    <>
      {isGlass && !disabled && <Sheen />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : undefined}
      onClick={disabled ? undefined : onClick}
    >
      {inner}
    </button>
  );
}
