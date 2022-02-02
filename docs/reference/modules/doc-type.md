---
extends: '@apostrophecms/module'
---

# `@apostrophecms/doc-type`

This module establishes the basic structure and functionality for all content documents, including pages and pieces. More specifically, it is the foundation for piece *types* and page *types*. The features below are available on all piece and page types except where they are overridden in the `@apostrophecms/piece-type` and `@apostrophecms/page-type` modules.

This module is almost never configured directly in Apostrophe projects. The only reason to configure this module directly would be to apply the changes to *every* page type and piece type, including those Apostrophe core (e.g., `@apostrophecms/user`, `@apostrophecms/home-page`).

**Extends:** `{{ $frontmatter.extends }}`

## Options

|  Property | Type | Description |
|---|---|---|
| [`autopublish`](#autopublish) | Boolean | Set to `true` to publish all saved edits immediately. |
| [`relatedDocument`](#relateddocument) | Boolean | Assign `true` on a doc-type module (almost always pieces) for those docs to be considered "related documents" in localization. |
| `slugPrefix` | String | A string Apostrophe should prepend to all slugs for a doc type. |

### `autopublish`

Set `autopublish` to `true` to automatically publish any changes saved to docs of this type. There is then effectively no draft mode for this doc type.

The core image and file modules use this option, for example. It eliminates the need for users to think about the distinction between draft and published content while preserving the possibility of translation for different locales.

### `relatedDocument`

When editors localize content, syncing it from one locale to other locales, there is an option to also localize "related documents" (docs connected through [relationship fields](/guide/relationships.md)). Setting this property `true` on a piece-type module will tell Apostrophe to automatically localize those pieces when connected to a document when it is localized using that editor option.

Apostrophe's `@apostrophecms/image` and `@apostrophecms/file` modules have this active. Page types should essentially never be considered "related documents" in this way.

### `slugPrefix`

Document slugs, the `slug` property of content documents, must be unique within a database. Apostrophe will enforce this by adding numbers to the end of a duplicate slug when needed (e.g., `some-slug-0`). Registering a prefix for a doc-type's slugs with `slugPrefix` is another way to prevent duplicate slugs across different doc-types (usually piece types) and also avoid the appended numbers.

For example, the `@apostrophecms/image` module uses the `image-` slug prefix. Image document slugs are not as important as event slugs, so adding the prefix prevents an image from reserving a slug both might have used. An image with filename `2021-company-retreat.jpg` would otherwise have tried to have the same auto-generated slug as an event titled "2021 Company Retreat."

#### Example

<AposCodeBlock>
  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
      slugPrefix: 'pub-'
    },
    // ...
  }
  ```
  <template v-slot:caption>
    modules/publication/index.js
  </template>
</AposCodeBlock>

## Related documentation

- [Content document definition](/reference/glossary.md#doc)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/piece-type/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

### `allowedSchema(req)`
### `async convert(req, input, doc, options)`
### `fieldsPresent(input)`
### `async find(req, criteria, options)`
### `findForEditing(req, criteria, builders)`
### `async findOneForEditing(req, criteria, builders)`
### `async findOneForCopying(req, criteria)`
### `getAutocompleteTitle(doc, query)`
### `inferIdLocaleAndMode(req, _id)`
### `isLocalized()`
### `async isModified(req, draftOrPublished)`
### `async publish(req, draft, options)`
### `newInstance()`
### `async publish(req, draft, options)`
### `async revertDraftToPublished(req, draft, options)`
### `async revertPublishedToPrevious(req, published)`
