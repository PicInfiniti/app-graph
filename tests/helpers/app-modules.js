import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "vite";

// Bundle browser modules with the same dependency resolution used by the app.
export async function loadAppModules(t, entries) {
  const directory = await mkdtemp(join(tmpdir(), "graph-studio-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { output } = await build({
    configFile: false,
    logLevel: "silent",
    ssr: { noExternal: true },
    build: {
      ssr: true,
      write: false,
      minify: false,
      rolldownOptions: {
        input: Object.fromEntries(
          Object.entries(entries).map(([name, path]) => [
            name,
            fileURLToPath(new URL(`../../${path}`, import.meta.url)),
          ]),
        ),
        output: {
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        },
      },
    },
  });
  await Promise.all(
    output.map((file) =>
      writeFile(join(directory, file.fileName), file.code ?? file.source),
    ),
  );
  return Object.fromEntries(
    await Promise.all(
      Object.keys(entries).map(async (name) => [
        name,
        await import(pathToFileURL(join(directory, `${name}.mjs`)).href),
      ]),
    ),
  );
}
