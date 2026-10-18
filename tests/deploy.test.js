import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { deployProject } from "../scripts/lib/deploy.js";

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function fixture(t, build = "") {
  const directory = await mkdtemp(join(tmpdir(), "deploy-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = join(directory, "project");
  const remote = join(directory, "remote.git");
  await mkdir(root);
  git(directory, "init", "--bare", "--quiet", remote);
  git(root, "init", "--quiet", "--initial-branch", "main");
  git(root, "config", "user.name", "Deployment Test");
  git(root, "config", "user.email", "deployment@example.invalid");
  // A relative remote exercises resolution outside the working checkout.
  git(root, "remote", "add", "origin", "../remote.git");
  await writeFile(join(root, ".gitignore"), "dist/\n");
  await writeFile(join(root, "source.txt"), "source stays here\n");
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ type: "module", scripts: { check: "node build.mjs" } }),
  );
  await setBuild(root, build);
  git(root, "add", ".");
  git(root, "commit", "--quiet", "-m", "Source");
  return {
    directory,
    root,
    remote,
    deploy: (options = {}) => deployProject({ root, log() {}, ...options }),
  };
}

async function setBuild(root, extra) {
  await writeFile(
    join(root, "build.mjs"),
    `
    import { mkdir, rm, writeFile, symlink } from 'node:fs/promises';
    await rm('dist', { recursive: true, force: true });
    await mkdir('dist/assets', { recursive: true });
    await writeFile('dist/index.html', '<!doctype html><title>Built site</title>');
    await writeFile('dist/assets/app.js', 'console.log("built");');
    ${extra}
  `,
  );
}

test("first deployment publishes only dist, preserves the source checkout, and copies CNAME", async (t) => {
  const f = await fixture(
    t,
    "await writeFile('dist/CNAME', 'example.com\\n');",
  );
  await writeFile(join(f.root, "source.txt"), "uncommitted changes\n");
  await writeFile(join(f.root, "untracked.txt"), "local file");
  const status = git(f.root, "status", "--porcelain");
  const head = git(f.root, "rev-parse", "HEAD");
  assert.equal((await f.deploy()).changed, true);
  assert.deepEqual(
    git(
      f.directory,
      "--git-dir",
      f.remote,
      "ls-tree",
      "-r",
      "--name-only",
      "gh-pages",
    ).split("\n"),
    [".nojekyll", "CNAME", "assets/app.js", "index.html"],
  );
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "show", "gh-pages:CNAME"),
    "example.com",
  );
  assert.equal(git(f.root, "symbolic-ref", "--short", "HEAD"), "main");
  assert.equal(git(f.root, "rev-parse", "HEAD"), head);
  assert.equal(git(f.root, "status", "--porcelain"), status);
  assert.equal(
    await readFile(join(f.root, "source.txt"), "utf8"),
    "uncommitted changes\n",
  );
});

test("unchanged files do not create another deployment commit", async (t) => {
  const f = await fixture(t);
  await f.deploy();
  const head = git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages");
  assert.equal((await f.deploy()).changed, false);
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages"),
    head,
  );
});

test("updates preserve history, remove obsolete files, and support custom deployment branches", async (t) => {
  const f = await fixture(t, "await writeFile('dist/obsolete.txt', 'old');");
  await f.deploy({ branch: "site/production" });
  const head = git(
    f.directory,
    "--git-dir",
    f.remote,
    "rev-parse",
    "site/production",
  );
  await setBuild(
    f.root,
    "await writeFile('dist/index.html', '<title>Updated</title>');",
  );
  await f.deploy({ branch: "site/production" });
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "rev-parse", "site/production^"),
    head,
  );
  assert.equal(
    git(
      f.directory,
      "--git-dir",
      f.remote,
      "show",
      "site/production:index.html",
    ),
    "<title>Updated</title>",
  );
  assert.ok(
    !git(
      f.directory,
      "--git-dir",
      f.remote,
      "ls-tree",
      "-r",
      "--name-only",
      "site/production",
    ).includes("obsolete.txt"),
  );
});

test("failed checks cannot publish an old build", async (t) => {
  const f = await fixture(t);
  await f.deploy();
  const head = git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages");
  await writeFile(join(f.root, "build.mjs"), "process.exit(1);");
  await assert.rejects(f.deploy(), /checks or build failed/);
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages"),
    head,
  );
});

test("symlinks and Git metadata in build output are rejected", async (t) => {
  for (const build of [
    "await symlink('../source.txt', 'dist/leak.txt');",
    "await mkdir('dist/.git');",
    "await writeFile('dist/.gitattributes', '* filter=external');",
  ]) {
    const f = await fixture(t, build);
    await assert.rejects(f.deploy(), /symlinks|Git metadata/);
    assert.equal(
      git(
        f.directory,
        "--git-dir",
        f.remote,
        "for-each-ref",
        "--format=%(refname)",
        "refs/heads",
      ).length,
      0,
    );
  }
});

test("a symlink replacing the dist directory is rejected", async (t) => {
  const f = await fixture(t);
  await writeFile(
    join(f.root, "build.mjs"),
    "import { symlink } from 'node:fs/promises'; await symlink('.', 'dist');",
  );
  await assert.rejects(f.deploy(), /Expected a dist directory/);
});

test("source branches and invalid branch names are rejected", async (t) => {
  const f = await fixture(t);
  for (const branch of ["main", "master", "-dangerous", "bad:branch"]) {
    await assert.rejects(f.deploy({ branch }));
  }
  git(f.root, "branch", "-m", "development");
  await assert.rejects(f.deploy({ branch: "development" }), /source branch/);
});

test("the remote default source branch cannot be overwritten", async (t) => {
  const f = await fixture(t);
  git(f.root, "push", "--quiet", "origin", "HEAD:refs/heads/development");
  git(
    f.directory,
    "--git-dir",
    f.remote,
    "symbolic-ref",
    "HEAD",
    "refs/heads/development",
  );
  await assert.rejects(
    f.deploy({ branch: "development" }),
    /default source branch/,
  );
});

test("multiple push destinations and remote helpers are rejected", async (t) => {
  const f = await fixture(t);
  git(f.root, "config", "--add", "remote.origin.pushurl", f.remote);
  git(
    f.root,
    "config",
    "--add",
    "remote.origin.pushurl",
    join(f.directory, "another.git"),
  );
  await assert.rejects(f.deploy(), /exactly one push URL/);
  git(f.root, "config", "--unset-all", "remote.origin.pushurl");
  git(f.root, "remote", "set-url", "origin", "ext::should-never-execute");
  await assert.rejects(f.deploy(), /remote helpers/);
  await assert.rejects(
    f.deploy({ remote: "--upload-pack=bad" }),
    /remote name/,
  );
});

test("remote push rejection leaves the published site unchanged", async (t) => {
  const f = await fixture(t);
  await f.deploy();
  const head = git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages");
  await setBuild(f.root, "await writeFile('dist/index.html', 'new');");
  const hook = join(f.remote, "hooks/pre-receive");
  await writeFile(hook, "#!/bin/sh\nexit 1\n");
  await chmod(hook, 0o755);
  await assert.rejects(f.deploy(), /Push rejected or failed/);
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages"),
    head,
  );
});

test("a concurrent deployment is rejected without overwriting its commit", async (t) => {
  const f = await fixture(t);
  await f.deploy();
  await setBuild(f.root, "await writeFile('dist/index.html', 'my change');");
  let concurrent;
  await assert.rejects(
    f.deploy({
      log(message) {
        if (message !== "Publishing verified build…") return;
        const head = git(
          f.directory,
          "--git-dir",
          f.remote,
          "rev-parse",
          "gh-pages",
        );
        const tree = git(
          f.directory,
          "--git-dir",
          f.remote,
          "rev-parse",
          "gh-pages^{tree}",
        );
        concurrent = git(
          f.directory,
          "--git-dir",
          f.remote,
          "-c",
          "user.name=Other deploy",
          "-c",
          "user.email=other@example.invalid",
          "commit-tree",
          tree,
          "-p",
          head,
          "-m",
          "Concurrent deployment",
        );
        git(
          f.directory,
          "--git-dir",
          f.remote,
          "update-ref",
          "refs/heads/gh-pages",
          concurrent,
          head,
        );
      },
    }),
    /No force push was attempted/,
  );
  assert.ok(concurrent);
  assert.equal(
    git(f.directory, "--git-dir", f.remote, "rev-parse", "gh-pages"),
    concurrent,
  );
});

test("paths and filenames with spaces or shell characters are copied literally", async (t) => {
  const f = await fixture(
    t,
    "await writeFile('dist/a $(echo bad);.txt', 'literal');",
  );
  const remoteWithSpace = join(f.directory, "remote with spaces.git");
  await symlink(f.remote, remoteWithSpace, "dir");
  git(f.root, "remote", "set-url", "origin", remoteWithSpace);
  await f.deploy();
  assert.equal(
    git(
      f.directory,
      "--git-dir",
      f.remote,
      "show",
      "gh-pages:a $(echo bad);.txt",
    ),
    "literal",
  );
});
