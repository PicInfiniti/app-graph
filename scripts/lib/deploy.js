import { execFile } from "node:child_process";
import { cp, lstat, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

async function git(cwd, args, { allowedCodes = [0] } = {}) {
  const env = { ...process.env };
  for (const name of [
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_INDEX_FILE",
    "GIT_COMMON_DIR",
    "GIT_OBJECT_DIRECTORY",
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  ]) {
    delete env[name];
  }
  const options = [
    "-c",
    `core.worktree=${cwd}`,
    "-c",
    `core.hooksPath=${join(cwd, ".git", "deploy-disabled-hooks")}`,
    "-c",
    "core.fsmonitor=false",
    "-c",
    "core.autocrlf=false",
    "-c",
    "commit.gpgSign=false",
    "-c",
    "push.followTags=false",
    "-c",
    "protocol.allow=never",
    "-c",
    "protocol.https.allow=always",
    "-c",
    "protocol.ssh.allow=always",
    "-c",
    "protocol.file.allow=always",
  ];
  try {
    const result = await execute("git", [...options, ...args], {
      cwd,
      env,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    });
    return { ...result, code: 0 };
  } catch (error) {
    if (allowedCodes.includes(error.code)) return error;
    // Git's stderr may contain authenticated URLs. Report the operation only.
    throw new Error(
      `Git ${args[0]} failed. Check Git authentication, repository access, and configuration.`,
      { cause: error },
    );
  }
}

async function validateFiles(directory) {
  for (const name of await readdir(directory)) {
    if (
      [".git", ".gitattributes", ".gitmodules"].includes(name.toLowerCase())
    ) {
      throw new Error(
        `Build output contains unsupported Git metadata: ${name}`,
      );
    }
    const path = join(directory, name);
    const info = await lstat(path);
    if (info.isDirectory()) await validateFiles(path);
    else if (!info.isFile())
      throw new Error(
        `Build output must contain regular files, not symlinks or special files: ${name}`,
      );
  }
}

function destination(url, root) {
  if (/[\r\n]/.test(url) || !url)
    throw new Error("The deployment remote URL is invalid.");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
    const parsed = new URL(url);
    if (!["https:", "ssh:", "file:"].includes(parsed.protocol)) {
      throw new Error(
        "Deployment requires an HTTPS, SSH, or local-file Git remote.",
      );
    }
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    return { url, label: parsed.toString() };
  }
  if (isAbsolute(url)) return { url, label: url };
  if (/^[^/\\:]+:.+/.test(url)) {
    if (url.includes("::"))
      throw new Error("Git remote helpers are not supported for deployment.");
    return { url, label: url.replace(/^[^@]+@/, "") };
  }
  const path = resolve(root, url);
  return { url: path, label: path };
}

export async function deployProject({
  root,
  remote = "origin",
  branch = "gh-pages",
  log = console.log,
}) {
  root = resolve(root);
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(remote))
    throw new Error("DEPLOY_REMOTE must be a configured Git remote name.");
  await git(root, ["check-ref-format", "--branch", branch]);
  const sourceBranch = (
    await git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"], {
      allowedCodes: [0, 1],
    })
  ).stdout.trim();
  if (["main", "master", sourceBranch].includes(branch))
    throw new Error(
      "The deployment branch must be separate from your source branch.",
    );
  const urls = (
    await git(root, ["remote", "get-url", "--push", "--all", remote])
  ).stdout
    .trim()
    .split("\n");
  if (urls.length !== 1)
    throw new Error("Use a deployment remote with exactly one push URL.");
  const target = destination(urls[0], root);
  const name = (
    await git(root, ["config", "--get", "user.name"], { allowedCodes: [0, 1] })
  ).stdout.trim();
  const email = (
    await git(root, ["config", "--get", "user.email"], { allowedCodes: [0, 1] })
  ).stdout.trim();
  if (!name || !email)
    throw new Error(
      "Configure Git user.name and user.email before deployment.",
    );
  log(`Deploying to ${remote} → ${branch} (${target.label})`);
  log("Running lint, formatting, tests, and the production build…");
  if (!process.env.npm_execpath)
    throw new Error("Run deployment through npm run deploy.");
  const checkEnv = { ...process.env };
  delete checkEnv.NODE_TEST_CONTEXT;
  try {
    const checks = await execute(
      process.execPath,
      [process.env.npm_execpath, "run", "check"],
      {
        cwd: root,
        env: checkEnv,
        encoding: "utf8",
        maxBuffer: 8 * 1024 * 1024,
      },
    );
    if (checks.stdout.trim()) log(checks.stdout.trim());
    if (checks.stderr.trim()) log(checks.stderr.trim());
  } catch (error) {
    if (error.stdout?.trim()) log(error.stdout.trim());
    if (error.stderr?.trim()) log(error.stderr.trim());
    throw new Error("Project checks or build failed; nothing was published.", {
      cause: error,
    });
  }

  const dist = join(root, "dist");
  if (
    !(await lstat(dist)).isDirectory() ||
    !(await lstat(join(dist, "index.html"))).isFile()
  ) {
    throw new Error(
      "Expected a dist directory containing a regular index.html file.",
    );
  }
  await validateFiles(dist);

  const ref = `refs/heads/${branch}`;
  const advertised = (
    await git(root, ["ls-remote", "--symref", "--", target.url, "HEAD", ref])
  ).stdout;
  const defaultRef = advertised.match(
    /^ref: (refs\/heads\/[^\t\n]+)\tHEAD$/m,
  )?.[1];
  if (defaultRef === ref)
    throw new Error(
      "Refusing to deploy over the remote repository’s default source branch.",
    );
  const previous = advertised
    .split("\n")
    .find((line) => line.endsWith(`\t${ref}`))
    ?.split("\t")[0];
  const temporary = await mkdtemp(join(tmpdir(), "vite-deploy-"));
  try {
    // Validate the copied snapshot before creating any Git metadata in it.
    await cp(dist, temporary, { recursive: true });
    await validateFiles(temporary);
    await writeFile(join(temporary, ".nojekyll"), "");
    await git(temporary, [
      "init",
      "--template=",
      "--quiet",
      "--initial-branch",
      branch,
    ]);
    // Never check out remote files, hooks, attributes, or submodules.
    if (previous) {
      await git(temporary, [
        "fetch",
        "--quiet",
        "--no-tags",
        "--depth=1",
        "--",
        target.url,
        ref,
      ]);
      const fetched = (
        await git(temporary, ["rev-parse", "FETCH_HEAD"])
      ).stdout.trim();
      if (fetched !== previous)
        throw new Error(
          "The deployment branch changed while preparing. Run npm run deploy again.",
        );
      await git(temporary, ["update-ref", ref, fetched]);
    }
    await git(temporary, ["add", "--force", "--all", "--", "."]);
    if (previous) {
      const changes = await git(
        temporary,
        ["diff", "--cached", "--quiet", "HEAD", "--"],
        { allowedCodes: [0, 1] },
      );
      if (changes.code === 0) {
        log("The published files are already up to date.");
        return { changed: false, branch };
      }
    }
    await git(temporary, [
      "-c",
      `user.name=${name}`,
      "-c",
      `user.email=${email}`,
      "commit",
      "--quiet",
      "-m",
      "Deploy static site",
    ]);
    log("Publishing verified build…");
    try {
      await git(temporary, [
        "push",
        "--porcelain",
        "--",
        target.url,
        `HEAD:${ref}`,
      ]);
    } catch (error) {
      throw new Error(
        "Push rejected or failed. Check access and network connectivity; if another deployment changed the branch, run npm run deploy again. No force push was attempted.",
        { cause: error },
      );
    }
    log(
      `Published successfully to ${remote}/${branch}. GitHub Pages may take a moment to update.`,
    );
    return { changed: true, branch };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
