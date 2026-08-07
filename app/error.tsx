"use client";

import { MonoDetail } from "@/components/ui/MonoDetail";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-start justify-center px-6">
      <MonoDetail>Error</MonoDetail>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-ink">
        Something broke.<span className="text-ink-faint"> Not you — me.</span>
      </h1>
      <button
        type="button"
        onClick={reset}
        className="mt-8 text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink"
      >
        Try again →
      </button>
    </main>
  );
}
