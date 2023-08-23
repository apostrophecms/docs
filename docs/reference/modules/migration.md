---
extends: '@apostrophecms/module'
---

# `@apostrophecms/migration`

**Alias:** `apos.migration`

<AposRefExtends :module="$frontmatter.extends" />

This module provides services for database migrations. These **migrations are used to make changes to the database** at the time of a new code deployment, typically because of *data structure changes* in code or *to fix data errors*. This is completely separate from transferring data between environments or between major versions of Apostrophe.

The `@apostrophecms/migration:migrate` task carries out all migrations that have been registered with this module, though typically only new migrations will run (see the warning below). In development environments all new migrations also run on every site startup.

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/migration/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.migration.add()`.

### `add(name, fn)`

Add a migration function (`fn`) to be invoked when the `@apostrophecms/migration:migrate` task is invoked. Each migration is only invoked once, however they will all be invoked on a brand-new site, so they must check whether a change is actually needed before executing changes. They must also be harmless to run twice.

Functions receive no arguments, but have access to the modules where they are registered (via `self`) and the Apostrophe object (`self.apos`).

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type'
  init(self) {
    // 👇 Adding a data migration related to this module.
    self.apos.migration.add('fix-roses', self.paintRosesRed);
  },
  methods(self) {
    return {
      // 👇 Registering a method to run in the migration.
      async paintRosesRed () {
        await self.apos.migration.eachDoc({
          type: 'rose',
          color: 'white'
        }, async (doc) => {
          await self.apos.doc.db.updateOne({
            _id: doc._id
          }, {
            $set: { color: 'red' }
          });
        });
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/rose/index.js
  </template>
</AposCodeBlock>

::: warning
If running multiple instances of the website on a server, note that previous instances of the site are not stopped automatically while migrations are run. Migrations must minimize their impact on currently running instances of older versions of the site. It is safer to copy data to new properties and to not *remove* existing data until a subsequent migration.
:::

### `async eachDoc(criteria, limit, iterator)`

Invokes the `iterator` function once for each doc in the `aposDocs` collection. The iterator function receives the document as an argument and is run as an `async` function. This method will never visit the same doc twice in a single call, even if modifications are made.

The `criteria` object is used to find documents to process, using the same format as in a [MongoDB `find` operation query](https://docs.mongodb.com/v4.4/reference/method/db.collection.find/). `limit` should be an integer and the number of documents to process in parallel, though it may be omitted. If only two arguments are passed in, `limit` is assumed to be 1 (only one doc may be processed at a time).

**Note:** This API is meant for migrations and task use only. It has no built-in security checks.

### `async each(collection, criteria, limit, iterator)`

This method is similar to [`eachDoc`](#async-eachdoc-criteria-limit-iterator), but it also accepts a database collection as its first argument. When working on normal website content, `eachDoc` will be better to use, though this method can be useful if operating on other database collections, such as the attachments collection (`self.apos.attachment.db`).

**Note:** This API is meant for migrations and task use only. It has no built-in security checks.

### `async eachArea(criteria, limit, iterator)`

Invokes the `iterator` function once for *every area* in *every doc* in the `aposDocs` collection. This method will never visit the same doc twice in a single call, even if modifications are made.

 The `iterator` function receives the following arguments:
 - `doc`: The full document object
 - `area`: The area object within the document
 - `dotPath`: The dot notation series leading to the area within the doc. If the area is a top-level field on the doc type's schema this will simply be the field name.

`criteria` may be used to limit the docs for which this is done, similar to its use in [`eachDoc`](#async-eachdoc-criteria-limit-iterator). `limit` should be an integer and the number of documents to process in parallel, though it may be omitted. If only two arguments are passed in, `limit` is assumed to be 1 (only one doc may be processed at a time).

**Note:** This API is meant for migrations and task use only. It has no built-in security checks.

### `async eachWidget(criteria, limit, iterator)`

Continuing from `eachArea()`, this method goes one level deeper. Invokes the `iterator` function once for *every widget* in *every area* in *every doc* in the `aposDocs` collection. This method will never visit the same doc twice in a single call, even if modifications are made.

 The `iterator` function receives the following arguments:
 - `doc`: The full document object
 - `widget`: The widget object within the document
 - `dotPath`: The dot notation series leading to the widget within the doc. If the area is a top-level field on the doc type's schema this will simply be the field name.

`criteria` may be used to limit the docs for which this is done, similar to its use in [`eachDoc`](#async-eachdoc-criteria-limit-iterator). `limit` should be an integer and the number of documents to process in parallel, though it may be omitted. If only two arguments are passed in, `limit` is assumed to be 1 (only one doc may be processed at a time).

**Note:** This API is meant for migrations and task use only. It has no built-in security checks.

## Module tasks

### `migrate`

Full command: `node app @apostrophecms/migration:migrate`

Run this command-line task to run all migrations. Migrations do not run automatically in production environments, so in that context this must be run manually or as part of a deployment process.
