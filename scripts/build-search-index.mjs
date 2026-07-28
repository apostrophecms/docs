/**
 * Build the Pagefind search index for the VitePress docs site.
 *
 * Unlike the marketing site (apostrophecms-website-next/frontend), which runs Astro in
 * `output: 'server'` mode and has to crawl a live server to get static HTML for Pagefind to
 * read (see frontend/scripts/build-search-index.mjs there), this docs site is a fully static
 * `vitepress build` — the rendered HTML is already sitting on disk in
 * `docs/.vitepress/dist`, so Pagefind can index it directly with no crawl step.
 *
 * Scope: indexed content is limited to VitePress's own rendered-markdown wrapper
 * (`.vp-doc`), which excludes the nav bar, sidebar, outline/aside, and doc footer without
 * needing any template changes. This mirrors the effect of the `data-pagefind-body`
 * attribute the marketing site's Astro templates use to scope indexing to `<main>`.
 *
 * Usage: run this AFTER `vitepress build docs` (it is wired into `npm run build` in
 * package.json, right after `docs:build`).
 *
 *   npm run docs:build
 *   npm run build:search-index
 *
 * Output goes to `docs/.vitepress/dist/pagefind/`, so it's served alongside the rest of the
 * built site (e.g. at /docs/pagefind/pagefind.js in production, since `base: '/docs/'`).
 *
 * See SEARCH.md (repo root) for the full write-up of this setup, including the merged
 * cross-site search index shared with the marketing site.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DIST_DIR = path.join(repoRoot, 'docs', '.vitepress', 'dist');
const PAGEFIND_OUTPUT = path.join(DIST_DIR, 'pagefind');

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[build-search-index] ${message}`);
}

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(`[build-search-index] ${message}`);
  process.exitCode = 1;
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    fail(`Cannot find built site at ${DIST_DIR}. Run \`npm run docs:build\` first.`);
    return;
  }

  log(`indexing ${DIST_DIR} -> ${PAGEFIND_OUTPUT} ...`);

  // The `pagefind` package exports `createIndex`/`close` as named exports, not a default
  // export (same as the marketing site's script).
  const { createIndex, close } = await import('pagefind');

  const { index, errors } = await createIndex({
    rootSelector: '.vp-doc',
    excludeSelectors: ['a.header-anchor']
  });

  if (errors?.length) {
    fail(`createIndex reported errors: ${errors.join('; ')}`);
    return;
  }

  const { errors: addErrors } = await index.addDirectory({ path: DIST_DIR });
  if (addErrors?.length) {
    fail(`addDirectory reported errors: ${addErrors.join('; ')}`);
    return;
  }

  await index.writeFiles({ outputPath: PAGEFIND_OUTPUT });
  await close();

  log('done.');
}

main().catch((err) => {
  fail(err.stack || String(err));
});
