# Migrating from `@apostrophecms-pro/document-versions`

Document version history is now built into Apostrophe core, as the [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module. Migrating off the `@apostrophecms-pro/document-versions` extension is highly recommended as part of your core upgrade, and it is short.

::: warning
A feature release of the pro package must not run alongside the core module — both would record versions into the same collection, and Apostrophe refuses to start. The final release of the pro package contains no features: next to a core version that includes the module, it only logs a warning that it can be removed; on an older core, it refuses to start.
:::

## Steps

1. Upgrade `apostrophe`.
2. Remove `@apostrophecms-pro/document-versions` from the `modules` list in `app.js` and from `package.json`.
3. Move any options to `modules/@apostrophecms/document-versions/index.js` (see the [module options reference](/reference/modules/document-versions.md#options)).
   - `dateTimeFormatOptions` carries over as-is.
   - `localeMapping` no longer exists; use `intlMapping` in the `@apostrophecms/i18n` locale configuration instead.
4. Start the site. The migrations described below run once and convert the existing history.

## What the migrations do

| Migration | What it does |
| -- | -- |
| `convert-legacy-versions` | Converts every existing version record in place: its content is packed, and `docId`, `locale`, `mode`, `authorId`, and `ai: false` are set at the top level. A version keeps the mode of the document it recorded, which for the pro module was always the published one, so the existing history reads as a sequence of publication points. No version is lost. |
| `set-legacy-change-counts` | The pro module counted the top-level fields that differ between versions; an edit count is now the number of rows in the version's change list. Every existing version is recounted once, so the list and the change list agree for old versions too. Runs after the other migrations. |
| `seed-publication-points` | For a published document whose history has no publication point — every document in a project that never ran the pro module — records what is published now and what was published before it, so Undo Publish works from the first day. |
| `remove-previous-mode-docs` | Core no longer keeps a `previous` copy of each published document; Undo Publish reads the history instead. These copies are deleted and their attachment references released. |

### Rolling deployments

An instance still running the previous release during a deployment can write versions in the old format after the migration has already run on other instances. Once the deployment is fully complete, run:

```bash
node app @apostrophecms/document-versions:convert-legacy-versions
node app @apostrophecms/document-versions:set-change-count
```

Run `convert-legacy-versions` first, then `set-change-count` so the newly converted records are counted like the rest. Until you run these, the module fails loudly on a record still in the old format rather than showing it incorrectly.

A packed version record is markedly smaller than the pro module's plain one, so the converted history takes up less room. From this point on, though, the collection grows faster than before, since draft work is recorded too, not only publishes.

## What changed for editors

- Draft work is recorded, not only publishes — with its author and whether AI was involved.
- The old side-by-side comparison view and its View Options are replaced by the change list and the markers drawn directly on the document, which show every change at its full depth against the version before it.
- Restore moved from the modal header to the entry for the selected version.

## What changed for developers

| Before (`@apostrophecms-pro/document-versions`) | Now (`@apostrophecms/document-versions`) |
| -- | -- |
| Base URL `/api/v1/@apostrophecms-pro/document-versions` | `/api/v1/@apostrophecms/document-versions` |
| List paged by number: `page`, with `pages`, `currentPage`, `total` in the response | Paged by cursor: `before` parameter, `{ results, next }` response. See [Listing versions](/reference/api/document-versions.md#get-api-v1-apostrophecms-document-versions). |
| `GET compare/:id1/:id2` | Removed. Use `GET :versionId/changes` and `GET :versionId?annotate=1` instead. |
| A version's `docId` was the full `_id` of the published document | `docId` is the `aposDocId`; `locale` and `mode` are separate fields. See [The version record](/reference/modules/document-versions.md#the-version-record). |
| `doc` was a plain object in the collection | `doc` is packed. Read it through `find` / `findOne`, which unpack it automatically. |
| `changeCount` counted the top-level fields that differ | Counts the rows of the change list, at full depth. Existing versions are recounted at upgrade. |
| Restore was a plain save of the old content | The save names the version with `_restoreVersion`, and the resulting record carries `restoredFrom`. See [Restoring a version](/reference/api/document-versions.md#restoring-a-version). |
| Documents in `aposMode: 'previous'` | Gone. Code that queried them should read publication points instead: `getPreviousPublication`. |
| Module methods `getRestPager`, `getCompareSchema`, `getCompareData` | Removed. Use `getTimelinePage`, `getVersionChanges` instead. |
| Option `localeMapping` | Removed. Use `intlMapping` on the locale configuration instead. |
| Task `@apostrophecms/i18n:document-versions-rename-locale` | `@apostrophecms/document-versions:rename-locale`, with the same arguments. As before, `@apostrophecms/i18n:rename-locale` covers versions automatically during a normal locale rename. |

Project-level overrides of the pro module's Vue components or i18n keys need revisiting: the versions modal was rebuilt, and the old compare components and their translation strings no longer exist.

## Related documentation

- [`@apostrophecms/document-versions` module reference](/reference/modules/document-versions.md)
- [Document Versions REST API](/reference/api/document-versions.md)
