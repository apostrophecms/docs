---
title: "Document versions in ApostropheCMS"
---

# Document versions

ApostropheCMS keeps a history of every page and piece. Editors open it from a document's context menu, under **Document Versions**. There they can see who changed what and when, see each change in place on the document, and restore an earlier version.

On the page itself, editors can also turn on [See Changes](#see-changes), which shows everything the current draft changes since the document was last published.

Version history and See Changes are part of core, in the [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module. There is nothing to install, and both work without configuration. This guide explains how the history is recorded, for developers who configure it, build on it, or write code that saves content.

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

The versions list that editors see is consolidated, so it can have fewer entries than there are stored versions. When one author's draft versions mix AI-written saves and hand edits, the list shows them as a single entry. For example, suppose an editor starts from an AI translation and then clicks **Save Draft** four times, making edits between clicks. That work is stored as several versions but listed as one entry. See [Consolidated versions](#consolidated-versions).

Each entry in the list is compared with the one before it on the timeline. Editors see the result in three places:

- **The edit count** on each entry in the list, such as "3 edits." It counts the individual changes, at their full depth: a changed field inside a widget inside an area is one edit.
- **The change list** for the selected version, one row per change, with a breadcrumb showing where the change sits in the document.
- **The document itself**, drawn with a frame around each changed widget and field, and with added and removed words marked in rich text. A field the template renders [inline editable](/guide/inline-editing.md#inline-editing-document-versions-and-see-changes) shows its added and removed words in place. Selecting a marker reveals the matching row in the change list.

Widget authors can improve how their widgets appear in all of this. See [Showing version changes in widgets](/guide/showing-version-changes.md).

### Consolidated versions

A **consolidated version** is a single entry in the versions list that stands for several versions. It is how the list shows an AI pass and the editor's corrections to it as one step of work.

Without it, that work would appear as several entries. Starting or stopping AI involvement is a handoff, so the AI-written saves and the hand edits around them are always recorded as separate versions. The consolidated entry joins them back together for display. Within it, each change AI was involved in has an AI badge, so editors can still tell the AI changes from the hand edits.

Consecutive draft versions by the same author are consolidated when at least one was saved with AI and at least one without. A publication point or a restored version ends the run. Consolidation affects only how the list displays versions. The versions themselves are stored separately and can be read individually.

## Restore and Undo Publish

**Restoring** a version saves its content over the document's draft. The restore is recorded as a new version, labeled **Restored**, that points back to the version it restored. A restored version is a fresh starting point, so it shows no changes of its own.

A restore always goes to the draft, even when the restored version is a publication point. The restored content goes live when the draft is published. To restore through the REST API, see [Restoring a version](/reference/api/document-versions.md#restoring-a-version).

**Undo Publish** uses the version history. It returns the published document to the previous publication point and records that as a published version that is also a restored version. Undo Publish cannot be applied twice in a row; after one, only a new publish can be undone. To find the publication point Undo Publish would return to, call [`getPreviousPublication`](/reference/modules/document-versions.md#getpreviouspublication-req-published).

## See Changes

**See Changes** shows what publishing the current draft would change. An editor turns it on from the **More Options** menu next to **Preview**, while editing a page or a piece on its own page. The page then shows the draft with every change since the last publication marked in place, and a floating window lists the same changes.

The two features answer different questions:

| | Document Versions | See Changes |
| -- | -- | -- |
| **Question** | Who changed what, and when? | What will happen if I publish? |
| **Compares** | Each version with the one before it | The current draft with the last publication point |
| **Shows** | The full history, version by version | Each changed value once, credited to everyone who changed it since the publication, with AI involvement |
| **Opens** | In a modal, for any document with versions | On the page, for the document the page displays |
| **Restores** | A whole version | One change at a time |

When a document has never been published, See Changes compares the draft with a new, empty document of its type, so every value the editor entered is listed as a change.

### Restore and Edit

Each change in the list can have two actions:

- **Restore** puts back the published value of that change alone, such as one field, one widget, or one array item. The rest of the draft stays as it is.
- **Edit** opens an editor for that value, inside the list. It saves to the draft with **Update Draft**.

Both save to the draft right away, then the page and the list refresh. The page itself is read-only while See Changes is on. Closing the window, or switching to **Preview**, returns to normal editing.

A restore or an edit is refused when it would leave the document invalid, for example a value that a [conditional field](/guide/conditional-fields.md) rule no longer allows alongside the other fields. The editor is told to make the change in the document's editor instead.

Restore is not offered for a change when:

- The editor cannot change the field, because it is `readOnly`, `hidden`, or restricted by `editPermission` or `viewPermission`.
- The restored value would bring back a widget type that the area no longer allows, or a related document that the editor can no longer load.
- The change is to a widget whose type sets [`versionsStandalone: false`](/guide/showing-version-changes.md#widgets-that-do-not-stand-alone), such as a layout column, which can only be put back with the widgets around it.
- The change is to the order of an array or area. Restoring the old order would also undo every other change to the list.

Edit uses the same schema-driven inputs as the document's editor. A widget that was added or changed as a whole opens in its widget editor. A widget with no visible schema fields and no [in-context editor](/guide/editing-custom-widgets-in-context.md) of its own has nothing to edit, so its changes offer Restore only. See [Widgets in See Changes](/guide/showing-version-changes.md#widgets-in-see-changes).

### Which documents offer See Changes

See Changes is offered for a document when all of these are true:

- Its type records versions of its drafts: it [has versions](#which-document-types-have-versions), is localized, and does not set `autopublish: true`.
- It has its own page, so that it can be shown in context: a page, or a piece whose type has a [piece page type](/guide/piece-pages.md).
- The user can edit it.

Pieces without a page of their own still have their history in **Document Versions**.

### What your project needs

See Changes renders the page with your own templates, so how much it can mark in place depends on how they output content:

- **Inline fields** show their changed words in place only when the template renders them with `Field` in JSX, `{% field %}` in Nunjucks, or `AposField` in Astro. A value printed with an ordinary template expression is not marked on the page, but it is still listed. See [Inline editing, Document Versions, and See Changes](/guide/inline-editing.md#inline-editing-document-versions-and-see-changes).
- **Widgets** are framed and badged as in the Document Versions modal, and the same widget type options apply. See [Showing version changes in widgets](/guide/showing-version-changes.md).

In an Astro project, See Changes works through the same bridge as in-context editing, with no extra setup. Fields need the same `wysiwyg` opt-in that inline editing needs.

See Changes is built for in-context editing, so it is not available on a [headless](/guide/headless-cms.md) front end. The same list of changes is available from the [`draft-changes` route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-draft-changes), with each change's restore patch, if you want to build your own review screen.

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

When a document type's module is later removed from the project, its version records stay in the collection. They can still be read programmatically, through the module methods, but not in the **Document Versions** modal.

This matters when a project migrates documents from one type to another, for example from a pro extension's piece type to a core type, and removes the old module. The migrated documents keep their history, but the versions recorded under the old type still carry that type. In the modal, selecting one of those versions shows a message in place of its changes, and the version offers no **Changes** or **Restore** action. This guards against restoring content into a schema that no longer matches it, which could lose data.

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
- [Inline editing](/guide/inline-editing.md)
- [Migrating from `@apostrophecms-pro/document-versions`](/guide/migration/document-versions-migration.md)
