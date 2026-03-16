---
extends: '@apostrophecms/module'
---

# `@apostrophecms/url`

**Alias:** `apos.url`

<AposRefExtends :module="$frontmatter.extends" />

This module centralizes URL generation for ApostropheCMS pages and pieces. It exposes the `build` method as a Nunjucks filter, supplies helpers for generating filter and pagination URLs, and — when configured with `static: true` — enables path-based URL generation and the metadata API that drives Astro static builds.

## Configuration options

Options are passed into the url module by creating a `modules/@apostrophecms/url/index.js` file in your project.

| Property | Type | Default | Description |
|---|---|---|---|
| [`static`](#static) | Boolean | `false` | Enables static-friendly path-based URLs and URL metadata behavior for static site generation |

### `static`

When set to `true`, URL generation for piece index filtering and pagination switches from query-string format to path-based format.

Examples:

- Query style (default): `/articles?category=tech&page=2`
- Static style: `/articles/category/tech/page/2`

This option also enables URL metadata collection used by static frontends to discover all pages that need to be generated, and activates the `GET /api/v1/@apostrophecms/url` endpoint consumed by the `apostrophe-astro` package during `astro build`.

::: warning
`static: true` affects filter and pagination URL format for all frontends connected to the same backend. If you are running both an SSR editorial frontend and a static production build against the same ApostropheCMS instance, make sure your SSR templates use helpers that produce URLs compatible with either format.
:::

`static: true` can be set in one of two places depending on your project's conventions.

**Option A — project-level module file**:

<AposCodeBlock>

```javascript
export default {
  options: {
    static: true
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/url/index.js
  </template>
</AposCodeBlock>

**Option B — inline in `app.js`** (useful when you prefer to keep configuration centralized):

<AposCodeBlock>

```javascript
export default apostrophe({
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
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

Regardless of which approach you use to set `static: true`, you should also set `staticBaseUrl` so that static URL generation has a known public origin to work from. It can be supplied via the `APOS_STATIC_BASE_URL` environment variable or at the top-level in the `app.js` file. The hard coded value can be used as a convenient fallback for local development and will be overridden by the variable during production deployment.

## URL metadata for static builds

When `static: true` is configured, the module gathers URL metadata from all registered doc types and event listeners. Static frontends — such as an Astro static build — consume this metadata to determine:

- Which HTML routes need to be rendered.
- Which literal files (for example CSS, `robots.txt`, or sitemap XML) need to be copied to the output.

Doc types that extend page and piece base modules are automatically included. The metadata is collected via the `GET /api/v1/@apostrophecms/url` endpoint and the `getAllUrlMetadata` method documented below.

## Extending URL metadata

Modules that do not extend a doc type can contribute URL metadata via the [`@apostrophecms/url:getAllUrlMetadata`](#apostrophecms-url-getallurlmetadata) event:

<AposCodeBlock>

```javascript
export default {
  handlers(self) {
    return {
      '@apostrophecms/url:getAllUrlMetadata': {
        addGeneratedFile(req, results) {
          results.push({
            url: '/my-generated-file.json',
            contentType: 'application/json',
            i18nId: 'my-module:generated-file',
            sitemap: false
          });
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/my-module/index.js
  </template>
</AposCodeBlock>

## Metadata entry format

### Document entries

Use document entries for renderable HTML routes:

| Property | Required | Description |
|---|---|---|
| `url` | Yes | Relative, prefix-free path (e.g. `/articles/my-post`) |
| `type` | Yes | The ApostropheCMS doc type name (e.g. `'article'`) |
| `aposDocId` | Yes | The locale-independent document ID |
| `i18nId` | Yes | Stable identifier consistent across localized versions of the same logical URL |
| `_id` | Yes | The full locale-qualified MongoDB `_id` |
| `sitemap` | No | When explicitly `false`, excludes the entry from sitemap output while still including it in the static build |
| `changefreq` | No | Sitemap hint (e.g. `'daily'`). Note that Google explicitly ignores this value |
| `priority` | No | Sitemap priority hint (e.g. `1.0`). Note that Google explicitly ignores this value |

### Literal content entries

Use literal content entries for non-HTML files that should be written to the static output as-is — CSS stylesheets, `robots.txt`, generated JSON, and similar:

| Property | Required | Description |
|---|---|---|
| `url` | Yes | Relative, prefix-free path beginning with `/` (e.g. `/robots.txt`) |
| `contentType` | Yes | MIME type (e.g. `'text/css'`, `'text/plain'`). Signals to the consumer that this URL should be fetched and written to disk rather than rendered as a page |
| `i18nId` | Yes | Stable identifier for this entry |
| `sitemap` | No | Commonly set to `false` for non-HTML entries |

::: info
`url` values for literal content entries must be relative, prefix-free paths. Do not include the site prefix manually — the consumer (e.g. the Astro integration) prepends it when fetching from the backend. Document entries have their base URL stripped automatically after collection; literal entries do not, so a relative path is required.
:::

## Sitemaps and exclusions

Set `sitemap: false` on metadata entries that should be built but excluded from sitemap output. Typical cases include:

- Paginated filter pages beyond the first
- CSS or other generated files
- Utility routes such as print views

## REST API routes

### `GET /api/v1/@apostrophecms/url`

Returns the full URL metadata needed for a static build — an object with `pages` and `attachments` properties. See [`getAllUrlMetadata`](#getallurlmetadata-req-options) for the complete response shape.

This endpoint is only accessible to authenticated external frontend requests (those made with a valid `APOS_EXTERNAL_FRONT_KEY`) and requires `static: true` to be configured. Calling it without that option returns a `400 invalid` error.

The endpoint accepts the following query parameters:

| Parameter | Type | Description |
|---|---|---|
| `attachments` | Boolean | When `true`, includes attachment metadata in the response |
| `attachmentSizes` | String | Comma-separated list of image sizes to include (e.g. `full,max,one-half`) |
| `attachmentSkipSizes` | String | Comma-separated list of image sizes to exclude |
| `attachmentScope` | String | `used` (default) limits to attachments referenced by returned pages; `all` returns every non-archived attachment |

This endpoint is consumed internally by the `apostrophe-astro` package and is not typically called directly in project-level code.

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/tree/main/packages/apostrophe/modules/%40apostrophecms/url) for all methods that belong to this module.

Because this module has an alias, you can call these from another module using the alias path. For example, `self.apos.url.build()`.

### `build(url, [path], data, [...])`

Builds a URL by merging new query parameters into an existing URL. This method is also available as the `build` filter in Nunjucks templates.

`url` is the base URL to modify. It may include an existing query string, which will be preserved and merged with the new parameters.

`data` is an object whose properties become query parameters. A new value replaces any existing value for that property. Passing `undefined`, `null`, or `''` for a property removes it from the URL if present. Note that the number `0` does not remove a parameter.

Additional `data` objects may be passed — the last one wins, so you can pass existing parameters first and new overrides last.

#### Pretty URLs

If the optional `path` argument is present, it must be an array of property names from `data`. Properties listed in `path` are appended to the URL as path segments rather than query parameters, provided their values are slug-safe strings. The first missing, empty, or non-slug-safe value stops path processing to prevent ambiguous URLs.

```javascript
// Produces: /articles/category/news
self.apos.url.build('/articles', ['category'], { category: 'news' });
```

#### Array operators

To add or remove values from an array parameter, use MongoDB-style operators:

```javascript
// Add colors[]=blue if not already present
self.apos.url.build('/products', { colors: { $addToSet: 'blue' } });

// Remove colors[]=blue if present
self.apos.url.build('/products', { colors: { $pull: 'blue' } });
```

All values passed to `$addToSet` or `$pull` must be strings, or values convertible to strings via `toString()`.

### `getBaseUrl(req, options)`

Returns the effective base URL (origin + optional prefix) for the given request.

Resolution order:

1. If a hostname is configured for the active locale, `<protocol>://<hostname>` is returned. The global prefix is not appended in this case.
2. If the request is a static build request, `staticBaseUrl` + prefix is returned.
3. Otherwise, `apos.baseUrl` + prefix is returned.

`options` accepts:

| Property | Default | Description |
|---|---|---|
| `strict` | `false` | When `true` and in a static build context where `staticBaseUrl` is not set, falls back to `apos.baseUrl` rather than returning an empty string. Use when an absolute URL is required, such as for sitemap `<loc>` values |
| `prefix` | `true` | When `true`, appends `apos.prefix` to the returned URL. Pass `false` to obtain only the origin without the prefix |

### `getChoiceFilter(name, value, page)`

Returns a URL suffix for a specific filter value and page number combination. The format depends on the `static` option:

- SSR mode: `?name=value` (or `?name=value&page=2` for pages beyond the first)
- Static mode: `/name/value` (or `/name/value/page/2` for pages beyond the first)

`page` is 1-based. Page 1 produces no page segment. This method is used internally when generating filter URLs for piece index pages.

### `getPageFilter(page)`

Returns a URL suffix for a page number. The format depends on the `static` option:

- SSR mode: `?page=2`
- Static mode: `/page/2`

Returns an empty string for page 1. `page` is 1-based.

### `isStaticBuild(req)`

Returns `true` if the given request is from an external frontend performing a static build. Modules that need to detect static build context should use this method rather than inspecting `req` properties directly.

### `isExternalFront(req)`

Returns `true` if the given request originates from an external frontend integration such as Astro or Next.js. Modules should use this method rather than inspecting `req.aposExternalFront` directly.

### `getAllUrlMetadata(req, options)`

Collects metadata for every URL a static build needs to render. Returns a promise resolving to:

```javascript
{
  pages: [ /* metadata entries */ ],
  attachments: null // or an object when requested — see below
}
```

`options` accepts:

| Property | Type | Default | Description |
|---|---|---|---|
| `excludeTypes` | String[] | `[]` | Doc type names to skip during collection |
| `attachments` | Object \| Boolean | `false` | When a truthy object, collects and returns attachment metadata alongside page URLs |

When `attachments` is provided as an object it accepts:

| Property | Type | Description |
|---|---|---|
| `scope` | String | `'used'` (default) limits to attachments referenced by documents in the results; `'all'` returns every non-archived attachment |
| `sizes` | String[] | Image sizes to include |
| `skipSizes` | String[] | Image sizes to exclude |

The `attachments` object in the response contains:

- `uploadsUrl` — the uploadfs base URL prefix (e.g. `/uploads` or `https://cdn.example.com`)
- `results` — an array of objects, each with `_id` (the attachment record ID) and `urls` (an array of `{ size, path }` objects where `path` is the uploadfs-relative file path)

## Server events

### `@apostrophecms/url:getAllUrlMetadata`

Emitted during URL metadata collection after all doc type managers have been queried. Handlers receive `(req, results, { excludeTypes })` where `results` is the page metadata array collected so far.

Handlers may push additional entries into `results`. This is the correct extension point for modules that cannot express their URLs through a doc type manager. See [Extending URL metadata](#extending-url-metadata) above for an example.

Handlers must respect `excludeTypes` and should not push entries for types listed there.

### `@apostrophecms/url:getAllAttachmentMetadata`

Emitted after attachment metadata is collected. Handlers receive `(req, results, options)` where `results` is the attachment results array and `options` includes `{ sizes, skipSizes, scope, uploadsUrl }`.

Use this event to contribute additional attachment entries or modify the results programmatically — for example, if your module manages attachments outside the standard uploadfs flow.

## Related docs

- [ApostropheCMS + Astro static builds](/tutorials/astro/static-builds-with-apostrophecms-astro.html)
- [Deploying ApostropheCMS + Astro projects](/tutorials/astro/deploying-hybrid-projects.html)
- [@apostrophecms/piece-page-type](/reference/modules/piece-page-type.html)
- [Server-side events](/reference/server-events.html)