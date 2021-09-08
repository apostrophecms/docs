---
sidebarDepth: 2
---

# Server-side events

Each section below includes server-side events emitted by a particular module *and [modules that extend them](/guide/modules.md#module-inheritance)* (e.g., all piece types emit the events listed for `@apostrophecms/piece-type`). See the [server-side events guide](/guide/server-events.md) for more detail on using events.

Code block examples represent the [`handlers`](/reference/module-api/module-overview.md#handlers-self) section of a module.

::: note
As a reminder, when referencing an event in the `handlers` section *from within the module that emits it* we only need to use the event name.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      // 'beforeSave' is an event the @apostrophecms/user module emits.
      'beforeSave': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/user/index.js
  </template>
</AposCodeBlock>

When naming an event emitted *by a different module*, the event name must be prefixed with the name of the module that emitted it followed by a colon.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      // This team module is specifically listening for 'beforeSave' on
      // the @apostrophecms/user module.
      '@apostrophecms/user:beforeSave': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/team/index.js
  </template>
</AposCodeBlock>
:::

## Core app events

These events are emitted by the primary Apostrophe app. Reference these events with the prefix `apostrophe:` (e.g., `apostrophe:ready`).

### `destroy`

Triggered when the app's `destroy` method is called. Most commonly used in tests. , an apos object is being shut down. Your handlers should clean up any custom `setTimeouts`, `setIntervals` and/or open socket or database connections you have created. You should not "destroy" your actual website content. Just close any remaining open connections, timeouts, etc.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'apostrophe:destroy': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/any-module/index.js
  </template>
</AposCodeBlock>

### `modulesRegistered`

Triggered during startup after all modules are registered and their `init` functions run. This is the last opportunity to adjust module configuration (e.g., field schema) in response to other active modules.

There is no data included with the event for handlers. Previously named `modulesReady`, which still works as an alias.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'apostrophe:modulesRegistered': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/any-module/index.js
  </template>
</AposCodeBlock>

### `ready`

Invoked after all `apostrophe:modulesRegistered` handlers have completed. All modules are not completely ready for work.

There is no data included with the event for handlers. Previously named `afterInit`, which still works as an alias.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'apostrophe:ready': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/any-module/index.js
  </template>
</AposCodeBlock>

### `run`

**Not intended for project use.** Triggered when the Apostrophe process is about to beginn running. Apostrophe uses this to run tasks and begin listening for connections.

#### Parameters

- `isTask`: A boolean value indicating whether the process was started from an [Apostrophe task](/reference/module-api/module-overview.md#tasks-self).

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'apostrophe:run': {
        async handlerName(isTask) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/any-module/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/db`

### `reset`

Invoked after all collections are dropped from the database in the `@apostrophecms/db:reset` command line task.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'reset': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/db/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/doc`

### `fixUniqueError`

Triggered when a unique key error is thrown by MongoDB. Apostrophe uses this to modify the slug property to make it unique.

#### Parameters

- `req`: The active request
- `doc`: The database document that triggered the error

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'fixUniqueError': {
        async handlerName(req, doc) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc/index.js
  </template>
</AposCodeBlock>

### `afterReplicate`

Triggered after Apostrophe automatically replicates certain documents across all locales, including parked pages and piece types with the `replicate: true` option.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterReplicate': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/doc-type`

These events are emitted by **all page type and piece type modules** since they extend `@apostrophecms/doc-type`. In most cases it will be best to watch for the event from a piece type or page type module rather than the doc type module.

If specifically watching events on `@apostrophecms/doc-type`, as opposed to modules that extend it, **it will normally be important to check the `type` of the document in question** before proceeding with the handler's work.

### `beforeInsert`

Triggered just *before* Apostrophe inserts a document into the database for the first time.

#### Parameters

- `req`: The active request
- `doc`: The document data being inserted into the database
- `options`: Any options passed from the `insert` method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeInsert': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `beforeUpdate`

Triggered just *before* Apostrophe updates an existing document in the database.

#### Parameters

- `req`: The active request
- `doc`: The document data being updated in the database
- `options`: Any options passed from the `update` method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeUpdate': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `beforeSave`

Triggered just *before* Apostrophe either inserts *or* updates a document. Invoked immediately after `beforeInsert` and `beforeUpdate` in their respective cases.

#### Parameters

- `req`: The active request
- `doc`: The document data being saved to the database
- `options`: Any options passed from the saving method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeSave': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterInsert`

Triggered just *after* Apostrophe inserts a document into the database for the first time.

#### Parameters

- `req`: The active request
- `doc`: The document data being inserted into the database
- `options`: Any options passed from the `insert` method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterInsert': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterUpdate`

Triggered just *after* Apostrophe updates an existing document in the database.

#### Parameters

- `req`: The active request
- `doc`: The document data being updated in the database
- `options`: Any options passed from the `update` method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterUpdate': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterSave`

Triggered just *after* Apostrophe either inserts *or* updates a document. Invoked immediately after `afterInsert` and `afterUpdate` in their respective cases.

#### Parameters

- `req`: The active request
- `doc`: The document data being saved to the database
- `options`: Any options passed from the saving method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterSave': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `beforeDelete`

Triggered just *before* Apostrophe permanently deletes an existing document from the database.

#### Parameters

- `req`: The active request
- `doc`: The document being deleted from the database
- `options`: Any options passed from the deleting method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeDelete': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterDelete`

Triggered just *after* Apostrophe permanently deletes an existing document from the database.

#### Parameters

- `req`: The active request
- `doc`: The document being deleted from the database
- `options`: Any options passed from the deleting method

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterDelete': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterArchive`

Triggered after a document is archived when saving it.

#### Parameters

- `req`: The active request
- `doc`: The document being archived

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterArchive': {
        async handlerName(req, doc) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterRescue`

Triggered after a document is rescued (the opposite of archiving) when saving it.

#### Parameters

- `req`: The active request
- `doc`: The document being rescued

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterRescue': {
        async handlerName(req, doc) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `beforePublish`

Triggered just *before* a draft document is published.

#### Parameters

- `req`: The active request
- `data`: An object containing the following properties:
  - `draft`: The draft document data
  - `published`: The document data as it will be published
  - `options`: Any options passed from the `publish` method
  - `firstTime`: A boolean value, `true` if the document has never been published before

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforePublish': {
        async handlerName(req, data) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterPublish`

Triggered just *after* a draft document is published.

#### Parameters

- `req`: The active request
- `data`: An object containing the following properties:
  - `draft`: The draft document data
  - `published`: The document data as it will be published
  - `options`: Any options passed from the `publish` method
  - `firstTime`: A boolean value, `true` if the document has never been published before

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterPublish': {
        async handlerName(req, data) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterRevertDraftToPublished`

Triggered after a draft document is reverted to the most recent published state. This is separate from the undo and redo features in the user interface.

#### Parameters

- `req`: The active request
- `result`: An object containing the following property:
  - `draft`: The *new* draft document

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterRevertDraftToPublished': {
        async handlerName(req, result) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

### `afterRevertPublishedToPrevious`

Triggered after a published document is reverted to the most recent "previous" state (the previous published version). This is separate from the undo and redo features in the user interface.

#### Parameters

- `req`: The active request
- `result`: An object containing the following property:
  - `published`: The *new* published document

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterRevertPublishedToPrevious': {
        async handlerName(req, result) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/express`

### `afterListen`

Triggered after the Express module begins listening for connections.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterListen': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/express/index.js
  </template>
</AposCodeBlock>

### `compileRoutes`

**Not intended for project use.** Triggered prior to middleware and route registration. Used to get all modules to compile their respective routes for registration.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'compileRoutes': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/express/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/login`

### `deserialize`

Triggered after a user logs in and their data is retrieved.

#### Parameters

- `user`: The user's data from the database

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'deserialize': {
        async handlerName(user) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/migration`

### `after`

Triggered after all data migrations have run. The database is now in a stable state.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'after': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/migration/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/page`

### `beforeUnpublish`

Triggered just before a page document is unpublished (converted to a draft document).

#### Parameters

- `req`: The active request
- `published`: The published document that is about to be unpublished

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeUnpublish': {
        async handlerName(req, published) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `afterParkAll`

Triggered after [parked pages](/reference/module-api/module-options.md#park) have been saved or updated in the database (as appropriate) during app startup.

There is no data included with the event for handlers.

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterParkAll': {
        async handlerName() { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `afterConvert`

Triggered after page data is run through the schema module's `convert` method, validating its data to the page type's field schema.

#### Parameters

- `req`: The active request
- `data`: The data being saved to the page, prior to schema conversion
- `page`: The page as it will be saved, following schema conversion

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterConvert': {
        async handlerName(req, data, page) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `beforeMove`

Triggered just *before* a page is moved from one position in the page tree to another.

#### Parameters

- `req`: The active request
- `page`: The page being moved
- `target`: The page used as a target for positioning in the page tree
- `position`: The position to place the page in relation to the target

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeMove': {
        async handlerName(req, page, target, position) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `afterMove`

Triggered just *after* a page is moved from one position in the page tree to another.

#### Parameters

- `req`: The active request
- `page`: The page being moved
- `data`: An object containing the following properties:
  - `originalSlug`: The page's slug prior to moving
  - `originalPath`: The page's path prior to moving
  - `changed`: An array of all pages that were changed by the move, including children of the moved page
  - `target`: The page used as a target for positioning in the page tree
  - `position`: The position to place the page in relation to the target

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterMove': {
        async handlerName(req, page, data) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `serveQuery`

Triggered just before the database query executes to find the best matching page for a request. This can be used to make final adjustments to the query.

#### Parameters

- `req`: The active request
- `query`: The database query that will execute

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'serveQuery': {
        async handlerName(req, query) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `serve`

Triggered just before a requested page is served.

#### Parameters

- `req`: The active request

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'serve': {
        async handlerName(req) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

### `notFound`

Triggered when Apostrophe fails to find a matching page for a request, just before the 404 response. This is a final chance to do extra work to find a matching page.

#### Parameters

- `req`: The active request

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'notFound': {
        async handlerName(req) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/piece-type`

### `beforeUnpublish`

Triggered just before a piece document is unpublished (converted to a draft document).

#### Parameters

- `req`: The active request
- `published`: The published document that is about to be unpublished

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'beforeUnpublish': {
        async handlerName(req, published) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/piece-type/index.js
  </template>
</AposCodeBlock>

### `afterConvert`

Triggered after piece data is run through the schema module's `convert` method, validating its data to the piece type's field schema.

#### Parameters

- `req`: The active request
- `data`: The data being saved to the piece, prior to schema conversion
- `piece`: The piece as it will be saved, following schema conversion

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'afterConvert': {
        async handlerName(req, data, piece) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/piece-type/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/search`

### `determineTypes`

Triggered after the search module identifies the document types to include in search results. This is a chance to change the included types.

#### Parameters

- `types`: An array of document type names

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'determineTypes': {
        async handlerName(types) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/search/index.js
  </template>
</AposCodeBlock>

### `beforeIndex`

Triggered just before the search index page is served, after the page's results are stored on `req.data.docs`.

#### Parameters

- `req`: The active request

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'determineTypes': {
        async handlerName(req) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/search/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/template`

### `addBodyData`

**Not intended for project use.**  Triggered just before a body data object is added to a request prior to rendering a page.

#### Parameters

- `bodyData`: The body data object as it has been constructed

<AposCodeBlock>
  ```javascript
  handlers(self, options) {
    return {
      'addBodyData': {
        async handlerName(bodyData) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/template/index.js
  </template>
</AposCodeBlock>
