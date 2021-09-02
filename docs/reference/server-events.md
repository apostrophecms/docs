# Server-side events

Each section below includes each server-side event emitted by a particular module and modules that extend it. Code block examples represent the [`handlers`](/reference/module-api/module-overview.md#handlers-self) section of a module.

## Core app events

These events are emitted by the primary Apostrophe app. Reference these events with the prefix `apostrophe:` (e.g., `apostrophe:afterInit`).

### `destroy`

Triggered when the app's `destroy` method is called. Most commonly used in tests. , an apos object is being shut down. Your handlers should clean up any custom `setTimeouts`, `setIntervals` and/or open socket or database connections you have created. You should not "destroy" your actual website content. Just close any remaining open connections, timeouts, etc.

There is no data included with the event for handlers.

### `modulesReady`

Triggered during startup after all modules are registered and their `init` functions run. This is the last opportunity to adjust module configuration (e.g., field schema) in response to other active modules.

There is no data included with the event for handlers.

### `afterInit`

Invoked after all `apostrophe:modulesReady` handlers have completed. All modules are not completely ready for work.

There is no data included with the event for handlers.

### `run`

**Not intended for project use.** Triggered when the Apostrophe process is about to beginn running. Apostrophe uses this to run tasks and begin listening for connections.

#### Parameters

- `isTask`: A boolean value indicating whether the process was started from an [Apostrophe task](/reference/module-api/module-overview.md#tasks-self).

Example: `handlerName(isTask)`

```javascript

handlers(self, options) {
  return {
    'apostrophe:run': {
      async handlerName(isTask) { ... }
    }
  };
}
```

## `@apostrophecms/db`

### `reset`

Invoked after all collections are dropped from the database in the `@apostrophecms/db:reset` command line task.

There is no data included with the event for handlers.

## `@apostrophecms/doc`

### `fixUniqueError`

Triggered when a unique key error is thrown by MongoDB. Apostrophe uses this to modify the slug property to make it unique.

#### Parameters

- `req`: The active request
- `doc`: The database document that triggered the error

Example: `handlerName(req, doc)`

### `afterReplicate`

Triggered after Apostrophe automatically replicates certain documents across all locales, including parked pages and piece types with the `replicate: true` option.

There is no data included with the event for handlers.

## `@apostrophecms/doc-type`

These events are emitted by all page type and piece type modules since they extend `@apostrophecms/doc-type`. In most cases it will be best to watch for the event from a piece type or page type module rather than the doc type module.

If specifically watching `@apostrophecms/doc-type:` events (e.g., `@apostrophecms/doc-type:beforeInsert`), **it will normally be important to check the `type` of the document in question** before proceeding with the handler's work.

### `beforeInsert`

Triggered just *before* Apostrophe inserts a document into the database for the first time.

#### Parameters

- `req`: The active request
- `doc`: The document data being inserted into the database
- `options`: Any options passed from the `insert` method

Example: `handlerName(req, doc, options)`

### `beforeUpdate`

Triggered just *before* Apostrophe updates an existing document in the database.

#### Parameters

- `req`: The active request
- `doc`: The document data being updated in the database
- `options`: Any options passed from the `update` method

Example: `handlerName(req, doc, options)`

### `beforeSave`

Triggered just *before* Apostrophe either inserts *or* updates a document. Invoked immediately after `beforeInsert` and `beforeUpdate` in their respective cases.

#### Parameters

- `req`: The active request
- `doc`: The document data being saved to the database
- `options`: Any options passed from the saving method

Example: `handlerName(req, doc, options)`

### `afterInsert`

Triggered just *after* Apostrophe inserts a document into the database for the first time.

#### Parameters

- `req`: The active request
- `doc`: The document data being inserted into the database
- `options`: Any options passed from the `insert` method

Example: `handlerName(Smthng)`

### `afterUpdate`

Triggered just *after* Apostrophe updates an existing document in the database.

#### Parameters

- `req`: The active request
- `doc`: The document data being updated in the database
- `options`: Any options passed from the `update` method

Example: `handlerName(req, doc, options)`

### `afterSave`

Triggered just *after* Apostrophe either inserts *or* updates a document. Invoked immediately after `afterInsert` and `afterUpdate` in their respective cases.

#### Parameters

- `req`: The active request
- `doc`: The document data being saved to the database
- `options`: Any options passed from the saving method

Example: `handlerName(req, doc, options)`


### `beforeDelete`

Triggered just *before* Apostrophe permanently deletes an existing document from the database.

#### Parameters

- `req`: The active request
- `doc`: The document being deleted from the database
- `options`: Any options passed from the deleting method

Example: `handlerName(req, doc, options)`

### `afterDelete`

Triggered just *after* Apostrophe permanently deletes an existing document from the database.

#### Parameters

- `req`: The active request
- `doc`: The document being deleted from the database
- `options`: Any options passed from the deleting method

Example: `handlerName(req, doc, options)`

### `afterArchive`

Triggered after a document is archived when saving it.

#### Parameters

- `req`: The active request
- `doc`: The document being archived

### `afterRescue`

Triggered after a document is rescued (the opposite of archiving) when saving it.

#### Parameters

- `req`: The active request
- `doc`: The document being rescued

### `beforePublish`

Triggered just *before* a draft document is published.

#### Parameters

- `req`: The active request
- `data`: An object containing the following properties:
  - `draft`: The draft document data
  - `published`: The document data as it will be published
  - `options`: Any options passed from the `publish` method
  - `firstTime`: A boolean value, `true` if the document has never been published before

Example: `handlerName(req, { draft, published, options, firstTime })`

### `afterPublish`

Triggered just *after* a draft document is published.

#### Parameters

- `req`: The active request
- `data`: An object containing the following properties:
  - `draft`: The draft document data
  - `published`: The document data as it will be published
  - `options`: Any options passed from the `publish` method
  - `firstTime`: A boolean value, `true` if the document has never been published before

Example: `handlerName(req, { draft, published, options, firstTime })`

### `afterRevertDraftToPublished`

Triggered after a draft document is reverted to the most recent published state. This is separate from the undo and redo features in the user interface.

#### Parameters

- `req`: The active request
- `result`: An object containing the following property:
  - `draft`: The *new* draft document


### `afterRevertPublishedToPrevious`

Triggered after a published document is reverted to the most recent "previous" state (the previous published version). This is separate from the undo and redo features in the user interface.

#### Parameters

- `req`: The active request
- `result`: An object containing the following property:
  - `published`: The *new* published document

## `@apostrophecms/express`

### `afterListen`

Triggered after the Express module begins listening for connections.

There is no data included with the event for handlers.

### `compileRoutes`

**Not intended for project use.** Triggered prior to middleware and route registration. Used to get all modules to compile their respective routes for registration.

There is no data included with the event for handlers.

## `@apostrophecms/login`

### `deserialize`

Triggered after a user logs in and their data is retrieved.

#### Parameters

- `user`: The user's data from the database

Example: `handlerName(user)`

<!-- ### `after`

Triggered after a user successfully logs into Apostrophe. -->

## `@apostrophecms/migration`

### `after`

Triggered after all data migrations have run. The database is now in a stable state.

There is no data included with the event for handlers.

## `@apostrophecms/page`

### `beforeUnpublish`

Triggered just before a page document is unpublished (converted to a draft document).

#### Parameters

- `req`: The active request
- `published`: The published document that is about to be unpublished

Example: `handlerName(req, published)`

### `afterParkAll`

Triggered after [parked pages](/reference/module-api/module-options.md#park) have been saved or updated in the database (as appropriate) during app startup.

There is no data included with the event for handlers.

### `afterConvert`

Triggered after page data is run through the schema module's `convert` method, validating its data to the page type's field schema.

#### Parameters

- `req`: The active request
- `data`: The data being saved to the page, prior to schema conversion
- `page`: The page as it will be saved, following schema conversion


### `beforeMove`

### `afterMove`

### `beforeUpdate`

### `beforeSave`

### `serve`

### `serveQuery`

### `notFound`

## `@apostrophecms/piece-type`

### `beforeUnpublish`

### `afterConvert`

Triggered after piece data is run through the schema module's `convert` method, validating its data to the piece type's field schema.

#### Parameters

- `req`: The active request
- `data`: The data being saved to the page, prior to schema conversion
- `piece`: The page as it will be saved, following schema conversion

## `@apostrophecms/search`
- determineTypes
- beforeIndex

## `@apostrophecms/template`
- addBodyData