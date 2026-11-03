import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-csp-worker.js",
  "public/maplibre-worker.js",
);
