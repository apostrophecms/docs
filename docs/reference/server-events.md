---
sidebarDepth: 2
---

# Server-side events

Each section below includes server-side events emitted by a particular module *and [modules that extend them](/guide/modules.md#module-inheritance)* (e.g., all piece types emit the events listed for `@apostrophecms/piece-type`). See the [server-side events guide](/guide/server-events.md) for more detail on using events.

Code block examples represent the [`handlers`](/reference/module-api/module-overview.md#handlers-self) section of a module.

::: info
As a reminder, when referencing an event in the `handlers` section *from within the module that emits it* we only need to use the event name. This includes events emitted by functionality that a module inherits (e.g., all piece type modules emit events from `@apostrophecms/piece-type` functionality).

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

Triggered when the app's `destroy` method is called. Most commonly used in tests. Your handlers should clean up any custom `setTimeout` or `setInterval` timers and/or open socket or database connections you have created. You should not "destroy" your actual website content. Just close any remaining open connections, timeouts, etc.

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

Invoked after all `apostrophe:modulesRegistered` handlers and start up functions have completed. All modules are now completely ready for work.

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

**Not intended for project use.** If Apostrophe was invoked as a command line task, Apostrophe's task module responds to this event by executing the task. Otherwise, Apostrophe's Express module responds to this event by listening for connections. If your goal is to do something just before that happens, you should listen for `apostrophe:ready` instead.

#### Parameters

- `isTask`: A boolean value indicating whether the process was started as an [Apostrophe task](/reference/module-api/module-overview.md#tasks-self).

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

## `@apostrophecms/db` events

Events emitted by the `@apostrophecms/db` module.

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

## `@apostrophecms/doc` events

Events emitted by the `@apostrophecms/doc` module.

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

Triggered after Apostrophe automatically replicates certain documents across all locales, including parked pages and piece types with the `replicate: true` option. This runs once during startup.

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

### `afterAllModesDeleted`

Triggered after Apostrophe automatically deletes all modes of a certain document. If the doc type module has the `localized: false` setting this event will not be emitted.

#### Parameters

- `req`: The active request
- `doc`: The draft mode data of the document being deleted
- `options`: Any options passed to the `delete` method of the corresponding document type

<AposCodeBlock>

  ```javascript
  handlers(self) {
    return {
      'afterAllModesDeleted': {
        async handlerName(req, doc, options) { ... }
      }
    };
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/doc/index.js
  </template>
</AposCodeBlock>

## `@apostrophecms/doc-type` events

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

Triggered just *after* Apostrophe inserts a document into the database for the first time. The `doc._id` property is available at this point.

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

## `@apostrophecms/express` events

Events emitted by the `@apostrophecms/express` module.

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

**Not intended for project use.** Triggered prior to middleware and route registration. Used to get all modules to compile their respective routes for registration. To add custom routes, configure the appropriate properties of your module, (e.g., `apiRoutes`, `restApiRoutes`).

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

## `@apostrophecms/login` events

Events emitted by the `@apostrophecms/login` module.

### `deserialize`

Triggered on every request made when a user is logged in, populating `req.user`.

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

## `@apostrophecms/migration` events

Events emitted by the `@apostrophecms/migration` module.

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

## `@apostrophecms/page` events

Events emitted by the `@apostrophecms/page` module.

### `beforeSend`

Triggered just before a page template is rendered and sent as a response to a request. This can be a good place to adjust the data available to the template  by amending `req.data`. Also see the [async components guide](/guide/async-components.md), as that can be a cleaner way to package code that fetches data during rendering.

#### Parameters

- `req`: The active request

<AposCodeBlock>

  ```javascript
  handlers(self, options) {
    return {
      'beforeSend': {
        async handlerName(req) { ... }
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

Triggered just before Apostrophe attempts to serve a requested page.

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

Triggered when Apostrophe fails to find a matching page for a request, just before the 404 response. This is a final chance to do extra work to find a matching page and assign the URL to `req.redirect`.

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


## `@apostrophecms/page-type` events

These events are emitted by **all page type modules** since they extend `@apostrophecms/page-type`. In most cases it will be best to watch for the event from a page type's module rather than the `@apostrophecms/page-type` module.

If specifically watching events on `@apostrophecms/page-type`, as opposed to modules that extend it, **it will normally be important to check the `type` of the page in question** before proceeding with the handler's work.

### `beforeUnpublish`

Triggered just before a page's published document is deleted, leaving only a draft document.

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

### `beforeMove`

Triggered just *before* a page is moved from one position in the page tree to another.

#### Parameters

- `req`: The active request
- `page`: The page being moved
- `target`: The page used as a target for positioning in the page tree
- `position`: The position to place the page in relation to the target: `before` and `after` insert the new page as a sibling of the target; `firstChild` and `lastChild` insert the new page as a child of the target

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

## `@apostrophecms/piece-type` events

These events are emitted by **all piece type modules** since they extend `@apostrophecms/piece-type`. In most cases it will be best to watch for the event from a piece type's module rather than the `@apostrophecms/piece-type` module.

If specifically watching events on `@apostrophecms/piece-type`, as opposed to modules that extend it, **it will normally be important to check the `type` of the piece in question** before proceeding with the handler's work.

### `beforeUnpublish`

Triggered just before a piece's published document is deleted, leaving only a draft document.

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

## `@apostrophecms/search` events

Events emitted by the `@apostrophecms/search` module.

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

## `@apostrophecms/template` events

Events emitted by the `@apostrophecms/template` module.

### `addBodyData`

**Not intended for project use.**  Triggered just before a body data object is added to a request prior to rendering a page. A module's `getBrowserData` and `enableBrowserData` are better places to work on this data in project code.

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
