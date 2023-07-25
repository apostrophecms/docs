---
extends: '@apostrophecms/module'
---

# `@apostrophecms/doc-type`

<AposRefExtends :module="$frontmatter.extends" />

This module establishes the basic structure and functionality for all content documents, including pages and pieces. More specifically, it is the foundation for piece *types* and page *types*. The features below are available on all piece and page types except where they are overridden in the `@apostrophecms/piece-type` and `@apostrophecms/page-type` modules.

This module is almost never configured or extended directly in Apostrophe projects. The only reason to configure this module directly would be to apply the changes to *every* page type and piece type, including those Apostrophe core (e.g., `@apostrophecms/user`, `@apostrophecms/home-page`). Project-level doc types should extend either `@apostrophecms/piece-type` or `@apostrophecms/page-type` instead.

## Options

|  Property | Type | Description |
|---|---|---|
| [`relatedDocument`](#relateddocument) | Boolean | Assign `true` on a doc-type module (almost always pieces) for those docs to be considered "related documents" in localization. |
| `slugPrefix` | String | A string Apostrophe should prepend to all slugs for a doc type. Only applicable to piece-type modules. |

### `relatedDocument`

When editors localize content, syncing it from one locale to other locales, there is an option to also localize "related documents" (docs connected through [relationship fields](/guide/relationships.md)). If this option is `true`, the type is selected by default for localization when related to a piece or page being localized. This is the default setting for `@apostrophecms/image` and `@apostrophecms/file`.

If this option is `null`, the type is offered for localization when related to a piece or page being localized, but not selected by default. This is the default setting for all other piece types.

If this option is `false`, the type is *never* offered for localization when related to a piece or page being localized. This is the default setting for `@apostrophecms/page-type`.

### `slugPrefix`

Document slugs, the `slug` property of content documents, must be unique within a database. Apostrophe will enforce this by adding numbers to the end of a duplicate slug when needed (e.g., `some-slug-0`). Registering a prefix for a piece type's slugs with `slugPrefix` is another way to prevent duplicate slugs across different piece types and also avoid the appended numbers. This should not be used for page types.

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

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/doc-type/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

This module is meant as a base class for more specific content modules. As such, the methods should be used from those content modules, not directly from this one.

### `allowedSchema(req)`

Returns a new version of the doc type's schema containing only fields that the current user (`req.user`) has permission to edit.

### `async convert(req, input, doc, options)`

Process untrusted data supplied in an `input` object using the doc type's schema and update the `doc` object accordingly. This does not save anything to the database by itself.

If `options.presentFieldsOnly` is `true`, only fields that exist in `input` are affected. The default is `false`, which applies default values to any fields not already in `input`. To intentionally erase a field's contents when this option is present, use `null` for that input field or another representation appropriate to the type (an empty string for a string field).

If `options.copyingId` is present and assigned to a document `_id`, the doc with the given ID is fetched and used as the default values for any schema fields not defined in `input`. This overrides `presentFieldsOnly` as long as the fields in question exist in the doc being copied. The `_id` of the copied doc is added as the `copyOfId` property of the `doc` object.

### `fieldsPresent(input)`

Returns an array with the names of all doc type schema fields present in the `input` object.

### `async find(req, criteria, builders)`

The `find()` method initiates a database query. Learn more about initiating queries [in the database query guide](/guide/database-queries.md#initiating-the-data-query). This method takes three arguments:

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | Object | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `builders` | Object | The builders object is converted to matching [query builders](/reference/query-builders.md). |

### `findForEditing(req, criteria, builders)`

Returns a query that finds documents the current user (based on the `req` request object) can edit. Unlike `find()`, this query defaults to including docs in the archive.

`criteria` is a MongoDB criteria object as in `find()`. The `builders` argument should be an object of query builders, in the same style as the [module option of the same name](#builders).

### `async findOneForEditing(req, criteria, builders)`

`findOneForEditing()` is wrapper for `findForEditing()` that returns a single document matching the arguments, not simply a query.

### `inferIdLocaleAndMode(req, _id)`

This method is a wrapper for the `@apostrophecms/i18n` module [method of the same name](/reference/modules/i18n.md##inferidlocaleandmode-req-id). If the doc type is a piece type that is not localized, this will simply return the `_id`.

### `async isModified(req, doc)`

Returns `true` if the provided draft (`doc`) has been modified from the published version of the same document. If the draft has no published version it is always considered modified.

For convenience, you may also pass the published document version as `doc`. In this case the draft version is found and compared to the provided published version.

### `newInstance()`

This method returns an new document object with appropriate default values for the doc type's schema fields. This is useful as a starting point for programmatically constructed documents.

### `async publish(req, draft, options)`

When passed a `req` object and *draft* document object (`draft`), this method will publish the draft. This replaces an existing published version of the document, if there is one. It returns the draft doc with the `lastPublishedAt` and `modified` properties updated.

If `options.permissions` is explicitly set to `false`, permissions checks are bypassed. If `options.autopublishing` is true, then the `edit` permission is sufficient, otherwise the `publish` permission is checked for.

### `async revertDraftToPublished(req, draft, options)`

Reverts the given draft document (`draft`) to the most recent publication, clearing any changes. It returns the draft's new value, or `false` if the draft was not modified from the published version or no published version exists yet.

If the `options` object contains an `overrides` object, properties of the `overrides` object will be applied to the draft document before it is updated in the database.

Emits the [`afterRevertDraftToPublished` event](/reference/server-events.md#afterrevertdrafttopublished) before returning, which includes a payload object containing the draft document.

### `async revertPublishedToPrevious(req, published)`

Reverts a published document (`published`) to the previous published state and returns the updated published state. If this was already done (only one previous state is saved) or there is no previous publication, it throws an `invalid` exception.

Emits the [`afterRevertPublishedToPrevious` event](/reference/server-events.md#afterrevertpublishedtoprevious) before returning, which includes a payload object containing the published document.
