---
extends: '@apostrophecms/piece-type'
---

# `@apostrophecms/image`

**Alias:** `apos.image`

<AposRefExtends :module="$frontmatter.extends" />

This module manages the image library in Apostrophe. Images are [piece-type](/guide/pieces.md) documents with an attachment field restricted to the `images` file group. The module provides template helpers for retrieving images and generating `srcset` attributes for responsive images.

By default, images are autopublished, meaning saved changes are immediately live. This eliminates the need for editors to manage draft and published states for media while still preserving localization support.

## Options

|  Property | Type | Description |
|---|---|---|
| [`insertViaUpload`](#insertviaupload) | Boolean | Defaults to `true`. Enables uploading images directly from the manager modal. |
| [`perPage`](#perpage) | Integer | Defaults to `50`. The number of images fetched per batch via infinite scroll in the manager modal. |
| [`searchable`](#searchable) | Boolean | Defaults to `false`. Images are excluded from search results by default. |
| [`slugPrefix`](#slugprefix) | String | Defaults to `'image-'`. Prefix applied to image slugs. |
| [`sort`](#sort) | Object | Defaults to `{ createdAt: -1 }`. Sort order for the image library. |

### `insertViaUpload`

Defaults to `true`. When enabled, a file upload button is available in the image manager modal, allowing users to upload new images directly. Set to `false` to disable this feature.

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
modules/@apostrophecms/image/index.js
</template>
</AposCodeBlock>

### `perPage`

The number of images fetched per batch via the infinite scroll mechanism in the image manager modal. The image manager is the only piece type manager that currently uses infinite scroll rather than traditional pagination. Defaults to `50`.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    perPage: 100
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/image/index.js
</template>
</AposCodeBlock>

### `searchable`

Defaults to `false` for images, excluding them from Apostrophe's built-in search results. Set to `true` to include images in search.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    searchable: true
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/image/index.js
</template>
</AposCodeBlock>

### `slugPrefix`

Defaults to `'image-'`. This prefix is applied to all image slugs to avoid collisions with other document types.

### `sort`

Defaults to `{ createdAt: -1 }`, sorting images by creation date in descending order (newest first).

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    sort: {
      title: 1
    }
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/image/index.js
</template>
</AposCodeBlock>

## Fields

The image module adds the following fields to each image piece:

| Field | Type | Description |
|---|---|---|
| `attachment` | Attachment | **Required.** The image file itself. Restricted to the `images` file group (`gif`, `jpg`, `png`, `svg`, `webp`). |
| `alt` | String | Alternative text for the image, used for accessibility. |
| `credit` | String | Attribution credit for the image. |
| `creditUrl` | URL | A URL associated with the image credit. |
| `_tags` | Relationship | Tags for organizing images, related to `@apostrophecms/image-tag` pieces. |

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path, e.g., `apos.image.first(within)`.

### `first(within, options)`

A convenience wrapper for [`apos.attachment.first()`](/reference/modules/attachment.md#first-within-options) that automatically filters for image attachments only (equivalent to passing `{ group: 'images' }` in the options). Returns the first image attachment found within the given document or area, or `undefined` if none is found.

Content from the alt text, credit, and credit URL fields is returned in the `_alt`, `_credit`, and `_creditUrl` properties of the attachment object.

| Parameter | Type | Description |
|---|---|---|
| `within` | Object | **Required.** The document or object to search for image attachments. |
| `options` | Object | Optional. Supports the same options as [`apos.attachment.first()`](/reference/modules/attachment.md#first-within-options), except `group` which is preset to `'images'`. |

<AposCodeBlock>

```nunjucks
{% set image = apos.image.first(data.piece) %}
{% if image %}
  <img src="{{ apos.attachment.url(image, { size: 'full' }) }}" alt="{{ image._alt }}">
{% endif %}
```
<template v-slot:caption>
views/show.html
</template>
</AposCodeBlock>

### `all(within, options)`

A convenience wrapper for [`apos.attachment.all()`](/reference/modules/attachment.md#all-within-options) that automatically filters for image attachments only. Returns an array of all image attachments found within the given document or area, or an empty array if none are found.

| Parameter | Type | Description |
|---|---|---|
| `within` | Object | **Required.** The document or object to search for image attachments. |
| `options` | Object | Optional. Supports the same options as [`apos.attachment.all()`](/reference/modules/attachment.md#all-within-options), except `group` which is preset to `'images'`. |

<AposCodeBlock>

```nunjucks
{% set images = apos.image.all(data.piece) %}
{% for image in images %}
  <img src="{{ apos.attachment.url(image, { size: 'one-third' }) }}" alt="{{ image._alt }}">
{% endfor %}
```
<template v-slot:caption>
views/show.html
</template>
</AposCodeBlock>

### `srcset(attachment, cropFields)`

Generates an HTML `srcset` attribute value for responsive images. This produces a comma-separated list of URLs at each configured image size along with their width descriptors, suitable for use in an `<img>` tag's `srcset` attribute.

In most cases you do not need to pass `cropFields`. When images are used via `@apostrophecms/image-widget`, the cropping coordinates are stored in the widget's relationship fields and applied automatically. The `cropFields` parameter is available for advanced cases where you need to manually specify crop dimensions (an object with `top`, `left`, `width`, and `height` properties).

| Parameter | Type | Description |
|---|---|---|
| `attachment` | Object | **Required.** An image attachment object. |
| `cropFields` | Object | Optional. Crop dimensions (`top`, `left`, `width`, `height`). Typically not needed as crop data is applied automatically through image widget relationships. |

<AposCodeBlock>

```nunjucks
{% set image = apos.image.first(data.piece) %}
{% if image %}
  <img
    src="{{ apos.attachment.url(image, { size: 'full' }) }}"
    srcset="{{ apos.image.srcset(image) }}"
    sizes="(max-width: 600px) 100vw, 50vw"
    alt="{{ image._alt }}"
  >
{% endif %}
```
<template v-slot:caption>
views/show.html
</template>
</AposCodeBlock>

### `isCroppable(image)`

Returns `true` if the image attachment has a file extension that supports cropping (i.e., it belongs to the `images` file group and is not an SVG). This is a convenience wrapper for [`apos.attachment.isCroppable()`](/reference/modules/attachment.md#iscroppable-attachment).

| Parameter | Type | Description |
|---|---|---|
| `image` | Object | **Required.** An image piece object. |

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/image/index.js) for all methods that belong to this module.

### `first(within, options)`

Finds and returns the first image attachment within a document or object. This is the same method exposed as a [template helper](#first-within-options).

| Parameter | Type | Description |
|---|---|---|
| `within` | Object | The document or object to search. |
| `options` | Object | Optional. Same options as `apos.attachment.first()` with `group` preset to `'images'`. |

### `all(within, options)`

Finds and returns all image attachments within a document or object. This is the same method exposed as a [template helper](#all-within-options).

| Parameter | Type | Description |
|---|---|---|
| `within` | Object | The document or object to search. |
| `options` | Object | Optional. Same options as `apos.attachment.all()` with `group` preset to `'images'`. |

### `srcset(attachment, cropFields)`

Generates an `srcset` attribute value for responsive images. This is the same method exposed as a [template helper](#srcset-attachment-cropfields).

| Parameter | Type | Description |
|---|---|---|
| `attachment` | Object | An image attachment object. |
| `cropFields` | Object | Optional. Crop dimension fields (`top`, `left`, `width`, `height`). |

### `isCroppable(image)`

Checks whether the given image attachment supports cropping. This is the same method exposed as a [template helper](#iscroppable-image).

| Parameter | Type | Description |
|---|---|---|
| `image` | Object | An image piece object. |

## Related documentation

- [Pieces guide](/guide/pieces.md)
- [`@apostrophecms/piece-type` reference](/reference/modules/piece-type.md)
- [`@apostrophecms/attachment` reference](/reference/modules/attachment.md)
- [Media REST API](/reference/api/media.md)
