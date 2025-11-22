---
extends: '@apostrophecms/module'
---

# `@apostrophecms/doc`

**Alias:** `apos.doc`

<AposRefExtends :module="$frontmatter.extends" />

This module is responsible for managing all documents (Apostrophe "docs") in the `aposDocs` MongoDB collection. It provides core functionality for document operations across all content types in Apostrophe.

The `getManager` method should be used to obtain a reference to the module that manages a particular doc type, allowing you to benefit from behavior specific to that module. The `apos.doc.find()` method returns a query for fetching documents of all types, which is useful when implementing features like the `@apostrophecms/search` module.

## Options

| Property | Type | Description |
|---|---|---|
| `advisoryLockTimeout` | Number | Sets the timeout (in seconds) for document advisory locks. Default is `15` seconds. |

### `advisoryLockTimeout`

Apostrophe locks documents while they are being edited to prevent conflicts when multiple users or browser tabs attempt to edit the same document simultaneously. These locks are refreshed frequently by the browser while held.

By default, if the browser is not heard from for 15 seconds, the lock expires. The browser refreshes the lock every 5 seconds under normal operation. This timeout should be kept relatively short since there is no longer a reliable way to force a browser to unlock a document when leaving the page.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    advisoryLockTimeout: 20
  }
}
```
<template v-slot:caption>
  modules/@apostrophecms/doc/index.js
</template>
</AposCodeBlock>

## Related documentation

- [Content document definition](/reference/glossary.md#doc)
- [Database query guide](/guide/database-queries.md)
- [Localization guide](/guide/localization/dynamic.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/doc/index.js) for all methods that belong to this module.

### `find(req, criteria, builders)`

The `find()` method initiates a database query for documents of any type. Learn more about initiating queries [in the database query guide](/guide/database-queries.md#initiating-the-database-query). This method takes three arguments:

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | Object | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `builders` | Object | The builders object is converted to matching [query builders](/reference/query-builders.md). |

### `getManager(type)`

Returns the module that manages documents of the given `type`. For example, `apos.doc.getManager('article')` would return the module managing article pieces. This allows you to access type-specific methods and behavior.

### `async getAposDocId({ _id, slug, locale })`

Retrieves the `aposDocId` for a document. This is the base identifier shared across all locales and modes of a document. Either `_id` or both `slug` and `locale` must be provided.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `_id` | String | The full document `_id` (e.g., `pfh0haxfpzowht3oi213cqos:fr:draft`) |
| `slug` | String | The document slug (required if `_id` is not provided) |
| `locale` | String | The locale name (required if using `slug`) |

Returns the `aposDocId` string or throws an error if the document is not found.

### `async setAposDocId({ newId, oldId, slug, locale })`

Changes the `aposDocId` of an existing document across all modes (draft, published, and previous). This is useful for re-linking pages across locales when documents were imported rather than localized directly through Apostrophe.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `newId` | String | The new `aposDocId` to assign (required) |
| `oldId` | String | The current `aposDocId` (required if `slug` is not provided) |
| `slug` | String | The document slug (required if `oldId` is not provided) |
| `locale` | String | The locale for which to change the `aposDocId` (required) |

Returns an object containing:
- `oldId`: The original `aposDocId`
- `newId`: The new `aposDocId`
- `locale`: The locale that was modified
- `renamed`: The number of documents that were changed

### `async getLocales(req, _id)`

Determines which locales exist for the given document `_id`. Returns an array of objects with `_id` and `aposLocale` properties for each locale version found. If the user does not have `view-draft` permission, only published versions are returned.

### `deduplicateWidgetIds(doc)`

Ensures all widgets within a document have unique `_id` values. If duplicate or missing widget IDs are found, new unique IDs are generated. This method walks through all areas in the document to check widget IDs.

## Module tasks

### `get-apos-doc-id`

Retrieves the `aposDocId` from either a full `_id` or a combination of `slug` and `locale`. The `aposDocId` is the base identifier that links all locale and mode versions of a document together.

**Usage with `_id`:**
```bash
node app @apostrophecms/doc:get-apos-doc-id --_id=pfh0haxfpzowht3oi213cqos:fr:draft
```

**Usage with slug and locale:**
```bash
node app @apostrophecms/doc:get-apos-doc-id --slug=about-us --locale=fr
```

**Options:**

| Option | Description |
|--------|-------------|
| `--_id` | The full document `_id` including locale and mode (e.g., `pfh0haxfpzowht3oi213cqos:fr:draft`) |
| `--slug` | The document slug (used with `--locale` if `--_id` is not provided) |
| `--locale` | The locale name (required when using `--slug`) |

**Output:**

The task outputs the `aposDocId` to the console. For example:
```
pfh0haxfpzowht3oi213cqos
```

**Use case:**

This task is useful when you need to find the shared identifier for documents across locales, particularly after importing content where locale relationships need to be established.

### `set-apos-doc-id`

Changes the `aposDocId` of an existing document to link it with documents in other locales. This updates the `aposDocId` across all modes (draft, published, and previous) for the specified locale.

**Usage with old ID:**
```bash
node app @apostrophecms/doc:set-apos-doc-id --new-id=tz4a98xxat96iws9zmbrgj3a --old-id=pfh0haxfpzowht3oi213cqos --locale=fr
```

**Usage with slug:**
```bash
node app @apostrophecms/doc:set-apos-doc-id --new-id=tz4a98xxat96iws9zmbrgj3a --slug=about-us --locale=fr
```

**Options:**

| Option | Description |
|--------|-------------|
| `--new-id` | The new `aposDocId` to assign (required) |
| `--old-id` | The current `aposDocId` (required if `--slug` is not provided) |
| `--slug` | The document slug (required if `--old-id` is not provided) |
| `--locale` | The locale for which to change the `aposDocId` (required) |

**Output:**

The task outputs a summary of the changes made:
```
"pfh0haxfpzowht3oi213cqos" has been changed to "tz4a98xxat96iws9zmbrgj3a" for locale "fr", 3 documents changed.
```

**Use case:**

This task is essential when pages have been imported into different locales independently rather than being localized through Apostrophe's built-in localization features. After import, you can use this task to link pages across locales by setting them to share the same `aposDocId`.

#### Example workflow for re-linking imported pages

When pages have been imported separately into multiple locales:

1. Identify corresponding pages in each locale (e.g., the "About Us" page in English and French)
2. Get the `aposDocId` of the page that should be the primary version:
   ```bash
   node app @apostrophecms/doc:get-apos-doc-id --slug=about-us --locale=en
   ```
3. Use the returned `aposDocId` to update the corresponding page in another locale:
   ```bash
   node app @apostrophecms/doc:set-apos-doc-id --new-id=<aposDocId-from-step-2> --slug=a-propos --locale=fr
   ```
4. Repeat for each locale where the page exists

After this process, all versions of the page across locales will share the same `aposDocId`, allowing Apostrophe's locale switcher and localization features to work correctly.

**Important notes:**

- This task only affects documents in the specified locale
- The new `aposDocId` should typically come from an existing document in another locale that represents the same content
- All modes (draft, published, previous) are updated together to maintain consistency
- Use with caution, as changing document identifiers can affect relationships and URL structures