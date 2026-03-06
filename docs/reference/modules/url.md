---
extends: '@apostrophecms/module'
---

# `@apostrophecms/url`

The `@apostrophecms/url` module centralizes URL generation behavior for Apostrophe pages and pieces. It also provides URL metadata collection used by static build pipelines (including Apostrophe + Astro static builds).

## Options

| Property | Type | Default | Description |
|---|---|---|---|
| [`static`](#static) | Boolean | `false` | Enables static-friendly path-based URLs and URL metadata behavior for static generation. |

### `static`

When set to `true`, URL generation for piece-index filtering and pagination switches from query-string format to path-based format.

Examples:

- Query style (default): `/articles?category=tech&page=2`
- Static style: `/articles/category/tech/page/2`

This option also enables URL metadata collection used by static frontends to discover all pages that should be generated.

::: warning
`static: true` affects URL behavior for all frontends connected to the same backend. Make sure your SSR templates and helpers also use URL-safe patterns that work in static mode.
:::

## URL metadata for static builds

The module gathers URL metadata from doc types and event listeners. Static frontends (such as Astro static builds) consume this metadata to determine:

- Which HTML routes should be rendered.
- Which literal files (for example CSS, `robots.txt`, or sitemap XML) should be copied to output.

Doc types that extend page/piece base modules are automatically included.

## Extending metadata from doc types

You can extend document-level metadata by overriding `getUrlMetadata(req, doc)` in page or piece managers.

```javascript
export default {
  extend: '@apostrophecms/page-type',
  extendMethods(self) {
    return {
      async getUrlMetadata(_super, req, doc) {
        const metadata = await _super(req, doc);
        metadata.push({
          url: `${doc._url}/print`,
          type: doc.type,
          aposDocId: doc.aposDocId,
          i18nId: `${doc.aposDocId}.print`,
          _id: doc._id
        });
        return metadata;
      }
    };
  }
};
```

You can also extend `getUrlMetadataQuery(req)` to adjust which documents are considered.

## Adding metadata from non-doc modules

Modules that do not extend a doc type can contribute metadata via the `@apostrophecms/url:getAllUrlMetadata` event.

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

## Metadata entry format

### Document entries

Use these for renderable HTML routes:

- `url` (required)
- `type` (required)
- `aposDocId` (required)
- `i18nId` (required)
- `_id` (required)
- `changefreq` (optional)
- `priority` (optional)
- `sitemap` (optional)

### Literal content entries

Use these for non-HTML files:

- `url` (required)
- `contentType` (required)
- `i18nId` (required)
- `sitemap` (optional; commonly `false`)

`url` values should be relative, prefix-free paths that begin with `/` (for example `/robots.txt`).

## Sitemaps and exclusions

Set `sitemap: false` on metadata entries that should be built but excluded from sitemap output. Typical cases include:

- Paginated filter pages
- CSS or generated text files
- Utility pages such as print views

## Related docs

- [Server-side events](/reference/server-events.html)
- [@apostrophecms/piece-page-type](/reference/modules/piece-page-type.html)
- [ApostropheCMS + Astro static builds tutorial](/tutorials/astro/static-builds-with-apostrophe.html)
