import { cn } from "@/lib/utils";

type Props<T extends React.ElementType> = {
  as?: T;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Surface<T extends React.ElementType = "div">({
  as,
  interactive,
  className,
  children,
  ...rest
}: Props<T>) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(
        "rounded-xl border border-line bg-surface-raised p-6",
        interactive &&
          "transition-[border-color,transform] duration-200 hover:border-ink/25 hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
