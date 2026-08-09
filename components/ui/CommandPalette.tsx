"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { applyTheme, resolveTheme } from "@/lib/theme";
import { ChatView } from "@/components/agent/ChatView";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  mode: "nav" | "chat";
  onOpenChange: (open: boolean) => void;
  onOpenChat: (seed?: string) => void;
  onNavMode: () => void;
};

export function CommandPalette({ open, mode, onOpenChange, onOpenChat, onNavMode }: Props) {
  const router = useRouter();
  const [currentInput, setCurrentInput] = useState("");
  // Stable ref so the effect closure always sees the latest mode/onNavMode
  const modeRef = useRef(mode);
  const onNavModeRef = useRef(onNavMode);
  modeRef.current = mode;
  onNavModeRef.current = onNavMode;

  // Intercept Escape in capture phase so Radix's dismissable-layer never fires
  // when the palette is in chat mode — Esc should return to nav mode, not close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modeRef.current === "chat") {
        e.stopPropagation();
        e.preventDefault();
        onNavModeRef.current();
      }
    };
    window.addEventListener("keydown", handler, true /* capture */);
    return () => window.removeEventListener("keydown", handler, true);
  }, [open]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      className={cn(
        "fixed left-1/2 top-28 z-50 w-[min(560px,90vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface-raised/90 shadow-2xl shadow-black/20 backdrop-blur-xl",
        mode === "chat" && "h-[70vh]",
      )}
    >
      {mode === "chat" ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <MonoDetail>agent</MonoDetail>
            <MonoDetail>esc → menu</MonoDetail>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatView />
          </div>
        </div>
      ) : (
        <>
          <Command.Input
            placeholder="Type a command…"
            className="w-full border-b border-line bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
            onValueChange={setCurrentInput}
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-ink-faint">
              Nothing found.
            </Command.Empty>
            <Command.Group heading="Agent" className="px-1 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              <Item onSelect={() => onOpenChat(currentInput || undefined)}>
                Ask my agent{currentInput ? ` — "${currentInput}"` : "…"}
              </Item>
            </Command.Group>
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
        </>
      )}
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
