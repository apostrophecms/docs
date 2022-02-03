---
extends: '@apostrophecms/module'
---

# `@apostrophecms/migration`

**Alias:** `apos.migration`

This module provides services for database migrations. These **migrations are used to make changes to the database** at the time of a new code deployment, typically because of *data structure changes* in code or *to fix data errors*. This is completely separate from transferring data between environments or between versions of Apostrophe.

The `@apostrophecms/migration:migrate` task carries out all migrations that have been registered with this module. The task function runs on every site start up, though typically only new migrations will run (see the warning below).

::: warning
**Migrations must be written so they are safe to run multiple times.** Apostrophe tracks when migrations have been run before in a the `aposMigrations` database collection, but there is no guarantee that they will not run again if that cache is cleared. If this is difficult to guarantee, you may wish to [write a task](/reference/module-api/module-overview.md#tasks-self) that executes the changes instead.
:::

**Extends:** `{{ $frontmatter.extends }}` [ℹ️](/guide/modules.md#module-inheritance)

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
      async painRosesRed () {
        const req = self.apos.task.getReq('editor');

        await self.apos.migration.eachDoc({
          type: 'rose'
        }, async (doc) => {
          if (doc.color === 'white') {
            doc.color = 'red';
            await self.update(req, doc);
          }
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

<!-- TODO: Link to the global module reference page here. -->
If you absolutely must prevent requests from being executed during the migration, wrap them with the `await apos.global.busy(fn)` API. Note that this API involves a significant startup delay to allow existing requests to terminate.
:::

### `async eventualResponse(req, _id)`

Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.

### `isValidLocale(locale)`

Etiam porta sem malesuada magna mollis euismod. Maecenas faucibus mollis interdum. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path. For example, `apos.util.log()`.

#### `slugify(string, options)`

Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Module tasks

### `migrate`

Full command: `node app @apostrophecms/migration:migrate`

Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed posuere consectetur est at lobortis.
