---
title: "Static Builds with ApostropheCMS + Astro"
detailHeading: "Astro"
url: "/tutorials/astro/static-builds-with-apostrophe.html"
content: "Build and deploy a fully static Astro frontend backed by ApostropheCMS content. Configure URL metadata, static paths, attachments, and non-root hosting."
tags:
  topic: "Core Concepts"
  type: astro
  effort: intermediate
order: 7
excludeFromFilters: true
---
# Static Builds with ApostropheCMS + Astro

This tutorial explains how to run ApostropheCMS as your content backend while generating a fully static Astro frontend at build time. The final output is static HTML, CSS, JS, and media files that can be deployed to static hosting platforms.

## How static mode works

In static mode, the Astro build:

1. Requests URL metadata from ApostropheCMS (pages, piece show URLs, filter/pagination URLs).
2. Renders all routes returned by `getStaticPaths()`.
3. Writes literal backend content (for example generated CSS, `robots.txt`, and sitemap files).
4. Copies attachment files so the static output can run without a live Apostrophe frontend server.

Your Apostrophe backend must be running during the build.

## Backend configuration

### 1. Enable static URL behavior

Set `@apostrophecms/url` `static: true`:

```javascript
// modules/@apostrophecms/url/index.js
export default {
  options: {
    static: true
  }
};
```

This enables path-based filter/pagination URLs and static URL metadata collection.

### 2. Set `staticBaseUrl`

Set a public origin for generated static URLs:

```javascript
// app.js
apostrophe({
  shortName: 'my-project',
  baseUrl: 'http://localhost:3000',
  staticBaseUrl: 'https://www.example.com',
  modules: {
    '@apostrophecms/url': {
      options: {
        static: true
      }
    }
  }
});
```

You can also set this with `APOS_STATIC_BASE_URL`.

### 3. Configure piece filters for static generation

When piece index filters are used, declare them with `piecesFilters` so static filter and pagination URLs can be generated:

```javascript
// modules/article-page/index.js
export default {
  extend: '@apostrophecms/piece-page-type',
  options: {
    piecesFilters: [
      { name: 'category' }
    ]
  }
};
```

## Frontend configuration

### 1. Switch Astro output mode

Use `APOS_BUILD=static` to switch from SSR to static output:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import apostrophe from '@apostrophecms/apostrophe-astro';

const isStatic = process.env.APOS_BUILD === 'static';

export default defineConfig({
  output: isStatic ? 'static' : 'server',
  adapter: isStatic ? undefined : node({ mode: 'standalone' }),
  integrations: [
    apostrophe({
      aposHost: 'http://localhost:3000',
      widgetsMapping: './src/widgets/index.js',
      templatesMapping: './src/templates/index.js'
    })
  ]
});
```

### 2. Add `getStaticPaths` in your catch-all route

```astro
---
// src/pages/[...slug].astro
import { getAllStaticPaths } from '@apostrophecms/apostrophe-astro/lib/static.js';
import { getAposHost } from '@apostrophecms/apostrophe-astro/helpers';
import aposPageFetch from '@apostrophecms/apostrophe-astro/lib/aposPageFetch.js';

export async function getStaticPaths() {
  return getAllStaticPaths({
    aposHost: getAposHost(),
    aposExternalFrontKey: import.meta.env.APOS_EXTERNAL_FRONT_KEY
  });
}

const aposData = await aposPageFetch(Astro.request);
---
```

## Build commands and env vars

Example frontend `package.json` scripts:

```json
{
  "scripts": {
    "dev": "cross-env APOS_EXTERNAL_FRONT_KEY=dev astro dev",
    "build": "astro build",
    "build:static": "APOS_BUILD=static APOS_EXTERNAL_FRONT_KEY=dev astro build"
  }
}
```

Common variables:

- `APOS_BUILD=static`
- `APOS_EXTERNAL_FRONT_KEY` (required)
- `APOS_HOST`
- `APOS_PREFIX`
- `APOS_STATIC_BASE_URL` (required for production static URLs)
- `APOS_SKIP_ATTACHMENTS`
- `APOS_ATTACHMENT_SIZES`
- `APOS_ATTACHMENT_SKIP_SIZES`
- `APOS_ATTACHMENT_SCOPE`

## Static-safe template helpers

Use helpers from `@apostrophecms/apostrophe-astro/helpers`:

- `buildPageUrl(aposData, pageNumber)` for pagination URLs in SSR and static modes.
- `getFilterBaseUrl(aposData)` for filter-aware base URLs.
- `getAposHost()` for server-side backend host resolution.
- `aposFetch()` for server-side requests to Apostrophe APIs.

## Filters and pagination updates

For piece index pages, prefer `req.data.filters` (available as `aposData.filters`) for filter metadata and links, while keeping `req.data.piecesFilters` support for legacy patterns.

For pagination, use `buildPageUrl` instead of manually assembling query strings.

## Widget behavior in static output

Client-side calls to Apostrophe backend routes (for example `/api/v1/...`) will fail on a purely static site. Move those calls to Astro server/frontmatter code at build time, then pass results into client components as props or `data-*` attributes.

## Non-root hosting (GitHub Pages and similar)

When deploying under a path prefix:

- Backend: set `prefix` (for example `/my-repo`) and `staticBaseUrl` (origin only, for example `https://user.github.io`).
- Frontend: set `base: '/my-repo'`.
- Keep Apostrophe `prefix` and Astro `base` identical.

## What to watch out for

1. The backend must stay online for the entire static build.
2. Content changes require rebuilding and redeploying static output.
3. Preview and in-context editing are not available on the final static site.
4. Static mode can increase build time significantly with many filter combinations or large attachment sets.

## Next steps

- Review [Creating Pieces](/tutorials/astro/creating-pieces.html) for filter/pagination templates.
- Review [Creating Widgets](/tutorials/astro/creating-widgets.html) for API-driven widget patterns.
- Review [Deploying ApostropheCMS-Astro Projects](/tutorials/astro/deploying-hybrid-projects.html) for production deployment setups.
