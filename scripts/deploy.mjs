import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { deployProject } from "./lib/deploy.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = loadEnv("production", root, "");

try {
  if (process.argv.length > 2) {
    throw new Error(
      "Use DEPLOY_REMOTE and DEPLOY_BRANCH to configure deployment.",
    );
  }
  await deployProject({
    root: resolve(root),
    remote: env.DEPLOY_REMOTE || "origin",
    branch: env.DEPLOY_BRANCH || "gh-pages",
  });
} catch (error) {
  console.error(`Deployment failed: ${error.message}`);
  process.exitCode = 1;
}
