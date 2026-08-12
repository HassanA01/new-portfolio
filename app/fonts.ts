import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

export const switzer = localFont({
  src: [
    { path: "../public/fonts/switzer/switzer-300.woff2", weight: "300" },
    { path: "../public/fonts/switzer/switzer-400.woff2", weight: "400" },
    { path: "../public/fonts/switzer/switzer-500.woff2", weight: "500" },
    { path: "../public/fonts/switzer/switzer-600.woff2", weight: "600" },
    { path: "../public/fonts/switzer/switzer-700.woff2", weight: "700" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});
