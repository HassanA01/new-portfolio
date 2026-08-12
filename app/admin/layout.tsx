import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Aneeq Hassan", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-36">{children}</main>;
}
