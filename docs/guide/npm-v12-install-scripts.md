# npm v12 and install scripts (`allowScripts`)

An install script (`preinstall`, `install`, or `postinstall`) is arbitrary code that a package runs on your machine automatically the moment you `npm install` it — code that can come from any dependency in your tree, including ones you never installed directly. That's a real supply-chain risk, so starting with **npm v12**, npm no longer runs dependency **install scripts** by default, and no longer installs **remote (URL/tarball)** or **git** dependencies by default.

## Why this matters

A compromised package could otherwise run anything at install time. npm v12 closes this off by default so that code only runs when you've explicitly said you trust it.

The tradeoff is that some install scripts are legitimate and necessary — they're how packages like `sharp`, `better-sqlite3`, and `esbuild` compile native add-ons or fetch prebuilt binaries for your platform. Block those without a plan and the install still succeeds, but the package ends up broken: image processing, your database driver, or your build tooling can fail later, at runtime or during a deploy, instead of failing loudly when you install.

So `allowScripts` isn't just a compatibility box to check — it's you explicitly deciding which packages you trust to run code on your machine. To keep a package's scripts running, a project opts back in with an `allowScripts` field in its `package.json`.

ApostropheCMS starter kits already ship the right `allowScripts` block, so a fresh project installs cleanly. You only need this guide when you **add a module or dependency** that brings its own install script — then it's your project's job to allow it.

::: tip
Module author? See [For module authors](#for-module-authors) below.
:::

## What changed

npm v12 turns off three automatic code-execution paths by default:

1. **Install scripts** — `preinstall` / `install` / `postinstall` from any dependency (direct or transitive), plus the implicit native rebuild for packages that compile binaries. These no longer run unless the package is on your `allowScripts` list.
2. **Git dependencies** — a dependency referenced by a git URL or `owner/repo` shorthand is blocked unless you opt in.
3. **Remote dependencies** — a dependency referenced by an `https://` tarball URL is blocked unless you opt in.

It does not hard-fail. When a script isn't approved, npm skips it, prints a warning, and the install still succeeds. That's the part to watch: the install looks fine, but a native binary may be missing, so the failure shows up later — at runtime, or during a deploy build — instead of at install time.

On npm 11.16 and newer (which ships with current Node.js releases up to v26) the new behavior is advisory: the scripts still run, and you only get a preview warning of what v12 will block. Nothing is broken today; this is about being ready before the enforced cutover.

## Creating a project or installing the CLI (`npm create apostrophe`)

`npm create apostrophe@latest` and the global CLI (`npm install -g @apostrophecms/cli`) both depend on `better-sqlite3`, which has a native build step.

With npm's defaults, this just works, so there's nothing to do.

The problem only appears if you've globally enforced strict install scripts (for example, `strict-allow-scripts=true` in your user `~/.npmrc`). Then npm blocks `better-sqlite3`'s build and the command itself fails to install.

To fix it, allow that one package on the command:

```bash
npm create apostrophe@latest --allow-scripts=better-sqlite3
npm install -g @apostrophecms/cli --allow-scripts=better-sqlite3
```

## What your project already ships

The ApostropheCMS starter kit `package.json` files include a baseline `allowScripts` block covering the build dependencies in its own tree. A typical block looks like this:

```json
{
  "allowScripts": {
    "@parcel/watcher": true,
    "better-sqlite3": true,
    "esbuild": true,
    "fsevents": true,
    "sharp": true,
    "unrs-resolver": true,
    "vue-demi": true
  }
}
```

These are the packages that need to run code at install time:

| Package | Why it builds | If skipped |
| --- | --- | --- |
| `sharp` | Image processing (libvips) | Image resizing/upload breaks |
| `better-sqlite3` | SQLite driver | SQLite projects fail to start |
| `esbuild` | Fetches its platform build binary | Build/dev tooling fails |
| `@parcel/watcher` | Native file watching | Dev file-watching degrades |
| `vue-demi` | Admin UI Vue compatibility shim | Fails gracefully |
| `unrs-resolver` | Lint resolver native binary | Lint resolver may break |
| `fsevents` | macOS-only file watching | Watcher falls back (non-macOS ignores it) |

The exact list varies by project and it's derived from each project's dependency tree (see [Build the list from the lockfile](#build-the-list-from-the-lockfile)). This baseline covers the project as shipped; anything you add is yours to maintain.

## When you add a module and the install warns

If you add a dependency that carries an install script, your next `npm install` warns that the script isn't covered. Here's the loop to resolve it:

```bash
# 1. See what's pending (read-only)
npm approve-scripts --allow-scripts-pending

# 2. Review the package before trusting it — don't blindly approve everything.

# 3. Approve it (see "Choosing the entry form" below for why --no-allow-scripts-pin)
npm approve-scripts <package> --no-allow-scripts-pin

# 4. Commit the package.json change.

# 5. For native packages, run the now-approved build:
npm rebuild <package>
```

Step 5 matters because of the trap above: when a script is skipped, the install still succeeds, so a native package installs but its binary is missing. Approving the script doesn't retroactively build it — `npm rebuild` does.

To explicitly block a script (and silence the pending warning for it):

```bash
npm deny-scripts <package>
```

## Choosing the entry form

The value in `allowScripts` is always a boolean. The version, if any, lives in the key:

| Entry | Meaning |
| --- | --- |
| `"sharp": true` | Trust this package across any version (name-only) |
| `"sharp@0.34.5": true` | Trust only this exact version (pinned) |
| `"sharp": false` | Block this package's scripts (wins over any approval) |

### Fine-tuning which versions are allowed

This controls exactly which versions of a package may run scripts:

- **Any version:** `"sharp": true`.
- **One specific version:** `"sharp@0.34.5": true`. The version is matched as an exact string — ranges and wildcards aren't supported. `"sharp@^0.34.0": true` and `"sharp@0.34.x": true` will not match the installed `0.34.5`; under v12 the script is silently skipped.
- **A specific set of versions:** list each one as its own exact key:
  ```json
  {
    "allowScripts": {
      "sharp@0.34.5": true,
      "sharp@0.34.6": true
    }
  }
  ```
- **Block:** `"sharp": false`.

Because exact pins don't follow version ranges, a pin stops matching the moment you bump the dependency. For anything you intend to keep updating, name-only is usually the practical choice — it's the only form that survives a version bump without editing `package.json`. Reach for exact pins when you specifically want to re-review every version change.

`npm approve-scripts <package>` writes a pinned entry by default. That's a trap for a long-lived project: the pin stops matching the moment the version changes — even a routine `^`-range bump — so the warning comes back and, under v12, the script is skipped. For a native dependency that means a stale or missing binary after an ordinary update.

Prefer the name-only form for dependencies you're happy to trust across versions:

```bash
npm approve-scripts <package> --no-allow-scripts-pin
```

Or just hand-edit the key to drop the `@version`. Use the pinned form only when you deliberately want to re-review every version bump.

::: tip Security trade-off
Approving a script lets that package run code on your machine at install time. The name-only form trusts all future versions; the pinned form re-asks on every bump. Name-only is the right convenience for well-known, trusted build tools (like the baseline packages above). For anything you don't fully trust, pin it — or don't approve it at all.
:::

## Build the list from the lockfile

Don't build your `allowScripts` block from whatever happened to install on one machine — some install scripts are platform-specific. For example, `fsevents` is macOS-only and never appears in a Linux or Windows install, so generating the list on Linux would silently omit it, and your macOS teammates would hit the guard.

The authoritative, platform-independent source is your lockfile: every package marked `"hasInstallScript": true` in `package-lock.json`. Build one union block from that and commit it; don't regenerate it per machine. Including an entry that doesn't apply on a given OS is harmless — npm ignores entries for packages that aren't installed.

## Remote and git dependencies

A vanilla project installs only from the npm registry, so the git/remote guards stay dormant — until you add a module that pulls a dependency from a git source or an `https://` tarball. (For example, a spreadsheet import/export module might depend on a library that's distributed only from a vendor URL.) Under npm v12 that dependency won't resolve unless the project opts in.

**Preferred fix:** use a registry-published alternative so there's no non-registry source to allow.

**Interim opt-in:** if you must keep the non-registry source for now, enable it at the project level in `.npmrc`:

```ini
# .npmrc
allow-remote=true   # permit https-tarball dependencies
allow-git=true      # permit git dependencies
```

Or pass `--allow-remote` / `--allow-git` on the install command. Treat these as a temporary bridge, not a resting state: they're broad, project-wide toggles (there's no per-host allow-list), so they weaken the protection v12 adds for your whole project. Prefer migrating to a registry dependency and removing the toggle.

## Pre-seeding modules you plan to add (advanced)

npm ignores `allowScripts` entries for packages that aren't installed. So you can pre-list a small, curated set of modules you know you'll add, with a comment, and your next `npm install` stays clean when you do. Keep it minimal — every entry widens the set of packages allowed to run code — and don't speculatively pre-approve arbitrary names. The approve loop above is the scalable answer; pre-seeding is just a convenience on top.

## Local is lenient, releases are strict

The local loop relies on v12 not failing installs: you install, see a warning, approve, and `npm rebuild`. That's fine for development. But it means a deploy install (`npm install` or `npm ci`) will happily succeed with a skipped native build — shipping an app whose binaries are missing.

For release and deploy installs, add `--strict-allow-scripts` so an unapproved or uncovered script becomes a hard failure at build time instead of a broken deployment:

```bash
# Release / deploy: fail fast if any required script isn't approved
npm install --strict-allow-scripts && npm run build
```

Put the strict flag in your project's release script and any deploy step (such as a Dockerfile install). Keep local development lenient — no flag — so the warn → approve → rebuild loop still works.

## For module authors

If you publish an ApostropheCMS module (or any npm package), help the projects that depend on you:

- **Avoid install scripts where you can.** Prefer prebuilt binaries shipped as platform-specific optional dependencies over a `postinstall` build step.
- **Avoid remote and git dependencies.** Publish to the registry; don't depend on a git branch or a vendor tarball.
- **Document what you require.** If your package genuinely needs an install script, a git source, or a remote source, say so in your README so downstream projects know exactly what to add to their `allowScripts` (or `.npmrc`).

## Quick reference

```bash
# Create a SQLite project / install the global CLI where allowScripts can't apply
npm create apostrophe@latest --allow-scripts=better-sqlite3
npm install -g @apostrophecms/cli --allow-scripts=better-sqlite3

# See pending (unapproved) install scripts
npm approve-scripts --allow-scripts-pending

# Approve a package for any version (recommended for trusted build tools)
npm approve-scripts <package> --no-allow-scripts-pin

# Block a package's scripts
npm deny-scripts <package>

# Build a native package after approving it
npm rebuild <package>

# Release / deploy: fail the build on any skipped script
npm install --strict-allow-scripts
```

```json
// package.json — name-only entries, derived from your lockfile's
// "hasInstallScript" packages, committed as one cross-platform block
{
  "allowScripts": {
    "better-sqlite3": true,
    "esbuild": true,
    "sharp": true
  }
}
```

```ini
# .npmrc — interim opt-in for non-registry sources (prefer a registry dependency)
allow-remote=true
allow-git=true
```
