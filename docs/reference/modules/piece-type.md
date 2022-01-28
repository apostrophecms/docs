---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/piece-type`

*General description paragraph.* Cras mattis consectetur purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

**Extends:** `{{ $frontmatter.extends }}`

## Options

|  Property | Type | Description |
|---|---|---|
| [`autopublish`](#autopublish) | Boolean | Set to `true` to publish all saved edits immediately. |
| [`label`](#label-for-doc-types) | String | The human-readable label for the doc type. |
| [`localized`](#localized) | Boolean | Set to `false` to exclude the doc type in the locale system. |
| [`pluralLabel`](#plurallabel) | String | The plural readable label for the piece type. |
| [`perPage`](#perpage) | Integer | The number of pieces to include on `req.data.pieces` in each page. |
| [`publicApiProjection`](#publicapiprojection) | Object | Piece fields to make available via a public REST API route. |
| [`quickCreate`](#quickcreate) | Boolean | Set to `true` to add the piece type to the quick create menu. |
| [`searchable`](#searchable) | Boolean | Set to `false` to remove the piece type from search results. |
insertViaUpload
singleton
showCreate
showDismissSubmission
showArchive
showDiscardDraft
sort
editRole

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

`label` should be set to a text string to be used in user interface elements related to this doc type. This includes buttons to open piece manager modals and the page type select field.

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

### `pluralLabel`

Similar to `label` for all doc types, the `pluraLabel` option sets the string the user interface will use to describe a piece type in plural contexts. All page types are referred to as "Pages" in these contexts, but pieces should have unique labels (e.g., "Articles," or "Teams").

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


## Related documentation

- [Pieces guide](/guide/pieces.md)
- [Pieces REST API](/docs/reference/api/pieces.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/i18n/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.[the alias].inferIdLocaleAndMode()`.

### `async eventualResponse(req, _id)`

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
