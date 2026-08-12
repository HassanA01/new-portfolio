import Link from "next/link";
import { MonoDetail } from "@/components/ui/MonoDetail";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-start justify-center px-6">
      <MonoDetail>404</MonoDetail>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-ink">
        Nothing here.<span className="text-ink-faint"> The page moved or never existed.</span>
      </h1>
      <Link href="/" className="mt-8 text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink">
        Back home →
      </Link>
    </main>
  );
}
