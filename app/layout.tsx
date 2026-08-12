import type { Metadata } from "next";
import { switzer, plexMono } from "./fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { NavPill } from "@/components/ui/NavPill";
import { AgentChatProvider } from "@/components/agent/AgentChatProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aneeqhassan.com"),
  title: "Aneeq Hassan — AI Engineer",
  description: "AI engineer in Toronto. I build systems that think.",
  openGraph: {
    title: "Aneeq Hassan — AI Engineer",
    description: "AI engineer in Toronto. I build systems that think.",
    url: "/",
    siteName: "Aneeq Hassan",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aneeq Hassan — AI Engineer",
    description: "AI engineer in Toronto. I build systems that think.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${switzer.variable} ${plexMono.variable} font-sans`}>
        <AgentChatProvider>
          <NavPill />
          {children}
        </AgentChatProvider>
      </body>
    </html>
  );
}
