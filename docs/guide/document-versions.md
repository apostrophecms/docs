# Document versions

ApostropheCMS keeps a history of every page and piece. Editors open it from a document's context menu, under **Document Versions**. There they can see who changed what and when, see each change in place on the document, and restore an earlier version.

Version history is part of core, in the [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module. There is nothing to install, and it works without configuration. This guide explains how the history is recorded, for developers who configure it, build on it, or write code that saves content.

::: info
If your project uses the `@apostrophecms-pro/document-versions` extension, start with the [migration guide](/guide/migration/document-versions-migration.md). The core module replaces it, and the two cannot run together.
:::

## How versions are recorded

A **version** is a stored copy of a document as it was saved, along with who saved it, when, and whether AI was involved. The draft and published copies of a document share one history per locale. That history, newest first, is the document's **timeline**.

Each version is either a draft version or a published version, depending on what was saved.

### Published versions

Publishing a document records a **published version**. Each published version is a **publication point**: a state of the document that was live on the site. Undo Publish moves the published document back to the publication point before the current one.

When a document is published, its newest draft version usually holds exactly the content being published. To avoid listing the same work twice, that draft version itself becomes the publication point. This happens only when the draft version still describes the work correctly: the person publishing is the one who saved it, AI involvement is the same, and it is not a restored version.

Otherwise, the draft version is kept and a separate published version is recorded. The most common case is a review workflow: a contributor who can edit but not publish saves a draft and submits it, and an editor publishes it. The history then shows the contributor's draft version, with their edits, followed by the editor's published version. The published version shows no changes of its own, because its content is identical to the draft's.

### Draft versions

Draft work is recorded too, but not every save. In-context editing autosaves frequently, and a version for each autosave would bury the useful ones. Instead, while one person keeps working, their saves keep updating the same draft version.

A new draft version starts at a **handoff**, when the work changes hands or changes kind:

- The editor saves from the document editor modal, for example with **Save Draft**, rather than through an autosave.
- A different user saves the document.
- AI involvement starts or stops. AI-written saves and hand edits are never merged into one version.
- The newest version is a publication point or a restored version.
- The current draft version is older than the [`draftInterval`](/reference/modules/document-versions.md#options) option, which defaults to one day.

A save that changes nothing records nothing.

For example, suppose Alice edits a page in context for an hour and then clicks **Publish**. Her autosaves all update a single draft version, and the publish turns that version into a publication point. Her history gains one entry. If Bob then fixes a typo on the page, his first save starts a new draft version, because the author changed.

## Which document types have versions

Pages and pieces have versions by default. Two kinds of types do not:

- Types that publish automatically (`autopublish: true`)
- Types that are not localized (`localized: false`)

Set the `versions` option on a page or piece type module to override either default:

<AposCodeBlock>

```javascript
export default {
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

| `versions` | Result |
| -- | -- |
| Not set | Versions, unless the type sets `autopublish: true` or `localized: false`. |
| `true` | Versions, irrespective of `autopublish` and `localized` values. |
| `false` | No versions. |

There is no project-wide setting to turn versions off. To opt out, set `versions: false` on each type.

A few details depend on the kind of type:

- **Opting out keeps Undo Publish working.** A localized type that is published by hand and sets `versions: false` still records its two most recent publication points per document and locale. That is exactly what Undo Publish needs. It records nothing else, has no **Document Versions** menu entry, and its documents are not available from the [REST API](/reference/api/document-versions.md).
- **Types that publish automatically** record one published version per save when they set `versions: true`. Core sets this for images, files, their tags, and the global styles document, so the media manager offers **Document Versions** for images and files. Core sets `versions: false` for users.
- **Types that are not localized** have no draft. With `versions: true`, every save that changes something records a published version, and the version's `locale` is `null`.

Archived documents record nothing. Taking a document out of the archive also records nothing, even if the same save edits fields; the next save records the difference.

## What editors see

Each version is compared with the one before it on the timeline. Editors see the result in three places:

- **The edit count** on each entry in the list, such as "3 edits." It counts the individual changes, at their full depth: a changed field inside a widget inside an area is one edit.
- **The change list** for the selected version, one row per change, with a breadcrumb showing where the change sits in the document.
- **The document itself**, drawn with a frame around each changed widget and field, and with added and removed words marked in rich text. [Inline editable fields](/guide/inline-editing.md#inline-editing-and-document-versions) are marked where they appear on the page. Selecting a marker reveals the matching row in the change list.

Widget authors can improve how their widgets appear in all of this. See [Showing version changes in widgets](/guide/showing-version-changes.md).

### Consolidated versions

A **consolidated version** is a single entry in the versions list that stands for several versions. It is how the list shows an AI pass and the editor's corrections to it as one step of work.

Without it, that work would appear as several entries. Starting or stopping AI involvement is a handoff, so the AI-written saves and the hand edits around them are always recorded as separate versions. The consolidated entry joins them back together for display. Within it, each change AI was involved in has an AI badge, so editors can still tell the AI changes from the hand edits.

Consecutive draft versions by the same author are consolidated when at least one was saved with AI and at least one without. A publication point or a restored version ends the run. Consolidation affects only how the list displays versions. The versions themselves are stored separately and can be read individually.

## Restore and Undo Publish

**Restoring** a version saves its content over the document's draft. The restore is recorded as a new version, labeled **Restored**, that points back to the version it restored. A restored version is a fresh starting point, so it shows no changes of its own.

A restore always goes to the draft, even when the restored version is a publication point. The restored content goes live when the draft is published. To restore through the REST API, see [Restoring a version](/reference/api/document-versions.md#restoring-a-version).

**Undo Publish** uses the version history. It returns the published document to the previous publication point and records that as a published version that is also a restored version. Undo Publish cannot be applied twice in a row; after one, only a new publish can be undone. To find the publication point Undo Publish would return to, call [`getPreviousPublication`](/reference/modules/document-versions.md#getpreviouspublication-req-published).

## Marking AI-written saves

A version is marked as involving AI when the save that recorded it was marked that way. Apostrophe cannot detect this on its own, so code that writes AI-generated content into a document has to say so. The mark does three things:

- The versions list shows "with AI" and an AI badge on the entry.
- AI-written saves and hand edits are kept in separate versions.
- In a consolidated version, each change that AI was involved in gets its own badge.

**Over REST**, add `_ai: true` to the body of the write. Apostrophe removes it before the document is stored:

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
  Marking a REST write as AI-written
</template>
</AposCodeBlock>

**On the server**, save with a clone of the request that carries the `aposAi` flag. Using a clone keeps the flag off any other saves made during the same request:

<AposCodeBlock>

```javascript
const aiReq = req.clone({ aposAi: true });
await self.apos.doc.update(aiReq, doc);
```
<template v-slot:caption>
  Marking a server-side save as AI-written
</template>
</AposCodeBlock>

**In a `beforeLocalize` handler**, set `_ai: true` on the draft being localized. Core reads it after all handlers have run. The automatic translation extension does this when the translation provider actually wrote at least one field.

### What counts as AI involvement

Mark a save when a tool wrote content into the document without the editor typing it: a machine translation, a generated summary saved directly, a bulk rewrite.

Do not mark a save for AI suggestions the editor reviewed and accepted in the editor before saving. Accepting a suggestion is the editor's own edit, saved along with their other changes. SEO Assistant suggestions work this way.

::: warning
Over REST, `_ai` is a claim made by the client, and anyone who can edit the document can send it. Treat it as an editorial disclosure, not a security boundary.
:::

## Custom field types

A field type registered with [`apos.schema.addFieldType`](/guide/custom-schema-field-types.md) works in version history without extra code, as long as it declares what it `extend`s:

- A type that extends a single-value type, such as `string`, is compared and displayed as that type.
- A type that extends `area`, `array`, `object`, `relationship`, or `richText` is walked like that type. Its items and widgets get their own change rows, reordering is detected, and rich text gets word marks.
- If the type defines `isEqual(req, field, one, two)`, that decides whether the value changed. As elsewhere in core, `one` and `two` are the objects that hold the field. Without `isEqual`, values are compared deeply, and `null` and `undefined` count as equal.
- If the type defines `isEmpty(field, value)`, that decides whether a change reads as Added or Deleted instead of Modified. Without it, `null`, `undefined`, `''`, and `[]` count as empty.

Code that reads change rows should test a row's `kind` rather than its `fieldType`. `fieldType` is your type's own name, while `kind` is the structure it resolves to. See [the change row](/reference/api/document-versions.md#the-change-row).

## Storage

Versions are stored in the `aposDocsVersions` MongoDB collection. Each version's copy of the document is compressed, so always read versions through the [module methods](/reference/modules/document-versions.md#featured-methods), which unpack them. Do not query the collection directly.

There is no retention policy. A document's versions in a locale are kept until the document is deleted in that locale. Because draft work is recorded as well as publishes, plan for the collection to grow steadily on an actively edited site. Compression keeps each record small.

When a document type's module is later removed from the project, its version records stay in the collection and can still be read.

## Known limitations

- **Moving a widget between areas** reads as a deletion from the first area and an addition to the second, not as a move. Moved is only for a change of position within one area or array.
- **Rich text marks cover words, bold, italic, and block kinds only.** Other formatting-only changes, rebuilt tables, and rewrites of more than about a thousand words mark the whole widget as Modified instead. The change list still lists those changes. See [Rich text marks](/guide/showing-version-changes.md#rich-text-marks).
- **Rich text formatting is compared on a fixed set of attributes:** tag, class, alignment, color, links, anchors, and image alt text, style, and link, plus table layout. A change to anything else alone, such as a `data-*` attribute, an inline font size, or the `start` of a list, shows as Modified with no detail.
- **Some values display plainly.** A boolean reads as `true` or `false`. A color reads as its stored string, with no swatch. The first setting of a box field, such as margin or padding, reads as Modified rather than Added.
- **A widget with no `titleField` and no text** gives an Added or Deleted row with nothing to expand. Set [`titleField`](/guide/showing-version-changes.md#titlefield-name-your-widgets) on the widget type.

## Related documentation

- [`@apostrophecms/document-versions` module reference](/reference/modules/document-versions.md)
- [Document versions REST API](/reference/api/document-versions.md)
- [Showing version changes in widgets](/guide/showing-version-changes.md)
- [Migrating from `@apostrophecms-pro/document-versions`](/guide/migration/document-versions-migration.md)
