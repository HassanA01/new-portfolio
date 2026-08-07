import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "glass" | "ghost";
  href?: string;
  disabled?: boolean;
  disabledHint?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors duration-150 focus-visible:outline-2";

// Note: The brief's `[data-theme=dark]_&:shadow-[...]` is not valid Tailwind 4 arbitrary-variant
// syntax. Instead we use a single inner highlight `shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`
// that reads well on both themes (barely visible on light, clearly visible on dark).
const variants = {
  glass:
    "px-5 py-2.5 bg-ink/5 border border-ink/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md hover:border-ink/30",
  ghost: "px-1 py-2 text-ink-muted hover:text-ink",
};

export function GlassButton({
  variant = "glass",
  href,
  disabled,
  disabledHint,
  onClick,
  className,
  children,
}: Props) {
  const classes = cn(base, variants[variant], disabled && "opacity-50 cursor-not-allowed", className);
  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : undefined}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}
