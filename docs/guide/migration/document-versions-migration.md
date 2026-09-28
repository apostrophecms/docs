# Migrating from `@apostrophecms-pro/document-versions`

Document version history is now part of ApostropheCMS core, as the [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module. It replaces the `@apostrophecms-pro/document-versions` extension. We strongly recommend removing the extension when you upgrade core. The migration is short, and the existing history is converted automatically.

Projects that never used the extension need no migration. Their history starts when they upgrade.

::: warning
The core module and a feature release of the extension cannot run together. Both would record versions in the same collection, so Apostrophe refuses to start. The final release of the extension has no features. Installed alongside a core version that includes the module, it only logs a warning that it can be removed. With an older core version, it refuses to start.
:::

## Steps

1. Upgrade the `apostrophe` package.
2. Remove `@apostrophecms-pro/document-versions` from the `modules` of `app.js` and from `package.json`.
3. If you configured the extension, move its options to `modules/@apostrophecms/document-versions/index.js`. See the [module options](/reference/modules/document-versions.md#options).
   - `dateTimeFormatOptions` works as before. If you never set it, the list now shows a compact date and time instead of the extension's longer default format.
   - `localeMapping` is removed. Set `intlMapping` on each locale in the `@apostrophecms/i18n` configuration instead.
4. Start the site. Four migrations run once and convert the existing history. See below.
5. If you overrode any of the extension's Vue components or i18n strings, review those overrides. The versions modal was rebuilt, and the compare components and their strings no longer exist.

## What the migrations do

The migrations run in this order:

| Migration | What it does |
| -- | -- |
| `convert-legacy-versions` | Converts each existing version record in place. Its document is compressed, and `docId`, `locale`, `mode`, `authorId`, and `ai: false` become top-level fields. The extension only recorded publishes, so the converted history is a sequence of publication points. No version is lost. |
| `seed-publication-points` | For each published document whose history has no publication point, records what is published now and what was published before it, so that Undo Publish works from the first day. This covers every document in a project that never used the extension. |
| `remove-previous-mode-docs` | Deletes the `previous` copy that core used to keep of each published document, and releases its attachment references. Undo Publish now reads the version history instead. |
| `set-legacy-change-counts` | Recounts the edits of every existing version. The extension counted top-level fields that differed; an edit count is now the number of rows in the version's change list, so the list and the change list agree for old versions too. |

A compressed version record is much smaller than the extension's, so the converted history takes less space. From now on, though, the collection grows faster than before, because draft work is recorded as well as publishes.

### Rolling deployments

During a rolling deployment, instances still running the previous release can write versions in the old format after the migration has run. When the deployment is complete, run these two tasks, in this order:

```bash
node app @apostrophecms/document-versions:convert-legacy-versions
node app @apostrophecms/document-versions:set-change-count
```

The first converts any remaining old records, and the second counts their edits like the rest. Until the tasks have run, the module throws an error on an old-format record rather than display it incorrectly.

## What changes for editors

- Draft work is recorded, not only publishes, along with its author and whether AI was involved.
- The side-by-side comparison and its View Options are gone. Instead, editors see a list of every change the selected version made, at full depth, and markers on the changed parts of the document itself.
- The Restore button moved from the modal header to the entry of the selected version.
- Images and files have a **Document Versions** entry in the media manager.

For the full picture, see the [Document versions guide](/guide/document-versions.md).

## What changes for developers

| Before (extension) | Now (core) |
| -- | -- |
| Base URL `/api/v1/@apostrophecms-pro/document-versions` | Base URL `/api/v1/@apostrophecms/document-versions`. |
| The list was paged by number, with `page`, and `pages`, `currentPage`, and `total` in the response | The list is paged by cursor, with `before`, and `{ results, next }` in the response. See the [list route](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions). |
| `GET compare/:id1/:id2` | Removed. Use [`GET :versionId/changes`](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid-changes) for the list of changes and [`GET :versionId?annotate=1`](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions-versionid) for the marked document. A version is always compared with the one before it. |
| A version's `docId` was the full `_id` of the published document | `docId` is the `aposDocId`, and `locale` and `mode` are separate fields. See [the version record](/reference/modules/document-versions.md#the-version-record). |
| `doc` was a plain object in the collection | `doc` is stored compressed. Read versions with [`find`](/reference/modules/document-versions.md#find-req-criteria-options) or `findOne`, which unpack it. |
| `changeCount` counted the top-level fields that differed | `changeCount` counts the rows of the change list, at full depth. Existing versions are recounted during the upgrade. |
| A restore was a plain save of the old content | A restore names the version with `_restoreVersion`, and the new version records `restoredFrom`. See [Restoring a version](/reference/api/document-versions.md#restoring-a-version). |
| Undo Publish used documents in `aposMode: 'previous'` | Those documents are removed. Use [`getPreviousPublication`](/reference/modules/document-versions.md#getpreviouspublication-req-published) to find the publication Undo Publish returns to. |
| Methods `getRestPager`, `getCompareSchema`, and `getCompareData` | Removed. Use [`getTimelinePage`](/reference/modules/document-versions.md#gettimelinepage-req-criteria-options) and [`getVersionChanges`](/reference/modules/document-versions.md#getversionchanges-req-versionid-options). |
| Option `localeMapping` | Removed. Use `intlMapping` on each locale. |
| Task `@apostrophecms/i18n:document-versions-rename-locale` | Now `@apostrophecms/document-versions:rename-locale`, with the same arguments. As before, `@apostrophecms/i18n:rename-locale` renames version records along with documents, so you rarely need it. |

## Related documentation

- [Document versions guide](/guide/document-versions.md)
- [`@apostrophecms/document-versions` module reference](/reference/modules/document-versions.md)
- [Document versions REST API](/reference/api/document-versions.md)
