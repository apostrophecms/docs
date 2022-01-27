# `@apostrophecms/page`

**Alias:** `apos.page`

This module provides the majority of functionality for serving and generally working with [pages](/reference/glossary.md#page) in Apostrophe.

For creating page types, see the `@apostrophecms/page-type` module instead.

## Options

| Property | Value type | Description |
|---------|---------|---------|
| [`builders`](#builders) | Object | Set [query builder](/reference/query-builders.md) values to be used when pages are served. |
| [`home`](#home) | Boolean/Object | Change how the home page is added to `req.data` when pages are served. |
| [`minimumPark`](#minimumpark) | Array | Override default parked pages, including the home page. |
| [`park`](#park) | Array | Set pages to be created on site start with configuration. |
| [`publicApiProjection`](#publicapiprojection-for-pages) | Object | Set query builder values to be used when pages are served. |
| [`quickCreate`](#quickcreate-for-pages) | Boolean | Set to `false` to remove pages from the quick create menu. |
| [`types`](#types) | Array | Set the page types available for new pages. |


### `builders`

<!-- TODO: Update builders with link to a more detailed explanation of builders when available. -->
The `builders` option can be used to apply any existing query builders when a page is served by its URL. This affects the data available on the page object, `req.data.page` (`data.page` in templates).

The default value is:
```javascript
{
  children: true,
  ancestors: { children: true }
}
```

In this example, page objects are fetched with one level of page tree "children" as `_children` and their "ancestor" pages, each with one level of their child pages, on `_ancestors`.


#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    builders: {
      children: { depth: 2 }
    }
  },
  // ...
}
```

In this example, we are not including ancestor pages and are requesting two levels of child pages (direct children and their direct children).

### `home`

The home page document is added to all page requests on `req.data.home` so it can be referenced in all page templates. That home page object also includes a `_children` property containing an array of top level page objects. The `home` option offers minor performance improvements for large sites by setting one of the following values:

| Setting | Description |
|---------|-------------|
| `false` | Disables adding the home page document to the requests. |
| `{ children: false }` | Includes the home page document, but without the child pages array. If the [`builders` option](#builders) has an `ancestors` property, that will take precedence. |

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    home: { children: false }
  },
  // ...
}
```

### `minimumPark`

The `minimumPark` option sets the initial defaults for the home page and archive "page" (the page archive). This should normally be left as it is. A possible use case for changing this might be when building an installable module meant to change the defaults for all websites that use it.

::: warning
Configuring this poorly, especially by leaving out one of the two required pages, will break page functionality. In almost every situation it is better to use the [`park`](#park) option instead, including for updating home page properties.
:::

The default is:
```javascript
[
  {
    slug: '/',
    parkedId: 'home',
    _defaults: {
      title: 'Home',
      type: '@apostrophecms/home-page'
    }
  },
  {
    slug: '/archive',
    parkedId: 'archive',
    type: '@apostrophecms/archive-page',
    archived: true,
    orphan: true,
    title: 'Archive'
  }
]
```

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    minimumPark: [
      {
        slug: '/',
        parkedId: 'home',
        _defaults: {
          title: 'Welcome',  // 👈
          type: 'welcome-page' // 👈
        }
      },
      {
        slug: '/archive',
        parkedId: 'archive',
        type: '@apostrophecms/archive-page',
        archived: true,
        orphan: true,
        title: 'Archive'
      }
    ]
  },
  // ...
}
```

### `park`

Use the `park` option to add an array of pages that should be created when the app starts up if they do not already exist. Each page is added as an object with initial properties, including the required `parkedId`.

Required and recommended parked page properties include:

| Setting | Requirement | Description |
|---------|-------------|-------------|
| `parkedId` | Required | A unique ID value used to identify it among parked pages. |
| `slug` | Required | The page [slug](/reference/glossary.md#slug). |
| `type` | Required | The page type to be used for the parked page. |
| `title` | Recommended | The page title. If not set, it will be "New Page." |

If added on the top level of the page object, these properties will not be editable through the user interface. Properties other than `parkedId` may be included in a `_defaults` property instead, which will allow them to be edited in the UI.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    park: [
      // The blog page has a permanent slug, title, and type.
      {
        parkedId: 'blogParkedId',
        slug: '/blog',
        title: 'Blog',
        type: 'blog-page'
      },
      // The team page has a permanent type, but editable slug and title.
      {
        parkedId: 'teamParkedId',
        type: 'staff-page',
        _defaults: {
          slug: '/team',
          title: 'Our Team',
        }
      }
    ]
  },
  // ...
}
```

### `publicApiProjection` (for pages)

By default the built-in Apostrophe REST APIs are not accessible without proper [authentication](/reference/api/authentication.md). You can set an exception to this for `GET` requests to return specific document properties with the `publicApiProjection` option.

This should be set to an object containing individual field name keys set to `1` for their values. Those fields names included in the `publicApiProjection` object will be returned when the `GET` API requests are made without authentication.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    publicApiProjection: {
      title: 1,
      _url: 1 // 👈 Dynamic properties are allowed
    }
  },
  // ...
}
```

Unauthenticated [`GET /api/v1/@apostrophecms/page`](/reference/api/pages.md#get-api-v1-apostrophecms-page) requests would return each piece with only the `title` and `_url` properties.

### `quickCreate` (for pages)

Pages are included in the admin bar "quick create" menu by default. Setting `quickCreate: false` on the page module will disable this.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    quickCreate: false
  },
  // ...
}
```

### `types`

The `types` array defines the page types available to users when creating or editing pages. Each item in the array should have a `label` property and a `name` property, which matches an active page type. If no `types` array is set, only the core "Home" page type will be available.

[Parked pages](#park) may use page types that are not in the `types` option array. This allows developers to do things such as parking a single search page but not allowing users to create additional search pages.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Default'
      },
      {
        name: 'article-page',
        label: 'Article Index'
      }
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      }
    ]
  },
  // ...
}
```

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
