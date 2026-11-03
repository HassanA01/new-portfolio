import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/chat": ["./lib/agent/server/prompts/system.MD"],
    "/api/resume/download": ["./private/AneeqHassan.pdf"],
  },
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
