---
extends: '@apostrophecms/module'
---

# `@apostrophecms/document-versions`

**Alias:** `apos.docVersions`

<AposRefExtends :module="$frontmatter.extends" />

The `document-versions` module records a history of saves for pages and pieces, and lets editors view what changed and restore an earlier version. It is registered in core, active in every project, and has no project-wide off switch — individual types opt out with the [`versions` option](#the-versions-option) on their own module.

This module replaces the `@apostrophecms-pro/document-versions` extension. If your project still depends on that package, see the [migration guide](/guide/migration/document-versions-migration.md) instead of this reference.

## Terminology

A few terms recur throughout this reference and the related [REST API](/reference/api/document-versions.md) and [widget developer guide](/guide/showing-version-changes.md):

| Term | Meaning |
| -- | -- |
| **Version** | One stored record of a document as it was saved. |
| **Timeline** | All the versions of one document in one locale, newest first. The draft and the published copy of a document share one timeline. |
| **Draft version**, **published version** | A version by its `mode`: what was saved was the draft, or the published document. |
| **Publication point** | A published version, when the point is its role: a state of the document that was live. Undo Publish moves between publication points. |
| **Handoff** | A moment draft work changes hands or kind, where a new draft version starts: Save Draft, another author, AI involvement starting or stopping, a publication point or a restored version before it, or the `draftInterval` running out. Between handoffs, saves update the same draft version. |
| **Restore** | Saving a version's content over the draft. The resulting **restored version** names the version it returned to in `restoredFrom` and shows no changes of its own. |
| **Consolidated version** | Never stored. One list item standing for several consecutive draft versions by one author, some with AI involvement and some without, so a pass of AI work followed by hand corrections reads as one step. It carries `versionIds`, every version it stands for. |
| **Change**, **change row** | One difference between a version and the version before it, at full depth: one value, one added or deleted widget or array item, one change of order. |

## The `versions` option

Whether a type has versions follows from three options on its own module, with `versions` overriding the other two:

| `versions` | `autopublish` | `localized` | Result |
| -- | -- | -- | -- |
| `true` | any | any | Versions |
| unset | unset or `false` | unset or `true` | Versions (pages and pieces by default) |
| unset | `true` | any | No versions |
| unset | any | `false` | No versions |
| `false` | any | any | No versions, with Undo Publish still working (see below) |

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    versions: false
  }
};
```
<template v-slot:caption>
  modules/article/index.js
</template>
</AposCodeBlock>

`versions: false` **keeps Undo Publish working.** A localized type published by hand that sets `versions: false` still records its publications, and only those — at most two per document and locale, the current one and the one before it, which is what Undo Publish returns to. It records no draft versions, has no Document Versions menu entry, and the REST routes answer `notfound` for its documents.

**Types that publish automatically.** With `versions: true`, an `autopublish` type records one published version per save; its draft copy records nothing. In core that includes `@apostrophecms/image`, `@apostrophecms/image-tag`, `@apostrophecms/file`, `@apostrophecms/file-tag`, and the global styles document. `@apostrophecms/user` sets `versions: false`.

**Types that are not localized.** With `versions: true`, a `localized: false` type has versions like any other type. Its documents have no draft, so every save that changes something is a published version, and its records carry `locale: null`.

The version records of a type whose module was later removed from the project stay in the database and stay readable.

## Options

|  Property | Type | Default | Description |
|---|---|---|---|
| `draftInterval` | Number (milliseconds) | `86400000` (one day) | How long draft saves keep updating the same draft version, measured from when that version was created. Past this interval, the next draft save that changes something starts a new version. The other handoffs (see [Terminology](#terminology)) start a new version regardless of the interval. |
| `dateTimeFormatOptions` | Object or `null` | `null` | [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) options for version timestamps. When unset, the list shows a compact day and time ("Sep 3 · 2:15 PM"), including the year only when it is not the current one. |
| `label`, `pluralLabel` | String | `apostrophe:versionLabel`, `apostrophe:versionPluralLabel` | The names used in the context menu and modal title. |
| `components.versions` | String | `AposDocVersions` | The Vue component for the versions modal, for a project that replaces it. |

<AposCodeBlock>

```javascript
// modules/@apostrophecms/document-versions/index.js
module.exports = {
  options: {
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

Timestamps are formatted in the language of the admin UI. Regional formatting comes from the `intlMapping` setting of that locale in the `@apostrophecms/i18n` configuration:

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    locales: {
      en: { label: 'English', intlMapping: 'en-GB' }
    }
  }
};
```
<template v-slot:caption>
  modules/@apostrophecms/i18n/index.js
</template>
</AposCodeBlock>

## The version record

Versions live in the `aposDocsVersions` collection, one record per version, indexed on `{ docId, createdAt }`. Read them through the [module methods](#featured-methods), not directly from the collection — `doc` is stored packed and is never queried into.

| Field | Type | Description |
| -- | -- | -- |
| `_id` | String | The version's id. |
| `docId` | String | The document's `aposDocId` (no locale, no mode). The draft and the published copy of a document share one history. |
| `locale` | String or `null` | The locale without its mode (`en`). `null` for a type that is not localized. |
| `mode` | `'draft'` or `'published'` | What was saved. A document without modes records `published`. |
| `createdAt` | Date | When the version was made. For a draft promoted to a publication point, the publish time. |
| `updatedAt` | Date (optional) | The last in-place update of a draft version. Absent on a version never updated. |
| `author` | String | Display name at the time: the user's title, else username, `SYSTEM` for a save with no user. |
| `authorId` | String or `null` | The user's `_id`. Use this for author comparisons, never the name. |
| `ai` | Boolean | Whether the save was marked as involving AI. See [AI attribution](#ai-attribution-for-integrators). |
| `restoredFrom` | Object (optional) | On a restored version, `{ _id, createdAt }` of the version it returned to. |
| `changeCount` | Number | The number of rows in its change list, against the version before it. `0` for a first version and for a restored version. |
| `doc` | String | The document as saved, packed: base64 of the gzipped Extended JSON. Unpacked automatically by `find`/`findOne`. |

A **consolidated version** is never stored. It is built on read from several consecutive versions and has the fields of its newest version, `ai: true`, its own `changeCount`, and `versionIds`, the `_id` of every version it stands for, newest first. Consecutive draft versions by one author, with no restore among them, consolidate when they include both a version saved with AI and one saved without.

## Featured methods

The following methods belong to this module and may be useful in project-level code. Every method that reads takes `req` first.

### Reading versions

#### `find(req, criteria, options)`

Returns version records, newest first, with `doc` unpacked. `options` supports `limit`, `skip`, `sort` (`false` for none), `project`, and `raw: true` to get the records as stored. Performs no permission check — see `getOne` for a permission-checked read.

#### `findOne(req, criteria, options)`

The first matching version record, per the criteria and options of `find`.

#### `count(req, criteria, options)`

The number of matching version records. Takes the options of `find` other than `sort` and `project`.

#### `getTimelineCriteria(doc)`

Returns `{ docId, locale }` for a document — the criteria that select its timeline.

#### `getTimelinePage(req, criteria, options)`

Returns one page of a timeline in the shape of the [list route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions): `{ results, next }`. `options` supports `before` and `consolidate`.

#### `getOne(req, versionId, options)`

Returns one version for display, in the shape of the [read-one route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid). `options` supports `annotate` and `consolidate`. Checks that `req` can edit the document.

#### `getPreviousVersion(req, version)`

Returns the version before the given one on its timeline, or `null`.

#### `getPreviousPublication(req, published)`

Returns the publication point that Undo Publish would return to, or `null`.

### Reading changes

#### `getVersionChanges(req, versionId, options)`

Returns `{ rows, counts, versionIds }` for a stored version, with text, word diff, and formatting changes, in the shape of the [changes route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid-changes). `options` supports `consolidate`. Checks that `req` can edit the document. Use this to present the changes of a stored version.

#### `getChangeList(req, pairs)`

Returns `{ rows, counts }` for any contents of one document, without a stored version behind it. `pairs` is an array of `{ older, newer, ai }`, oldest first: one pair compares two contents, and several pairs list consecutive saves as one change list, each row flagged `ai` when a pair saved with AI changed it. Performs no permission check on the contents passed in; related documents are read as `req` sees them. Returns an empty result when `pairs` is empty, or for a type whose module is no longer in the project.

Use this to present changes that are not a stored version — a draft compared against what is published, or a document compared against an import.

#### `getChangeRows(req, older, newer)`

Returns the rows between any two stored contents of one document, without text. Pure and fast: a fraction of a millisecond on a large document.

#### `addChangeText(req, rows)`

Adds `oldText` and `newText` to change rows. Resolves the titles of related documents in one query, as `req` sees them.

#### `getChangeCount(req, doc, previousDoc)`

The number of change rows between two document contents.

#### `getAnnotatedDoc(req, older, newer, options)`

Returns a copy of `newer` marked up with its changes for display. See [Widget developers: showing what changed](/guide/showing-version-changes.md) for what the markers mean and how to use them in templates.

#### `hasVersions(moduleOptions)`

Returns whether a doc type's options give it versions, per the [`versions` option](#the-versions-option) logic.

`getChangeRows`, `getChangeCount`, and `getAnnotatedDoc` read the schema of the document's type, so its module must still be in the project; `getChangeList` and `getVersionChanges` return an empty result when it is not.

`getVersionChanges` and `getOne` throw the same errors the REST routes answer with: `invalid` for a malformed id, `notfound` for a version that does not exist or that `req` may not see.

::: info
The methods listed here are the module's public API. Its other methods serve these and may change between releases.
:::

## Events

| Event | Arguments | When |
| -- | -- | -- |
| `@apostrophecms/document-versions:beforeInsert` | `req, version` | Emitted before a new version record is written. The record can be amended in a handler. Not emitted when an existing draft version is updated in place. |
| `@apostrophecms/doc:afterChangeDocIds` | `pairs, options` | Emitted after `apos.doc.changeDocIds` rewrites document ids (`options` includes `keep` and `skipReplace`). The versions module uses this to make a document's history follow it when its id changes; any other module that stores document ids can do the same. |

## Save flags

The module decides what to record from flags on `req`. `apos.doc.setSaveFlags(req, input)` sets these flags from virtual properties of a document being saved and removes those properties so they are never stored. Core calls it on every REST write body (`POST`, `PUT`, `PATCH` of pages and pieces) and on a localized document after `beforeLocalize`.

| Body property | Request flag | Meaning |
| -- | -- | -- |
| `_explicitSave: true` | `req.aposExplicitSave` | A save the user asked for, not an autosave: always starts a new draft version when something changed. The editor's Save Draft action sends this. |
| `_restoreVersion: <versionId>` | `req.aposRestoreVersion` | The save is a restore of that version. See [Restoring a version](/reference/api/document-versions.md#restoring-a-version). |
| `_ai: true` | `req.aposAi` | The content of the save was written by an AI tool. See [AI attribution](#ai-attribution-for-integrators). |
| _(none — server side only)_ | `req.aposSkipVersion` | Never read from a request body. The save records no version, for a save that is a side effect of an operation already recorded elsewhere. Set it on a request clone, `req.clone({ aposSkipVersion: true })`, so it does not leak into later saves of the same request. |

## AI attribution for integrators

A version is marked `ai: true` when the save that produced it was marked as AI involvement. Apostrophe cannot detect this on its own — the code that writes AI-generated content has to say so. The mark drives three things: the "with AI" wording and badge in the versions list, the rule that AI work and hand-typed work become separate versions, and the per-change AI badges of a consolidated version.

**Over REST**, add `_ai: true` to the body of the write. It is stripped before the document is stored:

<AposCodeBlock>

```javascript
await apos.http.patch(`${action}/${doc._id}`, {
  body: {
    seoDescription: generated,
    _ai: true
  },
  draft: true
});
```
<template v-slot:caption>
  A REST write with AI attribution
</template>
</AposCodeBlock>

**On the server**, save under a request clone that carries the flag, so other saves in the same request are not marked:

<AposCodeBlock>

```javascript
const aiReq = req.clone({ aposAi: true });
await self.apos.doc.update(aiReq, doc);
```
<template v-slot:caption>
  Server-side AI attribution
</template>
</AposCodeBlock>

**In a `beforeLocalize` handler**, set `_ai: true` on the draft being localized. Core reads it after the handlers run. Apostrophe's own automatic translation feature does this when the translation provider actually wrote at least one field.

**What counts as AI involvement.** Mark a save when a tool wrote content into the document without the editor typing it: a translation, a generated summary saved directly, a bulk rewrite. Do not mark a save for content the editor reviewed and accepted in a form before saving — accepting a suggestion is the editor's own edit, and it is saved along with their other changes.

Over REST, the flag is a claim made by the client, available to anyone who can write the document. It is an editorial disclosure, not a security boundary.

## Related core API added with this feature

A few small additions to core support document versions and may be useful beyond it:

- `apos.attachment.addDocSource(name, fn)` registers a store of documents outside `aposDocs` whose attachments must be counted when attachment references are recomputed. `fn(work)` hands each of its documents to `work`. The versions module registers itself this way, since attachments referenced only by old versions still need to count as in use.
- The `attachment` field type gained an `isEqual`: two attachment values are equal when they hold the same attachment `_id` and the same `crop`. Every reader of `apos.schema.isEqual` and `getChanges` follows it, so a draft with an attachment field no longer reads as modified after a save that changes nothing.
- `apos.doc.replaceDocIdReferences(doc, options)` replaces an `aposDocId` wherever a document holds it — as a page `path` segment, as a value, and as an object key (per-relationship field storage). Takes `{ oldId, newId }` and returns whether anything changed.
- `AposSchema` gained a scoped slot, `beforeField`, inside each field's wrapper ahead of the input, receiving `field`.
- `AposModalRail` takes a `collapsible` prop.
- `useAdvisoryLock` in `@apostrophecms/ui` is the Composition API counterpart of `AposAdvisoryLockMixin`.

## Module tasks

| Task | Description |
| -- | -- |
| `node app @apostrophecms/document-versions:set-change-count` | Recomputes the edit count of every version, one timeline at a time. A repair tool: an upgrade from the pro module recounts existing versions on its own, and new versions are counted as they are recorded. Run it after `convert-legacy-versions` when that task had records to convert. |
| `node app @apostrophecms/document-versions:convert-legacy-versions` | Converts version records still in the `@apostrophecms-pro/document-versions` format. The database migration of the same name does this once at upgrade; run the task by hand when old code wrote more records afterward — for instance, an instance still running the previous release during a rolling deployment. |
| `node app @apostrophecms/document-versions:rename-locale --old=<oldLocale> --new=<newLocale> [--keep=<localeName>]` | Not needed for a normal rename: `node app @apostrophecms/i18n:rename-locale` renames version records along with documents, with the same `--keep` rule. This task does the versions half alone, for version records a rename left behind — for example, versions created before the module was installed, or written by other means than that task. |

## Known limits

- **No retention policy.** Versions are kept until their document is deleted in that locale. Draft capture makes the collection grow faster than publish-only history did; packed storage offsets part of that growth.
- **No project-wide off switch.** Types opt out one by one with `versions: false`, and keep the two publication points Undo Publish needs.
- **A widget moved from one area to another** reads as deleted in the first area and added in the second, not as moved. The Moved change type is for a change of place within one area or array.
- **Rich text marks are words only**, falling back to a plain "Modified" marker for formatting-only changes, rebuilt tables and lists, and rewrites past about a thousand changed words. See [Rich text marks](/guide/showing-version-changes.md#rich-text-marks).
- **A save that takes a document out of the archive** records nothing, even if it also edits fields; the next save records the difference.
- **An id repair** (`apos.doc.changeDocIds`, used only by tasks and migrations) rewrites the id in every version that holds it, which reads the whole `aposDocsVersions` collection once per renamed id.
- **Project field types extending `array` or `object`** are read by the history, but core's schema composition does not accept `fields: { add }` for them — they must provide a ready `schema`. This is a limit of custom field types in general, not specific to versions. See [Project field types](/guide/showing-version-changes.md#project-field-types).

## Related documentation

- [Document Versions REST API](/reference/api/document-versions.md)
- [Widget developers: showing what changed](/guide/showing-version-changes.md)
- [Migrating from `@apostrophecms-pro/document-versions`](/guide/migration/document-versions-migration.md)
