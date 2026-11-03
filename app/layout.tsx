import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Manrope } from "next/font/google";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Header from "@/components/Header";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});
const themeScript = readFileSync(
  join(process.cwd(), "public/theme.js"),
  "utf8",
);

export const metadata: Metadata = {
  title: { default: "Aneeq Hassan", template: "%s · Aneeq Hassan" },
  description:
    "I'm Aneeq. I like sports, learning languages, and idk a bunch of random stuff. Ask my agent if u wanna know more",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const savedTheme = (await cookies()).get("theme")?.value;
  return (
    <html
      lang="en"
      data-theme={
        savedTheme === "light" || savedTheme === "dark" ? savedTheme : undefined
      }
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={manrope.variable}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-shell">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
