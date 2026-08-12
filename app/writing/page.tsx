import type { Metadata } from "next";
import { MonoDetail } from "@/components/ui/MonoDetail";

export const metadata: Metadata = { title: "Writing — Aneeq Hassan", robots: { index: false } };

export default function WritingPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-start justify-center px-6">
      <MonoDetail>Soon</MonoDetail>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-ink">
        Writing.<span className="text-ink-faint"> Nothing published yet.</span>
      </h1>
    </main>
  );
}
