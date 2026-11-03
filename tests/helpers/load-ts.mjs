import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);

// Node tests execute real modules; Next enforces server-only during the build.
export function loadTsFile(relativePath) {
  const filename = path.resolve(root, relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => {
      if (name === "server-only") return {};
      if (name.startsWith("@/")) {
        const target = name.slice(2);
        return target.endsWith(".json")
          ? JSON.parse(fs.readFileSync(path.join(root, target), "utf8"))
          : loadTsFile(`${target}.ts`);
      }
      return require(name);
    },
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}
