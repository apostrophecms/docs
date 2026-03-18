---
extends: '@apostrophecms/piece-type'
---

# `@apostrophecms/file`

**Alias:** `apos.file`

<AposRefExtends :module="$frontmatter.extends" />

This module establishes a library of uploaded files in Apostrophe, which may be of any type acceptable to the [`@apostrophecms/attachment`](/reference/modules/attachment.md) module. Together with [`@apostrophecms/file-widget`](/reference/modules/widget-type.md), it provides a way to add downloadable PDFs and other documents to a website and to manage a library of them for reuse.

Files are autopublished, meaning saved changes are immediately live. This eliminates the need for editors to manage draft and published states for uploaded files while still preserving localization support.

## Options

|  Property | Type | Description |
|---|---|---|
| [`insertViaUpload`](#insertviaupload) | Boolean | Defaults to `true`. Enables uploading files directly from the manager modal. |
| [`prettyUrls`](#prettyurls) | Boolean | Defaults to `false`. Enables human-readable file URLs. |
| [`prettyUrlDir`](#prettyurldir) | String | Defaults to `'/files'`. The URL path prefix for pretty URLs. |
| [`slugPrefix`](#slugprefix) | String | Defaults to `'file-'`. Prefix applied to file slugs. |

### `insertViaUpload`

Defaults to `true`. When enabled, a file upload button is available in the file manager modal, allowing users to upload new files directly. Set to `false` to disable this feature.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    insertViaUpload: false
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/file/index.js
</template>
</AposCodeBlock>

### `prettyUrls`

Defaults to `false`. When set to `true`, files are served at human-readable URLs based on their slug, rather than the default uploadfs URL. For example, a file with the slug `file-annual-report` and a `.pdf` extension would be available at `/files/annual-report.pdf` (with the `slugPrefix` stripped from the URL).

The pretty URL route streams the file content from the underlying uploadfs storage, so the file is still stored in the same location. There is a slight performance penalty for using this option, as each request is proxied through the Node.js process rather than being served directly by the storage backend or CDN.

As of 2026-03-18, this feature is temporarily incompatible with Astro static builds.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    prettyUrls: true
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/file/index.js
</template>
</AposCodeBlock>

### `prettyUrlDir`

Defaults to `'/files'`. Sets the URL path prefix used when [`prettyUrls`](#prettyurls) is enabled. Only takes effect when `prettyUrls` is `true`.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    prettyUrls: true,
    prettyUrlDir: '/downloads'
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/file/index.js
</template>
</AposCodeBlock>

### `slugPrefix`

Defaults to `'file-'`. This prefix is applied to all file slugs to avoid collisions with other document types.

## Fields

The file module adds the following fields to each file piece:

| Field | Type | Description |
|---|---|---|
| `attachment` | Attachment | **Required.** The uploaded file. Accepts any file type in the configured file groups. |
| `description` | String (textarea) | A description of the file. |
| `credit` | String | Attribution credit for the file. |
| `creditUrl` | URL | A URL associated with the file credit. |
| `_tags` | Relationship | Tags for organizing files, related to `@apostrophecms/file-tag` pieces. |

## Interesting properties

These properties are automatically available on file piece objects when they are loaded.

### `_url`

Each file piece automatically receives a `_url` property containing a URL that can be used to download the file. If [`prettyUrls`](#prettyurls) is enabled, this will be a human-readable URL; otherwise it will be the standard uploadfs URL for the attachment.

### `attachment`

The `attachment` property contains the attachment object for the file. This object includes metadata such as the file extension, name, and size. It can be passed to [`apos.attachment.url()`](/reference/modules/attachment.md#url-attachment-options) to generate a URL, although in most cases the `_url` property on the file piece itself is more convenient.

## Related documentation

- [Pieces guide](/guide/pieces.md)
- [`@apostrophecms/piece-type` reference](/reference/modules/piece-type.md)
- [`@apostrophecms/attachment` reference](/reference/modules/attachment.md)
- [Widget type reference](/reference/modules/widget-type.md)
