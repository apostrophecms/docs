---
prev:
  text: 'Upgrade From Apostrophe 3'
  link: '/guide/migration/upgrading-3-to-4.html'
next: false
---

# Upgrading apostrophe-astro to v1.13

## What's new in v1.13

Version 1.13 of `@apostrophecms/apostrophe-astro` adds official support for **Astro v6** (Vite 7) and **Astro v7** (Vite 8). If you're staying on Astro v5 for now, everything continues to work as before and this release is fully backwards compatible.

That said, if you are upgrading to Astro v6 or v7, there are a few things to be aware of. Most projects will only need to address one or two of the changes below.

---

## Static builds: guard `security.allowedDomains` to SSR only

This one only applies to you if your project uses **both** `security.allowedDomains` in `astro.config.mjs` **and** static builds. If you're SSR-only, you can skip ahead.

Starting in Astro v6, the framework reads `request.headers` during prerendering to validate forwarded headers — even though there are no real HTTP headers at static build time. If `allowedDomains` is configured unconditionally, this produces a warning for every prerendered page:

::: warning
 `Astro.request.headers` was used when rendering the route `src/pages/[...slug].astro`
:::

The fix is to apply `allowedDomains` only when running in SSR mode, since it has no effect during prerendering anyway:

```js
// astro.config.mjs
const isStatic = process.env.APOS_BUILD === 'static'; // or however you detect it

export default defineConfig({
  output: isStatic ? 'static' : 'server',
  // Only configure allowedDomains for SSR — it has no effect during
  // static prerendering and triggers a spurious headers warning in Astro v6+.
  ...(!isStatic && {
    security: { allowedDomains }
  }),
  // ...
});
```

---

## Update direct `lib/` imports to the new helper entry points

Previous versions of `apostrophe-astro` exposed several utilities as direct paths into the package's internal `lib/` directory. Those internal paths are now deprecated in favour of stable, documented entry points that won't change between releases.

::: info
One exception: `lib/aposPageFetch.js` is **not** deprecated. It's an internal function used by the starter kit's `[...slug].astro` entrypoint and was never part of the public API, so it doesn't need to move.
:::

Here's the full list of affected imports and their replacements:

| Old import | New import |
|---|---|
| `@apostrophecms/apostrophe-astro/lib/static.js` | `@apostrophecms/apostrophe-astro/helpers/server` |
| `@apostrophecms/apostrophe-astro/lib/aposSetQueryParameter.js` | `@apostrophecms/apostrophe-astro/helpers/universal` |
| `@apostrophecms/apostrophe-astro/lib/util.js` | `@apostrophecms/apostrophe-astro/helpers/universal` |
| `@apostrophecms/apostrophe-astro/lib/aposStyles.js` | `@apostrophecms/apostrophe-astro/helpers/universal` |
| `@apostrophecms/apostrophe-astro/lib/attachment.js` | `@apostrophecms/apostrophe-astro/helpers/universal` |

The exported function names haven't changed, so it's a simple find-and-replace on the import paths. For example:

```js
// Before
import { getAllStaticPaths } from '@apostrophecms/apostrophe-astro/lib/static.js';

// After
import { getAllStaticPaths } from '@apostrophecms/apostrophe-astro/helpers/server';
```

The `helpers/server` entry point exports `getAllStaticPaths`, `getAllUrlMetadata`, and `getLocales`. Everything else — `aposSetQueryParameter`, `slugify`, `stylesAttributes`, `stylesElements`, `getAttachmentUrl`, `getAttachmentSrcset`, and related utilities — is available from `helpers/universal`.

---

## Vite virtual modules have been removed

Two Vite virtual modules that were previously available — `virtual:apostrophe-config` and `virtual:apostrophe-doctypes` — have been removed. These were always private implementation details rather than part of the public API, but some projects found and used them directly.

**If you used `virtual:apostrophe-config`** to read values like `aposHost` or `aposPrefix`, the good news is that you set those values yourself in `astro.config.mjs`. Source them from your own application config instead.

**If you used `virtual:apostrophe-doctypes`** to access your `widgets` or `templates` maps, import your own mapping files directly wherever you need them.

::: warning
If your project was relying on either of these virtual modules, this is the one breaking change in v1.13. The fix is straightforward in both cases, but you will need to make the update before upgrading.
:::
