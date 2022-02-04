---
extends: '@apostrophecms/module'
---

# `@apostrophecms/page`

**Alias:** `apos.page`

<AposRefExtends :module="$frontmatter.extends" />

This module provides the majority of functionality for serving and generally working with [pages](/reference/glossary.md#page) in Apostrophe.

For creating page types, see the `@apostrophecms/page-type` module instead.

**Extends:** `{{ $frontmatter.extends }}`

## Options

| Property | Value type | Description |
|---------|---------|---------|
| [`builders`](#builders) | Object | Set query builder values to be used when pages are served. |
| [`home`](#home) | Boolean/Object | Change how the home page is added to `req.data` when pages are served. |
| [`minimumPark`](#minimumpark) | Array | Override default parked pages, including the home page. |
| [`park`](#park) | Array | Set pages to be created on site start with configuration. |
| [`publicApiProjection`](#publicapiprojection) | Object | Set query builder values to be used when pages are served. |
| [`quickCreate`](#quickcreate) | Boolean | Set to `false` to remove pages from the quick create menu. |
| [`types`](#types) | Array | Set the page types available for new pages. |


### `builders`

The `builders` option can be used to apply any existing query builders when a page is served by its URL. This affects the data available on the page object, `req.data.page` (`data.page` in templates). All of the [documented query builders](/reference/query-builders.md) are valid, but in a key/value syntax rather than as method receiving arguments.

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

Use the `park` option to add an array of pages that should be created when the app starts up if they do not already exist. Each page is added as an object with initial properties, including the required `parkedId`. If a page in this array has the same `parkedId` as one in [`minimumPark`](#minimumpark), the version in the `park` option will be used.

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
      // Customizing home page properties, including title and page type.
      {
        slug: '/',
        parkedId: 'home',
        title: 'Our Business',
        type: 'custom-home-page'
      },
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

### `publicApiProjection`

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

### `quickCreate`

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
- [Pages REST API](/reference/api/pages.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/page/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module using the alias. For example, `self.apos.page.find()`.

### `async find(req, criteria, builders)`

The `find()` method initiates a database query. Learn more about initiating queries [in the database query guide](/guide/database-queries.md#initiating-the-data-query). This method takes three arguments:

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | Object | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `builders` | Object | The builders object is converted to matching [query builders](/reference/query-builders.md). |

### `findForEditing(req, criteria, builders)`

Returns a query that finds pages the current user (based on the `req` request object) can edit. Unlike `find()`, this query defaults to including docs in the archive.

`criteria` is a MongoDB criteria object as in `find()`. The `builders` argument should be an object of query builders, in the same style as the [module option of the same name](#builders).

### `async findOneForEditing(req, criteria, builders)`

`findOneForEditing()` is wrapper for `findForEditing()` that returns a single document matching the arguments, not simply a query.

### `async insert(req, targetId, position, page, options)`

The `insert()` method is used to add a new page. It requires specific arguments to place the new page in a specific location in the page tree hierarchy. See the [guide for inserting documents in code](/guide/database-insert-update.md#inserting-pages) for more on this.

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
|`targetId` | String | The `_id` of an existing page to use as a target when inserting the new page. `_home` and `_archive` are optional conveniences for the home page and [archived section](/reference/api/pages.md#moving-pages-to-the-archive), respectively. |
|`position` | Integer/String | A numeric value will represent the zero-based child index under the `_targetId` page. `before`, `after`, `firstChild`, or `lastChild` values set the position within the page tree for the new page in relation to the target page (see `_targetId`). `before` and `after` insert the new page as a sibling of the target. `firstChild` and `lastChild` insert the new page as a child of the target. |
| `page` | Object | The page document object. |
| `options` | Object | An options object, primarily used for internal draft state management. |

### `async update(req, page, options)`

The `update()` method is used to update data for an existing page. Note that the second argument must be a *complete page object* to replace the existing one. You will typically use [`find()`](#async-find-req-criteria-options) to get the existing document object, alter that, then pass it into this method. See the [guide for updating pages in code](/guide/database-insert-update.md#updating-page-documents) for more on this.

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `page` | Object | The document object that will *replace* the existing database document. |
| `options` | Object | An options object, currently only used for internal draft state management. |

### `getBrowserData(req)`

The page module's implementation of [`getBrowserData`](module.md#getbrowserdata-req). This establishes the data that is used in the browser (including by the user interface). If adjusting this **remember to [*extend* this method](/reference/module-api/module-overview.md#extendmethods-self) rather than overwriting it** to avoid breaking the UI.

### `newChild(page)`

This method creates and returns a new object suitable to be inserted *as a child of the specified parent page* (`page`) via `insert()`. It *does not* insert the page to the database. That should be done as a subsequent step. If the parent page is locked down such that no child page types are permitted, this method returns `null`. Visibility settings are inherited from the parent page.

### `allowedChildTypes(page)`

This module returns an array of page types allowed to be used for child pages of page (`page`) passed in as an argument. By default, this method simply returns an array of all page types, but it can be extended or overwritten to be more restrictive.

### `async move(req, pageId, targetId, position)`

This is the proper method to use to move a page within the page tree hierarchy. Since pages have positional relationship with each other we need to provide the `_id` properties of the page we're moving, the page it should be moved *in relation to*, and the position in relation to the target page.

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
|`pageId` | String | The `_id` of an existing page to use as a target when inserting the new page. `_home` and `_archive` are optional conveniences for the home page and [archived section](/reference/api/pages.md#moving-pages-to-the-archive), respectively. |
|`targetId` | String | The `_id` of an existing page to use as a target when inserting the new page. `_home` and `_archive` are optional conveniences for the home page and [archived section](/reference/api/pages.md#moving-pages-to-the-archive), respectively. |
|`position` | Integer/String | A numeric value will represent the zero-based child index under the `_targetId` page. `before`, `after`, `firstChild`, or `lastChild` values set the position within the page tree for the new page in relation to the target page (see `_targetId`). `before` and `after` insert the new page as a sibling of the target. `firstChild` and `lastChild` insert the new page as a child of the target. |

### `async archive(req, _id)`

The `archive()` method moves a page, identified by its unique `_id`, into the page tree's archive section. It returns an object with two properties: `parentSlug`, the slug of the page's former parent; and `changed`, an array of objects with `_id` and `slug` properties, identifying all child pages of the moved page that were also archived.

### `async publish(req, draft, options)`

When passed a `req` object and *draft* document object (`draft`), this method will publish the draft. This replaces an existing published version of the page, if there is one. The options object (`options`) is currently only used for internal draft state management.

### `async localize(req, draft, locale, option)`

Localize the draft page (`draft`), copying it to another locale (`locale`). This creates that locale's draft for the first time if necessary. By default existing documents are not updated, but setting `update: true` in the `options` object will update existing ones.

### `async revertDraftToPublished(req, draft)`

Reverts the given draft page (`draft`) to the most recent publication, clearing any changes. It returns the draft's new value, or `false` if the draft was not modified from the published version or no published version exists yet.

Emits the [`afterRevertDraftToPublished` event](/reference/server-events.md#afterrevertdrafttopublished) before returning, which includes a payload object containing the draft document.

### `async revertPublishedToPrevious(req, published)`

Reverts a published page document (`published`) to the previous published state and returns the updated published state. If this was already done (only one previous state is saved) or there is no previous publication, it throws an `invalid` exception.

Emits the [`afterRevertPublishedToPrevious` event](/reference/server-events.md#afterrevertpublishedtoprevious) before returning, which includes a payload object containing the published document.

### `normalizeSlug(req)`

Normalizes and replaces `req.slug` to account for unneeded trailing whitespace, trailing slashes other than the root, and double slash based open redirect attempts.

### `isPage(doc)`

Returns `true` if the document object, `doc` is identifiable as a page.


### `getBaseUrl(req)`

Returns the effective base URL for the given request (`req`). If a hostname is configured for the active locale (`req.locale`), then the base URL will include it, inferring the protocol from `req.protocol`. Otherwise, if Apostrophe's top-level `baseUrl` option is set it will be used. If there is neither an active locale hostname nor a configured `baseUrl` option, the base URL will be an empty string. This makes it easier to build absolute URLs (when `baseUrl` is configured), or to harmlessly prepend the empty string (when it is not configured). The Apostrophe queries used to fetch Apostrophe pages consult this method.

### `inferIdLocaleAndMode(req, _id)`

This method is a wrapper for the `@apostrophecms/i18n` module [method of the same name](/reference/modules/i18n.md##inferidlocaleandmode-req-id).

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path. For example, `apos.page.isAncestorOf(doc1, doc2)`.

#### `isAncestorOf(possibleAncestorPage, page)`

Returns a boolean value indicating whether the first argument page object (`possibleAncestorPage`) is an ancestor of the second argument page (`page`) in the page tree.

## Module tasks

### `unpark`

Full command: `node app @apostrophecms/page:unpark /page/slug`

Running this task will unlock a page that was ["parked"](#park) by including its slug as an argument. The page must first be removed from the [`park` option array](#park). This allows editors to then change any properties that were not editable previously.
