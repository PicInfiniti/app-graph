import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const pagesDirectory = resolve(root, "pages");

const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const pages = (
    existsSync(pagesDirectory)
      ? readdirSync(pagesDirectory, { recursive: true })
      : []
  )
    .filter((file) => file.endsWith(".html"))
    .map((file) => resolve(pagesDirectory, file))
    .filter((file) => statSync(file).isFile())
    .sort();

  return {
    root,
    server: { headers: isolationHeaders },
    preview: { headers: isolationHeaders },
    base: env.BASE_PATH || "/",
    input: [resolve(root, "index.html"), ...pages],
    resolve: {
      alias: { "@": resolve(root, "src") },
    },
  };
});
