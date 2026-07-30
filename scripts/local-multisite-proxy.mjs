/**
 * Local reverse proxy for testing the cross-site Pagefind merge (see SEARCH.md) without
 * deploying to staging.
 *
 * In production, both sites share one origin (apostrophecms.com, docs mounted at /docs/), so
 * `mergeIndex()`'s root-relative bundle paths ('/pagefind' from docs, '/docs/pagefind' from
 * marketing) resolve correctly. Locally, each site's own dev/preview server runs on its own
 * port -- a different origin as far as the browser and `fetch()` are concerned -- so a
 * root-relative merge path can never reach the other site's server, no matter how the code is
 * written. This proxy fronts both under one port so the merge (and the reachability probe in
 * front of it, see AposPagefindResults.vue / navigationClient.js) can be exercised for real,
 * against real local builds, before anything touches staging.
 *
 * Usage:
 *   1. In apostrophecms-website-next/frontend:
 *        APOS_EXTERNAL_FRONT_KEY=dev npm run build
 *        npm run build:search-index
 *        npm run serve            # binds :4321 by default (see package.json)
 *      (The Apostrophe backend doesn't need to be running for this test -- /pagefind/* is
 *      served as a static file either way. It only matters if you also want to click through
 *      to a real rendered marketing page, not just confirm search results merge correctly.)
 *
 *   2. In this repo:
 *        npm run build
 *        npm run preview          # binds :4173 by default (vitepress's default preview port)
 *
 *   3. node scripts/local-multisite-proxy.mjs
 *      (override ports with DOCS_PORT / MARKETING_PORT / PROXY_PORT env vars if either upstream
 *      is bound somewhere else, e.g. vitepress picked a different port because 4173 was busy)
 *
 *   4. Open http://localhost:8888/docs/ and http://localhost:8888/ and search from either --
 *      results from the *other* site should now appear instead of the "not reachable" fallback,
 *      and the console should show no cross-site probe 404s.
 */
import http from 'node:http';

const PROXY_PORT = Number(process.env.PROXY_PORT || 8888);
const DOCS_PORT = Number(process.env.DOCS_PORT || 4173);
const MARKETING_PORT = Number(process.env.MARKETING_PORT || 4321);

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[local-multisite-proxy] ${message}`);
}

const server = http.createServer((req, res) => {
  // Docs is mounted at /docs/ in production (see docs/.vitepress/config.js `base`), so route
  // anything under that prefix to the docs preview server and everything else to marketing --
  // the same split production uses.
  const targetPort = req.url.startsWith('/docs') ? DOCS_PORT : MARKETING_PORT;

  const proxyReq = http.request(
    {
      host: '127.0.0.1',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${targetPort}` }
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', (err) => {
    log(`upstream error for ${req.url} (port ${targetPort}): ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end(
      `Bad gateway: could not reach upstream on port ${targetPort}. ` +
        'Is that site\'s preview/serve command running?'
    );
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, () => {
  log(`listening on http://localhost:${PROXY_PORT}`);
  log(`  /docs/*  -> http://localhost:${DOCS_PORT} (this repo's \`npm run preview\`)`);
  log(`  /*       -> http://localhost:${MARKETING_PORT} (marketing's \`npm run serve\`)`);
});
