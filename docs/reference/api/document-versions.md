# Document Versions REST API

The `@apostrophecms/document-versions` module exposes the history of a page or piece: the list of versions, the content of a version, and the changes between one version and the one before it. See the [module reference](/reference/modules/document-versions.md) for terminology (version, timeline, consolidated version, and so on) and for how a type gets versions in the first place.

Base URL: `/api/v1/@apostrophecms/document-versions`

Every route requires edit permission on the document, checked against its draft. A version of a document the requesting user cannot edit answers `notfound`, as does a document whose type has no versions.

## Endpoints

| Method | Path | Description |
|---------|---------|---------|
|`GET` | [`/api/v1/@apostrophecms/document-versions`](#get-api-v1-apostrophecms-document-versions) | List the versions of a document |
|`GET` | [`/api/v1/@apostrophecms/document-versions/:versionId`](#get-api-v1-apostrophecms-document-versions-versionid) | Read one version |
|`GET` | [`/api/v1/@apostrophecms/document-versions/:versionId/changes`](#get-api-v1-apostrophecms-document-versions-versionid-changes) | The changes of a version |

There is no dedicated restore route — restoring a version is a normal `PUT` of the document with a flag set. See [Restoring a version](#restoring-a-version).

## `GET /api/v1/@apostrophecms/document-versions`

Lists the versions of one document's timeline, newest first.

| Query parameter | Description |
|----------|-------------|
|`docId` | Required. The `_id` of the live document, in any mode (`ckx...:en:draft` or `:published`). The locale of the `_id` selects the timeline. |
|`before` | A date. Returns versions older than it. Omit to get the newest. |
|`consolidate` | `1` to get list items with consecutive versions collapsed: consecutive versions that consolidate come back as one consolidated version carrying `versionIds`. |

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
      "versionIds": [ "cm1...", "cm0...", "clz..." ]
    }
  ],
  "next": "2026-09-01T09:02:44.009Z"
}
```

Paging is by cursor: up to 10 results per page, newest first. `next`, when not `null`, is the `before` value to use for the following request. A page never splits a consolidated version across the boundary. `updatedAt`, `restoredFrom`, and `versionIds` appear only on the items that have them. The list response does not include `doc`.

## `GET /api/v1/@apostrophecms/document-versions/:versionId`

Returns one version with `doc` unpacked and loaded like a regular find: relationships and areas are populated, and fields added to the schema since the version was saved are present with their defaults.

| Query parameter | Description |
|----------|-------------|
|`annotate` | `1` to get the document marked up with its changes since the version before it, for display. See [Showing what changed](/guide/showing-version-changes.md). A first version and a restored version are returned unmarked, since they have no changes of their own. |
|`consolidate` | Used with `annotate`, when `versionId` is the newest version of a consolidated version: marks the changes of every version it stands for, and flags where AI was involved. |

::: warning
An annotated document (returned with `annotate=1`) is for display only. Never save it back — restore from the version as stored, without `annotate`.
:::

## `GET /api/v1/@apostrophecms/document-versions/:versionId/changes`

Returns the changes between a version and the one before it.

| Query parameter | Description |
|----------|-------------|
|`consolidate` | `1`, used with `versionId` set to the newest version of a consolidated version: returns the changes of every version it stands for as one list, each row flagged `ai` when AI was involved in that change. A version that does not consolidate answers the same as without the flag. |

### Response

```json
{
  "rows": [ /* change rows, see below */ ],
  "counts": { "added": 1, "modified": 3, "deleted": 0, "ai": 2 },
  "versionIds": [ "cm1..." ]
}
```

A first version has no rows, and neither does a restored version — it is a new baseline with no changes of its own.

### The change row

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
| `path` | Breadcrumb from the top-level field to the changed value. A schema field is `{ name, label }`. An array item is `{ name: <item _id>, label, ordinal }`, its label the text of the array's `titleField`, else its `title` field, else `#n`. A widget is `{ name: <widget _id>, label, title?, ordinal, widgetType }`, its label the widget type's label. Labels may be i18n keys, as in the schema. `ordinal` is the 1-based position. |
| `type` | `added`, `modified`, or `deleted`. For an array item, a widget, or an object: it exists on one side only, and nothing is listed below it. For a single value: `added` when the older value was empty, `deleted` when the newer one is. |
| `fieldType` | The type as the schema declares it, including a project's own type name; or `arrayItem`, `widget`, or `richText` for the markup of a rich text widget. For display only. |
| `kind` | What the row actually is, whatever its `fieldType` is called: `leaf`, `richText`, `object`, `relationship`, `arrayItem`, `widget`, or `array` / `area` for a change of order. **Test `kind`, not `fieldType`**, in code that reads rows. See [Project field types](/guide/showing-version-changes.md#project-field-types). |
| `old`, `new` | The stored values; the missing side is absent. A relationship's values are its id arrays; an order row's values are the ids both versions have, in each order. |
| `oldText`, `newText` | The same values in words, in the language of the admin UI: a select, radio, or checkboxes value by the label of its choice; a relationship by the titles of the related documents; an attachment by its file name; rich text as plain text; a box field by its sides ("Top 10px, Left 20px"); a number with its field's `unit`; an array item or widget by its title; a change of order as the items in each order. Empty when the value has no text form, in which case the UI shows the change type alone. |
| `diff` | The word diff of the two texts: `{ text, change }` parts, `change` one of `same`, `added`, `removed`. |
| `formatChanges` | For rich text rows whose formatting changed: one entry per change, `{ change, type, label, text?, href?, old?, new? }`. `change` names the kind of change, `label` says it in words ("Link", "Alignment", "Image"), `text` quotes the words affected, `old` and `new` are `{ text, href? }`. `href` is the URL of an image, when it can be opened. A change with nothing to compare (merged paragraphs, a table's layout) has neither `old` nor `new`. |
| `ai` | Whether AI was involved in this specific change. Meaningful for a consolidated version, where it distinguishes the AI changes from the hand edits within it. |

## Restoring a version

There is no restore route. A restore is a normal `PUT` of the version's `doc` to the document's own REST URL, in draft mode, naming the version being restored:

<AposCodeBlock>

```javascript
// `doc` is the live document, here an article
const versionsAction = apos.modules['@apostrophecms/document-versions'].action;
const docAction = apos.modules.article.action;

// 1. Pick a version from the document's list
const { results } = await apos.http.get(versionsAction, {
  qs: { docId: doc._id }
});
const versionId = results[2]._id;

// 2. Read it as stored — no `annotate`
const version = await apos.http.get(`${versionsAction}/${versionId}`, {});

// 3. Save its content over the draft of the live document, naming it
await apos.http.put(`${docAction}/${doc._id}`, {
  body: {
    ...version.doc,
    _restoreVersion: versionId
  },
  draft: true
});
```
<template v-slot:caption>
  Restoring a version over REST
</template>
</AposCodeBlock>

`versionId` is the `_id` of a version record, as the list route returns it — not the document's own `_id`. For a consolidated version, it is the `_id` of the entry, which is its newest version.

The `PUT` request goes to the live document in draft mode regardless of the mode of the version being restored: a published version is restored to the draft as well, and only goes live once the draft is published.

`_restoreVersion` is what makes the save a restore: it always records a new version, and that version carries `restoredFrom`. Send the version's content exactly as stored, never an annotated one (`annotate=1`). Without `_restoreVersion`, the same request is just an ordinary edit.

## Errors

| Error | Cause |
| -- | -- |
| `invalid` | A missing `docId`, a malformed `before`, or a malformed version id. |
| `notfound` | A version or document that does not exist, that the user cannot edit, or whose type has no versions. |
