# Module configuration options

Apostrophe modules can be configured with settings that influence functionality without having to write custom Javascript. The sections below describe the options available in all modules as well as those specific to certain module types.

All settings described here are placed in a module's `options` configuration object. The `options` object can be added in the module's `index.js` file, as well as where the module is instantiated in the `app.js` file.

`index.js` example:
```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  // 👇 Module configuration options
  options: {
    alias: 'article',
    label: 'Article',
    pluralLabel: 'Articles',
    quickCreate: true
  },
  // Other settings, such as `fields`
}
```

`app.js` example:
```javascript
// app.js
require('apostrophe')({
  shortName: 'bowling-league-site', // Unique to your project
  modules: {
    article: {
      extend: '@apostrophecms/piece-type',
      // 👇 Module configuration options
      options: {
        alias: 'article',
        label: 'Article',
        pluralLabel: 'Articles',
        quickCreate: true
      },
      // Other settings, such as `fields`
    }
  }
});
```

## Options for any module

Option settings in this section apply to every module in Apostrophe.

- [`alias`](#alias)
- [`components`](#components)
- [`name`](#name)
- [`templateData`](#templatedata)

### `alias`

<!-- TODO: Link to information about the apos object when available. -->
Set to a string, the `alias` value will be applied to the `apos` object (accessible in many places) as a quick reference to the module.
set an alias to easily reference the module from other modules. There is no default value.

#### Example

```javascript
// modules/news-article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    alias: 'article'
  },
  // ...
}
```

This `article` module can then be referenced anywhere the `apos` object is present as `apos.article`. Otherwise it would be available via `apos.modules['news-article']`.


### `components`

The `components` options is an object identifying Vue components to use for the module's related user interface. The keys of this object, and thus the UI being overridden, will vary based on the module type. For example, piece module use `managerModal` and `editorModal` components.

This is an advanced option since it can easily break the user interface.

#### Example

```javascript
// modules/@apostrophecms/piece-type/index.js
module.exports = {
  options: {
    components: {
      managerModal: 'MyCustomPiecesManager'
    }
  },
  // ...
}
```

### `name`

Modules' `name` properties are based on the `module` object keys in `app.js` by default. Setting the the `name` option in a module can override this original value for the sake of referencing the module elsewhere.

#### Example

```javascript
// modules/article-module/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    name: 'article'
  },
  // ...
}
```

### `templateData`

Similar to [`browser`](#browser), the `templateData` module option can be set to an object whose properties will be made available in templates of that module. Properties are attached directly to the `data` object in templates.

#### Example

```javascript
// modules/heading-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    templateData: {
      defaultColor: '#55ff93'
    }
  },
  // ...
}
```

You might use that value as a fallback for user-editable fields.

```django
{# In `modules/heading-widget/index.js` #}
{% set bgColor = data.widget.color or data.defaultColor %}
<h2 style="background-color: {{ bgColor }}">
  Title Here
</h2>
```

## Options for all doc type modules

Option settings in this section apply to all modules that extend `@apostrophecms/doc-type` ([doc type](glossary.md#doc) modules). These include all piece and page types.

- [`adminOnly`](#adminonly)
- [`autopublish`](#autopublish)
- [`label`](#label)
- [`localized`](#localized)
- [`sort`](#sort)
- [`slugPrefix`](#slugprefix)
<!-- - [`contextBar`](#contextbar) -->

### `adminOnly`

<!-- TODO: link to permissions docs when available. -->
If `true`, only users with the sitewide admin permission can read or write docs of this type. The `@apostrophecms/user` module uses this setting due to its impact on user access. There is no default value.

#### Example

```javascript
// modules/official-memo/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    adminOnly: true
  },
  // ...
}
```

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

<!-- ### `contextBar` -->

<!-- NOTE: Should we keep this on the secrete menu? (not document) -->
<!-- If `true`, the second row of the admin bar, the "context bar," will be disabled.
`true` ~ allows the admin bar context bar row to appear -->

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

The `sort` option for a doc type defines a sorting order for requests to the database for that type. This setting generally follows the [MongoDB `$sort` aggregation](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/) syntax. The option is set to an object containing field name keys with `1` as a property value for ascending order and `-1` for descending order.

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

### `slugPrefix`

Set `slugPrefix` to a string to prepend all [slugs](glossary.md#slug) for docs of this type. This can be useful to help prevent slugs, which must be unique for each doc in the database, from being reserved in some cases. For example, Apostrophe image docs have the `slugPrefix` value of `'image-'` so images, which do not typically have public pages, do not accidentally reserve a more reader-friendly slug.

#### Example

```javascript
// modules/article-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    slugPrefix: 'category-'
  },
  // ...
}
```

## Options for all piece modules

Option settings in this section apply to all piece modules (those that extend `@apostrophecms/piece-type`).

- [`pluralLabel`](#plurallabel)
- [`perPage`](#perpage)
- [`publicApiProjection`](#publicapiprojection)
- [`quickCreate`](#quickcreate)
- [`searchable`](#searchable)

### `pluralLabel`

Similar to `label` for all doc types, the `pluraLabel` option sets the string the user interface will use to describe a piece type in plural contexts. All page types are referred to as "Pages" in these contexts, but pieces have unique labels, for example, in the manager modal where it might display "All Articles."

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

In piece type modules, the `perPage` option, set to an integer, sets the number of pieces that will be returned in each "page" [during `GET` requests](api/pieces.md#get-api-v1-piece-name) that don't specify an `_id`. This value defaults to 10.

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

Unauthenticated [`GET /api/v1/article`](api/pieces.md#get-api-v1-piece-name) requests would return each piece with only the title, `authorName`, and `_url` properties.

### `quickCreate`

Setting `quickCreate` to the boolean `true` on a piece adds that piece type to the admin bar "quick create" menu. The Apostrophe admin bar user interface includes the quick create menu button to add new pieces without first opening their respective manager modals. This is a useful setting for the piece types that editors will be adding most often.

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
By default, all piece types are included in Apostrophe search results. Setting `searchable: false` on a piece type will exclude that piece type from the search results.

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

