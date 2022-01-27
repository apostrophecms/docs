# `@apostrophecms/page`

**Alias:** `apos.page`

This module provides the majority of functionality for serving and generally working with [pages](/reference/glossary.md#page) in Apostrophe.

For creating page types, see the `@apostrophecms/page-type` module instead.

## Options

|  Property | Type | Description |
|---|---|---|
builders
home
minimumPark
park
publicApiProjection
quickCreate
|`types` | String | Nulla vitae elit libero, a pharetra augue. |

## Related documentation

- [Pages guide](/guide/pages.md)
- [Pages REST API](/docs/reference/api/pages.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/page/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.page.find()`.

- async find(req, criteria, options)
- async insert(req, targetId, position, page, options)
- getBrowserData
- lock
- unlock
- newChild
- allowedChildTypes
- move
- getTarget
- getTargetIdAndPosition
- async archive(req, ...)
- async update(req, ...)
- async publish(req, ...)
- async localize(req, ...)
- async revertDraftToPublished(req, draft)
- async revertPublishedToPrevious(req, published)
- async serve(req, res)
- normalizeSlug(req)
- serveNotFound(req)
- async serveDeliver(req, err)
- isPage(doc),
-


### `inferIdLocaleAndMode(req, _id)`

Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.

### `isValidLocale(locale)`

Etiam porta sem malesuada magna mollis euismod. Maecenas faucibus mollis interdum. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path. For example, `apos.util.log()`.

#### `slugify(string, options)`

Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Module tasks

### `reset`

Full command: `node app @apostrophecms/db:reset`

Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed posuere consectetur est at lobortis.
