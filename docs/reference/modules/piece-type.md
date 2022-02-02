---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/piece-type`

This module is the foundation for all [piece types](/guide/pieces.md) in Apostrophe. It is not typically configured or referenced in project code directly since each piece type should be managed independently in most cases. For example, the options documented below would be configured on a custom piece type, e.g., `article`, rather this piece type base module.

The only reason to configure this module directly would be to apply the changes to *every* piece type, including those Apostrophe core (e.g., `@apostrophecms/user`).

**Extends:** `{{ $frontmatter.extends }}`

## Options

|  Property | Type | Description |
|---|---|---|
| [`autopublish`](#autopublish) | Boolean | Set to `true` to publish all saved edits immediately. |
| [`label`](#label-for-doc-types) | String | The human-readable label for the doc type. |
| [`localized`](#localized) | Boolean | Set to `false` to exclude the doc type in the locale system. |
| [`perPage`](#perpage) | Integer | The number of pieces to include on `req.data.pieces` in each page. |
| [`pluralLabel`](#plurallabel) | String | The plural readable label for the piece type. |
| [`publicApiProjection`](#publicapiprojection) | Object | Piece fields to make available via a public REST API route. |
| [`quickCreate`](#quickcreate) | Boolean | Set to `true` to add the piece type to the quick create menu. |
| [`searchable`](#searchable) | Boolean | Set to `false` to remove the piece type from search results. |
| `showCreate` | Boolean | Set to `false` to disable UI related to creating new pieces of that type. |
| `showArchive` | Boolean | Set to `false` to disable UI related to archiving pieces of that type. |
| `showDiscardDraft` | Boolean | Set to `false` to disable UI related to discarding draft pieces of that type. |
| `showDismissSubmission` | Boolean | Set to `false` to disable UI related to dismissing draft submissions for pieces of that type. |
| `singleton` | Boolean | Set to `true` to ensure that no one can create a new piece of that type. The global doc as only one should ever exist. |
| [`sort`](#sort) | Object | The value for a piece type's default sort order query builder. |

### `autopublish`

Set `autopublish` to `true` to automatically publish any changes saved to docs of this type. There is then effectively no draft mode for this doc type.

The core image and file modules use this option, for example. It eliminates the need for users to think about the distinction between draft and published content while preserving the possibility of translation for different locales.

#### Example

```javascript
// modules/article-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    autopublish: true
  },
  // ...
}
```

### `label`

`label` should be set to a text string to be used in user interface elements related to this doc type. This includes buttons to open piece manager modals.

If not set, Apostrophe will convert the module `name` meta property to a readable label by splitting the `name` on dashes and underscores, then capitalizing the first letter of each word.

#### Example

```javascript
// modules/feature/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Featured Article'
  },
  // ...
}
```

### `localized`

Defaults to `true`. If set to `false`, this doc type will _not_ be included in the locale system. This means there will be only one version of each doc, regardless of whether multiple locales (e.g., for languages or regions) are active. The "users" piece disables localization in this way.

#### Example

```javascript
// modules/administrative-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    localized: false
  },
  // ...
}
```

### `perPage`

In piece types, the `perPage` option, expressed as an integer, sets the number of pieces that will be returned in each "page" [during `GET` requests](/reference/api/pieces.md#get-api-v1-piece-name) that don't specify an `_id`. This value defaults to 10.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    perPage: 20 // REST `GET` requests will return 20 pieces per page.
  },
  // ...
}
```

### `pluralLabel`

Similar to `label` for all doc types, the `pluralLabel` option sets the string the user interface will use to describe a piece type in plural contexts.

If no `pluralLabel` value is provided, Apostrophe will append the `label` (whether set manually or generated [as described](#label)), with "s", as is typical for English words. **Even in English this is often not correct, so `pluralLabel` should usually be defined explicitly.**

#### Example

```javascript
// modules/goose/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Goose',
    pluralLabel: 'Geese'
  },
  // ...
}
```

### `publicApiProjection`

By default the built-in Apostrophe REST APIs are not accessible without proper [authentication](/reference/api/authentication.md). You can set an exception to this for `GET` requests to return specific document properties with the `publicApiProjection` option.

This should be set to an object containing individual field name keys set to `1` for their values. Those fields names included in the `publicApiProjection` object will be returned when the `GET` API requests are made without authentication.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    publicApiProjection: {
      title: 1,
      authorName: 1,
      _url: 1 // 👈 Dynamic properties are allowed
    }
  },
  // ...
}
```

Unauthenticated [`GET /api/v1/article`](/reference/api/pieces.md#get-api-v1-piece-name) requests would return each piece with only the `title`, `authorName`, and `_url` properties.

### `quickCreate`

Setting `quickCreate: true` on a piece adds that piece type to the admin bar "quick create" menu. The Apostrophe admin bar user interface includes the quick create menu button to add new pieces without first opening their respective manager modals.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    quickCreate: true
  },
  // ...
}
```

### `searchable`

<!-- TODO: link to documentation of Apostrophe search when available. -->
Setting `searchable: false` on a piece type will exclude that piece type from the results in Apostrophe's built-in search.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    searchable: false
  },
  // ...
}
```

### `sort`

The `sort` option for a doc type defines a sorting order for requests to the database for that type. The option is set to an object containing field name keys with `1` as a property value for ascending order and `-1` for descending order.

The default sort for all doc types is `{ updatedAt: -1 }`, meaning it returns documents based on the `updatedAt` property (the date and time of the last update) in descending order. The `sort` object can have multiple keys for more specific sorting.

#### Example

This `sort` setting will return articles first based on a custom `priority` field in ascending order, then by the core `updatedAt` property in descending order.

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    sort: {
      priority: 1,
      updatedAt: -1
    }
  },
  fields: {
    add: {
      priority: {
        type: 'integer',
        min: 1,
        max: 5
      },
      // ...
    }
  }
  // ...
}
```

## Related documentation

- [Pieces guide](/guide/pieces.md)
- [Pieces REST API](/reference/api/pieces.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/piece-type/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

### `async find(req, criteria, options)`

The `find()` method initiates a database query. Learn more about initiating queries [in the database query guide](/guide/database-queries.md#initiating-the-data-query). This method takes three arguments:

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | Object | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `options` | Object | The options object is converted to matching [query builders](/reference/query-builders.md). |

### `async update(req, piece, options)`

The `insert()` method is used to add a new piece in server-side code. See the [guide for inserting documents in code](/guide/database-insert-update.md#inserting-a-new-piece) for more on this.

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `piece` | Object | The piece document object. |
| `options` | Object | An options object, primarily used for internal draft state management. |

### `async update(req, piece, options)`

The `update()` is used to update data for an existing piece. Note that the second argument must be a *complete piece object* to replace the existing one. You will typically use [`find()`](#async-find-req-criteria-options) to get the existing document object, alter that, then pass it into this method. See the [guide for updating pages in code](/guide/database-insert-update.md#updating-content-documents) for more on this.

| Property | Type | Description |
| -------- | -------- | ----------- |
| `req` | Object | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `piece` | Object | The document object that will *replace* the existing database document. |
| `options` | Object | An options object, currently only used for internal draft state management. |

### `getBrowserData(req)`

Piece type modules' implementation of [`getBrowserData`](module.md#getbrowserdata-req). This establishes the data that is used in the browser (including by the user interface). If adjusting this **remember to [*extend* this method](/reference/module-api/module-overview.md#extendmethods-self) rather than overwriting it** to avoid breaking the UI.

## Module tasks

### `generate`

Full command: `node app [piece-type name]:generate --total [integer]`

This task is used to generate sample documents for a given piece type. This can be helpful during project development to quickly create test content. The task will generate 10 items if the `--total` argument is *not* included. If `--total` is included with a number argument, it will generate that number of items.

For example, `node app article:generate --total 2000` will generate 2,000 documents for an `article` piece type.
