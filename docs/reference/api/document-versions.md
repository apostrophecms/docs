# Document versions REST API

The [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module provides routes to list a document's versions, read one version, and read the changes a version made. For the concepts used on this page, such as timelines, publication points, and consolidated versions, see the [Document versions guide](/guide/document-versions.md).

Every route requires permission to edit the document. The routes answer `notfound` for a document the user cannot edit, and for a document whose type has no versions. Authenticate as you would for any other REST route, for example with an [API key](/reference/api/authentication.md#api-keys) for a role that can edit the document.

## Endpoints

| Method | Path | Description |
|---------|---------|---------|
|`GET` | [`/api/v1/@apostrophecms/document-versions`](#get-api-v1-apostrophecms-document-versions) | List the versions of a document |
|`GET` | [`/api/v1/@apostrophecms/document-versions/:versionId`](#get-api-v1-apostrophecms-document-versions-versionid) | Get one version, with its document |
|`GET` | [`/api/v1/@apostrophecms/document-versions/:versionId/changes`](#get-api-v1-apostrophecms-document-versions-versionid-changes) | Get the changes a version made |

There is no restore route. To restore a version, save its content to the document's own REST route. See [Restoring a version](#restoring-a-version).

## `GET /api/v1/@apostrophecms/document-versions`

Lists the versions on a document's timeline, newest first, 10 at a time.

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`docId` | `?docId=ckx...:en:draft` | **Required.** The `_id` of the document, in either mode. The locale in the `_id` selects which locale's timeline to list. |
|`before` | `?before=2026-09-01T09:02:44.009Z` | Lists versions older than this date. Pass the `next` value of the previous response to get the next page. Omit it for the first page. |
|`consolidate` | `?consolidate=1` | Returns [consolidated versions](/guide/document-versions.md#consolidated-versions) as single items. This is how the versions modal lists them. |

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/@apostrophecms/document-versions?docId=ckitdo5oq004pu69kr6oxo6fr:en:draft&consolidate=1&apikey=myapikey', {
  method: 'GET'
});
const { results, next } = await response.json();

// The next page: pass `next` as `before`
if (next) {
  const nextPage = await fetch(`http://example.net/api/v1/@apostrophecms/document-versions?docId=ckitdo5oq004pu69kr6oxo6fr:en:draft&consolidate=1&before=${encodeURIComponent(next)}&apikey=myapikey`, {
    method: 'GET'
  });
}
```

### Response

```json
{
  "results": [
    {
      "_id": "cm1...",
      "createdAt": "2026-09-03T14:15:02.113Z",
      "updatedAt": "2026-09-03T14:40:51.870Z",
      "mode": "draft",
      "author": "Alice Martin",
      "authorId": "cku...",
      "ai": true,
      "changeCount": 4,
      "versionIds": [ "cm1...", "cm0...", "clz..." ],
      "live": true
    }
  ],
  "next": "2026-09-01T09:02:44.009Z"
}
```

| Property | Description |
|----------|-------------|
| `results` | The versions, newest first. Each has these fields of the [version record](/reference/modules/document-versions.md#the-version-record): `_id`, `createdAt`, `updatedAt`, `mode`, `author`, `authorId`, `ai`, `restoredFrom`, and `changeCount`. `updatedAt` and `restoredFrom` appear only on versions that have them. |
| `results[].versionIds` | Consolidated versions only: the `_id` of every version the item stands for, newest first. The item's own `_id` is that of its newest version. |
| `results[].live` | On the newest item of the first page only, when its content is what the document's draft holds now. Restoring it would change nothing. |
| `next` | The value to pass as `before` to get the next page, or `null` on the last page. |

With `consolidate=1`, a page can read past 10 versions so that a consolidated version is never split across two pages.

## `GET /api/v1/@apostrophecms/document-versions/:versionId`

Returns one version, including its document. The document is loaded as a normal find would load it: relationships and areas are populated, and fields added to the schema since the version was saved are present with their default values.

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`annotate` | `?annotate=1` | Returns the document marked with the changes this version made, for display. See [The annotated document](/guide/showing-version-changes.md#the-annotated-document). A first version and a restored version have no changes and come back unmarked. |
|`consolidate` | `?annotate=1&consolidate=1` | With `annotate`, when `:versionId` is the newest version of a consolidated version: marks the changes of every version it stands for, including where AI was involved. |

### Request example

```javascript
// Request inside an async function.
// Read the version as stored:
const response = await fetch('http://example.net/api/v1/@apostrophecms/document-versions/cm1e9kq2v0003xyz8a1b2c3d4?apikey=myapikey', {
  method: 'GET'
});
const version = await response.json();

// Or, for display, marked with its changes:
const annotated = await fetch('http://example.net/api/v1/@apostrophecms/document-versions/cm1e9kq2v0003xyz8a1b2c3d4?annotate=1&apikey=myapikey', {
  method: 'GET'
});
```

### Response

The same fields as a list item, plus `doc`, the document object.

::: warning
An annotated document is for display only. Never save it back to the document. To restore a version, read it without `annotate`.
:::

## `GET /api/v1/@apostrophecms/document-versions/:versionId/changes`

Returns the changes between a version and the version before it on the timeline.

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`consolidate` | `?consolidate=1` | When `:versionId` is the newest version of a consolidated version: returns the changes of every version it stands for, as one list, with each row's `ai` showing AI's part in it. For any other version, the parameter has no effect. |

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/@apostrophecms/document-versions/cm1e9kq2v0003xyz8a1b2c3d4/changes?consolidate=1&apikey=myapikey', {
  method: 'GET'
});
const { rows, counts } = await response.json();
```

### Response

```json
{
  "rows": [ /* change rows, see below */ ],
  "counts": { "added": 1, "modified": 3, "deleted": 0, "ai": 2 },
  "versionIds": [ "cm1..." ],
  "compared": true
}
```

| Property | Description |
|----------|-------------|
| `rows` | The changes, in schema order. See [The change row](#the-change-row). |
| `counts` | The number of rows of each change type, and the number of rows AI was involved in (`ai` is `'changed'` or `'assisted'`). |
| `versionIds` | The versions the list covers, newest first: the one requested, or with `consolidate`, all the versions of its consolidated version. |
| `compared` | `false` when the version has nothing to be compared with: it is the first version, or a restored version. `true` otherwise. A compared version can still have no rows, when its saves ended exactly where the version before it left off, such as an edit that was undone. It stays in the timeline because it records saves that happened. |

### The change row

Each row is one change, at its full depth: one changed value, one added or deleted widget or array item, or one change of order in an area or array.

```json
{
  "path": [
    { "name": "main", "label": "Content" },
    { "name": "cm0w...", "label": "Hero", "title": "Autumn sale", "ordinal": 2, "widgetType": "hero" },
    { "name": "heading", "label": "Heading" }
  ],
  "type": "modified",
  "fieldType": "string",
  "kind": "leaf",
  "old": "Autumn sale",
  "new": "Autumn sale starts Friday",
  "oldText": "Autumn sale",
  "newText": "Autumn sale starts Friday",
  "diff": [
    { "text": "Autumn sale", "change": "same" },
    { "text": " starts Friday", "change": "added" }
  ],
  "ai": false
}
```

| Property | Description |
| -- | -- |
| `path` | Where the change is, as a breadcrumb from the top-level field down. See [Path segments](#path-segments). |
| `type` | `added`, `modified`, or `deleted`. For a widget, an array item, or an object, `added` or `deleted` means it exists in only one version, and no rows are listed inside it. For a single value, `added` means the older value was empty and `deleted` means the newer one is. |
| `kind` | The structure of the change: `leaf`, `richText`, `object`, `relationship`, `widget`, `arrayItem`, or, for a change of order, `area` or `array`. **Test `kind`, not `fieldType`, in code.** |
| `fieldType` | The field type as the schema names it, including a custom type's own name. `widget` or `arrayItem` for a whole widget or item, and `richText` for the content of a rich text widget. For display. |
| `old`, `new` | The stored values. The missing side is absent on an added or deleted row. A relationship's values are arrays of ids. An order row's values are the ids of the items both versions have, in each version's order. |
| `oldText`, `newText` | The same values as readable text, in the language of the admin UI. See [Display text](#display-text). |
| `diff` | A word-by-word diff of `oldText` and `newText`: an array of `{ text, change }`, where `change` is `same`, `added`, or `removed`. |
| `formatChanges` | Rich text rows only, when formatting changed in ways the word diff does not show. See [Formatting changes](#formatting-changes). |
| `images` | Relationship rows only, when every related document on a side is an image: `{ old, new }`, each an array of `{ text, href, change }` for showing thumbnails. |
| `ai` | AI's part in this change. See [AI involvement](#ai-involvement). |

#### Path segments

Each segment of `path` has a `name` and a `label`. Labels may be i18n keys, as they are in the schema.

| Segment | Properties |
| -- | -- |
| A schema field | `name` is the field name. `label` is the field label. |
| An array item | `name` is the item's `_id`. `label` is the text of the array's `titleField`, else of the item's `title` field, else `#n`. `ordinal` is its 1-based position. |
| A widget | `name` is the widget's `_id`. `label` is the widget type's label. `title` is the text of the type's [`titleField`](/guide/showing-version-changes.md#titlefield-name-your-widgets), when it has one. `ordinal` is its 1-based position, and `widgetType` its type. |

#### Display text

`oldText` and `newText` describe each value the way an editor would recognize it:

- A select, radio, or checkboxes value reads as the label of its choice.
- A relationship reads as the titles of the related documents.
- An attachment reads as its file name.
- Rich text reads as plain text.
- A box field reads as its sides, such as "Top 10px, Left 20px."
- A number includes its field's `unit`.
- An array item or widget reads as its title.
- A change of order lists the items in each order.

The text is empty when a value has no text form. The versions modal then shows the change type alone.

#### Formatting changes

Some rich text changes appear in the word diff, `diff`, as words removed and added again in their new form: bold, italic, splitting or merging paragraphs, and changing a block's kind, such as a paragraph turned into a heading. They are not repeated here, unless the texts are too long to compare word by word.

Other formatting changes, such as links, alignment, and images, are listed in `formatChanges`, an array with one entry per change:

| Property | Description |
| -- | -- |
| `change` | An internal identifier for the kind of formatting change. Display `label` instead. |
| `type` | `added`, `modified`, or `deleted`. |
| `label` | What changed, in words, such as "Link", "Alignment", or "Image". |
| `text` | The words affected, shortened to one line. For an image's alt text, style, or link, the image's title. |
| `href` | With an image title in `text`: the image's URL, when it can be opened. |
| `old`, `new` | Each side's value, `{ text, href?, url? }`. `href` is an image's URL, and `url` is the page URL of a document an internal link points to, with the document's title as `text`. Both are omitted for changes with nothing to compare, such as a table's layout. |

#### AI involvement

A row's `ai` property shows AI's part in the change, based on the versions that made it:

| Value | Meaning |
| -- | -- |
| `'changed'` | The last save to make this change was [marked as AI-written](/guide/document-versions.md#marking-ai-written-saves). |
| `'assisted'` | A person made the last change here, after AI had changed it earlier. That earlier AI change can be in the same consolidated version, in the entry just before it in the list, or in a first version saved with AI. |
| `false` | AI was not involved. |

Test it for truthiness to find every change AI was involved in. The version record's own `ai` field stays a boolean: it describes one save, while a row's `ai` describes one change.

## Restoring a version

There is no restore route. To restore a version, `PUT` its document to the document's own REST route in draft mode, with `_restoreVersion` set to the version's `_id`.

### Request example

```javascript
// Request inside an async function.
const versionId = 'cm1e9kq2v0003xyz8a1b2c3d4';

// 1. Read the version as stored, without `annotate`
const versionResponse = await fetch(`http://example.net/api/v1/@apostrophecms/document-versions/${versionId}?apikey=myapikey`, {
  method: 'GET'
});
const version = await versionResponse.json();

// 2. Save its content over the article's draft, naming the version
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr:en:draft?apikey=myapikey&aposMode=draft', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...version.doc,
    _restoreVersion: versionId
  })
});
const draft = await response.json();
```

The same restore from admin UI code, using `apos.http`:

<AposCodeBlock>

```javascript
// `doc` is the document, here an article
const versionsAction = apos.modules['@apostrophecms/document-versions'].action;
const docAction = apos.modules.article.action;

// 1. Find the version to restore
const { results } = await apos.http.get(versionsAction, {
  qs: { docId: doc._id }
});
const versionId = results[2]._id;

// 2. Read it as stored, without `annotate`
const version = await apos.http.get(`${versionsAction}/${versionId}`, {});

// 3. Save its content over the draft, naming the version
await apos.http.put(`${docAction}/${doc._id}`, {
  body: {
    ...version.doc,
    _restoreVersion: versionId
  },
  draft: true
});
```
<template v-slot:caption>
  Restoring a version from admin UI code
</template>
</AposCodeBlock>

`_restoreVersion` is what makes the save a restore. Apostrophe removes it before storing the document, always records a new version for the save, and sets that version's `restoredFrom`. Without it, the same request is an ordinary edit.

Keep in mind:

- `versionId` is the `_id` of a version, not of the document. For a consolidated version, use the item's `_id`, which is its newest version.
- Always send the version as stored. Never send a document read with `annotate=1`.
- A restore always goes to the draft, even for a published version. The restored content goes live when the draft is published.

## Errors

| Error | Cause |
| -- | -- |
| `invalid` | `docId` is missing, `before` is not a valid date, or a version id is malformed. |
| `notfound` | The version or document does not exist, the user cannot edit the document, or the document's type has no versions. |
