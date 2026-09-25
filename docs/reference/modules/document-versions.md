---
extends: '@apostrophecms/module'
---

# `@apostrophecms/document-versions`

**Alias:** `apos.docVersions`

<AposRefExtends :module="$frontmatter.extends" />

This module records the version history of pages and pieces and provides the **Document Versions** modal, where editors review changes and restore earlier versions. It is part of core and active in every project.

For how versions are recorded, which types have them, and how to mark AI-written saves, see the [Document versions guide](/guide/document-versions.md). This page is the reference for the module's options, data, and server API. The HTTP API is covered in the [Document versions REST API](/reference/api/document-versions.md).

## Options

|  Property | Type | Default | Description |
|---|---|---|---|
| `draftInterval` | Number (milliseconds) | `86400000` (one day) | How long saves keep updating the same draft version, measured from when that version was created. After this interval, the next save that changes something starts a new draft version. Other [handoffs](/guide/document-versions.md#draft-versions) start a new version regardless. |
| `dateTimeFormatOptions` | Object or `null` | `null` | [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) options for version timestamps. When `null`, the list shows a compact date and time, such as "Sep 3 · 2:15 PM", with the year only when it is not the current year. |
| `label` | String | `apostrophe:versionLabel` | The singular name of a version in the UI. |
| `pluralLabel` | String | `apostrophe:versionPluralLabel` | The name used for the context menu entry and the modal title ("Document Versions"). |
| `components.versions` | String | `AposDocVersions` | The Vue component for the versions modal. Set it to replace the modal with a project component. |

<AposCodeBlock>

```javascript
export default {
  options: {
    // Start a new draft version every four hours of continuous work
    draftInterval: 1000 * 60 * 60 * 4,
    dateTimeFormatOptions: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  }
};
```
<template v-slot:caption>
  modules/@apostrophecms/document-versions/index.js
</template>
</AposCodeBlock>

Timestamps are formatted in the language of the admin UI. To control regional formatting, set `intlMapping` on that locale in the `@apostrophecms/i18n` module:

<AposCodeBlock>

```javascript
export default {
  options: {
    locales: {
      en: {
        label: 'English',
        intlMapping: 'en-GB'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/@apostrophecms/i18n/index.js
</template>
</AposCodeBlock>

### The `versions` option of document types

Whether a page or piece type has versions is set on that type's own module, with the `versions` option. See [Which document types have versions](/guide/document-versions.md#which-document-types-have-versions).

## The version record

Each version is one record in the `aposDocsVersions` collection. Read records through [`find`](#find-req-criteria-options) and [`findOne`](#findone-req-criteria-options), which unpack `doc`. Do not query the collection directly.

| Field | Type | Description |
| -- | -- | -- |
| `_id` | String | The version's id. |
| `metaType` | String | Always `'version'`. |
| `docId` | String | The document's `aposDocId`, with no locale or mode. |
| `locale` | String or `null` | The locale, without a mode, such as `en`. `null` for a type that is not localized. |
| `mode` | String | `'draft'` or `'published'`: which copy of the document was saved. A type that is not localized always records `'published'`. |
| `createdAt` | Date | When the version was recorded. For a draft version that became a publication point, the time of the publish. |
| `updatedAt` | Date | When later saves last updated this draft version. Absent if it was never updated. |
| `author` | String | The saving user's `title`, or their `username` if they have no title, as it was at the time. `SYSTEM` for a save with no user. |
| `authorId` | String or `null` | The saving user's `_id`. Compare authors by this field, not by `author`. |
| `ai` | Boolean | Whether the save was [marked as AI-written](/guide/document-versions.md#marking-ai-written-saves). |
| `restoredFrom` | Object | On a restored version only: `{ _id, createdAt }` of the version it restored. |
| `changeCount` | Number | The number of changes from the previous version on the timeline, as the change list counts them. `0` for the first version and for a restored version. |
| `doc` | String | The document as saved, stored compressed. `find` and `findOne` return it unpacked. |

### Querying versions

Because `doc` is stored compressed, MongoDB cannot search inside it. Your criteria can only use the top-level fields in the table above, such as `docId`, `locale`, `mode`, `authorId`, `ai`, and `createdAt`. For example, you can find every version Alice saved of a document, but not every version whose title contained "Sale." To filter on document content, find the versions by their top-level fields, then check `doc` in your own code after `find` has unpacked it.

### Consolidated versions

The versions list sometimes shows several versions as a single entry: a **consolidated version**. It exists to keep AI work and the editor's corrections to it together. Starting or stopping AI involvement always starts a new version, so an AI pass and the hand edits around it are recorded separately. A consolidated version joins them back into one entry, so they read as one step of work.

Consecutive draft versions by one author are consolidated only when at least one was saved with AI and at least one without. Every consolidated version therefore contains AI work. The [guide](/guide/document-versions.md#consolidated-versions) covers the full rules.

A consolidated version is never stored in the collection. It appears only in list results, from the [list route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions) or `getTimelinePage` with `consolidate`. It looks like a normal version record, taking its fields from the newest version it combines, with these differences:

- `versionIds` lists the `_id` of every version it combines, newest first. Only consolidated versions have this field.
- `ai` is always `true`, even when the newest version is a hand edit. To see which changes involved AI, read the `ai` value of each row of the [consolidated change list](/reference/api/document-versions.md#ai-involvement).
- `changeCount` counts the changes across all the combined versions, not just the newest one.

## Featured methods

These methods are the module's public API. The module's other methods support these and may change.

Most of these methods take the request, `req`, as their first argument, as elsewhere in Apostrophe. Depending on the method, `req` determines:

- Whether the user may see the version, for the methods that check permissions (`getOne` and `getVersionChanges`).
- Which related documents are visible when their titles are looked up for display.
- The language of the display text, which is the language of the user's admin UI.

In a task or migration, where there is no request, use `self.apos.task.getReq()`.

### Permissions

Only `getOne` and `getVersionChanges` check permissions. They require the user to be able to **edit** the document, as the REST routes do. Read permission is not enough, because versions include unpublished draft content.

::: warning
The other methods read the versions collection directly and check nothing, even though they take `req`. This includes `find`, `findOne`, `count`, `getTimelinePage`, `getPreviousVersion`, and `getPreviousPublication`. If you show their results to a user, check first that the user can edit the document:

```javascript
// `version` is a record returned by `find` or `findOne`
const canEdit = await self.apos.doc.find(req, { aposDocId: version.docId })
  .locale(`${version.locale}:draft`)
  .archived(null)
  .permission('edit')
  .toCount();
if (!canEdit) {
  throw self.apos.error('notfound');
}
```
:::

### Reading versions

#### `find(req, criteria, options)`

Returns the version records matching the MongoDB `criteria`, newest first, with `doc` unpacked. Checks no [permissions](#permissions).

`options` accepts:

- `limit` and `skip`: numbers.
- `sort`: a MongoDB sort, or `false` for none. Defaults to `{ createdAt: -1 }`.
- `project`: a MongoDB projection.
- `raw`: `true` to return records as stored, with `doc` still packed. Faster when you only need the top-level fields.

#### `findOne(req, criteria, options)`

Returns the first record `find` would return, or `undefined`.

#### `count(req, criteria, options)`

Returns the number of matching records. Accepts the same options as `find`, but ignores `sort` and `project`.

#### `getTimelineCriteria(doc)`

Returns `{ docId, locale }` for a document: the criteria that select its timeline. Pass the result to `find` to read a document's versions:

```javascript
const versions = await self.apos.docVersions.find(
  req,
  self.apos.docVersions.getTimelineCriteria(doc),
  { limit: 5 }
);
```

#### `getTimelinePage(req, criteria, options)`

Returns one page of a timeline, `{ results, next }`, in the same shape as the [list route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions). `options` accepts `before`, a date, and `consolidate`, a boolean. Checks no [permissions](#permissions).

#### `getOne(req, versionId, options)`

Returns one version for display, in the same shape as the [single version route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid). `options` accepts `annotate` and `consolidate`, both booleans. Throws `notfound` unless `req` can edit the document.

#### `getPreviousVersion(req, version)`

Returns the version before `version` on its timeline, or `null` if it is the first.

#### `getPreviousPublication(req, published)`

Returns the publication point that Undo Publish would return the `published` document to. Returns `null` when there is none, or when the current publication point was itself made by Undo Publish.

### Reading changes

These methods compare two copies of the same document and describe the differences. The copies are whole document objects, not ids. In the method signatures, `older` is the earlier copy and `newer` the later one. Each copy can be:

- The `doc` of a version record, from `find` or `findOne`.
- A document you read yourself, for example with `apos.doc.find`. Populated relationships and other properties whose names start with `_` are ignored in the comparison.
- A document you built, such as content about to be imported.

Both copies must be of the same document type, because the comparison follows that type's schema.

#### `getVersionChanges(req, versionId, options)`

Returns the changes a stored version made, compared with the version before it: `{ rows, counts, versionIds, compared }`, in the same shape as the [changes route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid-changes). Rows include their display text, word diff, and formatting changes. `options` accepts `consolidate`. Throws `notfound` unless `req` can edit the document.

Use this method to show the changes of a version. It finds the copies to compare for you.

#### `getChangeList(req, pairs)`

Returns the same kind of change list as `getVersionChanges`, `{ rows, counts }`, for copies of a document that you supply. Use it to show changes that are not a stored version, such as how a draft differs from the published document, or how an import would change a document.

`pairs` is an array of comparisons, each an object with these properties:

| Property | Description |
| -- | -- |
| `older` | The earlier copy of the document. |
| `newer` | The later copy. |
| `ai` | Optional. `true` if the change from `older` to `newer` was AI-written. |

To compare two copies, pass one pair. This lists the unpublished changes in a draft:

```javascript
// `aposDocId` is the document's `aposDocId`, shared by its draft and published copies
const draft = await self.apos.doc.find(req.clone({ mode: 'draft' }), { aposDocId }).toObject();
const published = await self.apos.doc.find(req.clone({ mode: 'published' }), { aposDocId }).toObject();

const { rows, counts } = await self.apos.docVersions.getChangeList(req, [
  {
    older: published,
    newer: draft
  }
]);
```

To describe a series of saves as one list, pass one pair per save, oldest first, where each pair's `newer` is the next pair's `older`. For saves A, B, and C, that is `[ { older: A, newer: B }, { older: B, newer: C } ]`. The result lists the net changes from A to C: a value that changed and then changed back does not appear. This is how consolidated versions are listed.

Each row's `ai` is `'changed'`, `'assisted'`, or `false`, as described in [AI involvement](/reference/api/document-versions.md#ai-involvement). Only the pairs you pass in are considered: AI changes made before the first pair's `older` do not count.

The method checks no [permissions](#permissions) on the documents passed in. Related documents are looked up for display as `req` can see them. It returns an empty list when `pairs` is empty, or when the document's type is no longer in the project.

#### `getChangeRows(req, older, newer)`

Returns the change rows between two copies of a document, without the display text, word diff, and formatting changes that `getChangeList` adds. It is fast, taking a fraction of a millisecond even on a large document. Use it when your code needs to know what changed but will not show it to a user.

#### `addChangeText(req, rows)`

Adds `oldText` and `newText` to rows from `getChangeRows`. The titles of related documents are fetched in one query, as `req` can see them.

#### `getChangeCount(req, doc, previousDoc)`

Returns the number of change rows between two copies of a document. This is the number stored as a version's `changeCount`. Note the argument order: the later copy, `doc`, comes before the earlier one, `previousDoc`.

#### `getAnnotatedDoc(req, older, newer, options)`

Returns a copy of `newer` marked with its changes since `older`, for display. See [The annotated document](/guide/showing-version-changes.md#the-annotated-document) for the markers it sets. If you already have the rows from `getChangeRows`, pass them as `options.rows` to avoid computing them again.

#### `hasVersions(moduleOptions)`

Returns whether a document type with these module options has versions, following the rules of the [`versions` option](/guide/document-versions.md#which-document-types-have-versions).

::: info
`getChangeRows`, `getChangeCount`, and `getAnnotatedDoc` read the schema of the document's type, so that type's module must still be in the project. `getChangeList` and `getVersionChanges` return an empty list instead when it is not.

`getOne` and `getVersionChanges` throw the same errors as the REST routes: `invalid` for a malformed id, and `notfound` for a version that does not exist or that `req` cannot edit. Check `error.name`, as with any `apos.error`.
:::

## Events

| Event | Arguments | Description |
| -- | -- | -- |
| `@apostrophecms/document-versions:beforeInsert` | `req`, `version` | Emitted before a new version record is written. A handler can change the record. Not emitted when a save updates an existing draft version. |

## Save flags

To tell the module how to record a save, add one of these properties to the body of a REST write (`POST`, `PUT`, or `PATCH`) for a page or piece, or set it on a document in a `beforeLocalize` handler. Apostrophe removes the property before storing the document. Server-side code sets the matching flag on `req` instead.

| Body property | Request flag | Effect |
| -- | -- | -- |
| `_explicitSave: true` | `req.aposExplicitSave` | Marks a save the user asked for, as opposed to an autosave. It starts a new draft version if anything changed. The document editor modal sends it on every save. |
| `_restoreVersion: '<versionId>'` | `req.aposRestoreVersion` | Marks the save as a restore of that version. See [Restoring a version](/reference/api/document-versions.md#restoring-a-version). |
| `_ai: true` | `req.aposAi` | Marks the save as AI-written. See [Marking AI-written saves](/guide/document-versions.md#marking-ai-written-saves). |
| None | `req.aposSkipVersion` | Server-side only; never read from a request body. The save records no version. Use it for a save that is a side effect of an operation already recorded. |

Always set a flag on a clone of the request, such as `req.clone({ aposSkipVersion: true })`, so that it does not apply to later saves made with the same request.

## Module tasks

### `set-change-count`

```bash
node app @apostrophecms/document-versions:set-change-count
```

Recomputes the `changeCount` of every version, one timeline at a time. New versions are counted when they are recorded, and the upgrade from the pro extension recounts existing ones, so this is a repair tool. Run it after `convert-legacy-versions` if that task converted any records.

### `convert-legacy-versions`

```bash
node app @apostrophecms/document-versions:convert-legacy-versions
```

Converts version records still in the `@apostrophecms-pro/document-versions` format. A migration of the same name does this once at upgrade. Run the task if older code wrote more legacy records afterward, for instance during a [rolling deployment](/guide/migration/document-versions-migration.md#rolling-deployments).

### `rename-locale`

```bash
node app @apostrophecms/document-versions:rename-locale --old=de-DE --new=de-de
```

Renames a locale in version records only. You do not need it for a normal locale rename: `node app @apostrophecms/i18n:rename-locale` renames version records along with documents. Use this task to repair versions that a rename left behind, such as one done before this module was installed, or without the i18n task.

Like the i18n task, it accepts `--keep=<locale>`. When a document has versions in both locales, `--keep` names the locale whose versions are kept. Without it, the two histories are merged.

## Related documentation

- [Document versions guide](/guide/document-versions.md)
- [Document versions REST API](/reference/api/document-versions.md)
- [Showing version changes in widgets](/guide/showing-version-changes.md)
- [Migrating from `@apostrophecms-pro/document-versions`](/guide/migration/document-versions-migration.md)
