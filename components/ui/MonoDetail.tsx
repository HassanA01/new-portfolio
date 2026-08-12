import { cn } from "@/lib/utils";

export function MonoDetail({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint", className)}>
      {children}
    </span>
  );
}
