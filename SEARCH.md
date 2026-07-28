# Search

This site (`apostrophecms.com/docs/`) uses [Pagefind](https://pagefind.app) for search — the
same engine as the marketing site ([apostrophecms-website-next](https://github.com/apostrophecms/apostrophecms-website-next),
`apostrophecms.com/`). The merge is one-directional: marketing search merges in docs results,
but **docs search only ever returns docs results** — a product decision, not a technical
limitation (Pagefind supports merging both ways; we only wire up one).

This replaces VitePress's built-in MiniSearch. The separate "Ask AI" search mode is unchanged.

## Testing locally

Since docs no longer merges anything in, there's nothing to test on the docs side beyond normal
`npm run build && npm run preview`. The proxy setup below is only needed to test *marketing's*
merge of docs results — `npm run preview` alone can't exercise that, since it runs on its own
local port (a different origin from marketing's), and `mergeIndex()`'s bundle path is
root-relative, so it only resolves against the current page's own origin.
`scripts/local-multisite-proxy.mjs` fronts both sites under one port instead (mirrors
production's `/docs/` split, no code changes needed):

```bash
# Terminal 1 - marketing backend (required before building the marketing search index — see
# "How indexing works" below)
cd apostrophecms-website-next/backend
npm run dev                            # :3000 by default

# Terminal 2 - marketing frontend
cd apostrophecms-website-next/frontend
APOS_EXTERNAL_FRONT_KEY=dev npm run build
npm run build:search-index
npm run serve                          # :4321 by default

# Terminal 3 - this repo
npm run build
npm run preview                        # :4173 by default

# Terminal 4 - proxy fronting both under one origin
npm run test:multisite-search          # :8888 by default
```

Open `http://localhost:8888/` and search — results from `http://localhost:8888/docs/` pages
should appear alongside marketing's own. (Searching from `/docs/` should *not* surface any
marketing results — that's the correct, intended behavior, not a bug.) Override `DOCS_PORT` /
`MARKETING_PORT` / `PROXY_PORT` if an upstream lands on a different port than the defaults
above.

The marketing backend only matters here because `build:search-index` crawls the site to
generate its index — it's not needed just to serve an already-built `pagefind/` folder.

## How indexing works

- **Docs** (this repo): a static `vitepress build`, so Pagefind indexes the built HTML directly.
  `npm run build:search-index` (`scripts/build-search-index.mjs`) runs after `docs:build` and is
  chained into `npm run build`, so every deploy script includes it automatically. Indexing is
  scoped to `.vp-doc`, VitePress's content wrapper, which excludes nav/sidebar/footer with no
  template changes needed.
- **Marketing**: Astro in `output: 'server'` mode has no static HTML for Pagefind to read, so
  `frontend/scripts/build-search-index.mjs` crawls the built site instead — starts the built
  server, fetches `/sitemap.xml`, saves each page to disk, then indexes that snapshot. This
  needs the Apostrophe backend reachable (see the comment at the top of that script for why, and
  `frontend/scripts/deploy-search-index.sh` for how the index ships to production).

Search doesn't work in `vitepress dev`, or in any build where `build:search-index` hasn't run —
the search box shows "Search is unavailable right now."

## The search UI

Both sites use Pagefind's JS API (`pagefind.js`, `pf.search()`) directly rather than Pagefind's
bundled UI, so results render in each site's own existing search component:

- **Docs**: `docs/.vitepress/components/AposPagefindResults.vue`, mounted from
  `AposLocalSearchBox.vue` (internally still called `MiniSearchResults`/`'MiniSearch'`, to avoid
  invalidating visitors' existing `vitepress:search-type` session storage).
- **Marketing**: `frontend/src/components/navigation/navigationClient.js`,
  `initCommandMenu()`'s `loadPagefind()`/`runPagefindSearch()` (the ⌘K command menu).

## Cross-site merge

Both sites share a domain, so this uses Pagefind's built-in
[multisite search](https://pagefind.app/docs/multisite/): each site indexes independently, and
**marketing's** search code calls `pagefind.mergeIndex('/docs/pagefind')` at query time to pull
docs' index in. Docs' own search code (`AposPagefindResults.vue`) does not call `mergeIndex` at
all — it only ever loads and searches its own index. No shared build, no coordinated deploy, no
CORS (same origin).

| Site | Own index at | Merges in |
|---|---|---|
| Docs | `/docs/pagefind/` | *(nothing — docs-only results)* |
| Marketing | `/pagefind/` | `/docs/pagefind` (docs) |

A few things worth knowing:

- **Reachability probe first.** Marketing checks the docs bundle is actually there
  (`isPagefindBundleReachable()`, a `fetch` of `pagefind-entry.json`) before calling
  `mergeIndex()`, and skips the merge if not. This isn't optional — `mergeIndex()` against an
  unreachable bundle doesn't fail gracefully: Pagefind still registers the index, and every
  later `.search()` call then fails trying to re-load its metadata, breaking marketing's *own*
  search too. Probing first means "docs isn't deployed yet" degrades to "no docs results in
  marketing's search," not "search is broken."
- **Ranking.** If docs results start drowning out marketing's own, use Pagefind's `indexWeight`
  option on `mergeIndex()` — see
  [multisite ranking](https://pagefind.app/docs/multisite/#changing-the-weighting-of-individual-indexes).
  Not set today.
- **Verifying it's working**: from marketing's search box, search for a term that only exists in
  the docs and confirm it shows up with a working link into `/docs/`. Can be done in
  staging/prod, but doesn't require them — see "Testing locally" above.

## Known gaps / follow-ups

- The one-directional merge (marketing → docs, not the reverse) is a deliberate product
  decision, not a placeholder — don't "fix" it into a two-way merge without checking first.
- Neither site pins the exact `pagefind` npm version to match the other (both `^1.5.2` today).
  Keep them in step — `mergeIndex` uses the *local* site's WebAssembly module against the
  *other* site's index files, and formats can change between versions.
- Verified end-to-end locally, including marketing surfacing docs results via the proxy setup
  above and docs search correctly returning docs-only results. Still worth one more check once
  both sites have actually deployed together, to confirm the real domain/path setup matches what
  was tested.
- Two unrelated, pre-existing issues surfaced getting a clean build here, fixed as part of this
  change:
  - `rollup` pinned to `4.52.4` via `package.json` `overrides` — `>=4.53` has a parser
    regression ([rollup/rollup#6176](https://github.com/rollup/rollup/issues/6176)) that panics
    on `swagger-ui-dist`'s bundle (used by the API Explorer).
  - `highlight.js` added as an explicit dependency — it was only ever present as an undeclared
    transitive dependency (via the now-removed `vitepress-plugin-search`) despite
    `AposAISearchResults.vue` importing it directly.
