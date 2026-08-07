"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { applyTheme, resolveTheme } from "@/lib/theme";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      className="fixed left-1/2 top-28 z-50 w-[min(560px,90vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface-raised/90 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <Command.Input
        placeholder="Type a command…"
        className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
      />
      <Command.List className="max-h-72 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-ink-faint">
          Nothing found.
        </Command.Empty>
        <Command.Group heading="Go to" className="px-1 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <Item onSelect={() => run(() => router.push("/"))}>Home</Item>
          <Item onSelect={() => run(() => router.push("/work"))}>Work</Item>
          <Item onSelect={() => run(() => router.push("/about"))}>About</Item>
          <Item onSelect={() => run(() => router.push("/#contact"))}>Contact</Item>
        </Command.Group>
        <Command.Group heading="Actions" className="px-1 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <Item onSelect={() => run(() => navigator.clipboard?.writeText("hassan.aneeq01@gmail.com"))}>
            Copy email
          </Item>
          <Item onSelect={() => run(() => window.open("/AneeqHassan.pdf", "_blank"))}>
            Download resume
          </Item>
          <Item onSelect={() => run(() => applyTheme(resolveTheme() === "dark" ? "light" : "dark"))}>
            Toggle theme
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({ onSelect, children }: { onSelect: () => void; children: React.ReactNode }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="cursor-pointer rounded-md px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink aria-selected:bg-ink/5"
    >
      {children}
    </Command.Item>
  );
}
