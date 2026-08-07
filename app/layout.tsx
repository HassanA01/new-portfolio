import type { Metadata } from "next";
import Script from "next/script";
import { switzer, plexMono } from "./fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aneeq Hassan — AI Engineer",
  description: "AI engineer in Toronto. I build systems that think.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className={`${switzer.variable} ${plexMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
